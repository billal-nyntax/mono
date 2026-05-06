import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shopping Cart',
  description:
    'Review your shopping cart at TechHub BD. Free delivery on orders over ৳5,000 across Bangladesh.',
  openGraph: {
    title: 'Shopping Cart | TechHub BD',
    description:
      'Review your shopping cart at TechHub BD. Free delivery on orders over ৳5,000.',
    type: 'website',
    siteName: 'TechHub BD',
  },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
