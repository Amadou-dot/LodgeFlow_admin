import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

/**
 * Server-side authentication helper
 * Use this in server components and API routes
 */
export async function requireAuth() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return { userId };
}

/**
 * Get user authentication status on the server
 * Returns null if user is not authenticated
 */
export async function getAuth() {
  const authData = await auth();
  return authData.userId ? authData : null;
}
