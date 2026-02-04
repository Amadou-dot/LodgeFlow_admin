import { createCabinSchema, updateCabinSchema } from '@/lib/validations/cabin';

describe('Cabin Validation Schemas', () => {
  describe('createCabinSchema', () => {
    const validCabin = {
      name: 'Lakeside Cabin',
      description: 'A beautiful cabin with stunning lake views and modern amenities.',
      capacity: 4,
      price: 200,
    };

    it('accepts valid cabin data', () => {
      const result = createCabinSchema.safeParse(validCabin);
      expect(result.success).toBe(true);
    });

    it('applies default values', () => {
      const result = createCabinSchema.safeParse(validCabin);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.discount).toBe(0);
        expect(result.data.isAvailable).toBe(true);
      }
    });

    it('rejects empty name', () => {
      const cabin = { ...validCabin, name: '' };
      const result = createCabinSchema.safeParse(cabin);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('name');
      }
    });

    it('rejects name over 100 characters', () => {
      const cabin = { ...validCabin, name: 'A'.repeat(101) };
      const result = createCabinSchema.safeParse(cabin);
      expect(result.success).toBe(false);
    });

    it('rejects description under 10 characters', () => {
      const cabin = { ...validCabin, description: 'Short' };
      const result = createCabinSchema.safeParse(cabin);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 10 characters');
      }
    });

    it('rejects description over 2000 characters', () => {
      const cabin = { ...validCabin, description: 'A'.repeat(2001) };
      const result = createCabinSchema.safeParse(cabin);
      expect(result.success).toBe(false);
    });

    it('accepts description at boundary (10 chars)', () => {
      const cabin = { ...validCabin, description: 'A'.repeat(10) };
      const result = createCabinSchema.safeParse(cabin);
      expect(result.success).toBe(true);
    });

    it('rejects capacity less than 1', () => {
      const cabin = { ...validCabin, capacity: 0 };
      const result = createCabinSchema.safeParse(cabin);
      expect(result.success).toBe(false);
    });

    it('rejects capacity greater than 20', () => {
      const cabin = { ...validCabin, capacity: 21 };
      const result = createCabinSchema.safeParse(cabin);
      expect(result.success).toBe(false);
    });

    it('rejects non-integer capacity', () => {
      const cabin = { ...validCabin, capacity: 4.5 };
      const result = createCabinSchema.safeParse(cabin);
      expect(result.success).toBe(false);
    });

    it('rejects zero price', () => {
      const cabin = { ...validCabin, price: 0 };
      const result = createCabinSchema.safeParse(cabin);
      expect(result.success).toBe(false);
    });

    it('rejects negative price', () => {
      const cabin = { ...validCabin, price: -50 };
      const result = createCabinSchema.safeParse(cabin);
      expect(result.success).toBe(false);
    });

    it('accepts discount less than price', () => {
      const cabin = { ...validCabin, discount: 50 };
      const result = createCabinSchema.safeParse(cabin);
      expect(result.success).toBe(true);
    });

    it('rejects discount equal to price', () => {
      const cabin = { ...validCabin, discount: 200 };
      const result = createCabinSchema.safeParse(cabin);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Discount cannot be greater than or equal to the price');
      }
    });

    it('rejects discount greater than price', () => {
      const cabin = { ...validCabin, discount: 250 };
      const result = createCabinSchema.safeParse(cabin);
      expect(result.success).toBe(false);
    });

    it('accepts zero discount', () => {
      const cabin = { ...validCabin, discount: 0 };
      const result = createCabinSchema.safeParse(cabin);
      expect(result.success).toBe(true);
    });

    it('rejects negative discount', () => {
      const cabin = { ...validCabin, discount: -10 };
      const result = createCabinSchema.safeParse(cabin);
      expect(result.success).toBe(false);
    });

    it('accepts valid image URL', () => {
      const cabin = { ...validCabin, image: 'https://example.com/cabin.jpg' };
      const result = createCabinSchema.safeParse(cabin);
      expect(result.success).toBe(true);
    });

    it('rejects invalid image URL', () => {
      const cabin = { ...validCabin, image: 'not-a-url' };
      const result = createCabinSchema.safeParse(cabin);
      expect(result.success).toBe(false);
    });

    it('accepts amenities object', () => {
      const cabin = {
        ...validCabin,
        amenities: {
          wifi: true,
          tv: true,
          pool: false,
          hotTub: true,
        },
      };
      const result = createCabinSchema.safeParse(cabin);
      expect(result.success).toBe(true);
    });

    it('applies default amenities values', () => {
      const cabin = {
        ...validCabin,
        amenities: {},
      };
      const result = createCabinSchema.safeParse(cabin);
      expect(result.success).toBe(true);
      if (result.success && result.data.amenities) {
        expect(result.data.amenities.wifi).toBe(true);
        expect(result.data.amenities.tv).toBe(true);
        expect(result.data.amenities.pool).toBe(false);
      }
    });
  });

  describe('updateCabinSchema', () => {
    it('requires _id field', () => {
      const result = updateCabinSchema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('_id');
      }
    });

    it('accepts valid update with only _id', () => {
      const result = updateCabinSchema.safeParse({
        _id: '65a1b2c3d4e5f6a7b8c9d0e1',
      });
      expect(result.success).toBe(true);
    });

    it('accepts partial updates', () => {
      const result = updateCabinSchema.safeParse({
        _id: '65a1b2c3d4e5f6a7b8c9d0e1',
        name: 'Updated Cabin Name',
        price: 250,
      });
      expect(result.success).toBe(true);
    });

    it('validates discount vs price when both provided', () => {
      const result = updateCabinSchema.safeParse({
        _id: '65a1b2c3d4e5f6a7b8c9d0e1',
        price: 100,
        discount: 150,
      });
      expect(result.success).toBe(false);
    });

    it('accepts discount update alone (no price check needed)', () => {
      const result = updateCabinSchema.safeParse({
        _id: '65a1b2c3d4e5f6a7b8c9d0e1',
        discount: 50,
      });
      expect(result.success).toBe(true);
    });

    it('accepts price update alone (no discount check needed)', () => {
      const result = updateCabinSchema.safeParse({
        _id: '65a1b2c3d4e5f6a7b8c9d0e1',
        price: 300,
      });
      expect(result.success).toBe(true);
    });

    it('validates URL format on image update', () => {
      const result = updateCabinSchema.safeParse({
        _id: '65a1b2c3d4e5f6a7b8c9d0e1',
        image: 'invalid-url',
      });
      expect(result.success).toBe(false);
    });

    it('accepts isAvailable update', () => {
      const result = updateCabinSchema.safeParse({
        _id: '65a1b2c3d4e5f6a7b8c9d0e1',
        isAvailable: false,
      });
      expect(result.success).toBe(true);
    });
  });
});
