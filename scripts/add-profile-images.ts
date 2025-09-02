import connectDB from '@/lib/mongodb';
import { Customer } from '@/models';

// Sample profile images from a free API service like Unsplash or generated avatars
const sampleProfileImages = [
  'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
];

// Alternative: Use generated avatar service
const generateAvatarUrl = (name: string) => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=150&background=random&color=fff&bold=true`;
};

async function addProfileImages() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Get all customers without profile images
    const customers = await Customer.find({
      $or: [
        { profileImage: { $exists: false } },
        { profileImage: null },
        { profileImage: '' },
      ],
    });

    console.log(`Found ${customers.length} customers without profile images`);

    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i];

      // Use either sample images or generated avatars
      const useGeneratedAvatar = true; // Set to false to use sample images

      let profileImage: string;
      if (useGeneratedAvatar) {
        profileImage = generateAvatarUrl(customer.name);
      } else {
        profileImage = sampleProfileImages[i % sampleProfileImages.length];
      }

      await Customer.findByIdAndUpdate(
        customer._id,
        { profileImage },
        { new: true }
      );

      console.log(
        `Updated ${customer.name} with profile image: ${profileImage}`
      );
    }

    console.log('✅ Successfully added profile images to all customers');
  } catch (error) {
    console.error('❌ Error adding profile images:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
if (require.main === module) {
  addProfileImages();
}

export { addProfileImages };
