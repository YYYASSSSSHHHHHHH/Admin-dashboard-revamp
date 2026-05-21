import { makeCreatedItem } from '@/lib/api-data';

export async function POST(request: Request, context: any) {
  const { tab } = await context.params;
  const payload = await request.json();
  return Response.json(makeCreatedItem(tab, payload));
}
