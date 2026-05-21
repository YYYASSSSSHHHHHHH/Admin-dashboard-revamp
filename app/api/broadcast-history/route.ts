import { broadcasts } from '@/lib/api-data';

export async function GET() {
  return Response.json(broadcasts);
}
