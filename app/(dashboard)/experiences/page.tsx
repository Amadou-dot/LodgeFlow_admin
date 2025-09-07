'use client';

import AddExperienceModal from '@/components/AddExperienceModal';
import { ExperienceGrid } from '@/components/ExperienceGrid';
import { PlusIcon } from '@/components/icons';
import { useCreateExperience, useExperiences } from '@/hooks/useExperiences';
import { Button } from '@heroui/button';
import { Card, CardBody } from '@heroui/card';
import { useDisclosure } from '@heroui/modal';
import { Spinner } from '@heroui/spinner';
import { addToast } from '@heroui/toast';

export default function ExperiencesPage() {
  const { data: experiences, error, isLoading } = useExperiences();
  const { createExperience } = useCreateExperience();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleCreateExperience = async (formData: Record<string, any>) => {
    try {
      // Basic validation
      const requiredFields = [
        'title',
        'price',
        'duration',
        'category',
        'shortDescription',
        'imageUrl',
        'callToAction',
      ];
      const missingFields = requiredFields.filter(field => !formData[field]);

      if (missingFields.length > 0) {
        addToast({
          title: 'Validation Error',
          description: `Please fill in all required fields: ${missingFields.join(', ')}`,
          color: 'danger',
        });
        return;
      }

      // Transform form data to match Experience model
      const transformedData = {
        name: formData.title,
        price: Number(formData.price) || 0,
        duration: formData.duration,
        difficulty: formData.difficulty || 'Easy',
        category: formData.category,
        description: formData.shortDescription,
        longDescription: formData.longDescription,
        image: formData.imageUrl,
        gallery: formData.imageGallery
          ? formData.imageGallery.split(',').map((url: string) => url.trim())
          : [],
        includes: formData.includes
          ? formData.includes.split(',').map((item: string) => item.trim())
          : [],
        available: formData.availableTimes
          ? formData.availableTimes
              .split(',')
              .map((time: string) => time.trim())
          : [],
        ctaText: formData.callToAction || 'Book Now',
        isPopular: formData.isPopular || false,
        maxParticipants: Number(formData.maxParticipants) || undefined,
        minAge: Number(formData.minimumAge) || undefined,
        requirements: formData.requirements
          ? formData.requirements.split(',').map((req: string) => req.trim())
          : [],
        location: formData.location,
        highlights: formData.highlights
          ? formData.highlights
              .split(',')
              .map((highlight: string) => highlight.trim())
          : [],
        whatToBring: formData.whatToBring
          ? formData.whatToBring.split(',').map((item: string) => item.trim())
          : [],
        cancellationPolicy: formData.cancellationPolicy,
        seasonality: Array.isArray(formData.seasonalAvailability)
          ? formData.seasonalAvailability.join(', ')
          : formData.seasonalAvailability || '',
        tags: formData.tags
          ? formData.tags.split(',').map((tag: string) => tag.trim())
          : [],
      };

      // Use the custom hook instead of direct fetch
      await createExperience(transformedData);

      addToast({
        title: 'Experience Created',
        description: 'Your new experience has been created successfully.',
        color: 'success',
      });
    } catch (error) {
      console.error('Error creating experience:', error);
      addToast({
        title: 'Error',
        description: 'Failed to create experience. Please try again.',
        color: 'danger',
      });
    }
  };

  if (error) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <Card className='bg-danger-50 border-danger-200'>
          <CardBody>
            <p className='text-danger'>
              Error loading experiences: {error.message}
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
        <div>
          <h1 className='text-3xl font-bold'>Experiences</h1>
          <p className='text-default-600 mt-1'>
            Manage your experience offerings and activities
          </p>
        </div>
        <AddExperienceModal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          onCreate={handleCreateExperience}
        />
        <Button
          color='primary'
          startContent={<PlusIcon size={18} />}
          onPress={onOpen}
          className='w-full sm:w-auto'
        >
          Add New Experience
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className='flex justify-center items-center py-12'>
          <Spinner size='lg' label='Loading experiences...' />
        </div>
      )}

      {/* Experiences Content */}
      {!isLoading && (
        <>
          {!experiences || experiences.length === 0 ? (
            <Card className='bg-default-50'>
              <CardBody className='text-center py-12'>
                <p className='text-default-600 text-lg mb-4'>
                  No experiences available
                </p>
                <Button
                  color='primary'
                  onPress={handleCreateExperience}
                  startContent={<PlusIcon size={18} />}
                >
                  Create Your First Experience
                </Button>
              </CardBody>
            </Card>
          ) : (
            <>
              {/* Results Count */}
              <div className='mb-6'>
                <p className='text-sm text-default-600'>
                  {experiences.length} experience
                  {experiences.length !== 1 ? 's' : ''} found
                </p>
              </div>

              {/* Experiences Grid */}
              <ExperienceGrid items={experiences} />
            </>
          )}
        </>
      )}
    </div>
  );
}
