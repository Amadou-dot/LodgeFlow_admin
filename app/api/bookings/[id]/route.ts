import { requireApiAuth } from '@/lib/api-utils';
import { hasAuthorizedRole } from '@/lib/auth-helpers';
import { getClerkUser } from '@/lib/clerk-users';
import { VALID_TRANSITIONS } from '@/lib/config';
import { logger } from '@/lib/logger';
import connectDB from '@/lib/mongodb';
import { patchBookingSchema } from '@/lib/validations';
import { Booking } from '@/models';
import { IdParam } from '@/types';
import { isMongooseValidationError, getErrorMessage } from '@/types/errors';
import { auth } from '@clerk/nextjs/server';

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
      logger.error('Failed to fetch customer from Clerk', clerkError, {
        bookingId,
      });
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
    logger.error('Failed to fetch booking', error, { bookingId });
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to fetch booking' }),
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, { params }: IdParam) {
  // Require authentication and admin role
  const authResult = await requireApiAuth();
  if (!authResult.authenticated) return authResult.error;

  const { has } = await auth();
  if (!hasAuthorizedRole(has)) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized' }),
      { status: 401 }
    );
  }

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
        const combined = booking.observations
          ? `${booking.observations}\n\nPayment recorded: ${notes}`
          : `Payment recorded: ${notes}`;
        booking.observations = combined.slice(0, 1000);
      }
    }

    // Handle status changes with transition validation
    if (updateData.status) {
      const allowed = VALID_TRANSITIONS[booking.status] ?? [];
      if (!allowed.includes(updateData.status)) {
        return new Response(
          JSON.stringify({
            success: false,
            error: `Cannot transition from '${booking.status}' to '${updateData.status}'`,
          }),
          { status: 400 }
        );
      }

      booking.status = updateData.status;

      // Set check-in/check-out times
      if (updateData.status === 'checked-in') {
        booking.checkInTime = new Date();
      } else if (updateData.status === 'checked-out') {
        booking.checkOutTime = new Date();
      } else if (updateData.status === 'cancelled') {
        booking.cancelledAt = updateData.cancelledAt ?? new Date();
        booking.refundStatus =
          updateData.refundStatus ?? booking.refundStatus ?? 'none';
      }
    }

    // Reject cancellation/refund fields on non-cancelled bookings
    const cancellationFields = [
      'cancellationReason',
      'refundStatus',
      'refundAmount',
      'refundedAt',
    ].filter(f => (updateData as Record<string, unknown>)[f] !== undefined);
    if (cancellationFields.length > 0 && booking.status !== 'cancelled') {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Cannot set ${cancellationFields.join(', ')} on a booking with status '${booking.status}'. The booking must be cancelled first.`,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate refundAmount does not exceed totalPrice
    if (
      updateData.refundAmount !== undefined &&
      updateData.refundAmount > booking.totalPrice
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Refund amount (${updateData.refundAmount}) cannot exceed total price (${booking.totalPrice})`,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate refundAmount requires a compatible refundStatus
    if (updateData.refundAmount !== undefined && updateData.refundAmount > 0) {
      const effectiveRefundStatus =
        updateData.refundStatus ?? booking.refundStatus ?? 'none';
      if (effectiveRefundStatus === 'none') {
        return new Response(
          JSON.stringify({
            success: false,
            error:
              'refundStatus must be "partial" or "full" when setting a non-zero refundAmount',
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Cancellation and refund metadata — only writable on cancelled bookings
    if (booking.status === 'cancelled') {
      if (updateData.cancellationReason !== undefined) {
        booking.cancellationReason = updateData.cancellationReason;
      }
      // Allow updating cancelledAt on already-cancelled bookings without re-sending status
      if (updateData.cancelledAt !== undefined && !updateData.status) {
        booking.cancelledAt = updateData.cancelledAt;
      }
      if (updateData.refundStatus !== undefined && !updateData.status) {
        booking.refundStatus = updateData.refundStatus;
      }
      if (updateData.refundAmount !== undefined) {
        booking.refundAmount = updateData.refundAmount;
      }
      if (updateData.refundedAt !== undefined) {
        booking.refundedAt = updateData.refundedAt;
      }
    }

    // Payment metadata — skip paidAt if recordPayment already set it
    if (updateData.paidAt !== undefined && !updateData.recordPayment) {
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

    const updatedBooking = await booking.save();
    await updatedBooking.populate('cabin');

    // Get customer data from Clerk (best-effort — don't fail the request
    // since the booking save already succeeded)
    let customer = null;
    try {
      customer = await getClerkUser(updatedBooking.customer);
    } catch (clerkError) {
      logger.error('Failed to fetch customer from Clerk', clerkError, {
        bookingId,
      });
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
    if (isMongooseValidationError(error)) {
      logger.warn(
        'Mongoose validation fired after Zod passed — possible schema drift',
        {
          bookingId,
          validationErrors: Object.keys(error.errors),
        }
      );
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Validation failed',
          details: error.errors,
        }),
        { status: 400 }
      );
    }

    logger.error('Failed to update booking', error, { bookingId });
    return new Response(
      JSON.stringify({
        success: false,
        error: getErrorMessage(error, 'Failed to update booking'),
      }),
      { status: 500 }
    );
  }
}
