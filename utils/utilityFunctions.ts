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
