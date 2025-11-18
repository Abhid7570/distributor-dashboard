import { X, Plus, Minus, ShoppingCart, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

type CartDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
};

export function CartDrawer({ isOpen, onClose, onCheckout }: CartDrawerProps) {
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        <div className="bg-[#1A2A44] text-white p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ShoppingCart className="w-6 h-6" />
            <h2 className="text-2xl font-bold">Your Cart</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-[#FFB400] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <ShoppingCart className="w-20 h-20 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-6">Add some products to get started</p>
            <button
              onClick={onClose}
              className="bg-[#FFB400] text-[#1A2A44] px-6 py-3 rounded-lg font-semibold hover:bg-[#FFC933] transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cartItems.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="bg-gray-50 rounded-lg p-4 flex gap-4 border border-gray-200"
                >
                  <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#1A2A44] mb-1 truncate">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">SKU: {product.sku}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center hover:border-[#FFB400] hover:bg-[#FFB400] hover:text-white transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-medium">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center hover:border-[#FFB400] hover:bg-[#FFB400] hover:text-white transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-2 text-right">
                      <span className="text-lg font-bold text-[#1A2A44]">
                        ${(product.price * quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 p-6 space-y-4 bg-gray-50">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>
              <div className="border-t border-gray-300 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-[#1A2A44]">Total</span>
                  <span className="text-2xl font-bold text-[#1A2A44]">
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={onCheckout}
                  className="w-full bg-[#FFB400] text-[#1A2A44] py-4 rounded-lg font-semibold hover:bg-[#FFC933] transition-colors shadow-lg text-lg"
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={onClose}
                  className="w-full mt-2 border-2 border-[#1A2A44] text-[#1A2A44] py-3 rounded-lg font-semibold hover:bg-[#1A2A44] hover:text-white transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
