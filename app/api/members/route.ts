import { members } from '@/lib/api-data';

export async function GET() {
  return Response.json(members);
}
