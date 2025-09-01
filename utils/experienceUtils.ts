// Test your booking utility functions
export const calculateTotalPrice = (
  basePrice: number,
  participants: number,
  discountPercentage = 0
): number => {
  const subtotal = basePrice * participants;
  const discount = subtotal * (discountPercentage / 100);
  return subtotal - discount;
};

export const isExperienceAvailable = (experience: any, date: Date): boolean => {
  // Check if experience is available on given date
  if (!experience.available || experience.available.length === 0) {
    return false;
  }

  // Simple availability check - you can expand this logic
  return (
    experience.available.includes('All seasons') ||
    experience.available.some((season: string) => {
      // Add season date logic here
      return true;
    })
  );
};

export const validateExperienceData = (
  data: any
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push('Experience name is required');
  }

  if (!data.price || data.price <= 0) {
    errors.push('Valid price is required');
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.push('Description is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
