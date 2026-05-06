import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { CartProvider } from '@/lib/cart-context';
import { AuthProvider } from '@/lib/auth/auth-context';
import { ThemeProvider, themeScript } from '@/lib/theme-context';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: {
    default: 'TechHub BD — Your Gadget Destination',
    template: '%s | TechHub BD',
  },
  description:
    'Shop the latest smartphones, laptops, accessories, and gadgets in Bangladesh. Free delivery, warranty, and secure payment.',
  keywords: [
    'TechHub BD',
    'buy smartphones Bangladesh',
    'laptops BD',
    'gadgets online shop',
    'mobile price in Bangladesh',
    'laptop price BD',
    'Samsung',
    'Apple',
    'Xiaomi',
    'official warranty',
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    locale: 'en_BD',
    siteName: 'TechHub BD',
    title: 'TechHub BD — Your Gadget Destination',
    description:
      'Shop the latest smartphones, laptops, accessories, and gadgets in Bangladesh. Free delivery, warranty, and secure payment.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TechHub BD — Your Gadget Destination',
    description:
      'Shop the latest smartphones, laptops, accessories, and gadgets in Bangladesh.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col bg-white font-sans antialiased dark:bg-gray-950`}
      >
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
