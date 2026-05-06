import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getProducts, getCategories, getBrands } from '@/lib/api';

export const metadata: Metadata = {
  title: 'TechHub BD — Your Gadget Destination',
  description:
    'Shop smartphones, laptops, smartwatches & accessories from top brands in Bangladesh. Free delivery over ৳5,000, official warranty, and secure payment.',
  openGraph: {
    title: 'TechHub BD — Your Gadget Destination',
    description:
      'Shop smartphones, laptops, smartwatches & accessories from top brands in Bangladesh. Free delivery over ৳5,000.',
    type: 'website',
    siteName: 'TechHub BD',
  },
};
import { ProductCard } from '@/components/product-card';
import { formatPrice } from '@/lib/format-price';
import {
  Truck, Shield, CreditCard, Headphones, ArrowRight, Star,
  Smartphone, Laptop, Watch, TabletSmartphone, Cable, Zap,
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, typeof Smartphone> = {
  mobile: Smartphone,
  laptop: Laptop,
  smartwatch: Watch,
  tablet: TabletSmartphone,
  headphones: Headphones,
  accessories: Cable,
};

export default async function HomePage() {
  const [productsRes, categoriesRes, newArrivalsRes, brandsRes, dealsRes] = await Promise.allSettled([
    getProducts({ limit: 8, sortBy: 'sellingPrice', sortOrder: 'desc' }),
    getCategories(),
    getProducts({ limit: 4, sortBy: 'createdAt', sortOrder: 'desc' }),
    getBrands(),
    getProducts({ limit: 4 }),
  ]);

  const featuredProducts =
    productsRes.status === 'fulfilled' ? productsRes.value.data?.data ?? [] : [];
  const categories =
    categoriesRes.status === 'fulfilled' ? categoriesRes.value.data ?? [] : [];
  const newArrivals =
    newArrivalsRes.status === 'fulfilled' ? newArrivalsRes.value.data?.data ?? [] : [];
  const brands =
    brandsRes.status === 'fulfilled' ? brandsRes.value.data ?? [] : [];
  const deals =
    dealsRes.status === 'fulfilled'
      ? (dealsRes.value.data?.data ?? []).filter((p) => p.compareAtPrice && p.compareAtPrice > p.sellingPrice)
      : [];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-950 dark:to-blue-950/10">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-100/40 blur-3xl dark:bg-blue-900/10" />
          <div className="absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-indigo-100/30 blur-3xl dark:bg-indigo-900/10" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-8 py-14 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-24">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-400">
                <Zap className="h-3.5 w-3.5" />
                Free delivery on orders over ৳5,000
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
                Your One-Stop
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Tech Shop
                </span>
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                Smartphones, laptops, smartwatches & accessories from Samsung, Apple, Xiaomi and more. Official warranty. Secure payment.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 hover:shadow-xl active:scale-[0.98]"
                >
                  Shop Now <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/products?sortBy=createdAt&sortOrder=desc"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-7 py-3.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  New Arrivals
                </Link>
              </div>

              <div className="mt-12 flex items-center gap-8 border-t border-gray-200/60 pt-8 dark:border-gray-800">
                {[
                  { num: '30+', label: 'Products' },
                  { num: '17+', label: 'Brands' },
                  { num: '100%', label: 'Authentic' },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">{s.num}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero visual — featured product showcase */}
            <div className="relative hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                {featuredProducts.slice(0, 4).map((product, i) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className={`group overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 ${i === 1 ? 'mt-8' : ''}`}
                  >
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-800">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="200px"
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Smartphone className="h-12 w-12 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <p className="mt-3 truncate text-sm font-medium text-gray-900 dark:text-white">{product.name}</p>
                    <p className="text-sm font-bold text-blue-600">{formatPrice(product.sellingPrice)}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-y border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 sm:grid-cols-4 sm:px-6 lg:px-8">
          {[
            { icon: Truck, text: 'Free Delivery', sub: 'Over ৳5,000', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
            { icon: Shield, text: 'Official Warranty', sub: 'Brand guarantee', color: 'text-green-600 bg-green-50 dark:bg-green-950/30' },
            { icon: CreditCard, text: 'Secure Payment', sub: 'SSL + COD', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30' },
            { icon: Headphones, text: '24/7 Support', sub: 'Always available', color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/30' },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.color}`}>
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.text}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Shop by Category</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Browse our product categories</p>
            </div>
            <Link href="/products" className="hidden items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 sm:flex">
              All Products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6 lg:gap-4">
            {categories.map((cat) => {
              const IconComponent = CATEGORY_ICONS[cat.slug] ?? Smartphone;
              return (
                <Link
                  key={cat.id}
                  href={`/products?categoryId=${cat.id}`}
                  className="group flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-5 text-center transition-all hover:border-blue-200 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-800 sm:p-6"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 transition-all group-hover:scale-110 group-hover:from-blue-100 group-hover:to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30">
                    <IconComponent className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">{cat.name}</h3>
                  <p className="mt-0.5 text-[11px] text-gray-400">{cat.productCount} items</p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Deals / Offers */}
      {deals.length > 0 && (
        <section className="bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 px-4 py-14 dark:from-red-950/10 dark:via-orange-950/10 dark:to-yellow-950/10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950/30">
                  <Zap className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Hot Deals</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Limited time offers</p>
                </div>
              </div>
              <Link href="/products" className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {deals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">New Arrivals</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Just landed in our store</p>
            </div>
            <Link href="/products?sortBy=createdAt&sortOrder=desc" className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
              See All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Top Products */}
      {featuredProducts.length > 0 && (
        <section className="bg-gray-50 px-4 py-14 dark:bg-gray-900 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Top Products</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Most popular picks</p>
              </div>
              <Link href="/products" className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Brands */}
      {brands.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Trusted Brands</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Only authentic products from top brands</p>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {brands.slice(0, 10).map((brand) => (
              <Link
                key={brand.id}
                href={`/products?brandId=${brand.id}`}
                className="flex h-14 items-center rounded-lg px-4 text-lg font-bold text-gray-400 transition-colors hover:text-gray-900 dark:text-gray-600 dark:hover:text-white"
              >
                {brand.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Customer Review / Social Proof */}
      <section className="border-t border-gray-100 bg-white px-4 py-14 dark:border-gray-800 dark:bg-gray-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">What Our Customers Say</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              { name: 'Rahim Ahmed', text: 'Great prices and fast delivery. Got my iPhone within 2 days!', rating: 5 },
              { name: 'Fatima Begum', text: 'Authentic products with official warranty. Very trustworthy shop.', rating: 5 },
              { name: 'Karim Hossain', text: 'Best place to buy gadgets in BD. Customer support is excellent.', rating: 5 },
            ].map((review) => (
              <div key={review.name} className="rounded-2xl border border-gray-100 bg-gray-50 p-6 text-left dark:border-gray-800 dark:bg-gray-950">
                <div className="flex gap-0.5">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  &ldquo;{review.text}&rdquo;
                </p>
                <p className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">{review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to upgrade your tech?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Browse our entire collection. Free delivery on orders over ৳5,000.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/products"
              className="rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-blue-700 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            >
              Browse Products
            </Link>
            <Link
              href="/signup"
              className="rounded-xl border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
