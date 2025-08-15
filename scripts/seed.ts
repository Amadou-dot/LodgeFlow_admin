import { faker } from "@faker-js/faker";
import connectDB from "../lib/mongodb";
import { Cabin, Customer, Booking, Settings } from "../models";
import type { ICabin, ICustomer, IBooking } from "../models";

// Sample cabin data
const cabinData = [
  {
    name: "Pine Valley Cabin",
    image:
      "https://images.unsplash.com/photo-1586375300773-8384e3e4916f?w=400&h=300&auto=format&fit=crop",
    capacity: 4,
    price: 250,
    discount: 25,
    description:
      "A cozy cabin nestled in the pine valley with stunning mountain views and modern amenities.",
    amenities: [
      "WiFi",
      "Kitchen",
      "Fireplace",
      "Hot Tub",
      "Mountain View",
      "BBQ Grill",
    ],
  },
  {
    name: "Lakeside Haven",
    image:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&auto=format&fit=crop",
    capacity: 6,
    price: 350,
    discount: 0,
    description:
      "Waterfront cabin with private dock, perfect for fishing and water activities.",
    amenities: [
      "WiFi",
      "Kitchen",
      "Private Dock",
      "Kayaks",
      "Fire Pit",
      "Lake View",
    ],
  },
  {
    name: "Mountain View Lodge",
    image:
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&auto=format&fit=crop",
    capacity: 8,
    price: 450,
    discount: 50,
    description:
      "Luxury lodge with panoramic mountain views and premium furnishings.",
    amenities: [
      "WiFi",
      "Full Kitchen",
      "Jacuzzi",
      "Sauna",
      "Game Room",
      "Panoramic Views",
    ],
  },
  {
    name: "Forest Edge Cabin",
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&auto=format&fit=crop",
    capacity: 2,
    price: 180,
    discount: 0,
    description:
      "Intimate cabin on the forest edge, perfect for romantic getaways.",
    amenities: [
      "WiFi",
      "Kitchenette",
      "Fireplace",
      "Forest View",
      "Bird Watching",
    ],
  },
  {
    name: "Sunset Retreat",
    image:
      "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=400&h=300&auto=format&fit=crop",
    capacity: 5,
    price: 300,
    discount: 30,
    description:
      "Watch spectacular sunsets from this elevated cabin with wrap-around deck.",
    amenities: [
      "WiFi",
      "Kitchen",
      "Hot Tub",
      "Sunset Views",
      "Deck",
      "Telescope",
    ],
  },
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
