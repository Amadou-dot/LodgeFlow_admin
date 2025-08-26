
import { faker } from '@faker-js/faker';
import { config } from 'dotenv';
import { resolve } from 'path';
import connectDB from '../lib/mongodb';
import type { IBooking, ICabin, ICustomer, IExperience, IDining } from '../models';
import { Booking, Cabin, Customer, Experience, Settings, Dining } from '../models';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Sample cabin data (extracted from database with updated images)
const cabinData = [
  {
    name: 'Pine Valley Cabin',
    image:
      'https://images.unsplash.com/photo-1633830902223-727413dfad8f?w=400&h=300&auto=format&fit=crop',
    capacity: 4,
    price: 250,
    discount: 25,
    description:
      'A cozy cabin nestled in the pine valley with stunning mountain views and modern amenities.',
    amenities: [
      'WiFi',
      'Kitchen',
      'Fireplace',
      'Hot Tub',
      'Mountain View',
      'BBQ Grill',
    ],
  },
  {
    name: 'Lakeside Haven',
    image:
      'https://images.unsplash.com/photo-1697689841030-000d3594c104?w=400&h=300&auto=format&fit=crop',
    capacity: 6,
    price: 350,
    discount: 0,
    description:
      'Waterfront cabin with private dock, perfect for fishing and water activities.',
    amenities: [
      'WiFi',
      'Kitchen',
      'Private Dock',
      'Kayaks',
      'Fire Pit',
      'Lake View',
    ],
  },
  {
    name: 'Mountain View Lodge',
    image:
      'https://images.unsplash.com/photo-1661285129351-2ccc4133dbc0?w=400&h=300&auto=format&fit=crop',
    capacity: 8,
    price: 450,
    discount: 50,
    description:
      'Luxury lodge with panoramic mountain views and premium furnishings.',
    amenities: [
      'WiFi',
      'Full Kitchen',
      'Jacuzzi',
      'Sauna',
      'Game Room',
      'Panoramic Views',
    ],
  },
  {
    name: 'Forest Edge Cabin',
    image:
      'https://images.unsplash.com/photo-1725138187136-790dc99ed924?w=400&h=300&auto=format&fit=crop',
    capacity: 2,
    price: 180,
    discount: 0,
    description:
      'Intimate cabin on the forest edge, perfect for romantic getaways.',
    amenities: [
      'WiFi',
      'Kitchenette',
      'Fireplace',
      'Forest View',
      'Bird Watching',
    ],
  },
  {
    name: 'Sunset Retreat',
    image:
      'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=400&h=300&auto=format&fit=crop',
    capacity: 5,
    price: 300,
    discount: 30,
    description:
      'Watch spectacular sunsets from this elevated cabin with wrap-around deck.',
    amenities: [
      'WiFi',
      'Kitchen',
      'Hot Tub',
      'Sunset Views',
      'Deck',
      'Telescope',
    ],
  },
  {
    name: 'Alpine Sanctuary',
    image:
      'https://images.unsplash.com/photo-1660553926576-b81fd7648618?w=400&h=300&auto=format&fit=crop',
    capacity: 3,
    price: 220,
    discount: 15,
    description:
      'Secluded alpine cabin with rustic charm and breathtaking wilderness views.',
    amenities: [
      'WiFi',
      'Kitchenette',
      'Wood Stove',
      'Hiking Trails',
      'Wildlife Viewing',
      'Stargazing Deck',
    ],
  },
  {
    name: 'Riverside Escape',
    image:
      'https://images.unsplash.com/photo-1580856942656-d4416b6e5c2e?w=400&h=300&auto=format&fit=crop',
    capacity: 4,
    price: 280,
    discount: 0,
    description:
      'Tranquil cabin beside a babbling brook with natural soundscapes and fishing access.',
    amenities: [
      'WiFi',
      'Kitchen',
      'River Access',
      'Fishing Gear',
      'Meditation Area',
      'Nature Sounds',
    ],
  },
  {
    name: 'Wilderness Estate',
    image:
      'https://images.unsplash.com/photo-1693949231048-5518d112e142?w=400&h=300&auto=format&fit=crop',
    capacity: 10,
    price: 600,
    discount: 75,
    description:
      'Luxurious estate cabin perfect for large groups and special celebrations.',
    amenities: [
      'WiFi',
      'Gourmet Kitchen',
      'Multiple Bedrooms',
      'Home Theater',
      'Pool Table',
      'Conference Room',
      'Private Chef Available',
    ],
  },
  {
    name: 'Treetop Hideaway',
    image:
      'https://images.unsplash.com/photo-1751834410723-b0dd9afe6237?w=400&h=300&auto=format&fit=crop',
    capacity: 2,
    price: 320,
    discount: 20,
    description:
      'Unique elevated cabin among the treetops for an unforgettable canopy experience.',
    amenities: [
      'WiFi',
      'Kitchenette',
      'Tree Views',
      'Bird Observatory',
      'Suspension Bridge',
      'Eco-Friendly',
    ],
  },
  {
    name: 'Desert Rose Villa',
    image:
      'https://images.unsplash.com/photo-1561026555-13539e82532f?w=400&h=300&auto=format&fit=crop',
    capacity: 6,
    price: 380,
    discount: 0,
    description:
      'Modern villa with desert landscape views and sustainable design features.',
    amenities: [
      'WiFi',
      'Full Kitchen',
      'Solar Power',
      'Desert Garden',
      'Outdoor Shower',
      'Yoga Studio',
    ],
  },
  {
    name: 'Glacier View Chalet',
    image:
      'https://images.unsplash.com/photo-1654949935785-29cbc0090492?w=400&h=300&auto=format&fit=crop',
    capacity: 7,
    price: 520,
    discount: 40,
    description:
      'Premium chalet with glacier views and luxury amenities for discerning guests.',
    amenities: [
      'WiFi',
      'Gourmet Kitchen',
      'Wine Cellar',
      'Heated Floors',
      'Glacier Views',
      'Spa Bathroom',
      'Concierge Service',
    ],
  },
  {
    name: 'Meadow Brook Cottage',
    image:
      'https://images.unsplash.com/photo-1679480554968-b76deb287584?w=400&h=300&auto=format&fit=crop',
    capacity: 3,
    price: 195,
    discount: 10,
    description:
      'Charming cottage surrounded by wildflower meadows and peaceful brooks.',
    amenities: [
      'WiFi',
      'Country Kitchen',
      'Garden View',
      'Flower Picking',
      'Reading Nook',
      'Hammock',
    ],
  },
  {
    name: 'Canyon Edge Lodge',
    image:
      'https://images.unsplash.com/photo-1597256817041-0c75c0633658?w=400&h=300&auto=format&fit=crop',
    capacity: 5,
    price: 420,
    discount: 35,
    description:
      'Dramatic lodge perched on canyon edge with spectacular views and adventure access.',
    amenities: [
      'WiFi',
      'Kitchen',
      'Canyon Views',
      'Rock Climbing',
      'Rappelling Gear',
      'Safety Equipment',
      'Guide Services',
    ],
  },
  {
    name: 'Stoneheart Manor',
    image:
      'https://images.unsplash.com/photo-1739511534497-92b2fc4df100?w=400&h=300&auto=format&fit=crop',
    capacity: 12,
    price: 750,
    discount: 100,
    description:
      'Historic stone manor with antique furnishings and old-world charm for large gatherings.',
    amenities: [
      'WiFi',
      'Commercial Kitchen',
      'Library',
      'Ballroom',
      'Wine Collection',
      'Butler Service',
      'Event Planning',
      'Antique Furnishings',
    ],
  },
  {
    name: 'Zen Garden Retreat',
    image:
      'https://images.unsplash.com/photo-1668315808815-538f8f72fee9?w=400&h=300&auto=format&fit=crop',
    capacity: 4,
    price: 340,
    discount: 25,
    description:
      'Peaceful retreat with Japanese-inspired design and meditation gardens.',
    amenities: [
      'WiFi',
      'Tea Kitchen',
      'Zen Garden',
      'Meditation Room',
      'Bamboo Forest',
      'Koi Pond',
      'Yoga Mats',
    ],
  },
];

