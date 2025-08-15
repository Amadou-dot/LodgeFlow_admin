import { faker } from '@faker-js/faker';
import { NextResponse } from 'next/server';

export interface Activity {
  id: number;
  status: 'arriving' | 'departing';
  name: string;
  stayDuration: number;
}

export async function GET() {
  try {
    // Generate fake activity data
    const activities: Activity[] = [];
    const activityCount = faker.number.int({ min: 4, max: 4 });
    
    for (let i = 0; i < activityCount; i++) {
      activities.push({
        id: i,
        status: faker.helpers.arrayElement(['arriving', 'departing']) as 'arriving' | 'departing',
        name: faker.person.fullName(),
        stayDuration: faker.number.int({ min: 1, max: 14 })
      });
    }

    return NextResponse.json(activities);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}
