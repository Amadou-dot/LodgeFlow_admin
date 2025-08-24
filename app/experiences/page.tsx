'use client'
import { ExperienceGrid } from '@/components/ExperienceGrid';
import { useExperiences } from '@/hooks/useExperiences';
import { Card, CardBody } from '@heroui/card';
import { Spinner } from '@heroui/spinner';

export default function ExperiencesPage() {
  const { data: experiences, error, isLoading } = useExperiences();

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

  if (isLoading || !experiences) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='flex justify-center items-center py-12'>
          <Spinner size='lg' label='Loading experiences...' />
        </div>
      </div>
    );
  }

  return (
    <div className='flex gap-4'>
      <ExperienceGrid items={experiences} />
    </div>
  );
}
