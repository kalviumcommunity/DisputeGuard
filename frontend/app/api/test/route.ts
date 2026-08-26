import { env } from '@/lib/env';

export async function GET() {
  console.log('Using database host:', env.database.url.split('@')[1]);

  return Response.json({
    message: 'Environment variables loaded successfully',
    appName: env.public.appName,
    analyticsId: env.public.analyticsId,
  });
}