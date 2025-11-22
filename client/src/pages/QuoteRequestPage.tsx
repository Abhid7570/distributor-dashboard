import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, CheckCircle } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, addDoc } from 'firebase/firestore';
import type { Product } from '../lib/types';
import { useNavigate } from "react-router-dom";

type QuoteItem = {
  product_id: string;
  product_name: string;
  quantity: number;
};

export function QuoteRequestPage() {
  const navigate = useNavigate(); // ✅ FIXED — must be inside component

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

  /* ---------------------------------------
     Load all products from Firestore
  --------------------------------------- */
  useEffect(() => {
    (async () => {
      try {
        const q = query(collection(db, 'products'), orderBy('name'));
        const snap = await getDocs(q);

        const data = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Product)
        }));

        setProducts(data);
      } catch (err) {
        console.error('Failed to load products:', err);
      }
    })();
  }, []);

  /* ---------------------------------------
     Quote List Handlers
  --------------------------------------- */
  const addQuoteItem = () => {
    setQuoteItems((prev) => [...prev, { product_id: '', product_name: '', quantity: 1 }]);
  };

  const removeQuoteItem = (index: number) => {
    setQuoteItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuoteItem = (index: number, field: keyof QuoteItem, value: any) => {
    setQuoteItems((prev) => {
      const updated = [...prev];

      if (field === 'product_id') {
        const product = products.find((p) => p.id === value);
        updated[index] = {
          ...updated[index],
          product_id: value,
          product_name: product ? product.name : ""
        };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }

      return updated;
    });
  };

  /* ---------------------------------------
     Submit Handler
  --------------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validItems = quoteItems.filter((i) => i.product_id && i.quantity > 0);

      if (validItems.length === 0) {
        alert("Please add at least one product.");
        setIsSubmitting(false);
        return;
      }

      const requestNumber = `QR-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      const payload = {
        request_number: requestNumber,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        company_name: companyName,
        items: validItems,
        message,
        status: "pending",
        created_at: new Date().toISOString(),
      };

      await addDoc(collection(db, "quote_requests"), payload);

      setSubmitted(true);

    } catch (err) {
      console.error("Submit failed:", err);
      alert("Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------------------------------
     After Successful Submission
  --------------------------------------- */
  if (submitted) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            <h2 className="text-2xl font-bold text-[#1A2A44] mb-4">
              Quote Request Submitted!
            </h2>

            <p className="text-gray-600 mb-6">
              Our team will get back to you within 24 hours.
            </p>

            <button
              onClick={() => navigate("/")}
              className="bg-[#FFB400] text-[#1A2A44] px-8 py-3 rounded-lg font-semibold hover:bg-[#FFC933]"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------------------------------
     Page UI
  --------------------------------------- */
  return (
    <div className="flex-1 bg-gray-50">
      {/* Header */}
      <div className="bg-[#1A2A44] text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="w-10 h-10 text-[#FFB400]" />
            <h1 className="text-4xl font-bold">Request Bulk Quote</h1>
          </div>
          <p className="text-gray-300 text-lg">
            Get competitive pricing for bulk orders.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* CONTACT INFO */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-[#1A2A44] mb-6">
              Contact Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-sm font-medium">Full Name *</label>
                <input
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Company Name</label>
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Email *</label>
                <input
                  required
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Phone *</label>
                <input
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* PRODUCTS */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#1A2A44]">Products</h2>

              <button
                type="button"
                onClick={addQuoteItem}
                className="flex items-center space-x-2 bg-[#FFB400] px-4 py-2 rounded-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            {/* PRODUCT LIST */}
            <div className="space-y-4">
              {quoteItems.map((item, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Product Dropdown */}
                    <div className="md:col-span-7">
                      <label className="block mb-2 text-sm font-medium">Product</label>
                      <select
                        value={item.product_id}
                        onChange={(e) => updateQuoteItem(index, "product_id", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      >
                        <option value="">Select a product...</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} - ₹{p.price} / {p.unit}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div className="md:col-span-4">
                      <label className="block mb-2 text-sm font-medium">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuoteItem(index, "quantity", parseInt(e.target.value) || 1)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      />
                    </div>

                    {/* Remove */}
                    <div className="md:col-span-1 flex justify-end">
                      {quoteItems.length > 1 && (
                        <button onClick={() => removeQuoteItem(index)} className="text-red-500">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MESSAGE */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Additional Information</h2>

            <textarea
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              placeholder="Add your message here..."
            />
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="px-8 py-3 border-2 border-gray-300 rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-[#FFB400] text-[#1A2A44] rounded-lg"
            >
              {isSubmitting ? "Submitting..." : "Submit Quote Request"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