// Sample experiences data
const experienceData = [
  {
    name: 'Guided Nature Walks',
    price: 45,
    duration: '2-3 hours',
    difficulty: 'Easy' as const,
    category: 'Nature',
    description:
      'Discover the local flora and fauna with our expert naturalist guides. Learn about the ecosystem and spot wildlife in their natural habitat.',
    longDescription:
      "Join our experienced naturalist guides for an immersive journey through pristine wilderness areas. During this 2-3 hour exploration, you'll learn to identify native plants, track animal signs, and understand the delicate balance of our local ecosystem. Perfect for all ages and fitness levels, this gentle walk covers easy terrain while offering profound insights into the natural world around us.",
    image:
      'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&auto=format&fit=crop',
    ],
    includes: [
      'Expert guide',
      'Binoculars',
      'Field notebook',
      'Light refreshments',
    ],
    available: ['Daily', 'Morning & Afternoon'],
    ctaText: 'Book Walk',
    isPopular: false,
    maxParticipants: 12,
    minAge: 5,
    requirements: ['Basic walking ability'],
    location: 'Forest Trail Network',
    highlights: [
      'Wildlife spotting',
      'Plant identification',
      'Ecosystem education',
      'Photography opportunities',
    ],
    whatToBring: [
      'Comfortable walking shoes',
      'Weather-appropriate clothing',
      'Water bottle',
      'Camera',
    ],
    cancellationPolicy:
      '24-hour cancellation policy. Full refund if cancelled due to weather.',
    seasonality: 'Year-round availability',
    tags: ['family-friendly', 'educational', 'wildlife', 'nature'],
    rating: 4.8,
    reviewCount: 142,
  },
  {
    name: 'Lake Kayaking Adventure',
    price: 85,
    duration: 'Half day',
    difficulty: 'Moderate' as const,
    category: 'Water Sports',
    description:
      'Paddle through crystal-clear waters surrounded by pristine wilderness. Perfect for beginners and experienced kayakers alike.',
    longDescription:
      'Experience the tranquility of our pristine mountain lake while developing your paddling skills. This half-day adventure includes safety instruction, equipment familiarization, and guided exploration of hidden coves and wildlife viewing areas. No previous experience required - our certified instructors will ensure you feel confident and safe on the water.',
    image:
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&auto=format&fit=crop',
    ],
    includes: [
      'Kayak & equipment',
      'Safety briefing',
      'Waterproof bag',
      'Snacks',
    ],
    available: ['Daily', 'Weather dependent'],
    ctaText: 'Book Adventure',
    isPopular: true,
    maxParticipants: 8,
    minAge: 12,
    requirements: ['Basic swimming ability', 'Moderate fitness level'],
    location: 'Mountain Lake',
    highlights: [
      'Scenic lake views',
      'Wildlife observation',
      'Peaceful paddling',
      'Photography spots',
    ],
    whatToBring: ['Quick-dry clothes', 'Sunscreen', 'Hat', 'Change of clothes'],
    cancellationPolicy:
      'Full refund for weather cancellations. 48-hour notice for other cancellations.',
    seasonality: 'May through October',
    tags: ['water-sports', 'adventure', 'scenic', 'beginner-friendly'],
    rating: 4.9,
    reviewCount: 198,
  },
  {
    name: 'Mountain Hiking Expedition',
    price: 120,
    duration: 'Full day',
    difficulty: 'Challenging' as const,
    category: 'Adventure',
    description:
      'Challenge yourself with a guided hike to our highest peak. Breathtaking views and a true wilderness experience await.',
    longDescription:
      "Embark on an unforgettable journey to the summit of our region's highest peak. This challenging full-day expedition rewards determined hikers with panoramic views and a genuine sense of accomplishment. Our experienced mountain guides will lead you safely through varied terrain while sharing knowledge about alpine ecology and mountain safety.",
    image:
      'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=400&h=300&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&auto=format&fit=crop',
    ],
    includes: [
      'Professional guide',
      'Trail lunch',
      'Hiking poles',
      'First aid support',
    ],
    available: ['Weekends', 'Good weather only'],
    ctaText: 'Book Expedition',
    isPopular: false,
    maxParticipants: 6,
    minAge: 16,
    requirements: [
      'Excellent fitness level',
      'Previous hiking experience',
      'Proper hiking boots',
    ],
    location: 'Summit Trail',
    highlights: [
      'Summit views',
      'Alpine wildlife',
      'Mountain photography',
      'Personal achievement',
    ],
    whatToBring: [
      'Hiking boots',
      'Layers of clothing',
      'Backpack',
      'Water bottles',
      'Energy snacks',
    ],
    cancellationPolicy: 'Weather-dependent. Full refund for unsafe conditions.',
    seasonality: 'June through September',
    tags: ['challenging', 'adventure', 'summit', 'fitness'],
    rating: 4.7,
    reviewCount: 89,
  },
  {
    name: 'Stargazing Sessions',
    price: 35,
    duration: '2 hours',
    difficulty: 'Easy' as const,
    category: 'Astronomy',
    description:
      'Experience the magic of dark skies with our astronomy expert. Learn about constellations and observe celestial wonders.',
    longDescription:
      'Escape light pollution and discover the wonders of our night sky. Our astronomy expert will guide you through constellation identification, planet observation, and deep-sky objects using professional telescopes. Learn fascinating facts about our universe while enjoying hot beverages under a blanket of stars.',
    image:
      'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=300&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400&h=300&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=300&auto=format&fit=crop',
    ],
    includes: ['Telescope access', 'Star charts', 'Hot chocolate', 'Blankets'],
    available: ['Clear nights', 'Year-round'],
    ctaText: 'Book Session',
    isPopular: false,
    maxParticipants: 15,
    minAge: 8,
    requirements: ['Interest in astronomy'],
    location: 'Dark Sky Observatory',
    highlights: [
      'Telescope viewing',
      'Constellation tours',
      'Planet observation',
      'Astrophotography tips',
    ],
    whatToBring: ['Warm clothing', 'Red flashlight', 'Comfortable chair'],
    cancellationPolicy:
      'Weather dependent. Alternative indoor session available.',
    seasonality: 'Year-round (weather permitting)',
    tags: ['astronomy', 'educational', 'night-activity', 'family-friendly'],
    rating: 4.6,
    reviewCount: 156,
  },
  {
    name: 'Fishing Expeditions',
    price: 95,
    duration: '4-6 hours',
    difficulty: 'Easy' as const,
    category: 'Fishing',
    description:
      'Try your hand at catch-and-release fishing in our pristine mountain streams and lake. Equipment and instruction provided.',
    longDescription:
      "Experience the peaceful art of fly fishing in some of the most pristine waters in the region. Whether you're a complete beginner or looking to improve your technique, our certified fishing guides will teach you everything from casting basics to reading water conditions. All equipment included, and we practice strict catch-and-release conservation.",
    image:
      'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400&h=300&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&auto=format&fit=crop',
    ],
    includes: ['Fishing gear', 'Permits', 'Guide', 'Catch cleaning'],
    available: ['Daily', 'Season dependent'],
    ctaText: 'Book Fishing',
    isPopular: false,
    maxParticipants: 4,
    minAge: 10,
    requirements: ['Patience', 'Interest in fishing'],
    location: 'Mountain Streams & Lake',
    highlights: [
      'Fly fishing instruction',
      'Pristine waters',
      'Wildlife viewing',
      'Peaceful experience',
    ],
    whatToBring: ['Waders (if preferred)', 'Sunglasses', 'Sunscreen', 'Snacks'],
    cancellationPolicy: 'Weather and water conditions dependent.',
    seasonality: 'April through October',
    tags: ['fishing', 'peaceful', 'instructional', 'nature'],
    rating: 4.4,
    reviewCount: 73,
  },
  {
    name: 'Photography Workshops',
    price: 75,
    duration: 'Half day',
    difficulty: 'Easy' as const,
    category: 'Creative',
    description:
      'Capture the beauty of nature with guidance from a professional photographer. Learn techniques for landscape and wildlife photography.',
    longDescription:
      'Enhance your photography skills while exploring stunning natural landscapes. Our professional photographer will teach you composition techniques, lighting principles, and camera settings specific to nature photography. Suitable for all skill levels, from smartphone photography to advanced DSLR techniques.',
    image:
      'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400&h=300&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&auto=format&fit=crop',
    ],
    includes: [
      'Professional instruction',
      'Location guidance',
      'Basic equipment',
      'Digital tips',
    ],
    available: ['Weekends', 'Golden hour sessions'],
    ctaText: 'Book Workshop',
    isPopular: false,
    maxParticipants: 8,
    minAge: 12,
    requirements: ['Camera or smartphone', 'Interest in photography'],
    location: 'Various scenic locations',
    highlights: [
      'Composition techniques',
      'Lighting mastery',
      'Wildlife photography',
      'Landscape shots',
    ],
    whatToBring: [
      'Camera equipment',
      'Extra batteries',
      'Memory cards',
      'Tripod (if available)',
    ],
    cancellationPolicy: 'Weather dependent for outdoor sessions.',
    seasonality: 'Year-round',
    tags: ['creative', 'educational', 'photography', 'artistic'],
    rating: 4.8,
    reviewCount: 124,
  },
  {
    name: 'Wellness & Meditation',
    price: 55,
    duration: '2 hours',
    difficulty: 'Easy' as const,
    category: 'Wellness',
    description:
      "Find inner peace in nature's embrace. Guided meditation sessions in serene outdoor settings to rejuvenate your mind and spirit.",
    longDescription:
      'Reconnect with yourself and nature through guided meditation and mindfulness practices. Set in peaceful outdoor locations, these sessions combine breathing techniques, gentle movement, and nature connection exercises. No previous meditation experience required - just an open mind and willingness to find inner peace.',
    image:
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&auto=format&fit=crop',
    ],
    includes: [
      'Meditation guide',
      'Yoga mats',
      'Breathing exercises',
      'Herbal tea',
    ],
    available: ['Daily', 'Morning & Evening'],
    ctaText: 'Book Session',
    isPopular: false,
    maxParticipants: 12,
    minAge: 16,
    requirements: ['Open mind', 'Comfortable sitting'],
    location: 'Meditation Garden',
    highlights: [
      'Guided meditation',
      'Breathing techniques',
      'Nature connection',
      'Stress relief',
    ],
    whatToBring: [
      'Comfortable clothing',
      'Water bottle',
      'Small pillow (optional)',
    ],
    cancellationPolicy: 'Indoor alternative available for weather issues.',
    seasonality: 'Year-round',
    tags: ['wellness', 'meditation', 'relaxation', 'mindfulness'],
    rating: 4.9,
    reviewCount: 167,
  },
  {
    name: 'Foraging & Wild Cooking',
    price: 110,
    duration: '4 hours',
    difficulty: 'Moderate' as const,
    category: 'Culinary',
    description:
      'Learn to identify edible plants and fungi, then prepare a meal using foraged ingredients with our expert chef.',
    longDescription:
      'Discover the ancient art of foraging while learning sustainable harvesting practices. Our expert guide will teach you to safely identify edible plants, mushrooms, and herbs. Then join our chef to transform your foraged finds into a delicious meal, learning traditional cooking techniques and food preparation methods.',
    image:
      'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=400&h=300&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&auto=format&fit=crop',
    ],
    includes: [
      'Foraging guide',
      'Cooking instruction',
      'All ingredients',
      'Full meal',
    ],
    available: ['Weekends', 'Seasonal'],
    ctaText: 'Book Experience',
    isPopular: false,
    maxParticipants: 6,
    minAge: 14,
    requirements: [
      'Interest in sustainable food',
      'No food allergies to wild plants',
    ],
    location: 'Foraging Areas & Outdoor Kitchen',
    highlights: [
      'Plant identification',
      'Sustainable foraging',
      'Wild cooking',
      'Traditional techniques',
    ],
    whatToBring: [
      'Closed-toe shoes',
      'Comfortable clothes',
      'Appetite for adventure',
    ],
    cancellationPolicy: 'Seasonal availability. Weather dependent.',
    seasonality: 'Spring through Fall',
    tags: ['culinary', 'educational', 'foraging', 'sustainable'],
    rating: 4.7,
    reviewCount: 92,
  },
];

