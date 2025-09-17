import { WelcomeEmail } from '@/components/EmailTemplates';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { firstName, email } = await request.json();
  try {
    const { data, error } = await resend.emails.send({
      from: 'LodgeFlow <onboarding@resend.dev>',
      to: email,
      subject: 'Welcome to LodgeFlow',
      react: WelcomeEmail({ firstName }),
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
