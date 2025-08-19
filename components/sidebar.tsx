'use client';

import clsx from 'clsx';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const sidebarItems = [
  {
    label: 'Dashboard',
    href: '/',
    icon: '🏠',
  },
  {
    label: 'Cabins',
    href: '/cabins',
    icon: '🏘️',
  },
  {
    label: 'Bookings',
    href: '/bookings',
    icon: '📅',
  },
  {
    label: 'Guests',
    href: '/guests',
    icon: '👥',
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: '⚙️',
  },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only render logo after component has mounted to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <aside className='hidden md:flex w-64 bg-background border-r border-default-200 h-full flex-col'>
      <div className='p-6 '>
        <Link href='/' className='flex justify-center'>
          {mounted ? (
            <Image
              src={
                resolvedTheme === 'dark' ? '/logo-dark.png' : '/logo-light.png'
              }
              alt='LodgeFlow'
              width={140}
              height={140}
              className='rounded-lg'
            />
          ) : (
            <div className='w-20 h-20 bg-default-200 rounded-lg animate-pulse' />
          )}
        </Link>
      </div>

      <nav className='flex-1 px-4 py-4'>
        <ul className='space-y-2'>
          {sidebarItems.map(item => {
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full text-left',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-default-100'
                  )}>
                  <span className='text-lg'>{item.icon}</span>
                  <span className='font-medium'>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className='p-4 border-t border-default-200'>
        <p className='text-xs text-default-400 text-center'>
          © 2025 LodgeFlow
        </p>
      </div>
    </aside>
  );
};
