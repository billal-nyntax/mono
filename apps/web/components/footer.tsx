import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-lg font-semibold text-white">About TechHub BD</h3>
            <p className="mt-4 text-sm leading-relaxed">
              Your trusted destination for the latest gadgets, electronics, and tech
              accessories in Bangladesh. Quality products at competitive prices.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/products" className="hover:text-white">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white">
                  Cart
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-white">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white">
                  Login / Sign Up
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white">Company</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/products?sortBy=createdAt&sortOrder=desc" className="hover:text-white">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white">
                  All Products
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white">Contact</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>Email: support@techhubbd.com</li>
              <li>Phone: +880 1XXX-XXXXXX</li>
              <li>Dhaka, Bangladesh</li>
              <li>Sat - Thu: 10AM - 8PM</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} TechHub BD. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
