import { getMemberDetail } from '@/lib/api-data';

export async function GET(_request: Request, context: any) {
  const { memberId } = await context.params;
  return Response.json(getMemberDetail(memberId));
}
