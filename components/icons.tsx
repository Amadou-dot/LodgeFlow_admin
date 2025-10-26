'use client';
import { ArrowLeft, Edit, Moon, Plus, Search, Sun, Trash2 } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';

import { IconSvgProps } from '@/types';

export const Logo: React.FC<IconSvgProps> = ({ size = 36, width, height }) => {
  const logoSize = Number(size || width || height || 36);

  return (
    <Image
      src='/logo.svg'
      alt='LodgeFlow'
      width={logoSize}
      height={logoSize}
      className='rounded'
    />
  );
};

export const MoonFilledIcon = ({
  size = 24,
  width,
  height,
  ...props
}: IconSvgProps) => {
  const iconSize = size || width || height || 24;
  return <Moon size={iconSize} {...props} />;
};

export const SunFilledIcon = ({
  size = 24,
  width,
  height,
  ...props
}: IconSvgProps) => {
  const iconSize = size || width || height || 24;
  return <Sun size={iconSize} {...props} />;
};

export const SearchIcon = (props: IconSvgProps) => {
  return <Search {...props} />;
};

export const PlusIcon = (props: IconSvgProps) => {
  return <Plus {...props} />;
};

export const ArrowLeftIcon = (props: IconSvgProps) => {
  return <ArrowLeft {...props} />;
};

export const EditIcon = (props: IconSvgProps) => {
  return <Edit {...props} />;
};

export const TrashIcon = (props: IconSvgProps) => {
  return <Trash2 {...props} />;
};
