import { Card, CardBody, CardHeader } from '@heroui/card';

interface NotesCardProps {
  observations?: string;
  specialRequests?: string[];
}

export default function NotesCard({
  observations,
  specialRequests,
}: NotesCardProps) {
  const hasContent =
    observations || (specialRequests && specialRequests.length > 0);

  if (!hasContent) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <h2 className='text-lg font-semibold'>Notes & Special Requests</h2>
      </CardHeader>
      <CardBody className='space-y-4'>
        {observations && (
          <div>
            <h4 className='font-medium text-sm text-default-600 mb-1'>
              Observations:
            </h4>
            <p className='text-sm'>{observations}</p>
          </div>
        )}
        {specialRequests && specialRequests.length > 0 && (
          <div>
            <h4 className='font-medium text-sm text-default-600 mb-1'>
              Special Requests:
            </h4>
            <ul className='text-sm space-y-1'>
              {specialRequests.map((request, index) => (
                <li key={index} className='flex items-start gap-2'>
                  <span className='text-primary'>•</span>
                  <span>{request}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
