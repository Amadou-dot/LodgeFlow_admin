import {
  calculateTotalPrice,
  isExperienceAvailable,
  validateExperienceData,
} from '@/utils/experienceUtils';

describe('Experience Utils', () => {
  describe('calculateTotalPrice', () => {
    it('calculates total price correctly', () => {
      expect(calculateTotalPrice(100, 2)).toBe(200);
      expect(calculateTotalPrice(100, 3, 10)).toBe(270); // 10% discount
    });

    it('handles zero participants', () => {
      expect(calculateTotalPrice(100, 0)).toBe(0);
    });
  });

  describe('isExperienceAvailable', () => {
    it('returns true for all-season experiences', () => {
      const experience = {
        available: ['All seasons'],
      };
      expect(isExperienceAvailable(experience, new Date())).toBe(true);
    });

    it('returns false for experiences with no availability', () => {
      const experience = {
        available: [],
      };
      expect(isExperienceAvailable(experience, new Date())).toBe(false);
    });
  });

  describe('validateExperienceData', () => {
    it('validates correct data', () => {
      const validData = {
        name: 'Mountain Hiking',
        price: 100,
        description: 'Great hiking experience',
      };

      const result = validateExperienceData(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('catches validation errors', () => {
      const invalidData = {
        name: '',
        price: -10,
        description: '',
      };

      const result = validateExperienceData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Experience name is required');
      expect(result.errors).toContain('Valid price is required');
      expect(result.errors).toContain('Description is required');
    });
  });
});