// Sample dining data
const diningData = [
  // Regular Menu Items - Breakfast
  {
    name: 'Lodge Breakfast Platter',
    description: 'Traditional hearty breakfast with scrambled eggs, bacon, sausage, hash browns, and toast',
    type: 'menu',
    mealType: 'breakfast',
    price: 18.99,
    servingTime: { start: '07:00', end: '11:00' },
    maxPeople: 1,
    minPeople: 1,
    category: 'regular',
    image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&auto=format&fit=crop',
    ingredients: ['eggs', 'bacon', 'sausage', 'potatoes', 'bread'],
    allergens: ['eggs', 'gluten'],
    dietary: ['gluten-free'],
    isPopular: true,
    isAvailable: true,
    tags: ['breakfast', 'traditional', 'hearty'],
  },
  {
    name: 'Mountain Berry Pancakes',
    description: 'Fluffy pancakes topped with fresh mountain berries and maple syrup',
    type: 'menu',
    mealType: 'breakfast',
    price: 14.99,
    servingTime: { start: '07:00', end: '11:00' },
    maxPeople: 1,
    minPeople: 1,
    category: 'regular',
    image: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=400&h=300&auto=format&fit=crop',
    ingredients: ['flour', 'eggs', 'milk', 'berries', 'maple syrup'],
    allergens: ['eggs', 'gluten', 'dairy'],
    dietary: ['vegetarian'],
    isPopular: true,
    isAvailable: true,
    tags: ['breakfast', 'sweet', 'vegetarian'],
  },

  // Regular Menu Items - Lunch
  {
    name: 'Grilled Mountain Trout',
    description: 'Fresh-caught trout grilled to perfection with lemon herbs and seasonal vegetables',
    type: 'menu',
    mealType: 'lunch',
    price: 28.99,
    servingTime: { start: '11:30', end: '15:00' },
    maxPeople: 1,
    minPeople: 1,
    category: 'regular',
    image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&h=300&auto=format&fit=crop',
    ingredients: ['trout', 'lemon', 'herbs', 'seasonal vegetables'],
    allergens: ['fish'],
    dietary: ['gluten-free', 'dairy-free'],
    isPopular: true,
    isAvailable: true,
    tags: ['lunch', 'fish', 'local', 'healthy'],
  },
  {
    name: 'Lodge Burger',
    description: 'Premium beef burger with lodge sauce, cheese, lettuce, tomato, and hand-cut fries',
    type: 'menu',
    mealType: 'lunch',
    price: 22.99,
    servingTime: { start: '11:30', end: '15:00' },
    maxPeople: 1,
    minPeople: 1,
    category: 'regular',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&auto=format&fit=crop',
    ingredients: ['beef', 'cheese', 'lettuce', 'tomato', 'bun', 'potatoes'],
    allergens: ['gluten', 'dairy'],
    dietary: [],
    isPopular: true,
    isAvailable: true,
    tags: ['lunch', 'burger', 'classic'],
  },

  // Regular Menu Items - Dinner
  {
    name: 'Wild Game Steak',
    description: 'Locally sourced wild game steak with roasted root vegetables and red wine reduction',
    type: 'menu',
    mealType: 'dinner',
    price: 45.99,
    servingTime: { start: '17:00', end: '21:00' },
    maxPeople: 1,
    minPeople: 1,
    category: 'regular',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&auto=format&fit=crop',
    ingredients: ['wild game', 'root vegetables', 'red wine', 'herbs'],
    allergens: [],
    dietary: ['gluten-free', 'dairy-free'],
    isPopular: true,
    isAvailable: true,
    tags: ['dinner', 'local', 'premium', 'wild game'],
  },

  // Craft Beer Selection
  {
    name: 'LodgeFlow IPA',
    description: 'Our signature India Pale Ale with citrus notes and a hoppy finish',
    type: 'menu',
    mealType: 'all-day',
    price: 8.99,
    servingTime: { start: '11:00', end: '23:00' },
    maxPeople: 1,
    minPeople: 1,
    category: 'craft-beer',
    subCategory: 'IPA',
    image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=300&auto=format&fit=crop',
    beverages: [{
      name: 'LodgeFlow IPA',
      description: 'Signature IPA with citrus notes',
      alcoholContent: 6.2,
      category: 'craft-beer',
    }],
    isPopular: true,
    isAvailable: true,
    tags: ['beer', 'craft', 'IPA', 'signature'],
  },
  {
    name: 'Mountain Mist Lager',
    description: 'Light and crisp lager perfect for outdoor adventures',
    type: 'menu',
    mealType: 'all-day',
    price: 7.99,
    servingTime: { start: '11:00', end: '23:00' },
    maxPeople: 1,
    minPeople: 1,
    category: 'craft-beer',
    subCategory: 'Lager',
    image: 'https://images.unsplash.com/photo-1437750769465-301382cdf094?w=400&h=300&auto=format&fit=crop',
    beverages: [{
      name: 'Mountain Mist Lager',
      description: 'Light and crisp lager',
      alcoholContent: 4.8,
      category: 'craft-beer',
    }],
    isPopular: false,
    isAvailable: true,
    tags: ['beer', 'craft', 'lager', 'light'],
  },

  // Wine Selection
  {
    name: 'Valley Pinot Noir',
    description: 'Elegant red wine from local valley vineyards with berry and earth notes',
    type: 'menu',
    mealType: 'all-day',
    price: 12.99,
    servingTime: { start: '16:00', end: '23:00' },
    maxPeople: 1,
    minPeople: 1,
    category: 'wine',
    subCategory: 'Red Wine',
    image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400&h=300&auto=format&fit=crop',
    beverages: [{
      name: 'Valley Pinot Noir',
      description: 'Local Pinot Noir with berry notes',
      alcoholContent: 13.5,
      category: 'wine',
    }],
    isPopular: true,
    isAvailable: true,
    tags: ['wine', 'red', 'local', 'pinot noir'],
  },
  {
    name: 'Mountain Chardonnay',
    description: 'Crisp white wine with apple and citrus notes, perfectly chilled',
    type: 'menu',
    mealType: 'all-day',
    price: 11.99,
    servingTime: { start: '16:00', end: '23:00' },
    maxPeople: 1,
    minPeople: 1,
    category: 'wine',
    subCategory: 'White Wine',
    image: 'https://images.unsplash.com/photo-1558346648-9757f2fa4474?w=400&h=300&auto=format&fit=crop',
    beverages: [{
      name: 'Mountain Chardonnay',
      description: 'Crisp white wine with citrus notes',
      alcoholContent: 12.8,
      category: 'wine',
    }],
    isPopular: false,
    isAvailable: true,
    tags: ['wine', 'white', 'chardonnay', 'crisp'],
  },

  // Artisan Spirits
  {
    name: 'Lodge Whiskey',
    description: 'Locally distilled whiskey aged in oak barrels with vanilla and caramel notes',
    type: 'menu',
    mealType: 'all-day',
    price: 15.99,
    servingTime: { start: '17:00', end: '23:00' },
    maxPeople: 1,
    minPeople: 1,
    category: 'spirits',
    subCategory: 'Whiskey',
    image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&h=300&auto=format&fit=crop',
    beverages: [{
      name: 'Lodge Whiskey',
      description: 'Locally distilled with vanilla notes',
      alcoholContent: 42,
      category: 'spirits',
    }],
    isPopular: true,
    isAvailable: true,
    tags: ['whiskey', 'spirits', 'local', 'aged'],
  },

  // Non-Alcoholic Options
  {
    name: 'Mountain Spring Water',
    description: 'Pure natural spring water from our mountain source',
    type: 'menu',
    mealType: 'all-day',
    price: 3.99,
    servingTime: { start: '07:00', end: '23:00' },
    maxPeople: 1,
    minPeople: 1,
    category: 'non-alcoholic',
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&auto=format&fit=crop',
    beverages: [{
      name: 'Mountain Spring Water',
      description: 'Pure natural spring water',
      category: 'non-alcoholic',
    }],
    isPopular: false,
    isAvailable: true,
    tags: ['water', 'natural', 'spring', 'refreshing'],
  },
  {
    name: 'Fresh Pressed Apple Juice',
    description: 'Made from local orchard apples, pressed fresh daily',
    type: 'menu',
    mealType: 'all-day',
    price: 5.99,
    servingTime: { start: '07:00', end: '20:00' },
    maxPeople: 1,
    minPeople: 1,
    category: 'non-alcoholic',
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&auto=format&fit=crop',
    beverages: [{
      name: 'Fresh Pressed Apple Juice',
      description: 'From local orchard apples',
      category: 'non-alcoholic',
    }],
    isPopular: true,
    isAvailable: true,
    tags: ['juice', 'fresh', 'local', 'apple'],
  },

  // Dining Experiences
  {
    name: 'Wine & Dine Mountain Experience',
    description: 'Exclusive 3-course dining experience paired with local wines and mountain views',
    type: 'experience',
    mealType: 'dinner',
    price: 125.99,
    servingTime: { start: '18:00', end: '21:00' },
    maxPeople: 8,
    minPeople: 2,
    category: 'wine',
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400&h=300&auto=format&fit=crop',
    duration: '3 hours',
    location: 'Mountain View Terrace',
    includes: [
      '3-course gourmet meal',
      'Wine pairings',
      'Sommelier service',
      'Mountain view seating',
    ],
    beverages: [
      {
        name: 'Valley Pinot Noir',
        description: 'Paired with main course',
        category: 'wine',
      },
      {
        name: 'Mountain Chardonnay',
        description: 'Paired with appetizer',
        category: 'wine',
      },
    ],
    specialRequirements: ['Advance reservation required', '21+ only'],
    isPopular: true,
    isAvailable: true,
    tags: ['experience', 'wine', 'fine dining', 'romantic'],
  },
  {
    name: 'Craft Beer & BBQ Experience',
    description: 'Outdoor BBQ experience featuring our craft beer selection and grilled specialties',
    type: 'experience',
    mealType: 'lunch',
    price: 89.99,
    servingTime: { start: '12:00', end: '16:00' },
    maxPeople: 12,
    minPeople: 4,
    category: 'craft-beer',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&auto=format&fit=crop',
    duration: '4 hours',
    location: 'Outdoor Fire Pit Area',
    includes: [
      'BBQ lunch buffet',
      'Beer flight tasting',
      'Live acoustic music',
      'Fire pit gathering',
    ],
    beverages: [
      {
        name: 'LodgeFlow IPA',
        description: 'Signature craft beer',
        category: 'craft-beer',
      },
      {
        name: 'Mountain Mist Lager',
        description: 'Light craft beer',
        category: 'craft-beer',
      },
      {
        name: 'Seasonal Ales',
        description: 'Rotating seasonal selection',
        category: 'craft-beer',
      },
    ],
    specialRequirements: ['Weather dependent', '21+ for alcohol'],
    isPopular: true,
    isAvailable: true,
    tags: ['experience', 'beer', 'BBQ', 'outdoor', 'group'],
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to database
    await connectDB();
    console.log('✅ Database connected');

    // Clear existing data
    await Promise.all([
      Cabin.deleteMany({}),
      Customer.deleteMany({}),
      Booking.deleteMany({}),
      Settings.deleteMany({}),
      Experience.deleteMany({}),
      Dining.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // Create settings
    const settings = await Settings.create({
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
      currency: 'USD',
      timezone: 'UTC',
    });
    console.log('⚙️  Settings created');

    // Create cabins
    const cabins: ICabin[] = await Cabin.insertMany(cabinData);
    console.log(`🏠 Created ${cabins.length} cabins`);

    // Create experiences
    const experiences: IExperience[] =
      await Experience.insertMany(experienceData);
    console.log(`🎯 Created ${experiences.length} experiences`);

    // Create dining items
    const dining: IDining[] = await Dining.insertMany(diningData);
    console.log(`🍽️ Created ${dining.length} dining items`);

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
            'spouse',
            'parent',
            'sibling',
            'friend',
          ]),
        },
        preferences: {
          smokingPreference: faker.helpers.arrayElement([
            'smoking',
            'non-smoking',
            'no-preference',
          ]),
          dietaryRestrictions: faker.helpers.arrayElements(
            ['vegetarian', 'vegan', 'gluten-free', 'lactose-free'],
            { min: 0, max: 2 }
          ),
          accessibilityNeeds: faker.helpers.arrayElements(
            ['wheelchair-accessible', 'hearing-impaired', 'vision-impaired'],
            { min: 0, max: 1 }
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
        from: new Date('2024-01-01'),
        to: new Date('2025-12-31'),
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
          'unconfirmed',
          'confirmed',
          'checked-in',
          'checked-out',
          'cancelled',
        ]),
        cabinPrice: discountedPrice,
        extrasPrice,
        totalPrice,
        isPaid: faker.datatype.boolean({ probability: 0.7 }),
        paymentMethod: faker.helpers.arrayElement([
          'cash',
          'card',
          'bank-transfer',
          'online',
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
              ['late checkout', 'early checkin', 'extra towels', 'baby crib'],
              { min: 1, max: 2 }
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
        b => b.customer.toString() === customer._id.toString()
      );
      const totalSpent = customerBookings.reduce(
        (sum, booking) => sum + booking.totalPrice,
        0
      );
      const lastBooking = customerBookings.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      )[0];

      await Customer.findByIdAndUpdate(customer._id, {
        totalBookings: customerBookings.length,
        totalSpent,
        lastBookingDate: lastBooking?.createdAt,
      });
    }
    console.log('📊 Updated customer statistics');

    console.log('🎉 Database seeding completed successfully!');
    console.log(`
📈 Summary:
- Settings: 1
- Cabins: ${cabins.length}
- Experiences: ${experiences.length}
- Dining Items: ${dining.length}
- Customers: ${customers.length}
- Bookings: ${bookings.length}
    `);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export default seedDatabase;
