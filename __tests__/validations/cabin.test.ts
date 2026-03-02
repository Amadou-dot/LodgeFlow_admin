import { createCabinSchema, updateCabinSchema } from '@/lib/validations/cabin';

describe('Cabin Validation Schemas', () => {
  describe('createCabinSchema', () => {
    const validCabin = {
      name: 'Lakeside Cabin',
      description: 'A beautiful cabin with stunning lake views.',
      capacity: 4,
      price: 200,
      image: 'https://example.com/cabin.jpg',
    };

    it('accepts valid cabin data', () => {
      const result = createCabinSchema.safeParse(validCabin);
      expect(result.success).toBe(true);
    });

    it('applies canonical defaults', () => {
      const result = createCabinSchema.safeParse(validCabin);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.discount).toBe(0);
        expect(result.data.images).toEqual([]);
        expect(result.data.status).toBe('active');
        expect(result.data.amenities).toEqual([]);
        expect(result.data.extraGuestFee).toBe(0);
      }
    });

    it('rejects invalid image URL', () => {
      const result = createCabinSchema.safeParse({
        ...validCabin,
        image: 'not-a-url',
      });
      expect(result.success).toBe(false);
    });

    it('accepts amenities as string array', () => {
      const result = createCabinSchema.safeParse({
        ...validCabin,
        amenities: ['WiFi', 'Hot Tub'],
      });
      expect(result.success).toBe(true);
    });

    it('rejects legacy amenities object shape', () => {
      const result = createCabinSchema.safeParse({
        ...validCabin,
        amenities: { wifi: true },
      });
      expect(result.success).toBe(false);
    });

    it('rejects discount above price', () => {
      const result = createCabinSchema.safeParse({
        ...validCabin,
        discount: 250,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          'Discount cannot exceed the cabin price'
        );
      }
    });
  });

  describe('updateCabinSchema', () => {
    it('requires _id field', () => {
      const result = updateCabinSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('accepts valid canonical partial update', () => {
      const result = updateCabinSchema.safeParse({
        _id: '65a1b2c3d4e5f6a7b8c9d0e1',
        status: 'maintenance',
        images: ['https://example.com/1.jpg'],
        amenities: ['WiFi'],
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid status', () => {
      const result = updateCabinSchema.safeParse({
        _id: '65a1b2c3d4e5f6a7b8c9d0e1',
        status: 'invalid',
      });
      expect(result.success).toBe(false);
    });

    it('validates discount against provided price', () => {
      const result = updateCabinSchema.safeParse({
        _id: '65a1b2c3d4e5f6a7b8c9d0e1',
        price: 100,
        discount: 150,
      });
      expect(result.success).toBe(false);
    });
  });
});
