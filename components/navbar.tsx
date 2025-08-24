'use client';

import { Link } from '@heroui/link';
import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from '@heroui/navbar';

import { ThemeSwitch } from '@/components/theme-switch';
import { Avatar } from '@heroui/avatar';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/dropdown';
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
      onMenuOpenChange={setIsOpen}>
      <NavbarContent>
        <NavbarMenuToggle className='md:hidden' />
      </NavbarContent>

      <NavbarContent as='div' justify='end'>
        <ThemeSwitch />

        <Dropdown>
          <DropdownTrigger>
            <Avatar
              src='https://i.pravatar.cc/150?u=a042581f4e29026704d'
              className='cursor-pointer'
            />
          </DropdownTrigger>
          <DropdownMenu aria-label='Profile Actions' variant='flat'>
            <DropdownItem
              key='profile'
              className='h-14'
              textValue='Signed in as zoey@example.com'>
              <p className='font-semibold'>Signed in as</p>
              <p className='font-semibold'>zoey@example.com</p>
            </DropdownItem>
            <DropdownItem key='settings' textValue='My Settings'>
              My Settings
            </DropdownItem>
            <DropdownItem key='help_and_feedback' textValue='Help & Feedback'>
              Help & Feedback
            </DropdownItem>
            <DropdownItem
              key='logout'
              className='text-danger'
              color='danger'
              textValue='Log Out'>
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
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
                size='lg'>
                {item.name}
              </Link>
            </NavbarMenuItem>
          );
        })}
      </NavbarMenu>
    </HeroUINavbar>
  );
};
