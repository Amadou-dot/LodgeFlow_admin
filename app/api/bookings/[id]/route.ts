import { getClerkUser } from '@/lib/clerk-users';
import connectDB from '@/lib/mongodb';
import { Booking } from '@/models';
import { IdParam } from '@/types';

export async function GET(req: Request, { params }: IdParam) {
  const bookingId = (await params).id;
  try {
    await connectDB();
    const booking = await Booking.findById(bookingId).populate('cabin');

    if (!booking) throw new Error('Booking not found');

    // Get customer data from Clerk
    const customer = await getClerkUser(booking.customer);

    // Build populated booking response
    const populatedBooking = {
      ...booking.toObject(),
      customer: customer,
      guest: customer, // For legacy compatibility
      cabinName: booking.cabin?.name,
    };

    return new Response(
      JSON.stringify({ success: true, data: populatedBooking }),
      {
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      {
        status: 404,
      }
    );
  }
}
