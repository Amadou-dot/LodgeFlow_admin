import { Card, CardBody, CardHeader } from '@heroui/card';
import { Divider } from '@heroui/divider';
import { PriceBreakdown as PriceBreakdownType } from './types';

interface PriceBreakdownProps {
  priceBreakdown: PriceBreakdownType;
  numNights: number;
  settings: any;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export default function PriceBreakdown({
  priceBreakdown,
  numNights,
  settings,
}: PriceBreakdownProps) {
  if (priceBreakdown.totalPrice <= 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <h3 className='text-lg font-semibold'>Price Breakdown</h3>
      </CardHeader>
      <CardBody>
        <div className='space-y-2'>
          <div className='flex justify-between'>
            <span>Cabin ({numNights} nights)</span>
            <span>{formatCurrency(priceBreakdown.cabinPrice)}</span>
          </div>

          {priceBreakdown.breakfastPrice > 0 && (
            <div className='flex justify-between text-sm'>
              <span>Breakfast</span>
              <span>{formatCurrency(priceBreakdown.breakfastPrice)}</span>
            </div>
          )}

          {priceBreakdown.petFee > 0 && (
            <div className='flex justify-between text-sm'>
              <span>Pet Fee</span>
              <span>{formatCurrency(priceBreakdown.petFee)}</span>
            </div>
          )}

          {priceBreakdown.parkingFee > 0 && (
            <div className='flex justify-between text-sm'>
              <span>Parking</span>
              <span>{formatCurrency(priceBreakdown.parkingFee)}</span>
            </div>
          )}

          {priceBreakdown.earlyCheckInFee > 0 && (
            <div className='flex justify-between text-sm'>
              <span>Early Check-in</span>
              <span>{formatCurrency(priceBreakdown.earlyCheckInFee)}</span>
            </div>
          )}

          {priceBreakdown.lateCheckOutFee > 0 && (
            <div className='flex justify-between text-sm'>
              <span>Late Check-out</span>
              <span>{formatCurrency(priceBreakdown.lateCheckOutFee)}</span>
            </div>
          )}

          <Divider />
          <div className='flex justify-between font-semibold'>
            <span>Total</span>
            <span>{formatCurrency(priceBreakdown.totalPrice)}</span>
          </div>

          {settings?.requireDeposit && (
            <>
              <div className='flex justify-between text-sm'>
                <span>Deposit ({settings.depositPercentage}%)</span>
                <span>{formatCurrency(priceBreakdown.depositAmount)}</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span>Remaining</span>
                <span>
                  {formatCurrency(
                    priceBreakdown.totalPrice - priceBreakdown.depositAmount
                  )}
                </span>
              </div>
            </>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
