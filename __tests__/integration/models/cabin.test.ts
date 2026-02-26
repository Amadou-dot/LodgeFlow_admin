import Cabin from '@/models/Cabin';

function createCabinData(overrides: Record<string, any> = {}) {
  return {
    name: 'Mountain Lodge',
    description: 'A cozy cabin in the mountains',
    capacity: 4,
    price: 200,
    discount: 0,
    image: 'https://example.com/cabin.jpg',
    amenities: ['WiFi', 'Air Conditioning'],
    status: 'active' as const,
    ...overrides,
  };
}

describe('Cabin Model', () => {
  describe('Document Creation', () => {
    it('creates a cabin with valid data', async () => {
      const cabin = await Cabin.create(createCabinData());

      expect(cabin._id).toBeDefined();
      expect(cabin.name).toBe('Mountain Lodge');
      expect(cabin.capacity).toBe(4);
      expect(cabin.price).toBe(200);
      expect(cabin.status).toBe('active');
    });

    it('sets default values', async () => {
      const cabin = await Cabin.create(createCabinData());

      expect(cabin.discount).toBe(0);
      expect(cabin.extraGuestFee).toBe(0);
      expect(cabin.status).toBe('active');
    });

    it('requires name', async () => {
      await expect(
        Cabin.create(createCabinData({ name: undefined }))
      ).rejects.toThrow(/Cabin name is required/);
    });

    it('requires image', async () => {
      await expect(
        Cabin.create(createCabinData({ image: undefined }))
      ).rejects.toThrow(/Cabin image is required/);
    });

    it('requires description', async () => {
      await expect(
        Cabin.create(createCabinData({ description: undefined }))
      ).rejects.toThrow(/Description is required/);
    });

    it('validates image URL format', async () => {
      await expect(
        Cabin.create(createCabinData({ image: 'not-a-url' }))
      ).rejects.toThrow(/valid image URL/);
    });

    it('validates capacity minimum (1)', async () => {
      await expect(
        Cabin.create(createCabinData({ capacity: 0 }))
      ).rejects.toThrow(/Capacity must be at least 1/);
    });

    it('validates capacity maximum (20)', async () => {
      await expect(
        Cabin.create(createCabinData({ capacity: 21 }))
      ).rejects.toThrow(/Capacity cannot exceed 20/);
    });

    it('validates price is positive', async () => {
      await expect(
        Cabin.create(createCabinData({ price: -10 }))
      ).rejects.toThrow(/Price must be positive/);
    });

    it('validates name max length', async () => {
      const longName = 'a'.repeat(101);
      await expect(
        Cabin.create(createCabinData({ name: longName }))
      ).rejects.toThrow(/Cabin name cannot exceed 100 characters/);
    });

    it('validates description max length', async () => {
      const longDesc = 'a'.repeat(1001);
      await expect(
        Cabin.create(createCabinData({ description: longDesc }))
      ).rejects.toThrow(/Description cannot exceed 1000 characters/);
    });

    it('validates status enum', async () => {
      await expect(
        Cabin.create(createCabinData({ status: 'invalid' }))
      ).rejects.toThrow();
    });

    it('validates gallery image URLs', async () => {
      await expect(
        Cabin.create(createCabinData({ images: ['not-a-url'] }))
      ).rejects.toThrow(/valid image URL/);
    });

    it('accepts valid gallery image URLs', async () => {
      const cabin = await Cabin.create(
        createCabinData({
          images: [
            'https://example.com/img1.jpg',
            'https://example.com/img2.jpg',
          ],
        })
      );

      expect(cabin.images).toHaveLength(2);
    });
  });

  describe('CRUD Operations', () => {
    it('reads cabin by ID', async () => {
      const created = await Cabin.create(createCabinData());
      const found = await Cabin.findById(created._id);

      expect(found).not.toBeNull();
      expect(found!.name).toBe('Mountain Lodge');
    });

    it('updates cabin fields', async () => {
      const cabin = await Cabin.create(createCabinData());
      cabin.price = 300;
      await cabin.save();

      const updated = await Cabin.findById(cabin._id);
      expect(updated!.price).toBe(300);
    });

    it('deletes cabin', async () => {
      const cabin = await Cabin.create(createCabinData());
      await Cabin.findByIdAndDelete(cabin._id);

      const found = await Cabin.findById(cabin._id);
      expect(found).toBeNull();
    });
  });

  describe('Virtuals', () => {
    it('calculates discountedPrice', async () => {
      const cabin = await Cabin.create(
        createCabinData({ price: 200, discount: 50 })
      );
      const json = cabin.toJSON();

      expect(json.discountedPrice).toBe(150);
    });

    it('discountedPrice equals price when no discount', async () => {
      const cabin = await Cabin.create(
        createCabinData({ price: 200, discount: 0 })
      );
      const json = cabin.toJSON();

      expect(json.discountedPrice).toBe(200);
    });
  });

  describe('Indexes', () => {
    it('has index on capacity', async () => {
      const indexes = await Cabin.collection.indexes();
      const idx = indexes.find((i: any) => i.key.capacity === 1);
      expect(idx).toBeDefined();
    });

    it('has index on price', async () => {
      const indexes = await Cabin.collection.indexes();
      const idx = indexes.find((i: any) => i.key.price === 1);
      expect(idx).toBeDefined();
    });

    it('has text index on name and description', async () => {
      const indexes = await Cabin.collection.indexes();
      const textIdx = indexes.find(
        (i: any) => i.key._fts === 'text'
      );
      expect(textIdx).toBeDefined();
    });
  });
});
