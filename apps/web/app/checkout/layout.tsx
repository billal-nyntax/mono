import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout',
  description:
    'Complete your purchase at TechHub BD. Secure payment via COD, SSLCommerz, bKash & more. Fast delivery across Bangladesh.',
  openGraph: {
    title: 'Checkout | TechHub BD',
    description:
      'Complete your purchase at TechHub BD. Secure payment and fast delivery across Bangladesh.',
    type: 'website',
    siteName: 'TechHub BD',
  },
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
