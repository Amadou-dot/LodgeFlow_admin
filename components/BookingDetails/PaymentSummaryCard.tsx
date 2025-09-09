import { Card, CardBody, CardHeader } from '@heroui/card';
import { Divider } from '@heroui/divider';

interface PaymentSummaryCardProps {
  numNights: number;
  cabinPrice: number;
  extrasPrice: number;
  totalPrice: number;
  depositPaid: boolean;
  depositAmount: number;
  remainingAmount: number;
  paymentMethod?: string;
}

export default function PaymentSummaryCard({
  numNights,
  cabinPrice,
  extrasPrice,
  totalPrice,
  depositPaid,
  depositAmount,
  remainingAmount,
  paymentMethod,
}: PaymentSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <h2 className='text-lg font-semibold'>Payment Summary</h2>
      </CardHeader>
      <CardBody className='space-y-3'>
        <div className='space-y-2 text-sm'>
          <div className='flex justify-between'>
            <span>Cabin ({numNights} nights)</span>
            <span>${cabinPrice * numNights}</span>
          </div>
          {extrasPrice > 0 && (
            <div className='flex justify-between'>
              <span>Extras</span>
              <span>${extrasPrice}</span>
            </div>
          )}
          <Divider />
          <div className='flex justify-between font-semibold'>
            <span>Total</span>
            <span>${totalPrice}</span>
          </div>
        </div>

        <Divider />

        <div className='space-y-2 text-sm'>
          {depositPaid && (
            <div className='flex justify-between text-success'>
              <span>Deposit Paid</span>
              <span>${depositAmount}</span>
            </div>
          )}
          <div className='flex justify-between'>
            <span>Remaining</span>
            <span
              className={remainingAmount > 0 ? 'text-warning' : 'text-success'}
            >
              ${remainingAmount}
            </span>
          </div>
        </div>

        {paymentMethod && (
          <div className='pt-2'>
            <span className='text-xs text-default-500'>Payment Method:</span>
            <p className='text-sm font-medium capitalize'>
              {paymentMethod.replace('-', ' ')}
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
