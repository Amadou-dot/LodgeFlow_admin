import {
  createExperienceSchema,
  updateExperienceSchema,
  difficultySchema,
} from '@/lib/validations/experience';

describe('Experience Validation Schemas', () => {
  describe('difficultySchema', () => {
    it('accepts valid difficulty levels', () => {
      const validLevels = ['easy', 'moderate', 'challenging', 'expert'];
      validLevels.forEach(level => {
        expect(difficultySchema.safeParse(level).success).toBe(true);
      });
    });

    it('rejects invalid difficulty levels', () => {
      const invalidLevels = ['beginner', 'hard', 'extreme', 'intermediate'];
      invalidLevels.forEach(level => {
        expect(difficultySchema.safeParse(level).success).toBe(false);
      });
    });
  });

  describe('createExperienceSchema', () => {
    const validExperience = {
      name: 'Mountain Hiking Tour',
      description:
        'An exciting hiking tour through scenic mountain trails with breathtaking views.',
      duration: '4 hours',
      price: 75,
      difficulty: 'moderate',
      maxParticipants: 12,
      category: 'Outdoor',
    };

    it('accepts valid experience data', () => {
      const result = createExperienceSchema.safeParse(validExperience);
      expect(result.success).toBe(true);
    });

    it('applies default values', () => {
      const result = createExperienceSchema.safeParse(validExperience);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isAvailable).toBe(true);
        expect(result.data.isFeatured).toBe(false);
      }
    });

    it('rejects empty name', () => {
      const experience = { ...validExperience, name: '' };
      const result = createExperienceSchema.safeParse(experience);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Name is required');
      }
    });

    it('rejects name over 100 characters', () => {
      const experience = { ...validExperience, name: 'A'.repeat(101) };
      const result = createExperienceSchema.safeParse(experience);
      expect(result.success).toBe(false);
    });

    it('rejects description under 10 characters', () => {
      const experience = { ...validExperience, description: 'Short' };
      const result = createExperienceSchema.safeParse(experience);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          'at least 10 characters'
        );
      }
    });

    it('rejects description over 2000 characters', () => {
      const experience = { ...validExperience, description: 'A'.repeat(2001) };
      const result = createExperienceSchema.safeParse(experience);
      expect(result.success).toBe(false);
    });

    it('accepts description at boundary (10 chars)', () => {
      const experience = { ...validExperience, description: 'A'.repeat(10) };
      const result = createExperienceSchema.safeParse(experience);
      expect(result.success).toBe(true);
    });

    it('rejects empty duration', () => {
      const experience = { ...validExperience, duration: '' };
      const result = createExperienceSchema.safeParse(experience);
      expect(result.success).toBe(false);
    });

    it('rejects duration over 50 characters', () => {
      const experience = { ...validExperience, duration: 'A'.repeat(51) };
      const result = createExperienceSchema.safeParse(experience);
      expect(result.success).toBe(false);
    });

    it('accepts zero price (free experiences)', () => {
      const experience = { ...validExperience, price: 0 };
      const result = createExperienceSchema.safeParse(experience);
      expect(result.success).toBe(true);
    });

    it('rejects negative price', () => {
      const experience = { ...validExperience, price: -10 };
      const result = createExperienceSchema.safeParse(experience);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('cannot be negative');
      }
    });

    it('accepts all difficulty levels', () => {
      const levels = ['easy', 'moderate', 'challenging', 'expert'] as const;
      levels.forEach(difficulty => {
        const experience = { ...validExperience, difficulty };
        const result = createExperienceSchema.safeParse(experience);
        expect(result.success).toBe(true);
      });
    });

    it('rejects invalid difficulty', () => {
      const experience = { ...validExperience, difficulty: 'super-hard' };
      const result = createExperienceSchema.safeParse(experience);
      expect(result.success).toBe(false);
    });

    it('rejects maxParticipants less than 1', () => {
      const experience = { ...validExperience, maxParticipants: 0 };
      const result = createExperienceSchema.safeParse(experience);
      expect(result.success).toBe(false);
    });

    it('rejects maxParticipants greater than 100', () => {
      const experience = { ...validExperience, maxParticipants: 101 };
      const result = createExperienceSchema.safeParse(experience);
      expect(result.success).toBe(false);
    });

    it('rejects non-integer maxParticipants', () => {
      const experience = { ...validExperience, maxParticipants: 12.5 };
      const result = createExperienceSchema.safeParse(experience);
      expect(result.success).toBe(false);
    });

    it('accepts valid image URL', () => {
      const experience = {
        ...validExperience,
        image: 'https://example.com/tour.jpg',
      };
      const result = createExperienceSchema.safeParse(experience);
      expect(result.success).toBe(true);
    });

    it('rejects invalid image URL', () => {
      const experience = { ...validExperience, image: 'not-a-url' };
      const result = createExperienceSchema.safeParse(experience);
      expect(result.success).toBe(false);
    });

    it('allows missing image (optional)', () => {
      const result = createExperienceSchema.safeParse(validExperience);
      expect(result.success).toBe(true);
    });

    it('rejects empty category', () => {
      const experience = { ...validExperience, category: '' };
      const result = createExperienceSchema.safeParse(experience);
      expect(result.success).toBe(false);
    });

    it('rejects category over 50 characters', () => {
      const experience = { ...validExperience, category: 'A'.repeat(51) };
      const result = createExperienceSchema.safeParse(experience);
      expect(result.success).toBe(false);
    });

    it('accepts included array', () => {
      const experience = {
        ...validExperience,
        included: ['Guide', 'Equipment', 'Snacks'],
      };
      const result = createExperienceSchema.safeParse(experience);
      expect(result.success).toBe(true);
    });

    it('accepts empty included array', () => {
      const experience = {
        ...validExperience,
        included: [],
      };
      const result = createExperienceSchema.safeParse(experience);
      expect(result.success).toBe(true);
    });

    it('accepts requirements array', () => {
      const experience = {
        ...validExperience,
        requirements: ['Hiking boots', 'Water bottle', 'Sunscreen'],
      };
      const result = createExperienceSchema.safeParse(experience);
      expect(result.success).toBe(true);
    });

    it('accepts location', () => {
      const experience = {
        ...validExperience,
        location: 'Mountain Peak Resort, Colorado',
      };
      const result = createExperienceSchema.safeParse(experience);
      expect(result.success).toBe(true);
    });

    it('rejects location over 200 characters', () => {
      const experience = { ...validExperience, location: 'A'.repeat(201) };
      const result = createExperienceSchema.safeParse(experience);
      expect(result.success).toBe(false);
    });

    it('accepts isFeatured true', () => {
      const experience = { ...validExperience, isFeatured: true };
      const result = createExperienceSchema.safeParse(experience);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isFeatured).toBe(true);
      }
    });
  });

  describe('updateExperienceSchema', () => {
    it('accepts empty update', () => {
      const result = updateExperienceSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('accepts partial updates', () => {
      const result = updateExperienceSchema.safeParse({
        name: 'Updated Tour Name',
        price: 100,
      });
      expect(result.success).toBe(true);
    });

    it('validates name on update', () => {
      const result = updateExperienceSchema.safeParse({
        name: '', // Empty name should fail min(1) validation
      });
      expect(result.success).toBe(false);
    });

    it('validates description on update', () => {
      const result = updateExperienceSchema.safeParse({
        description: 'Short', // Under 10 chars should fail
      });
      expect(result.success).toBe(false);
    });

    it('validates difficulty on update', () => {
      const result = updateExperienceSchema.safeParse({
        difficulty: 'invalid',
      });
      expect(result.success).toBe(false);
    });

    it('validates maxParticipants on update', () => {
      const result = updateExperienceSchema.safeParse({
        maxParticipants: 150,
      });
      expect(result.success).toBe(false);
    });

    it('validates image URL on update', () => {
      const result = updateExperienceSchema.safeParse({
        image: 'invalid-url',
      });
      expect(result.success).toBe(false);
    });

    it('accepts isAvailable update', () => {
      const result = updateExperienceSchema.safeParse({
        isAvailable: false,
      });
      expect(result.success).toBe(true);
    });

    it('accepts isFeatured update', () => {
      const result = updateExperienceSchema.safeParse({
        isFeatured: true,
      });
      expect(result.success).toBe(true);
    });

    it('accepts included update', () => {
      const result = updateExperienceSchema.safeParse({
        included: ['New item'],
      });
      expect(result.success).toBe(true);
    });

    it('accepts requirements update', () => {
      const result = updateExperienceSchema.safeParse({
        requirements: ['New requirement'],
      });
      expect(result.success).toBe(true);
    });

    it('accepts location update', () => {
      const result = updateExperienceSchema.safeParse({
        location: 'New Location',
      });
      expect(result.success).toBe(true);
    });

    it('validates all fields together', () => {
      const result = updateExperienceSchema.safeParse({
        name: 'Updated Experience',
        description: 'This is a valid description for the experience update.',
        duration: '3 hours',
        price: 50,
        difficulty: 'easy',
        maxParticipants: 20,
        category: 'Adventure',
        isAvailable: true,
        isFeatured: true,
      });
      expect(result.success).toBe(true);
    });
  });
});
