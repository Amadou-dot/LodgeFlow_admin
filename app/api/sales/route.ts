import { faker } from "@faker-js/faker";
import { NextResponse } from "next/server";

export interface SalesData {
  date: string;
  fullDate: string;
  sales: number;
  bookings: number;
}

export async function GET() {
  try {
    // Generate fake sales data for the last 30 days
    const data: SalesData[] = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Generate more realistic sales patterns (higher on weekends, lower on weekdays)
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const baseAmount = isWeekend ? 800 : 500;
      const variance = isWeekend ? 400 : 300;

      data.push({
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        fullDate: date.toISOString().split("T")[0],
        sales: faker.number.int({
          min: baseAmount - variance,
          max: baseAmount + variance,
        }),
        bookings: faker.number.int({ min: 5, max: isWeekend ? 25 : 15 }),
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch sales data" },
      { status: 500 },
    );
  }
}
