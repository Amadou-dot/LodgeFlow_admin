import type { PopulatedBooking } from '@/types';
import BookingHistoryCard from './BookingHistoryCard';
import PaymentSummaryCard from './PaymentSummaryCard';
import QuickActionsCard from './QuickActionsCard';

interface BookingSidebarProps {
  booking: PopulatedBooking;
  onCheckIn: () => void;
  onCheckOut: () => void;
  actionLoading: string | null;
}

export default function BookingSidebar({
  booking,
  onCheckIn,
  onCheckOut,
  actionLoading,
}: BookingSidebarProps) {
  return (
    <div className='space-y-6'>
      <PaymentSummaryCard
        numNights={booking.numNights}
        cabinPrice={booking.cabinPrice}
        extrasPrice={booking.extrasPrice}
        totalPrice={booking.totalPrice}
        depositPaid={booking.depositPaid}
        depositAmount={booking.depositAmount}
        remainingAmount={booking.remainingAmount}
        paymentMethod={booking.paymentMethod}
      />

      <QuickActionsCard
        status={booking.status}
        isPaid={booking.isPaid}
        onCheckIn={onCheckIn}
        onCheckOut={onCheckOut}
        actionLoading={actionLoading}
        firstName={booking.customer.name}
        email={booking.customer.email}
      />

      <BookingHistoryCard
        createdAt={booking.createdAt.toString()}
        updatedAt={booking.updatedAt.toString()}
      />
    </div>
  );
}
