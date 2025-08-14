'use client';

import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from '@heroui/navbar';
import { Link } from '@heroui/link';

import { Logo } from '@/components/icons';
import { ThemeSwitch } from '@/components/theme-switch';
import { Avatar } from '@heroui/avatar';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/dropdown';

export const Navbar = () => {
  const menuItems = [
    { name: 'Dashboard', href: '/' },
    { name: 'Cabins', href: '/cabins' },
    { name: 'Bookings', href: '/bookings' },
    { name: 'Guests', href: '/guests' },
    { name: 'Settings', href: '/settings' },
  ];

  return (
    <HeroUINavbar isBordered maxWidth='2xl'>
      <NavbarContent>
        <NavbarMenuToggle className="md:hidden" />
        <NavbarBrand>
          <Logo />
          <p className='font-bold text-inherit ml-2'>The Wild Oasis</p>
        </NavbarBrand>
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
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={index}>
            <Link
              color="foreground"
              className="w-full"
              href={item.href}
              size="lg"
            >
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </HeroUINavbar>
  );
};
