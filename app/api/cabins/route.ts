import { faker } from '@faker-js/faker';
import { NextResponse } from 'next/server';

export interface Cabin {
  id: number;
  name: string;
  image: string;
  capacity: number;
  price: number;
  discount: number;
  description: string;
  amenities: string[];
  created_at: string;
}

// Generate fake cabin data
const generateCabins = (): Cabin[] => {
  const cabins: Cabin[] = [];
  const cabinNames = [
    'Forest Retreat', 'Mountain View', 'Lakeside Haven', 'Pine Valley', 
    'Cedar Lodge', 'Sunrise Cabin', 'Wildflower Cottage', 'Eagle\'s Nest',
    'Riverbend Lodge', 'Autumn Leaves', 'Moonlight Cabin', 'Stargazer\'s Den'
  ];

  for (let i = 0; i < 12; i++) {
    const basePrice = faker.number.int({ min: 150, max: 500 });
    const discount = faker.number.int({ min: 0, max: 50 });
    
    cabins.push({
      id: i + 1,
      name: cabinNames[i] || faker.location.city() + ' Cabin',
      image: faker.helpers.arrayElement([
        'https://images.unsplash.com/photo-1586375300773-8384e3e4916f?w=400&h=300&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=400&h=300&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1520637836862-4d197d17c85a?w=400&h=300&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=300&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1470165301023-58dab8118cc9?w=400&h=300&auto=format&fit=crop'
      ]),
      capacity: faker.number.int({ min: 2, max: 8 }),
      price: basePrice,
      discount: discount,
      description: faker.lorem.paragraphs(2),
      amenities: faker.helpers.arrayElements([
        'WiFi', 'Kitchen', 'Fireplace', 'Hot Tub', 'BBQ Grill', 
        'Air Conditioning', 'Heating', 'TV', 'Coffee Maker', 'Microwave',
        'Dishwasher', 'Washer/Dryer', 'Balcony', 'Mountain View', 'Lake View'
      ], { min: 3, max: 7 }),
      created_at: faker.date.past({ years: 2 }).toISOString(),
    });
  }

  return cabins;
};

let cabinsData = generateCabins();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    let filteredCabins = [...cabinsData];

    // Apply filters
    if (filter) {
      switch (filter) {
        case 'with-discount':
          filteredCabins = filteredCabins.filter(cabin => cabin.discount > 0);
          break;
        case 'no-discount':
          filteredCabins = filteredCabins.filter(cabin => cabin.discount === 0);
          break;
        case 'small':
          filteredCabins = filteredCabins.filter(cabin => cabin.capacity <= 3);
          break;
        case 'medium':
          filteredCabins = filteredCabins.filter(cabin => cabin.capacity >= 4 && cabin.capacity <= 6);
          break;
        case 'large':
          filteredCabins = filteredCabins.filter(cabin => cabin.capacity >= 7);
          break;
      }
    }

    // Apply sorting
    filteredCabins.sort((a, b) => {
      let aValue = a[sortBy as keyof Cabin];
      let bValue = b[sortBy as keyof Cabin];

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    });

    return NextResponse.json(filteredCabins);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch cabins' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cabin = await request.json();
    const newCabin: Cabin = {
      ...cabin,
      id: Math.max(...cabinsData.map(c => c.id)) + 1,
      created_at: new Date().toISOString(),
    };
    
    cabinsData.push(newCabin);
    return NextResponse.json(newCabin, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create cabin' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const cabin = await request.json();
    const index = cabinsData.findIndex(c => c.id === cabin.id);
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Cabin not found' },
        { status: 404 }
      );
    }
    
    cabinsData[index] = { ...cabinsData[index], ...cabin };
    return NextResponse.json(cabinsData[index]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update cabin' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0');
    
    const index = cabinsData.findIndex(c => c.id === id);
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Cabin not found' },
        { status: 404 }
      );
    }
    
    cabinsData.splice(index, 1);
    return NextResponse.json({ message: 'Cabin deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete cabin' },
      { status: 500 }
    );
  }
}
