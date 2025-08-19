import { config } from "dotenv";
import { resolve } from "path";
import { faker } from "@faker-js/faker";
import connectDB from "../lib/mongodb";
import { Cabin, Customer, Booking, Settings } from "../models";
import type { ICabin, ICustomer, IBooking } from "../models";

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local") });

// Sample cabin data (extracted from database with updated images)
const cabinData = [
  {
    "name": "Pine Valley Cabin",
    "image": "https://images.unsplash.com/photo-1633830902223-727413dfad8f?w=400&h=300&auto=format&fit=crop",
    "capacity": 4,
    "price": 250,
    "discount": 25,
    "description": "A cozy cabin nestled in the pine valley with stunning mountain views and modern amenities.",
    "amenities": [
      "WiFi",
      "Kitchen",
      "Fireplace",
      "Hot Tub",
      "Mountain View",
      "BBQ Grill"
    ]
  },
  {
    "name": "Lakeside Haven",
    "image": "https://images.unsplash.com/photo-1697689841030-000d3594c104?w=400&h=300&auto=format&fit=crop",
    "capacity": 6,
    "price": 350,
    "discount": 0,
    "description": "Waterfront cabin with private dock, perfect for fishing and water activities.",
    "amenities": [
      "WiFi",
      "Kitchen",
      "Private Dock",
      "Kayaks",
      "Fire Pit",
      "Lake View"
    ]
  },
  {
    "name": "Mountain View Lodge",
    "image": "https://images.unsplash.com/photo-1661285129351-2ccc4133dbc0?w=400&h=300&auto=format&fit=crop",
    "capacity": 8,
    "price": 450,
    "discount": 50,
    "description": "Luxury lodge with panoramic mountain views and premium furnishings.",
    "amenities": [
      "WiFi",
      "Full Kitchen",
      "Jacuzzi",
      "Sauna",
      "Game Room",
      "Panoramic Views"
    ]
  },
  {
    "name": "Forest Edge Cabin",
    "image": "https://images.unsplash.com/photo-1725138187136-790dc99ed924?w=400&h=300&auto=format&fit=crop",
    "capacity": 2,
    "price": 180,
    "discount": 0,
    "description": "Intimate cabin on the forest edge, perfect for romantic getaways.",
    "amenities": [
      "WiFi",
      "Kitchenette",
      "Fireplace",
      "Forest View",
      "Bird Watching"
    ]
  },
  {
    "name": "Sunset Retreat",
    "image": "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=400&h=300&auto=format&fit=crop",
    "capacity": 5,
    "price": 300,
    "discount": 30,
    "description": "Watch spectacular sunsets from this elevated cabin with wrap-around deck.",
    "amenities": [
      "WiFi",
      "Kitchen",
      "Hot Tub",
      "Sunset Views",
      "Deck",
      "Telescope"
    ]
  },
  {
    "name": "Alpine Sanctuary",
    "image": "https://images.unsplash.com/photo-1660553926576-b81fd7648618?w=400&h=300&auto=format&fit=crop",
    "capacity": 3,
    "price": 220,
    "discount": 15,
    "description": "Secluded alpine cabin with rustic charm and breathtaking wilderness views.",
    "amenities": [
      "WiFi",
      "Kitchenette",
      "Wood Stove",
      "Hiking Trails",
      "Wildlife Viewing",
      "Stargazing Deck"
    ]
  },
  {
    "name": "Riverside Escape",
    "image": "https://images.unsplash.com/photo-1580856942656-d4416b6e5c2e?w=400&h=300&auto=format&fit=crop",
    "capacity": 4,
    "price": 280,
    "discount": 0,
    "description": "Tranquil cabin beside a babbling brook with natural soundscapes and fishing access.",
    "amenities": [
      "WiFi",
      "Kitchen",
      "River Access",
      "Fishing Gear",
      "Meditation Area",
      "Nature Sounds"
    ]
  },
  {
    "name": "Wilderness Estate",
    "image": "https://images.unsplash.com/photo-1693949231048-5518d112e142?w=400&h=300&auto=format&fit=crop",
    "capacity": 10,
    "price": 600,
    "discount": 75,
    "description": "Luxurious estate cabin perfect for large groups and special celebrations.",
    "amenities": [
      "WiFi",
      "Gourmet Kitchen",
      "Multiple Bedrooms",
      "Home Theater",
      "Pool Table",
      "Conference Room",
      "Private Chef Available"
    ]
  },
  {
    "name": "Treetop Hideaway",
    "image": "https://images.unsplash.com/photo-1751834410723-b0dd9afe6237?w=400&h=300&auto=format&fit=crop",
    "capacity": 2,
    "price": 320,
    "discount": 20,
    "description": "Unique elevated cabin among the treetops for an unforgettable canopy experience.",
    "amenities": [
      "WiFi",
      "Kitchenette",
      "Tree Views",
      "Bird Observatory",
      "Suspension Bridge",
      "Eco-Friendly"
    ]
  },
  {
    "name": "Desert Rose Villa",
    "image": "https://images.unsplash.com/photo-1561026555-13539e82532f?w=400&h=300&auto=format&fit=crop",
    "capacity": 6,
    "price": 380,
    "discount": 0,
    "description": "Modern villa with desert landscape views and sustainable design features.",
    "amenities": [
      "WiFi",
      "Full Kitchen",
      "Solar Power",
      "Desert Garden",
      "Outdoor Shower",
      "Yoga Studio"
    ]
  },
  {
    "name": "Glacier View Chalet",
    "image": "https://images.unsplash.com/photo-1654949935785-29cbc0090492?w=400&h=300&auto=format&fit=crop",
    "capacity": 7,
    "price": 520,
    "discount": 40,
    "description": "Premium chalet with glacier views and luxury amenities for discerning guests.",
    "amenities": [
      "WiFi",
      "Gourmet Kitchen",
      "Wine Cellar",
      "Heated Floors",
      "Glacier Views",
      "Spa Bathroom",
      "Concierge Service"
    ]
  },
  {
    "name": "Meadow Brook Cottage",
    "image": "https://images.unsplash.com/photo-1679480554968-b76deb287584?w=400&h=300&auto=format&fit=crop",
    "capacity": 3,
    "price": 195,
    "discount": 10,
    "description": "Charming cottage surrounded by wildflower meadows and peaceful brooks.",
    "amenities": [
      "WiFi",
      "Country Kitchen",
      "Garden View",
      "Flower Picking",
      "Reading Nook",
      "Hammock"
    ]
  },
  {
    "name": "Canyon Edge Lodge",
    "image": "https://images.unsplash.com/photo-1597256817041-0c75c0633658?w=400&h=300&auto=format&fit=crop",
    "capacity": 5,
    "price": 420,
    "discount": 35,
    "description": "Dramatic lodge perched on canyon edge with spectacular views and adventure access.",
    "amenities": [
      "WiFi",
      "Kitchen",
      "Canyon Views",
      "Rock Climbing",
      "Rappelling Gear",
      "Safety Equipment",
      "Guide Services"
    ]
  },
  {
    "name": "Stoneheart Manor",
    "image": "https://images.unsplash.com/photo-1739511534497-92b2fc4df100?w=400&h=300&auto=format&fit=crop",
    "capacity": 12,
    "price": 750,
    "discount": 100,
    "description": "Historic stone manor with antique furnishings and old-world charm for large gatherings.",
    "amenities": [
      "WiFi",
      "Commercial Kitchen",
      "Library",
      "Ballroom",
      "Wine Collection",
      "Butler Service",
      "Event Planning",
      "Antique Furnishings"
    ]
  },
  {
    "name": "Zen Garden Retreat",
    "image": "https://images.unsplash.com/photo-1668315808815-538f8f72fee9?w=400&h=300&auto=format&fit=crop",
    "capacity": 4,
    "price": 340,
    "discount": 25,
    "description": "Peaceful retreat with Japanese-inspired design and meditation gardens.",
    "amenities": [
      "WiFi",
      "Tea Kitchen",
      "Zen Garden",
      "Meditation Room",
      "Bamboo Forest",
      "Koi Pond",
      "Yoga Mats"
    ]
  }
];

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // Connect to database
    await connectDB();
    console.log("✅ Database connected");

    // Clear existing data
    await Promise.all([
      Cabin.deleteMany({}),
      Customer.deleteMany({}),
      Booking.deleteMany({}),
      Settings.deleteMany({}),
    ]);
    console.log("🗑️  Cleared existing data");

    // Create settings
    const settings = await Settings.create({
      minBookingLength: 2,
      maxBookingLength: 30,
      maxGuestsPerBooking: 8,
      breakfastPrice: 15,
      checkInTime: "15:00",
      checkOutTime: "11:00",
      cancellationPolicy: "moderate",
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
      currency: "USD",
      timezone: "UTC",
    });
    console.log("⚙️  Settings created");

    // Create cabins
    const cabins: ICabin[] = await Cabin.insertMany(cabinData);
    console.log(`🏠 Created ${cabins.length} cabins`);

    // Create customers
    const customers: ICustomer[] = [];
    for (let i = 0; i < 20; i++) {
      // Generate simple phone numbers that match the validation pattern
      const generatePhoneNumber = () => {
        // Generate a number starting with 1-9 followed by 9-14 digits
        const firstDigit = faker.number.int({ min: 1, max: 9 });
        const remainingDigits = faker.string.numeric(9); // 9 more digits for total of 10
        return `${firstDigit}${remainingDigits}`;
      };

      const customer = await Customer.create({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: generatePhoneNumber(),
        nationality: faker.location.country(),
        nationalId: faker.string.alphanumeric(10).toUpperCase(),
        address: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          country: faker.location.country(),
          zipCode: faker.location.zipCode(),
        },
        emergencyContact: {
          name: faker.person.fullName(),
          phone: generatePhoneNumber(),
          relationship: faker.helpers.arrayElement([
            "spouse",
            "parent",
            "sibling",
            "friend",
          ]),
        },
        preferences: {
          smokingPreference: faker.helpers.arrayElement([
            "smoking",
            "non-smoking",
            "no-preference",
          ]),
          dietaryRestrictions: faker.helpers.arrayElements(
            ["vegetarian", "vegan", "gluten-free", "lactose-free"],
            { min: 0, max: 2 },
          ),
          accessibilityNeeds: faker.helpers.arrayElements(
            ["wheelchair-accessible", "hearing-impaired", "vision-impaired"],
            { min: 0, max: 1 },
          ),
        },
      });
      customers.push(customer);
    }
    console.log(`👥 Created ${customers.length} customers`);

    // Create bookings
    const bookings: IBooking[] = [];
    for (let i = 0; i < 40; i++) {
      const cabin = faker.helpers.arrayElement(cabins);
      const customer = faker.helpers.arrayElement(customers);
      const checkInDate = faker.date.between({
        from: new Date("2024-01-01"),
        to: new Date("2025-12-31"),
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
        customer: customer._id,
        checkInDate,
        checkOutDate,
        numNights,
        numGuests: faker.number.int({ min: 1, max: cabin.capacity }),
        status: faker.helpers.arrayElement([
          "unconfirmed",
          "confirmed",
          "checked-in",
          "checked-out",
          "cancelled",
        ]),
        cabinPrice: discountedPrice,
        extrasPrice,
        totalPrice,
        isPaid: faker.datatype.boolean({ probability: 0.7 }),
        paymentMethod: faker.helpers.arrayElement([
          "cash",
          "card",
          "bank-transfer",
          "online",
        ]),
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
        observations: faker.datatype.boolean({ probability: 0.3 })
          ? faker.lorem.paragraph()
          : undefined,
        specialRequests: faker.datatype.boolean({ probability: 0.2 })
          ? faker.helpers.arrayElements(
              ["late checkout", "early checkin", "extra towels", "baby crib"],
              { min: 1, max: 2 },
            )
          : [],
        depositPaid:
          depositAmount > 0
            ? faker.datatype.boolean({ probability: 0.8 })
            : false,
        depositAmount,
      });

      bookings.push(booking);
    }
    console.log(`📅 Created ${bookings.length} bookings`);

    // Update customer statistics
    for (const customer of customers) {
      const customerBookings = bookings.filter(
        (b) => b.customer.toString() === customer._id.toString(),
      );
      const totalSpent = customerBookings.reduce(
        (sum, booking) => sum + booking.totalPrice,
        0,
      );
      const lastBooking = customerBookings.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      )[0];

      await Customer.findByIdAndUpdate(customer._id, {
        totalBookings: customerBookings.length,
        totalSpent,
        lastBookingDate: lastBooking?.createdAt,
      });
    }
    console.log("📊 Updated customer statistics");

    console.log("🎉 Database seeding completed successfully!");
    console.log(`
📈 Summary:
- Settings: 1
- Cabins: ${cabins.length}
- Customers: ${customers.length}
- Bookings: ${bookings.length}
    `);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("✅ Seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}

export default seedDatabase;
