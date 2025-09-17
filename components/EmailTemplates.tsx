interface EmailTemplateProps {
  firstName: string;
}

export function WelcomeEmail({ firstName }: EmailTemplateProps) {
  return (
    <div>
      <h1>Welcome, {firstName}!</h1>
    </div>
  );
}

export function BookingConfirmationEmail({ firstName }: EmailTemplateProps) {
  return (
    <div>
      <h1>Booking Confirmed, {firstName}!</h1>
    </div>
  );
}
