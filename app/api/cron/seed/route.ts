import { NextResponse } from 'next/server';
import { createClerkClient } from '@clerk/backend';
import { faker } from '@faker-js/faker';
import connectDB from '@/lib/mongodb';
import { Booking, Cabin, Dining, Experience, Settings } from '@/models';
import {
  cabinData,
  diningData,
  experienceData,
  settingsData,
} from '@/lib/data/seed-data';

export const dynamic = 'force-dynamic'; // Ensure the route is not cached

export async function GET(request: Request) {
  try {
    // Verify authentication (recommended for cron jobs)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    await connectDB();

    const results = {
      cabins: 'skipped',
      experiences: 'skipped',
      dining: 'skipped',
      settings: 'skipped',
      bookings: 0,
    };

    // 1. Insert Static Data if missing
    if ((await Cabin.countDocuments()) === 0) {
      await Cabin.insertMany(cabinData);
      results.cabins = `inserted ${cabinData.length}`;
    }

    if ((await Experience.countDocuments()) === 0) {
      await Experience.insertMany(experienceData);
      results.experiences = `inserted ${experienceData.length}`;
    }

    if ((await Dining.countDocuments()) === 0) {
      await Dining.insertMany(diningData);
      results.dining = `inserted ${diningData.length}`;
    }

    if ((await Settings.countDocuments()) === 0) {
      await Settings.create(settingsData);
      results.settings = 'inserted';
    }

    // 2. Fetch Users from Clerk
    if (!process.env.CLERK_SECRET_KEY) {
      throw new Error('CLERK_SECRET_KEY is not defined');
    }

    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    const userList = await clerkClient.users.getUserList({
      limit: 100,
    });

    const users = userList.data;

    if (users.length === 0) {
      return NextResponse.json({
        message: 'No users found in Clerk to create bookings for.',
        results,
      });
    }

    // 3. Create New Bookings
    // Create 5-10 new bookings
    const numBookings = faker.number.int({ min: 5, max: 10 });
    const cabins = await Cabin.find();
    const settings = await Settings.findOne();

    if (!settings || cabins.length === 0) {
      return NextResponse.json({
        message: 'Missing settings or cabins, cannot create bookings.',
        results,
      });
    }

    const newBookings = [];
    const today = new Date();
    const thirtyDaysFromNow = new Date(
      today.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    for (let i = 0; i < numBookings; i++) {
      const cabin = faker.helpers.arrayElement(cabins);
      const user = faker.helpers.arrayElement(users);

      // Use primary email or first available
      // const userEmail = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress || user.emailAddresses[0]?.emailAddress;

      // Generate check-in dates randomly over the next 30 days
      const checkInDate = faker.date.between({
        from: today,
        to: thirtyDaysFromNow,
      });
      const numNights = faker.number.int({ min: 2, max: 14 });
      const checkOutDate = new Date(checkInDate);
      checkOutDate.setDate(checkOutDate.getDate() + numNights);

      const discountedPrice =
        cabin.discount > 0 ? cabin.price - cabin.discount : cabin.price;
      const cabinPrice = discountedPrice * numNights;
      const hasBreakfast = faker.datatype.boolean();
      const hasPets = faker.datatype.boolean({ probability: 0.3 });
      const hasParking = faker.datatype.boolean({ probability: 0.4 });

      const breakfastPrice = hasBreakfast
        ? settings.breakfastPrice *
          faker.number.int({ min: 1, max: 4 }) *
          numNights
        : 0;
      const petFee = hasPets ? settings.petFee * numNights : 0;
      const parkingFee =
        hasParking && !settings.parkingIncluded
          ? settings.parkingFee * numNights
          : 0;

      const extrasPrice = breakfastPrice + petFee + parkingFee;
      const totalPrice = cabinPrice + extrasPrice;
      const depositAmount = settings.requireDeposit
        ? Math.round(totalPrice * (settings.depositPercentage / 100))
        : 0;

      const booking = await Booking.create({
        cabin: cabin._id,
        customer: user.id, // Clerk User ID
        checkInDate,
        checkOutDate,
        numNights,
        numGuests: faker.number.int({ min: 1, max: cabin.capacity }),
        status: 'confirmed', // New bookings are usually confirmed or unconfirmed
        cabinPrice: discountedPrice,
        extrasPrice,
        totalPrice,
        isPaid: faker.datatype.boolean({ probability: 0.5 }),
        paymentMethod: faker.helpers.arrayElement(['card', 'online']),
        extras: {
          hasBreakfast,
          breakfastPrice,
          hasPets,
          petFee,
          hasParking,
          parkingFee,
          hasEarlyCheckIn: false,
          earlyCheckInFee: 0,
          hasLateCheckOut: false,
          lateCheckOutFee: 0,
        },
        depositPaid: depositAmount > 0, // Assume deposit is paid for confirmed bookings
        depositAmount,
        createdAt: new Date(),
      });

      newBookings.push(booking);
    }

    results.bookings = newBookings.length;

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      results,
    });
  } catch (error: any) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
