import { membershipLabels } from '@/lib/api-data';

export async function GET() {
  return Response.json(membershipLabels);
}

export async function POST(request: Request) {
  const payload = await request.json();
  return Response.json({ id: `LBL-${Date.now().toString().slice(-5)}`, ...payload });
}
