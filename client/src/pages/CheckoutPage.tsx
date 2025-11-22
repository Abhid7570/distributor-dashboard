import { useState } from 'react';
import { CheckCircle, CreditCard, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { insertDoc } from '../lib/firebase';
import { useNavigate } from "react-router-dom";

export function CheckoutPage() {
  const navigate = useNavigate(); // ✅ Router navigation

  const { cartItems, cartTotal, clearCart } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('India');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // ---------------------------------------------------
  // 🧾 SUBMIT ORDER
  // ---------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setIsSubmitting(true);

    try {
      const generatedOrderNumber = `ORD-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)
        .toUpperCase()}`;

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

      const inserted = await insertDoc('orders', orderPayload);
      if (!inserted?.id) throw new Error('Order creation failed.');

      const orderId = inserted.id;

      const orderItems = cartItems.map(({ product, quantity }: any) => ({
        order_id: orderId,
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku,
        quantity,
        unit_price: product.price,
        subtotal: product.price * quantity,
        status: "pending",
        created_at: new Date().toISOString(),
      }));

      await Promise.all(orderItems.map(item => insertDoc('order_items', item)));

      setOrderNumber(generatedOrderNumber);
      setOrderComplete(true);
      clearCart();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to place order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------
  // 🎉 ORDER COMPLETE SCREEN
  // ---------------------------------------------------
  if (orderComplete) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center py-12">
        <div className="max-w-2xl w-full mx-4 bg-white rounded-xl shadow-lg p-8">

          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-[#1A2A44] mb-2">Order Placed Successfully!</h2>
            <p className="text-gray-600 text-lg">Thank you for your order</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <p className="text-sm text-gray-600 mb-1 text-center">Order Number</p>
            <p className="text-2xl font-bold text-center text-[#1A2A44]">{orderNumber}</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
              <Truck className="w-6 h-6 text-blue-600" />
              <p className="text-sm text-gray-600">
                Our team is processing your order. You will receive shipping details soon.
              </p>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
              <CreditCard className="w-6 h-6 text-green-600" />
              <p className="text-sm text-gray-600">
                Total: <strong>₹{cartTotal.toFixed(2)}</strong>
              </p>
            </div>
          </div>

          {/* 🔥 Router Nav instead of onNavigate */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate("/")}
              className="flex-1 bg-[#FFB400] text-[#1A2A44] px-6 py-3 rounded-lg font-semibold hover:bg-[#FFC933]"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => navigate("/products")}
              className="flex-1 border-2 border-[#1A2A44] text-[#1A2A44] px-6 py-3 rounded-lg font-semibold hover:bg-[#1A2A44] hover:text-white"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------
  // 🧾 MAIN CHECKOUT FORM
  // ---------------------------------------------------
  return (
    <div className="flex-1 bg-gray-50">
      <div className="bg-[#1A2A44] text-white py-12 px-4">
        <h1 className="text-4xl font-bold max-w-6xl mx-auto">Checkout</h1>
        <p className="text-gray-300 max-w-6xl mx-auto">Complete your order</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT SIDE FORM */}
        <div className="lg:col-span-2">

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* CONTACT INFO */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-[#1A2A44] mb-6">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Full Name *</label>
                  <input
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Email *</label>
                  <input
                    required
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Phone *</label>
                  <input
                    required
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* ADDRESS */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-[#1A2A44] mb-6">Shipping Address</h2>

              <div className="space-y-6">

                <div>
                  <label className="text-sm font-medium text-gray-700">Street *</label>
                  <input
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700">City *</label>
                    <input
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">State *</label>
                    <input
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700">PIN Code *</label>
                    <input
                      required
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Country *</label>
                    <input
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* NOTES */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-[#1A2A44] mb-6">Order Notes</h2>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
                placeholder="Any special delivery instructions..."
              />
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={isSubmitting || cartItems.length === 0}
              className="w-full py-4 bg-[#FFB400] text-[#1A2A44] rounded-lg font-bold hover:bg-[#FFC933]"
            >
              {isSubmitting ? "Processing..." : "Place Order"}
            </button>
          </form>
        </div>

        {/* RIGHT SIDE SUMMARY */}
        <div>
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-semibold text-[#1A2A44] mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              {cartItems.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-gray-500">Qty: {quantity}</p>
                  </div>
                  <p className="font-semibold">
                    ₹{(product.price * quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium">₹{cartTotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-gray-500 text-sm">Calculated later</span>
              </div>

              <div className="border-t pt-3 flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-2xl text-[#1A2A44]">
                  ₹{cartTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
