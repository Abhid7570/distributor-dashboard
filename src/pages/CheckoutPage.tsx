import { useState } from 'react';
import { CheckCircle, CreditCard, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { insertDoc } from '../lib/firebase';

type CheckoutPageProps = {
  onNavigate: (page: string) => void;
};

export function CheckoutPage({ onNavigate }: CheckoutPageProps) {
  const { cartItems, cartTotal, clearCart } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('United States');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setIsSubmitting(true);

    try {
      // Generate order number (client-side). For production you'd prefer server-generated.
      const generatedOrderNumber = `ORD-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 6)
        .toUpperCase()}`;

      // Build order payload
      const orderPayload = {
        order_number: generatedOrderNumber,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        shipping_address: { street, city, state, zip, country },
        total_amount: cartTotal,
        status: 'pending',
        notes,
        created_at: new Date().toISOString(),
      };

      // Insert order
      const inserted = await insertDoc('orders', orderPayload);
      if (!inserted || !inserted.id) {
        throw new Error('Failed to create order.');
      }
      const orderId = inserted.id;

      // Prepare order items
      const orderItems = cartItems.map(({ product, quantity }: any) => ({
        order_id: orderId,
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku,
        quantity,
        unit_price: product.price,
        subtotal: product.price * quantity,
        created_at: new Date().toISOString(),
      }));

      // Insert all order items in parallel
      const insertPromises = orderItems.map((item) => insertDoc('order_items', item));
      const insertedItems = await Promise.all(insertPromises);

      // Check for any failed inserts
      const failed = insertedItems.some((res) => !res || !res.id);
      if (failed) {
        // NOTE: we are not rolling back the order here. In production use Cloud Functions + transactions.
        throw new Error('Failed to save one or more order items.');
      }

      // Success
      setOrderNumber(generatedOrderNumber);
      setOrderComplete(true);
      clearCart();
    } catch (err: any) {
      console.error('Order submission error:', err);
      alert(err?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center py-12">
        <div className="max-w-2xl w-full mx-4">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-[#1A2A44] mb-2">Order Placed Successfully!</h2>
              <p className="text-gray-600 text-lg">Thank you for your order</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 mb-1">Order Number</p>
                <p className="text-2xl font-bold text-[#1A2A44]">{orderNumber}</p>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-600 text-center">
                  A confirmation email has been sent to <strong>{customerEmail}</strong>
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                <Truck className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">What happens next?</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Our team is processing your order. You'll receive tracking information via email once your order ships.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                <CreditCard className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Payment Details</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Total amount: <strong>${cartTotal.toFixed(2)}</strong>. Invoice will be sent separately.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => onNavigate('home')}
                className="flex-1 bg-[#FFB400] text-[#1A2A44] px-6 py-3 rounded-lg font-semibold hover:bg-[#FFC933] transition-colors"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => onNavigate('products')}
                className="flex-1 border-2 border-[#1A2A44] text-[#1A2A44] px-6 py-3 rounded-lg font-semibold hover:bg-[#1A2A44] hover:text-white transition-colors"
              >
                Browse Products
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50">
      <div className="bg-[#1A2A44] text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Checkout</h1>
          <p className="text-gray-300 text-lg">Complete your order</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-[#1A2A44] mb-6">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFB400] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFB400] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFB400] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-[#1A2A44] mb-6">Shipping Address</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFB400] focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFB400] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State / Province *
                      </label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFB400] focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP / Postal Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFB400] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country *
                      </label>
                      <input
                        type="text"
                        required
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFB400] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-[#1A2A44] mb-6">Order Notes</h2>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Any special instructions or delivery notes..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFB400] focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || cartItems.length === 0}
                className="w-full bg-[#FFB400] text-[#1A2A44] py-4 rounded-lg font-semibold hover:bg-[#FFC933] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg text-lg"
              >
                {isSubmitting ? 'Processing...' : 'Place Order'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-[#1A2A44] mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {cartItems.map(({ product, quantity }) => (
                  <div key={product.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-gray-500">Qty: {quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      ${(product.price * quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-sm">Calculated after order</span>
                </div>
                <div className="border-t border-gray-300 pt-3 flex justify-between items-center">
                  <span className="text-lg font-semibold text-[#1A2A44]">Total</span>
                  <span className="text-2xl font-bold text-[#1A2A44]">
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </div>
  );
}
