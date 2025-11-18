import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Minus, ShoppingCart, Package } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useCart } from '../context/CartContext';
import type { Product } from '../lib/types';

type ProductDetailPageProps = {
  productId: string;
  onNavigate: (page: string) => void;
};

export function ProductDetailPage({ productId, onNavigate }: ProductDetailPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const productRef = doc(db, 'products', productId);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          const data = productSnap.data() as Product;
          setProduct(data);
          setQuantity(data.min_order_quantity);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    loadProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (product) addToCart(product, quantity);
  };

  if (!product) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50">
      {/* Header */}
      <div className="bg-[#1A2A44] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => onNavigate('products')}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Products</span>
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="aspect-square">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                SKU: {product.sku}
              </div>
              <h1 className="text-4xl font-bold text-[#1A2A44] mb-4">{product.name}</h1>
              <p className="text-gray-600 text-lg leading-relaxed">{product.description}</p>
            </div>

            {/* Price & Stock */}
            <div className="border-t border-b border-gray-200 py-6">
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-bold text-[#1A2A44]">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-xl text-gray-500">/ {product.unit}</span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Minimum order quantity: {product.min_order_quantity} units
              </div>
              <div className="mt-1 text-sm">
                {product.stock_quantity > 0 ? (
                  <span className="text-green-600 font-medium">
                    In Stock ({product.stock_quantity} available)
                  </span>
                ) : (
                  <span className="text-red-600 font-medium">Out of Stock</span>
                )}
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setQuantity(Math.max(product.min_order_quantity, quantity - 1))}
                    className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-[#FFB400] hover:bg-[#FFB400] hover:text-white transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        Math.max(
                          product.min_order_quantity,
                          parseInt(e.target.value) || product.min_order_quantity
                        )
                      )
                    }
                    min={product.min_order_quantity}
                    className="w-20 text-center py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFB400] focus:border-transparent"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-[#FFB400] hover:bg-[#FFB400] hover:text-white transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Subtotal */}
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Subtotal:</span>
                  <span className="text-2xl font-bold text-[#1A2A44]">
                    ${(product.price * quantity).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
                className="w-full bg-[#FFB400] text-[#1A2A44] py-4 rounded-lg font-semibold hover:bg-[#FFC933] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-lg shadow-lg"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={() => onNavigate('quote')}
                className="w-full border-2 border-[#1A2A44] text-[#1A2A44] py-4 rounded-lg font-semibold hover:bg-[#1A2A44] hover:text-white transition-colors text-lg"
              >
                Request Bulk Quote
              </button>
            </div>

            {/* Specifications */}
            {product.specifications && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-[#1A2A44] mb-4">Technical Specifications</h2>
                <div className="space-y-3">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between py-2 border-b border-gray-100 last:border-0"
                    >
                      <span className="text-gray-600 font-medium capitalize">
                        {key.replace(/_/g, ' ')}:
                      </span>
                      <span className="text-[#1A2A44] font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
