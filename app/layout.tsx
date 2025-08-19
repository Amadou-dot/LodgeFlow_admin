import '@/styles/globals.css';
import clsx from 'clsx';
import { Metadata, Viewport } from 'next';

import { Providers } from './providers';

import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { fontSans } from '@/config/fonts';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: '/icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang='en'>
      <head />
      <body
        className={clsx(
          'min-h-screen text-foreground bg-background font-sans antialiased',
          fontSans.variable
        )}>
        <Providers themeProps={{ attribute: 'class', defaultTheme: 'dark' }}>
          <div className='flex h-screen'>
            <Sidebar />
            <div className='flex flex-col flex-1 overflow-hidden'>
              <Navbar />
              <main className='flex-1 overflow-auto'>
                <div className=' mx-auto  pt-6 px-6 h-full'>{children}</div>
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
