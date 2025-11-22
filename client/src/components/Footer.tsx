import { Package, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#1A2A44] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Package className="w-8 h-8 text-[#FFB400]" />
              <span className="text-xl font-bold">ConduitPro</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your trusted partner for industrial conduit solutions. Quality products, competitive prices, reliable delivery.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#FFB400]">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-300 hover:text-[#FFB400] transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#FFB400] transition-colors">Products</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#FFB400] transition-colors">Bulk Orders</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#FFB400] transition-colors">Delivery Info</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#FFB400]">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-300 hover:text-[#FFB400] transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#FFB400] transition-colors">FAQs</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#FFB400] transition-colors">Returns</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#FFB400] transition-colors">Terms & Conditions</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#FFB400]">Contact Info</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2 text-gray-300">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>123 Industrial Ave, Suite 100<br />Manufacturing District</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-300">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-300">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>sales@conduitpro.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 ConduitPro. All rights reserved. Quality conduit solutions for professionals.</p>
        </div>
      </div>
    </footer>
  );
}
