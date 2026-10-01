import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Praman — Know what you choose',
  description: 'Explore Nepal-focused product labels, nutrition, ingredients, and alternatives.',
  applicationName: 'Praman',
};
export const viewport: Viewport = { themeColor: '#6840c6', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
