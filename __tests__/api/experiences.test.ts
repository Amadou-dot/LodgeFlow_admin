/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/experiences/route';
import { GET as getById, PUT, DELETE } from '@/app/api/experiences/[id]/route';
import connectToDatabase from '@/lib/mongodb';
import { Experience } from '@/models/Experience';

// Mock the database connection
jest.mock('@/lib/mongodb');
const mockConnectToDatabase = connectToDatabase as jest.MockedFunction<typeof connectToDatabase>;

// Mock the Experience model
jest.mock('@/models/Experience');
const MockExperience = Experience as jest.MockedClass<typeof Experience>;

// Mock data
const mockExperienceData = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Mountain Hiking Adventure',
  price: 299,
  duration: '4 hours',
  difficulty: 'Moderate' as const,
  category: 'Adventure',
  description: 'Experience the thrill of mountain hiking',
  image: '/images/hiking.jpg',
  includes: ['Guide', 'Equipment', 'Snacks'],
  available: ['2024-06-01', '2024-06-15'],
  ctaText: 'Book Now',
  isPopular: true,
  maxParticipants: 12,
  minAge: 16,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const mockExperienceList = [
  mockExperienceData,
  {
    ...mockExperienceData,
    _id: '507f1f77bcf86cd799439012',
    name: 'River Rafting',
    price: 199,
    category: 'Water Sports',
  },
];

describe('/api/experiences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConnectToDatabase.mockResolvedValue({} as any);
  });

  describe('GET /api/experiences', () => {
    it('should return all experiences', async () => {
      // Mock Experience.find to return mock data
      MockExperience.find = jest.fn().mockResolvedValue(mockExperienceList);

      const response = await GET();
      const data = await response.json();

      expect(mockConnectToDatabase).toHaveBeenCalledTimes(1);
      expect(MockExperience.find).toHaveBeenCalledWith({});
      expect(response.status).toBe(200);
      expect(data).toEqual(mockExperienceList);
    });

    it('should handle database errors', async () => {
      MockExperience.find = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch experiences' });
    });
  });

  describe('POST /api/experiences', () => {
    it('should create a new experience', async () => {
      const mockSave = jest.fn().mockResolvedValue(mockExperienceData);
      MockExperience.mockImplementation(() => ({
        save: mockSave,
        ...mockExperienceData,
      }) as any);

      const request = new NextRequest('http://localhost/api/experiences', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Mountain Hiking Adventure',
          price: 299,
          duration: '4 hours',
          difficulty: 'Moderate',
          category: 'Adventure',
          description: 'Experience the thrill of mountain hiking',
          image: '/images/hiking.jpg',
          includes: ['Guide', 'Equipment', 'Snacks'],
          available: ['2024-06-01', '2024-06-15'],
          ctaText: 'Book Now',
          isPopular: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(mockConnectToDatabase).toHaveBeenCalledTimes(1);
      expect(MockExperience).toHaveBeenCalledWith({
        name: 'Mountain Hiking Adventure',
        price: 299,
        duration: '4 hours',
        difficulty: 'Moderate',
        category: 'Adventure',
        description: 'Experience the thrill of mountain hiking',
        image: '/images/hiking.jpg',
        includes: ['Guide', 'Equipment', 'Snacks'],
        available: ['2024-06-01', '2024-06-15'],
        ctaText: 'Book Now',
        isPopular: true,
      });
      expect(mockSave).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(201);
      expect(data).toEqual(mockExperienceData);
    });

    it('should handle creation errors', async () => {
      MockExperience.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(new Error('Validation error')),
      }) as any);

      const request = new NextRequest('http://localhost/api/experiences', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Experience' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create experience' });
    });

    it('should handle invalid JSON', async () => {
      const request = new NextRequest('http://localhost/api/experiences', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create experience' });
    });
  });
});

