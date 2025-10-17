'use client';

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import { Link } from '@heroui/link';
import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from '@heroui/navbar';

import { ThemeSwitch } from '@/components/theme-switch';
import { Button } from '@heroui/button';
import clsx from 'clsx';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const ThemeIcon = () => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='currentColor'
      width='16'
      height='16'
    >
      <path d='M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z' />
    </svg>
  );
};

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathName = usePathname();
  const { setTheme, theme } = useTheme();
  const menuItems = [
    { name: 'Dashboard', href: '/' },
    { name: 'Cabins', href: '/cabins' },
    { name: 'Bookings', href: '/bookings' },
    { name: 'Experiences', href: '/experiences' },
    { name: 'Dining', href: '/dining' },
    { name: 'Guests', href: '/guests' },
    { name: 'Settings', href: '/settings' },
  ];

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <HeroUINavbar
      isBordered
      maxWidth='2xl'
      isMenuOpen={isOpen}
      onMenuOpenChange={setIsOpen}
    >
      <NavbarContent>
        <NavbarMenuToggle className='md:hidden' />
      </NavbarContent>

      <NavbarContent as='div' justify='end'>
        <SignedOut>
          <ThemeSwitch />
          <SignInButton>
            <Button color='primary' variant='ghost'>
              Sign In
            </Button>
          </SignInButton>
          <SignUpButton>
            <Button color='primary' variant='solid'>
              Sign Up
            </Button>
          </SignUpButton>
        </SignedOut>

        <SignedIn>
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Action
                label='Toggle theme'
                labelIcon={<ThemeIcon />}
                onClick={toggleTheme}
              />
            </UserButton.MenuItems>
          </UserButton>
        </SignedIn>
      </NavbarContent>

      <NavbarMenu>
        {menuItems.map((item, index) => {
          const isLinkActive = pathName === item.href;
          return (
            <NavbarMenuItem key={index}>
              <Link
                onPress={() => setIsOpen(!isOpen)}
                color='foreground'
                className={clsx(
                  'w-full p-2',
                  isLinkActive && 'font-bold rounded-lg bg-primary'
                )}
                href={item.href}
                size='lg'
              >
                {item.name}
              </Link>
            </NavbarMenuItem>
          );
        })}
      </NavbarMenu>
    </HeroUINavbar>
  );
};
