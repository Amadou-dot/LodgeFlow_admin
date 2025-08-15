import { faker } from "@faker-js/faker";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Generate fake overview data
    const data = {
      bookings: faker.number.int({ min: 15, max: 85 }),
      cancellations: faker.number.int({ min: 0, max: 8 }),
      revenue: Number(faker.finance.amount({ min: 5000, max: 25000, dec: 0 })),
      customers: faker.number.int({ min: 100, max: 500 }),
    };

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch overview data" },
      { status: 500 },
    );
  }
}
