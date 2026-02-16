import { requireApiAuth } from '@/lib/api-utils';
import { AUTHORIZED_ROLES } from '@/lib/auth-helpers';
import connectDB from '@/lib/mongodb';
import { isMongooseValidationError } from '@/types/errors';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { Settings } from '../../../models';

const DEFAULT_SETTINGS = {
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
  parkingFee: 15,
  currency: 'USD',
  timezone: 'America/New_York',
  businessHours: {
    open: '08:00',
    close: '22:00',
    daysOpen: [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ],
  },
  contactInfo: {
    phone: '18005634336',
    email: 'info@lodgeflow.com',
    address: {
      street: '1000 Wilderness Drive',
      city: 'Pine Valley',
      state: 'MT',
      country: 'USA',
      zipCode: '59718',
    },
  },
  notifications: {
    emailEnabled: true,
    smsEnabled: false,
    bookingConfirmation: true,
    paymentReminders: true,
    checkInReminders: true,
  },
};

export async function GET() {
  // Require authentication
  const authResult = await requireApiAuth();
  if (!authResult.authenticated) return authResult.error;

  try {
    await connectDB();

    // Get settings or create default if none exist
    let settings = await Settings.findOne();

    if (!settings) {
      // Clear invalid settings first (in case there are partial documents)
      await Settings.deleteMany({});

      // Create default settings if none exist
      settings = await Settings.create(DEFAULT_SETTINGS);
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch settings',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  // Require authentication
  const authResult = await requireApiAuth();
  if (!authResult.authenticated) return authResult.error;

  try {
    await connectDB();

    const body = await request.json();

    // Get current settings or create new if none exist
    let settings = await Settings.findOne();

    if (settings) {
      // Update existing settings
      Object.assign(settings, body);
      await settings.save();
    } else {
      // Create new settings
      settings = await Settings.create(body);
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error: unknown) {
    console.error('Error updating settings:', error);

    if (isMongooseValidationError(error)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update settings',
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  // Require authentication
  const authResult = await requireApiAuth();
  if (!authResult.authenticated) return authResult.error;

  // Resetting settings is a destructive operation — require admin role
  if (
    !(
      process.env.NODE_ENV !== 'production' &&
      process.env.NEXT_PUBLIC_TESTING === 'true'
    )
  ) {
    const { has } = await auth();
    if (!has?.({ role: AUTHORIZED_ROLES.ADMIN })) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin role required' },
        { status: 403 }
      );
    }
  }

  try {
    await connectDB();

    // Delete existing settings and recreate with defaults
    await Settings.deleteMany({});
    const settings = await Settings.create(DEFAULT_SETTINGS);

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Error resetting settings:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to reset settings',
      },
      { status: 500 }
    );
  }
}
