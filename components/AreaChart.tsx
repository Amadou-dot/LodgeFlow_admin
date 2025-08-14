'use client';

import { faker } from '@faker-js/faker';
import {
    Area,
    CartesianGrid,
    AreaChart as RechartsAreaChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

export default function AreaChart() {
  // Generate fake sales data for the last 30 days
  const generateSalesData = () => {
    const data = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Generate more realistic sales patterns (higher on weekends, lower on weekdays)
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const baseAmount = isWeekend ? 800 : 500;
      const variance = isWeekend ? 400 : 300;

      data.push({
        date: date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        fullDate: date.toISOString().split('T')[0],
        sales: faker.number.int({
          min: baseAmount - variance,
          max: baseAmount + variance,
        }),
        bookings: faker.number.int({ min: 5, max: isWeekend ? 25 : 15 }),
      });
    }

    return data;
  };

  const data = generateSalesData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const salesData = payload.find((p: any) => p.dataKey === 'sales');
      const bookingsData = payload.find((p: any) => p.dataKey === 'bookings');

      return (
        <div className='bg-content1 p-3 border border-divider rounded-lg shadow-lg'>
          <p className='font-medium mb-2'>{label}</p>
          <div className='space-y-1'>
            {salesData && (
              <p className='text-sm'>
                <span style={{ color: salesData.color }}>● </span>
                Sales: ${salesData.value.toLocaleString()}
              </p>
            )}
            {bookingsData && (
              <p className='text-sm'>
                <span style={{ color: bookingsData.color }}>● </span>
                Bookings: {bookingsData.value}
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const formatYAxisSales = (value: number) => {
    return `$${(value / 1000).toFixed(0)}k`;
  };

  const formatYAxisBookings = (value: number) => {
    return value.toString();
  };

  return (
    <div className='bg-content1 p-4 md:p-6 rounded-lg border border-divider'>
      <h3 className='text-lg md:text-xl font-bold mb-4'>
        Sales & Bookings Trend
      </h3>
      <p className='text-sm text-default-600 mb-4 md:hidden'>Last 30 Days</p>
      <div className='h-64 md:h-80'>
        <ResponsiveContainer width='100%' height='100%'>
          <RechartsAreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id='salesGradient' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.8} />
                <stop offset='95%' stopColor='#3b82f6' stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id='bookingsGradient' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#10b981' stopOpacity={0.8} />
                <stop offset='95%' stopColor='#10b981' stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray='3 3'
              stroke='#e5e7eb'
              opacity={0.5}
            />
            <XAxis
              dataKey='date'
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#6b7280' }}
              interval='preserveStartEnd'
            />
            <YAxis
              yAxisId='sales'
              orientation='left'
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#6b7280' }}
              tickFormatter={formatYAxisSales}
              width={40}
            />
            <YAxis
              yAxisId='bookings'
              orientation='right'
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#6b7280' }}
              tickFormatter={formatYAxisBookings}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              yAxisId='sales'
              type='monotone'
              dataKey='sales'
              stroke='#3b82f6'
              strokeWidth={2}
              fillOpacity={1}
              fill='url(#salesGradient)'
            />
            <Area
              yAxisId='bookings'
              type='monotone'
              dataKey='bookings'
              stroke='#10b981'
              strokeWidth={2}
              fillOpacity={1}
              fill='url(#bookingsGradient)'
            />
          </RechartsAreaChart>
        </ResponsiveContainer>
      </div>
      <div className='flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mt-4'>
        <div className='flex items-center gap-2'>
          <div className='w-3 h-3 rounded-full bg-blue-500' />
          <span className='text-sm font-medium'>Sales ($)</span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-3 h-3 rounded-full bg-green-500' />
          <span className='text-sm font-medium'>Bookings (#)</span>
        </div>
      </div>
    </div>
  );
}
