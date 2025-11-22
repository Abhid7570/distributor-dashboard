import { useState, useEffect } from 'react';
import {
  ArrowRight, CheckCircle, Package, Truck, Shield, Zap
} from 'lucide-react';

import { db } from '../lib/firebase';
import { collection, getDocs, query, where, limit } from "firebase/firestore";

import { useCart } from '../context/CartContext';
import { useNavigate } from "react-router-dom";

export function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const { addToCart } = useCart();
  
  const navigate = useNavigate();   // <-- router navigation

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // ------------- FEATURED PRODUCTS -------------
      const productsRef = collection(db, "products");
      const featuredQuery = query(
        productsRef,
        where("is_featured", "==", true),
        limit(3)
      );
      const productsSnap = await getDocs(featuredQuery);

      const products = productsSnap.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));

      // ------------- CATEGORIES -------------
      const categoriesRef = collection(db, "categories");
      const categoriesQuery = query(categoriesRef, limit(4));
      const categoriesSnap = await getDocs(categoriesQuery);

      const categories = categoriesSnap.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));

      setFeaturedProducts(products);
      setCategories(categories);
    } catch (err) {
      console.error("Firebase fetch error:", err);
    }
  };

  const handleAddToCart = (product: any) => {
    addToCart(product, product.min_order_quantity);
  };

  return (
    <div className="flex-1">
      {/* --- HERO SECTION --- */}
      <section className="bg-gradient-to-br from-[#1A2A44] via-[#2A3A54] to-[#1A2A44] text-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

            {/* Left content */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Premium Conduit Solutions for Every Project
              </h1>

              <p className="text-xl text-gray-300 leading-relaxed">
                Industry-leading conduit pipes and accessories. From residential installations to industrial projects.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => navigate("/products")}
                  className="bg-[#FFB400] text-[#1A2A44] px-8 py-4 rounded-lg font-semibold hover:bg-[#FFC933] transition-all transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg"
                >
                  <span>Browse Products</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={() => navigate("/quote")}
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-[#1A2A44] transition-all"
                >
                  Request Bulk Quote
                </button>
              </div>
            </div>

            {/* Right content */}
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-[#FFB400]" />
                  <span className="text-lg">Premium Quality Standards</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-[#FFB400]" />
                  <span className="text-lg">Competitive Bulk Pricing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-[#FFB400]" />
                  <span className="text-lg">Fast Nationwide Delivery</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-[#FFB400]" />
                  <span className="text-lg">Expert Technical Support</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- WHY CHOOSE US --- */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <FeatureCard icon={<Package />} title="Wide Selection" text="Extensive range of conduit pipes and accessories" />
            <FeatureCard icon={<Shield />} title="Quality Assured" text="All products meet international standards" />
            <FeatureCard icon={<Truck />} title="Fast Delivery" text="Reliable nationwide shipping" />
            <FeatureCard icon={<Zap />} title="Bulk Discounts" text="Special pricing for large orders" />
          </div>
        </div>
      </section>

      {/* --- CATEGORIES GRID --- */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A2A44] mb-4">
              Shop by Category
            </h2>
            <p className="text-gray-600 text-lg">
              Find the perfect conduit solution for your needs
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => navigate("/products")}
                className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all transform hover:scale-105"
              >
                <div className="aspect-square">
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A2A44] via-[#1A2A44]/70 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{category.name}</h3>
                    <p className="text-gray-200 text-sm">{category.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* --- FEATURED PRODUCTS GRID --- */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A2A44] mb-4">
              Featured Products
            </h2>
            <p className="text-gray-600 text-lg">
              Our most popular conduit solutions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold text-[#1A2A44] mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold text-[#1A2A44]">
                        ₹{product.price}
                      </span>
                      <span className="text-gray-500 text-sm ml-1">/ {product.unit}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      Min. order: {product.min_order_quantity}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/product/${product.id}`)}
                      className="flex-1 border-2 border-[#1A2A44] text-[#1A2A44] px-4 py-2 rounded-lg font-semibold hover:bg-[#1A2A44] hover:text-white transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 bg-[#FFB400] text-[#1A2A44] px-4 py-2 rounded-lg font-semibold hover:bg-[#FFC933] transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => navigate("/products")}
              className="bg-[#1A2A44] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#2A3A54] transition-colors inline-flex items-center space-x-2"
            >
              <span>View All Products</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

        </div>
      </section>
    </div>
  );
}


/* Small reusable Feature Card */
function FeatureCard({ icon, title, text }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
      <div className="w-12 h-12 bg-[#FFB400] rounded-lg flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-[#1A2A44] mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{text}</p>
    </div>
  );
}
