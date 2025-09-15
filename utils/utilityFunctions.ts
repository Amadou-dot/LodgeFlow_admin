export const getLoyaltyTier = (totalSpent: number) => {
  if (totalSpent >= 10000)
    return { tier: 'Diamond', color: 'secondary' as const };
  if (totalSpent >= 5000) return { tier: 'Gold', color: 'warning' as const };
  if (totalSpent >= 2000) return { tier: 'Silver', color: 'default' as const };
  return { tier: 'Bronze', color: 'primary' as const };
};

export const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'success';
    case 'unconfirmed':
      return 'warning';
    case 'checked-in':
      return 'primary';
    case 'checked-out':
      return 'default';
    case 'cancelled':
      return 'danger';
    default:
      return 'default';
  }
};

export const calcNumNights = (checkInDate: string, checkOutDate: string) => {
  return checkInDate && checkOutDate
    ? Math.ceil(
        (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;
};

export const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(amount);
};

export async function isImageUrl(url: string | undefined): Promise<boolean> {
  if (typeof url !== 'string') return false;

  try {
    // Quick sanity check: must be a valid URL
    new URL(url);

    // Try a HEAD request to check Content-Type
    const res = await fetch(url, { method: 'HEAD' });
    const contentType = res.headers.get('content-type') || '';
    return contentType.startsWith('image/');
  } catch {
    return false;
  }
}
