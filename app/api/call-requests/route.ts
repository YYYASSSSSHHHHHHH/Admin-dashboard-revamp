import { callRequests } from '@/lib/api-data';

export async function GET() {
  return Response.json(callRequests);
}
