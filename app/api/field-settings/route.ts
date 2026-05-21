import { fieldSettings, makeCreatedItem } from '@/lib/api-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tab = searchParams.get('tab') || 'category';
  return Response.json(fieldSettings[tab] || []);
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const tab = searchParams.get('tab') || 'category';
  const payload = await request.json();
  return Response.json(makeCreatedItem(tab, payload));
}
