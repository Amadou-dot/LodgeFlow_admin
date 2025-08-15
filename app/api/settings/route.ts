import { NextRequest } from 'next/server';

export interface AppSettings {
  id: number;
  minBookingLength: number;
  maxBookingLength: number;
  maxGuestsPerBooking: number;
  breakfastPrice: number;
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: 'flexible' | 'moderate' | 'strict';
  requireDeposit: boolean;
  depositPercentage: number;
  allowPets: boolean;
  petFee: number;
  smokingAllowed: boolean;
  earlyCheckInFee: number;
  lateCheckOutFee: number;
  wifiIncluded: boolean;
  parkingIncluded: boolean;
  parkingFee: number;
  updated_at: string;
}

// Default settings
let appSettings: AppSettings = {
  id: 1,
  minBookingLength: 2,
  maxBookingLength: 30,
  maxGuestsPerBooking: 8,
  breakfastPrice: 15,
  checkInTime: '15:00',
  checkOutTime: '11:00',
  cancellationPolicy: 'moderate',
  requireDeposit: true,
  depositPercentage: 25,
  allowPets: true,
  petFee: 20,
  smokingAllowed: false,
  earlyCheckInFee: 50,
  lateCheckOutFee: 50,
  wifiIncluded: true,
  parkingIncluded: false,
  parkingFee: 10,
  updated_at: new Date().toISOString(),
};

export async function GET() {
  try {
    return Response.json(appSettings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (body.minBookingLength && body.maxBookingLength && body.minBookingLength > body.maxBookingLength) {
      return Response.json(
        { error: 'Minimum booking length cannot be greater than maximum booking length' },
        { status: 400 }
      );
    }

    if (body.depositPercentage && (body.depositPercentage < 0 || body.depositPercentage > 100)) {
      return Response.json(
        { error: 'Deposit percentage must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Update settings
    appSettings = {
      ...appSettings,
      ...body,
      id: 1, // Keep ID consistent
      updated_at: new Date().toISOString(),
    };

    return Response.json(appSettings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Reset to default settings
    appSettings = {
      id: 1,
      minBookingLength: 2,
      maxBookingLength: 30,
      maxGuestsPerBooking: 8,
      breakfastPrice: 15,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      cancellationPolicy: 'moderate',
      requireDeposit: true,
      depositPercentage: 25,
      allowPets: true,
      petFee: 20,
      smokingAllowed: false,
      earlyCheckInFee: 50,
      lateCheckOutFee: 50,
      wifiIncluded: true,
      parkingIncluded: false,
      parkingFee: 10,
      updated_at: new Date().toISOString(),
    };

    return Response.json(appSettings);
  } catch (error) {
    console.error('Error resetting settings:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
