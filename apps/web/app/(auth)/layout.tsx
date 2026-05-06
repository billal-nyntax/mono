import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Account',
  description:
    'Sign in or create your TechHub BD account to track orders, save addresses, and enjoy a faster checkout experience.',
  openGraph: {
    title: 'Account | TechHub BD',
    description:
      'Sign in or create your TechHub BD account to track orders and enjoy faster checkout.',
    type: 'website',
    siteName: 'TechHub BD',
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
