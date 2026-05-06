import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Truck, Award, Users, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about TechHub BD — your trusted destination for smartphones, laptops, and gadgets in Bangladesh.',
};

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-16 dark:from-gray-900 dark:to-gray-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl lg:text-5xl">
            About TechHub BD
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            We are Bangladesh&apos;s trusted destination for the latest smartphones, laptops, smartwatches, and tech accessories. Quality products, competitive prices, and exceptional service.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white">Why Choose Us</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Shield, title: 'Authentic Products', desc: 'Every product comes with official brand warranty. No refurbished or counterfeit items.' },
            { icon: Truck, title: 'Fast Delivery', desc: 'Free delivery on orders over ৳5,000. Same-day delivery in Dhaka.' },
            { icon: Award, title: 'Best Prices', desc: 'Competitive pricing with regular deals and discounts. Price match guarantee.' },
            { icon: Users, title: 'Expert Support', desc: '24/7 customer support via phone and email. Pre and post-purchase assistance.' },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-gray-100 bg-white p-6 text-center transition-shadow hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30">
                <item.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="border-t border-gray-100 bg-gray-50 px-4 py-14 dark:border-gray-800 dark:bg-gray-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Our Story</h2>
          <div className="mt-6 space-y-4 text-gray-600 dark:text-gray-400">
            <p>
              TechHub BD started with a simple mission: make authentic tech products accessible to everyone in Bangladesh at fair prices. We noticed that many customers struggled to find genuine products with proper warranty support.
            </p>
            <p>
              Today, we partner directly with leading brands like Samsung, Apple, Xiaomi, Sony, Dell, and many more to bring you the latest gadgets with official warranty and after-sales support.
            </p>
            <p>
              Whether you&apos;re looking for a flagship smartphone, a powerful laptop for work, or the perfect pair of headphones, we&apos;ve got you covered. Our team of tech enthusiasts is always ready to help you find the right product.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { num: '30+', label: 'Products' },
            { num: '17+', label: 'Top Brands' },
            { num: '1000+', label: 'Happy Customers' },
            { num: '4.8/5', label: 'Customer Rating' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-blue-600 sm:text-4xl">{stat.num}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Ready to explore?</h2>
          <p className="mt-3 text-blue-100">Browse our collection of smartphones, laptops, and accessories.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/products" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-blue-700 hover:scale-105">
              Shop Now <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/contact" className="rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
