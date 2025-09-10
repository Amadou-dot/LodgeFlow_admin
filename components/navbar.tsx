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
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathName = usePathname();
  const menuItems = [
    { name: 'Dashboard', href: '/' },
    { name: 'Cabins', href: '/cabins' },
    { name: 'Bookings', href: '/bookings' },
    { name: 'Experiences', href: '/experiences' },
    { name: 'Dining', href: '/dining' },
    { name: 'Guests', href: '/guests' },
    { name: 'Settings', href: '/settings' },
  ];

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
        <ThemeSwitch />

        <SignedOut>
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
          <UserButton />
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
