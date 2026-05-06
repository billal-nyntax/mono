import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Package } from 'lucide-react';
import { getProduct } from '@/lib/api';
import { formatPrice } from '@/lib/format-price';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { ProductImageGallery } from '@/components/product-image-gallery';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await getProduct(slug);
    const product = res.data;
    if (!product) return { title: 'Product Not Found' };

    const brandName =
      typeof product.brand === 'string' ? product.brand : product.brand?.name ?? '';
    const price = `৳${product.sellingPrice.toLocaleString('en-BD')}`;
    const description =
      product.description ??
      `Buy ${product.name}${brandName ? ` by ${brandName}` : ''} at ${price}. Official warranty, free delivery over ৳5,000. Shop at TechHub BD.`;

    return {
      title: product.name,
      description,
      openGraph: {
        title: `${product.name} | TechHub BD`,
        description,
        type: 'website',
        siteName: 'TechHub BD',
        ...(product.images[0] && {
          images: [{ url: product.images[0], alt: product.name }],
        }),
      },
      twitter: {
        card: 'summary_large_image',
        title: `${product.name} | TechHub BD`,
        description,
        ...(product.images[0] && { images: [product.images[0]] }),
      },
    };
  } catch {
    return { title: 'Product Not Found' };
  }
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;

  let product;
  try {
    const res = await getProduct(slug);
    product = res.data;
  } catch {
    notFound();
  }

  if (!product) notFound();

  const inStock = product.stockQuantity > 0;
  const categoryName = typeof product.category === 'string' ? product.category : product.category?.name ?? '';
  const brandName = typeof product.brand === 'string' ? product.brand : product.brand?.name ?? '';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/products"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductImageGallery
          images={product.images}
          productName={product.name}
        />

        <div className="flex flex-col">
          <div>
            {categoryName && (
              <span className="inline-block rounded-full bg-blue-100 dark:bg-blue-950/30 px-3 py-1 text-xs font-medium text-blue-700">
                {categoryName}
              </span>
            )}
            <h1 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
              {product.name}
            </h1>
            {brandName && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Brand: {brandName}</p>
            )}
            {product.model && (
              <p className="mt-1 text-sm text-gray-400">Model: {product.model}</p>
            )}
          </div>

          <div className="mt-6">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatPrice(product.sellingPrice)}
            </p>
            {product.compareAtPrice && product.compareAtPrice > product.sellingPrice && (
              <div className="mt-1 flex items-center gap-2">
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
                <span className="rounded-md bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700 dark:bg-red-950/50 dark:text-red-400">
                  {Math.round(((product.compareAtPrice - product.sellingPrice) / product.compareAtPrice) * 100)}% OFF
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${
                inStock ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span
              className={`text-sm font-medium ${
                inStock ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
              }`}
            >
              {inStock
                ? `In Stock (${product.stockQuantity} available)`
                : 'Out of Stock'}
            </span>
          </div>

          {product.description && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Description</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {product.description}
              </p>
            </div>
          )}

          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Specifications</h2>
              <dl className="mt-3 divide-y divide-gray-100 rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-700">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between px-4 py-2.5 text-sm">
                    <dt className="font-medium text-gray-500 dark:text-gray-400">{key}</dt>
                    <dd className="text-gray-900 dark:text-white">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {product.sku && (
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
              <Package className="h-3.5 w-3.5" />
              SKU: {product.sku}
            </div>
          )}

          <div className="mt-8">
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                brand: brandName,
                sellingPrice: product.sellingPrice,
                images: product.images,
                stockQuantity: product.stockQuantity,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