describe('/api/experiences/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConnectToDatabase.mockResolvedValue({} as any);
  });

  describe('GET /api/experiences/[id]', () => {
    it('should return a specific experience', async () => {
      MockExperience.findById = jest.fn().mockResolvedValue(mockExperienceData);

      const request = new NextRequest('http://localhost/api/experiences/507f1f77bcf86cd799439011');
      const params = Promise.resolve({ id: '507f1f77bcf86cd799439011' });

      const response = await getById(request, { params });
      const data = await response.json();

      expect(mockConnectToDatabase).toHaveBeenCalledTimes(1);
      expect(MockExperience.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(response.status).toBe(200);
      expect(data).toEqual(mockExperienceData);
    });

    it('should return 404 when experience not found', async () => {
      MockExperience.findById = jest.fn().mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/experiences/nonexistent');
      const params = Promise.resolve({ id: 'nonexistent' });

      const response = await getById(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Experience not found' });
    });

    it('should handle database errors', async () => {
      MockExperience.findById = jest.fn().mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/experiences/507f1f77bcf86cd799439011');
      const params = Promise.resolve({ id: '507f1f77bcf86cd799439011' });

      const response = await getById(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch experience' });
    });
  });

  describe('PUT /api/experiences/[id]', () => {
    it('should update an existing experience', async () => {
      const updatedData = { ...mockExperienceData, name: 'Updated Adventure' };
      MockExperience.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedData);

      const request = new NextRequest('http://localhost/api/experiences/507f1f77bcf86cd799439011', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Adventure' }),
      });
      const params = Promise.resolve({ id: '507f1f77bcf86cd799439011' });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(mockConnectToDatabase).toHaveBeenCalledTimes(1);
      expect(MockExperience.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { name: 'Updated Adventure' },
        { new: true }
      );
      expect(response.status).toBe(200);
      expect(data).toEqual(updatedData);
    });

    it('should return 404 when updating non-existent experience', async () => {
      MockExperience.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/experiences/nonexistent', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Adventure' }),
      });
      const params = Promise.resolve({ id: 'nonexistent' });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Experience not found' });
    });

    it('should handle update errors', async () => {
      MockExperience.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Update error'));

      const request = new NextRequest('http://localhost/api/experiences/507f1f77bcf86cd799439011', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Adventure' }),
      });
      const params = Promise.resolve({ id: '507f1f77bcf86cd799439011' });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to update experience' });
    });

    it('should handle invalid JSON in PUT request', async () => {
      const request = new NextRequest('http://localhost/api/experiences/507f1f77bcf86cd799439011', {
        method: 'PUT',
        body: 'invalid json',
      });
      const params = Promise.resolve({ id: '507f1f77bcf86cd799439011' });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to update experience' });
    });
  });

  describe('DELETE /api/experiences/[id]', () => {
    it('should delete an existing experience', async () => {
      MockExperience.findByIdAndDelete = jest.fn().mockResolvedValue(mockExperienceData);

      const request = new NextRequest('http://localhost/api/experiences/507f1f77bcf86cd799439011', {
        method: 'DELETE',
      });
      const params = Promise.resolve({ id: '507f1f77bcf86cd799439011' });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(mockConnectToDatabase).toHaveBeenCalledTimes(1);
      expect(MockExperience.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(response.status).toBe(200);
      expect(data).toEqual({ message: 'Experience deleted' });
    });

    it('should return 404 when deleting non-existent experience', async () => {
      MockExperience.findByIdAndDelete = jest.fn().mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/experiences/nonexistent', {
        method: 'DELETE',
      });
      const params = Promise.resolve({ id: 'nonexistent' });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Experience not found' });
    });

    it('should handle deletion errors', async () => {
      MockExperience.findByIdAndDelete = jest.fn().mockRejectedValue(new Error('Delete error'));

      const request = new NextRequest('http://localhost/api/experiences/507f1f77bcf86cd799439011', {
        method: 'DELETE',
      });
      const params = Promise.resolve({ id: '507f1f77bcf86cd799439011' });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to delete experience' });
    });
  });
});
