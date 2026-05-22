export async function POST(request: Request, context: { params: Promise<{ memberId: string }> }) {
  const { memberId } = await context.params;
  const payload = await request.json();

  return Response.json({
    memberId,
    ...payload,
    saved: true,
  });
}
