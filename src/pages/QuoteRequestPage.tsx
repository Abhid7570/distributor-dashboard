import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, CheckCircle } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, addDoc } from 'firebase/firestore';
import type { Product } from '../lib/types'; // optional

type QuoteRequestPageProps = {
  onNavigate: (page: string) => void;
};

type QuoteItem = {
  product_id: string;
  product_name: string;
  quantity: number;
};

export function QuoteRequestPage({ onNavigate }: QuoteRequestPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([
    { product_id: '', product_name: '', quantity: 1 },
  ]);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const q = query(collection(db, 'products'), orderBy('name'));
        const snap = await getDocs(q);
        const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as Product));
        setProducts(data);
      } catch (err) {
        console.error('Failed to load products for quote page:', err);
      }
    })();
  }, []);

  const addQuoteItem = () => {
    setQuoteItems((s) => [...s, { product_id: '', product_name: '', quantity: 1 }]);
  };

  const removeQuoteItem = (index: number) => {
    setQuoteItems((s) => s.filter((_, i) => i !== index));
  };

  const updateQuoteItem = (index: number, field: keyof QuoteItem, value: string | number) => {
    setQuoteItems((prev) => {
      const newItems = [...prev];
      if (field === 'product_id') {
        const product = products.find((p) => p.id === value);
        if (product) {
          newItems[index] = { ...newItems[index], product_id: product.id, product_name: product.name };
        } else {
          newItems[index] = { ...newItems[index], product_id: value as string };
        }
      } else {
        newItems[index] = { ...newItems[index], [field]: value } as QuoteItem;
      }
      return newItems;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validItems = quoteItems.filter((it) => it.product_id && it.quantity > 0);
      if (validItems.length === 0) {
        alert('Please add at least one product to your quote request.');
        setIsSubmitting(false);
        return;
      }

      const requestNumber = `QR-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      const payload = {
        request_number: requestNumber,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        company_name: companyName,
        items: validItems,
        message,
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      await addDoc(collection(db, 'quote_requests'), payload);
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit quote request:', err);
      alert('Failed to submit quote request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#1A2A44] mb-4">Quote Request Submitted!</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Thank you for your quote request. Our team will review your requirements and get back to you within 24 hours with a competitive quote.
            </p>
            <button
              onClick={() => onNavigate('home')}
              className="bg-[#FFB400] text-[#1A2A44] px-8 py-3 rounded-lg font-semibold hover:bg-[#FFC933] transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50">
      <div className="bg-[#1A2A44] text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="w-10 h-10 text-[#FFB400]" />
            <h1 className="text-4xl font-bold">Request Bulk Quote</h1>
          </div>
          <p className="text-gray-300 text-lg">Get competitive pricing for bulk orders. Our team will respond within 24 hours.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Contact info & products UI */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-[#1A2A44] mb-6">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input type="text" required value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFB400] focus:border-transparent" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFB400] focus:border-transparent" placeholder="ABC Construction" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input type="email" required value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFB400] focus:border-transparent" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input type="tel" required value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFB400] focus:border-transparent" placeholder="+1 (555) 123-4567" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#1A2A44]">Products</h2>
              <button type="button" onClick={addQuoteItem} className="flex items-center space-x-2 bg-[#FFB400] text-[#1A2A44] px-4 py-2 rounded-lg font-semibold hover:bg-[#FFC933] transition-colors">
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            <div className="space-y-4">
              {quoteItems.map((item, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-7">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                      <select value={item.product_id} onChange={(e) => updateQuoteItem(index, 'product_id', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFB400] focus:border-transparent">
                        <option value="">Select a product...</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} - ₹{(product.price || 0).toFixed(2)} / {product.unit}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                      <input type="number" min="1" value={item.quantity} onChange={(e) => updateQuoteItem(index, 'quantity', parseInt(e.target.value) || 1)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFB400] focus:border-transparent" />
                    </div>

                    <div className="md:col-span-1 flex justify-end">
                      {quoteItems.length > 1 && (
                        <button type="button" onClick={() => removeQuoteItem(index)} className="text-red-600 hover:text-red-700 p-2">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-[#1A2A44] mb-6">Additional Information</h2>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFB400] focus:border-transparent" placeholder="Please provide any additional details about your requirements, delivery timeline, or special requests..." />
          </div>

          <div className="flex justify-end space-x-4">
            <button type="button" onClick={() => onNavigate('products')} className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-[#FFB400] text-[#1A2A44] rounded-lg font-semibold hover:bg-[#FFC933] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg">{isSubmitting ? 'Submitting...' : 'Submit Quote Request'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
