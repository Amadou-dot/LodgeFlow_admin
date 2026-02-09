import {
  createDiningSchema,
  updateDiningSchema,
  diningTypeSchema,
  mealTypeSchema,
} from '@/lib/validations/dining';

describe('Dining Validation Schemas', () => {
  describe('diningTypeSchema', () => {
    it('accepts valid dining types', () => {
      const validTypes = [
        'breakfast',
        'lunch',
        'dinner',
        'snack',
        'beverage',
        'dessert',
      ];
      validTypes.forEach(type => {
        expect(diningTypeSchema.safeParse(type).success).toBe(true);
      });
    });

    it('rejects invalid dining types', () => {
      const result = diningTypeSchema.safeParse('brunch');
      expect(result.success).toBe(false);
    });
  });

  describe('mealTypeSchema', () => {
    it('accepts valid meal types', () => {
      const validTypes = [
        'vegetarian',
        'vegan',
        'gluten-free',
        'dairy-free',
        'nut-free',
        'regular',
      ];
      validTypes.forEach(type => {
        expect(mealTypeSchema.safeParse(type).success).toBe(true);
      });
    });

    it('rejects invalid meal types', () => {
      const result = mealTypeSchema.safeParse('keto');
      expect(result.success).toBe(false);
    });
  });

  describe('createDiningSchema', () => {
    const validDining = {
      name: 'Continental Breakfast',
      description:
        'A delicious continental breakfast with fresh pastries and coffee.',
      type: 'breakfast',
      mealType: 'regular',
      category: 'Main',
      price: 25,
      servingTime: {
        start: '07:00',
        end: '10:30',
      },
      maxPeople: 50,
      image: 'https://example.com/breakfast.jpg',
    };

    it('accepts valid dining data', () => {
      const result = createDiningSchema.safeParse(validDining);
      expect(result.success).toBe(true);
    });

    it('applies default values', () => {
      const result = createDiningSchema.safeParse(validDining);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isAvailable).toBe(true);
        expect(result.data.isPopular).toBe(false);
      }
    });

    it('rejects empty name', () => {
      const dining = { ...validDining, name: '' };
      const result = createDiningSchema.safeParse(dining);
      expect(result.success).toBe(false);
    });

    it('rejects name over 100 characters', () => {
      const dining = { ...validDining, name: 'A'.repeat(101) };
      const result = createDiningSchema.safeParse(dining);
      expect(result.success).toBe(false);
    });

    it('rejects description under 10 characters', () => {
      const dining = { ...validDining, description: 'Short' };
      const result = createDiningSchema.safeParse(dining);
      expect(result.success).toBe(false);
    });

    it('rejects description over 1000 characters', () => {
      const dining = { ...validDining, description: 'A'.repeat(1001) };
      const result = createDiningSchema.safeParse(dining);
      expect(result.success).toBe(false);
    });

    it('rejects invalid dining type', () => {
      const dining = { ...validDining, type: 'invalid' };
      const result = createDiningSchema.safeParse(dining);
      expect(result.success).toBe(false);
    });

    it('rejects invalid meal type', () => {
      const dining = { ...validDining, mealType: 'invalid' };
      const result = createDiningSchema.safeParse(dining);
      expect(result.success).toBe(false);
    });

    it('rejects empty category', () => {
      const dining = { ...validDining, category: '' };
      const result = createDiningSchema.safeParse(dining);
      expect(result.success).toBe(false);
    });

    it('rejects zero price', () => {
      const dining = { ...validDining, price: 0 };
      const result = createDiningSchema.safeParse(dining);
      expect(result.success).toBe(false);
    });

    it('rejects negative price', () => {
      const dining = { ...validDining, price: -10 };
      const result = createDiningSchema.safeParse(dining);
      expect(result.success).toBe(false);
    });

    it('accepts valid serving time formats', () => {
      const validTimes = [
        { start: '00:00', end: '23:59' },
        { start: '9:00', end: '17:00' },
        { start: '12:30', end: '14:00' },
      ];
      validTimes.forEach(servingTime => {
        const dining = { ...validDining, servingTime };
        const result = createDiningSchema.safeParse(dining);
        expect(result.success).toBe(true);
      });
    });

    it('rejects invalid time format', () => {
      const invalidTimes = [
        { start: '7:00 AM', end: '10:00 AM' },
        { start: '25:00', end: '10:00' },
        { start: '12:60', end: '14:00' },
        { start: 'invalid', end: '10:00' },
      ];
      invalidTimes.forEach(servingTime => {
        const dining = { ...validDining, servingTime };
        const result = createDiningSchema.safeParse(dining);
        expect(result.success).toBe(false);
      });
    });

    it('rejects maxPeople less than 1', () => {
      const dining = { ...validDining, maxPeople: 0 };
      const result = createDiningSchema.safeParse(dining);
      expect(result.success).toBe(false);
    });

    it('rejects maxPeople greater than 100', () => {
      const dining = { ...validDining, maxPeople: 101 };
      const result = createDiningSchema.safeParse(dining);
      expect(result.success).toBe(false);
    });

    it('rejects non-integer maxPeople', () => {
      const dining = { ...validDining, maxPeople: 25.5 };
      const result = createDiningSchema.safeParse(dining);
      expect(result.success).toBe(false);
    });

    it('rejects invalid image URL', () => {
      const dining = { ...validDining, image: 'not-a-url' };
      const result = createDiningSchema.safeParse(dining);
      expect(result.success).toBe(false);
    });

    it('accepts ingredients array', () => {
      const dining = {
        ...validDining,
        ingredients: ['eggs', 'bacon', 'toast'],
      };
      const result = createDiningSchema.safeParse(dining);
      expect(result.success).toBe(true);
    });

    it('accepts allergens array', () => {
      const dining = {
        ...validDining,
        allergens: ['gluten', 'dairy', 'eggs'],
      };
      const result = createDiningSchema.safeParse(dining);
      expect(result.success).toBe(true);
    });

    it('accepts calories as positive integer', () => {
      const dining = { ...validDining, calories: 500 };
      const result = createDiningSchema.safeParse(dining);
      expect(result.success).toBe(true);
    });

    it('accepts zero calories', () => {
      const dining = { ...validDining, calories: 0 };
      const result = createDiningSchema.safeParse(dining);
      expect(result.success).toBe(true);
    });

    it('rejects negative calories', () => {
      const dining = { ...validDining, calories: -100 };
      const result = createDiningSchema.safeParse(dining);
      expect(result.success).toBe(false);
    });

    it('accepts isPopular true', () => {
      const dining = { ...validDining, isPopular: true };
      const result = createDiningSchema.safeParse(dining);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isPopular).toBe(true);
      }
    });
  });

  describe('updateDiningSchema', () => {
    it('requires _id field', () => {
      const result = updateDiningSchema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('_id');
      }
    });

    it('accepts valid update with only _id', () => {
      const result = updateDiningSchema.safeParse({
        _id: '65a1b2c3d4e5f6a7b8c9d0e1',
      });
      expect(result.success).toBe(true);
    });

    it('accepts partial updates', () => {
      const result = updateDiningSchema.safeParse({
        _id: '65a1b2c3d4e5f6a7b8c9d0e1',
        name: 'Updated Breakfast',
        price: 30,
      });
      expect(result.success).toBe(true);
    });

    it('validates dining type on update', () => {
      const result = updateDiningSchema.safeParse({
        _id: '65a1b2c3d4e5f6a7b8c9d0e1',
        type: 'invalid',
      });
      expect(result.success).toBe(false);
    });

    it('validates serving time format on update', () => {
      const result = updateDiningSchema.safeParse({
        _id: '65a1b2c3d4e5f6a7b8c9d0e1',
        servingTime: {
          start: 'invalid',
          end: '10:00',
        },
      });
      expect(result.success).toBe(false);
    });

    it('accepts isAvailable update', () => {
      const result = updateDiningSchema.safeParse({
        _id: '65a1b2c3d4e5f6a7b8c9d0e1',
        isAvailable: false,
      });
      expect(result.success).toBe(true);
    });

    it('accepts ingredients update', () => {
      const result = updateDiningSchema.safeParse({
        _id: '65a1b2c3d4e5f6a7b8c9d0e1',
        ingredients: ['new ingredient'],
      });
      expect(result.success).toBe(true);
    });

    it('accepts allergens update', () => {
      const result = updateDiningSchema.safeParse({
        _id: '65a1b2c3d4e5f6a7b8c9d0e1',
        allergens: ['peanuts'],
      });
      expect(result.success).toBe(true);
    });
  });
});
