import { faker } from "@faker-js/faker";
import { NextResponse } from "next/server";

export interface DurationData {
  name: string;
  value: number;
  color: string;
}

export async function GET() {
  try {
    // Generate fake data for stay durations
    const data: DurationData[] = [
      {
        name: "1-2 nights",
        value: faker.number.int({ min: 15, max: 30 }),
        color: "#3b82f6", // blue
      },
      {
        name: "3-4 nights",
        value: faker.number.int({ min: 20, max: 35 }),
        color: "#10b981", // green
      },
      {
        name: "5-7 nights",
        value: faker.number.int({ min: 25, max: 40 }),
        color: "#f59e0b", // amber
      },
      {
        name: "8-14 nights",
        value: faker.number.int({ min: 10, max: 25 }),
        color: "#8b5cf6", // purple
      },
      {
        name: "15+ nights",
        value: faker.number.int({ min: 5, max: 15 }),
        color: "#ef4444", // red
      },
    ];

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch duration data" },
      { status: 500 },
    );
  }
}
