import { broadcasts } from '@/lib/api-data';

export async function PUT(request: Request, context: any) {
  const { broadcastId } = await context.params;
  const payload = await request.json();
  const existing = broadcasts.find((item) => item.id === broadcastId);
  return Response.json({ ...existing, ...payload, id: broadcastId });
}
