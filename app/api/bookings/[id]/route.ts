import { getClerkUser } from '@/lib/clerk-users';
import connectDB from '@/lib/mongodb';
import { Booking } from '@/models';
import { IdParam } from '@/types';

export async function GET(_req: Request, { params }: IdParam) {
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

export async function PATCH(req: Request, { params }: IdParam) {
  const bookingId = (await params).id;
  try {
    await connectDB();
    const updateData = await req.json();

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return new Response(
        JSON.stringify({ success: false, error: 'Booking not found' }),
        { status: 404 }
      );
    }

    // Handle payment recording
    if (updateData.recordPayment) {
      const { paymentMethod, amountPaid, notes } = updateData.recordPayment;

      // Validate payment method
      const validPaymentMethods = ['cash', 'card', 'bank-transfer', 'online'];
      if (!validPaymentMethods.includes(paymentMethod)) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid payment method' }),
          { status: 400 }
        );
      }

      // Validate amount
      if (!amountPaid || amountPaid <= 0) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid payment amount' }),
          { status: 400 }
        );
      }

      // Calculate remaining amount, accounting for previous payments
      const totalPreviouslyPaid = booking.depositAmount || 0;
      const totalPaid = totalPreviouslyPaid + amountPaid;
      const remainingAmount = booking.totalPrice - totalPaid;
      const isPaid = remainingAmount <= 0;

      // Update booking payment fields
      booking.paymentMethod = paymentMethod;
      booking.isPaid = isPaid;
      booking.depositPaid = true;
      booking.depositAmount = totalPaid;
      booking.remainingAmount = Math.max(0, remainingAmount);

      // Add payment notes to observations if provided
      if (notes) {
        booking.observations = booking.observations
          ? `${booking.observations}\n\nPayment recorded: ${notes}`
          : `Payment recorded: ${notes}`;
      }
    }

    // Handle other updates (status changes, etc.)
    if (updateData.status) {
      booking.status = updateData.status;

      // Set check-in/check-out times
      if (updateData.status === 'checked-in') {
        booking.checkInTime = new Date();
      } else if (updateData.status === 'checked-out') {
        booking.checkOutTime = new Date();
      }
    }

    // Save the updated booking
    const updatedBooking = await booking.save();
    await updatedBooking.populate('cabin');

    // Get customer data from Clerk
    const customer = await getClerkUser(updatedBooking.customer);

    // Build populated booking response
    const populatedBooking = {
      ...updatedBooking.toObject(),
      customer: customer,
      guest: customer, // For legacy compatibility
      cabinName: updatedBooking.cabin?.name,
    };

    return new Response(
      JSON.stringify({ success: true, data: populatedBooking }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500 }
    );
  }
}
