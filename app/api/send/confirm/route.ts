import { BookingConfirmationEmail } from '@/components/EmailTemplates';
import { validateEmail } from '@/utils/utilityFunctions';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { firstName, email, bookingData, cabinData } = await request.json();
  const emailValid = validateEmail(email);
  try {
    console.log(email);
    if (!emailValid) {
      return Response.json({ error: 'Invalid email address' }, { status: 400 });
    }

    if (!bookingData || !cabinData) {
      return Response.json(
        { error: 'Missing booking or cabin data' },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: 'LodgeFlow <onboarding@resend.dev>',
      to: `${email}`,
      subject: 'Booking Confirmation',
      react: BookingConfirmationEmail({
        firstName,
        bookingData,
        cabinData,
      }),
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
