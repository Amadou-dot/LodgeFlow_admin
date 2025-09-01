import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import { Settings } from '../../../models';

export async function GET() {
  try {
    await connectDB();

    // Get settings or create default if none exist
    let settings = await Settings.findOne();

    if (!settings) {
      // Clear any invalid settings first (in case there are partial documents)
      await Settings.deleteMany({});

      // Create default settings if none exist
      settings = await Settings.create({
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
      });
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
  } catch (error: any) {
    console.error('Error updating settings:', error);

    if (error.name === 'ValidationError') {
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
