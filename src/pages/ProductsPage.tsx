import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useCart } from '../context/CartContext';
import type { Product } from '../lib/types';

type Category = { id: string; name: string; image_url?: string; description?: string };

type ProductsPageProps = {
  onNavigate: (page: string, productId?: string) => void;
};

export function ProductsPage({ onNavigate }: ProductsPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const productsQuery = query(collection(db, 'products'), orderBy('name'));
    const categoriesQuery = query(collection(db, 'categories'), orderBy('name'));

    const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
      setProducts(snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Product) })));
      setLoading(false);
    });

    const unsubscribeCategories = onSnapshot(categoriesQuery, (snapshot) => {
      setCategories(snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Category) })));
    });

    return () => {
      unsubscribeProducts();
      unsubscribeCategories();
    };
  }, []);

  const filteredProducts = products.filter((product) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      product.name.toLowerCase().includes(q) ||
      product.description.toLowerCase().includes(q) ||
      product.sku.toLowerCase().includes(q);

    const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: Product) => {
    addToCart(product, product.min_order_quantity);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50">
      <div className="bg-[#1A2A44] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Our Products</h1>
          <p className="text-gray-300 text-lg">Browse our complete range of conduit pipes and accessories</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* search + filters */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden bg-white border border-gray-300 px-6 py-3 rounded-lg flex items-center justify-center space-x-2"
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block md:w-64`}>
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-[#1A2A44] mb-4">Filters</h2>
              <h3 className="font-medium text-[#1A2A44] mb-2">Categories</h3>
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left px-3 py-2 rounded-lg ${
                  selectedCategory === '' ? 'bg-[#FFB400] text-[#1A2A44] font-semibold' : 'hover:bg-gray-100'
                }`}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg ${
                    selectedCategory === cat.id ? 'bg-[#FFB400] text-[#1A2A44] font-semibold' : 'hover:bg-gray-100'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="mb-4 text-gray-600">
              Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-md hover:shadow-xl overflow-hidden">
                  <div
                    className="aspect-video overflow-hidden cursor-pointer"
                    onClick={() => onNavigate('product', product.id)}
                  >
                    <img
                      src={product.image_url || '/placeholder.png'}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform"
                    />
                  </div>
                  <div className="p-5">
                    <div className="mb-2 text-xs text-gray-500">SKU: {product.sku}</div>
                    <h3
                      className="text-lg font-semibold text-[#1A2A44] cursor-pointer"
                      onClick={() => onNavigate('product', product.id)}
                    >
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between mb-4">
                      <span className="text-2xl font-bold text-[#1A2A44]">₹{product.price}</span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        Min: {product.min_order_quantity}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onNavigate('product', product.id)}
                        className="flex-1 border-2 border-[#1A2A44] text-[#1A2A44] px-4 py-2 rounded-lg"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 bg-[#FFB400] text-[#1A2A44] px-4 py-2 rounded-lg"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12 text-gray-600">
                No products found.
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('');
                  }}
                  className="mt-4 text-[#FFB400]"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
