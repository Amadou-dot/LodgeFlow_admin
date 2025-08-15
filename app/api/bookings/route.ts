import { faker } from '@faker-js/faker';
import { NextRequest } from 'next/server';

export interface Guest {
  id: number;
  name: string;
  email: string;
  nationality: string;
  nationalId: string;
}

export interface Booking {
  id: number;
  cabinName: string;
  guest: Guest;
  checkInDate: string;
  checkOutDate: string;
  numNights: number;
  status: 'unconfirmed' | 'checked-in' | 'checked-out' | 'cancelled';
  totalPrice: number;
  cabinPrice: number;
  created_at: string;
}

const generateGuest = (): Guest => ({
  id: faker.number.int({ min: 1, max: 1000 }),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  nationality: faker.location.country(),
  nationalId: faker.string.alphanumeric(10).toUpperCase(),
});

const generateBookings = (): Booking[] => {
  const bookings: Booking[] = [];
  const cabinNames = [
    'Pine Valley Cabin', 'Mountain View Lodge', 'Sunset Retreat', 'Lakeside Haven',
    'Forest Edge Cabin', 'Alpine Paradise', 'Cozy Creek Cottage', 'Wilderness Lodge',
    'Rustic Mountain Cabin', 'Peaceful Valley Retreat', 'Cedar Point Lodge', 'Tranquil Waters'
  ];

  for (let i = 0; i < 50; i++) {
    const cabinPrice = faker.number.int({ min: 100, max: 400 });
    const numNights = faker.number.int({ min: 1, max: 14 });
    const totalPrice = cabinPrice * numNights;
    
    // Generate dates based on status
    const status = faker.helpers.arrayElement(['unconfirmed', 'checked-in', 'checked-out', 'cancelled']);
    let checkInDate: Date;
    let checkOutDate: Date;

    switch (status) {
      case 'unconfirmed':
        // Future bookings
        checkInDate = faker.date.future({ years: 1 });
        checkOutDate = new Date(checkInDate);
        checkOutDate.setDate(checkOutDate.getDate() + numNights);
        break;
      case 'checked-in':
        // Currently staying (check-in in the past, check-out in future)
        checkInDate = faker.date.recent({ days: 7 });
        checkOutDate = new Date();
        checkOutDate.setDate(checkOutDate.getDate() + faker.number.int({ min: 1, max: 7 }));
        break;
      case 'checked-out':
        // Past stays
        checkOutDate = faker.date.recent({ days: 30 });
        checkInDate = new Date(checkOutDate);
        checkInDate.setDate(checkInDate.getDate() - numNights);
        break;
      case 'cancelled':
        // Can be any time
        checkInDate = faker.date.between({ 
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
          to: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) 
        });
        checkOutDate = new Date(checkInDate);
        checkOutDate.setDate(checkOutDate.getDate() + numNights);
        break;
    }

    bookings.push({
      id: i + 1,
      cabinName: faker.helpers.arrayElement(cabinNames),
      guest: generateGuest(),
      checkInDate: checkInDate.toISOString(),
      checkOutDate: checkOutDate.toISOString(),
      numNights,
      status,
      totalPrice,
      cabinPrice,
      created_at: faker.date.past({ years: 1 }).toISOString(),
    });
  }

  return bookings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

let bookingsData = generateBookings();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    let filteredBookings = [...bookingsData];

    // Apply status filter
    if (status && status !== 'all') {
      filteredBookings = filteredBookings.filter(booking => booking.status === status);
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredBookings = filteredBookings.filter(booking => 
        booking.cabinName.toLowerCase().includes(searchLower) ||
        booking.guest.name.toLowerCase().includes(searchLower) ||
        booking.guest.email.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filteredBookings.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Booking];
      let bValue: any = b[sortBy as keyof Booking];

      // Handle nested guest properties
      if (sortBy === 'guestName') {
        aValue = a.guest.name;
        bValue = b.guest.name;
      }

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    });

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

    const totalPages = Math.ceil(filteredBookings.length / limit);

    return Response.json({
      bookings: paginatedBookings,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: filteredBookings.length,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newBooking: Booking = {
      id: Math.max(...bookingsData.map(b => b.id)) + 1,
      ...body,
      created_at: new Date().toISOString(),
    };

    bookingsData.unshift(newBooking);
    return Response.json(newBooking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const bookingIndex = bookingsData.findIndex(b => b.id === body.id);

    if (bookingIndex === -1) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    bookingsData[bookingIndex] = { ...bookingsData[bookingIndex], ...body };
    return Response.json(bookingsData[bookingIndex]);
  } catch (error) {
    console.error('Error updating booking:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0');

    const bookingIndex = bookingsData.findIndex(b => b.id === id);
    if (bookingIndex === -1) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    bookingsData.splice(bookingIndex, 1);
    return Response.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
