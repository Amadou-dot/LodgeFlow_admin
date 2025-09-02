import connectDB from '@/lib/mongodb';
import { Booking } from '@/models';
import { IdParam } from '@/types';

export async function GET(req: Request, { params }: IdParam) {
  const bookingId = (await params).id;
  try {
    await connectDB();
    const booking = await Booking.findById(bookingId)
      .populate('customer')
      .populate('cabin');
    if (!booking) throw new Error('Booking not found');
    return new Response(JSON.stringify({ success: true, data: booking }), {
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      {
        status: 404,
      }
    );
  }
}
