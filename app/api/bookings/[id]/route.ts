import { requireApiAuth } from '@/lib/api-utils';
import { getClerkUser } from '@/lib/clerk-users';
import connectDB from '@/lib/mongodb';
import { patchBookingSchema } from '@/lib/validations';
import { Booking } from '@/models';
import { IdParam } from '@/types';

export async function GET(_req: Request, { params }: IdParam) {
  // Require authentication
  const authResult = await requireApiAuth();
  if (!authResult.authenticated) return authResult.error;

  const bookingId = (await params).id;
  try {
    await connectDB();
    const booking = await Booking.findById(bookingId).populate('cabin');

    if (!booking) {
      return new Response(
        JSON.stringify({ success: false, error: 'Booking not found' }),
        { status: 404 }
      );
    }

    // Get customer data from Clerk (best-effort — don't fail the request)
    let customer = null;
    try {
      customer = await getClerkUser(booking.customer);
    } catch (clerkError) {
      console.error('Error fetching customer from Clerk:', clerkError);
    }

    // Build populated booking response
    const populatedBooking = {
      ...booking.toObject(),
      customer: customer,
      guest: customer, // For legacy compatibility
      cabinName: (booking.cabin as unknown as { name?: string })?.name,
    };

    return new Response(
      JSON.stringify({ success: true, data: populatedBooking }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching booking:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to fetch booking' }),
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, { params }: IdParam) {
  // Require authentication
  const authResult = await requireApiAuth();
  if (!authResult.authenticated) return authResult.error;

  const bookingId = (await params).id;
  try {
    await connectDB();
    const rawUpdateData = await req.json();
    const validationResult = patchBookingSchema.safeParse(rawUpdateData);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Validation failed',
          details: validationResult.error.flatten(),
        }),
        { status: 400 }
      );
    }
    const updateData = validationResult.data;

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
      if (isPaid) {
        booking.paidAt = new Date();
      }

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
      } else if (updateData.status === 'cancelled') {
        booking.cancelledAt = updateData.cancelledAt ?? new Date();
        booking.refundStatus = updateData.refundStatus ?? booking.refundStatus ?? 'none';
      }
    }

    if (updateData.cancellationReason !== undefined) {
      booking.cancellationReason = updateData.cancellationReason;
    }
    if (updateData.cancelledAt !== undefined) {
      booking.cancelledAt = updateData.cancelledAt;
    }
    if (updateData.refundStatus !== undefined) {
      booking.refundStatus = updateData.refundStatus;
    }
    if (updateData.refundAmount !== undefined) {
      booking.refundAmount = updateData.refundAmount;
    }
    if (updateData.refundedAt !== undefined) {
      booking.refundedAt = updateData.refundedAt;
    }
    if (updateData.paidAt !== undefined) {
      booking.paidAt = updateData.paidAt;
    }
    if (updateData.stripePaymentIntentId !== undefined) {
      booking.stripePaymentIntentId = updateData.stripePaymentIntentId;
    }
    if (updateData.stripeSessionId !== undefined) {
      booking.stripeSessionId = updateData.stripeSessionId;
    }
    if (updateData.paymentConfirmationSentAt !== undefined) {
      booking.paymentConfirmationSentAt = updateData.paymentConfirmationSentAt;
    }

    // Save the updated booking
    const updatedBooking = await booking.save();
    await updatedBooking.populate('cabin');

    // Get customer data from Clerk (best-effort — don't fail the request
    // since the booking save already succeeded)
    let customer = null;
    try {
      customer = await getClerkUser(updatedBooking.customer);
    } catch (clerkError) {
      console.error('Error fetching customer from Clerk:', clerkError);
    }

    // Build populated booking response
    const populatedBooking = {
      ...updatedBooking.toObject(),
      customer: customer,
      guest: customer, // For legacy compatibility
      cabinName: (updatedBooking.cabin as unknown as { name?: string })?.name,
    };

    return new Response(
      JSON.stringify({ success: true, data: populatedBooking }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating booking:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to update booking' }),
      { status: 500 }
    );
  }
}
