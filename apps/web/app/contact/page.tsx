import type { Metadata } from 'next';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with TechHub BD. We are here to help with your orders, products, and inquiries.',
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Contact Us</h1>
        <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
          Have a question or need help? We&apos;d love to hear from you.
        </p>
      </div>

      <div className="mt-12 grid gap-8 sm:grid-cols-2">
        {/* Contact Info */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Get in Touch</h2>

          <div className="space-y-5">
            {[
              { icon: Mail, label: 'Email', value: 'support@techhubbd.com', href: 'mailto:support@techhubbd.com' },
              { icon: Phone, label: 'Phone', value: '+880 1XXX-XXXXXX', href: 'tel:+8801XXXXXXXXX' },
              { icon: MapPin, label: 'Address', value: 'Dhaka, Bangladesh', href: null },
              { icon: Clock, label: 'Business Hours', value: 'Sat - Thu: 10AM - 8PM', href: null },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30">
                  <item.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400">{item.value}</a>
                  ) : (
                    <p className="text-gray-900 dark:text-white">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-900">
            <h3 className="font-semibold text-gray-900 dark:text-white">Quick Help</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>For order issues, include your order number in the message.</li>
              <li>For returns/exchanges, contact us within 7 days of delivery.</li>
              <li>All products come with official brand warranty.</li>
            </ul>
          </div>
        </div>

        {/* Contact Form */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Send a Message</h2>
          <form className="mt-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input id="name" type="text" required className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white" placeholder="Your name" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input id="email" type="email" required className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white" placeholder="your@email.com" />
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
              <input id="subject" type="text" required className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white" placeholder="Order inquiry, product question..." />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
              <textarea id="message" rows={4} required className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white" placeholder="How can we help?" />
            </div>
            <button type="submit" className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
