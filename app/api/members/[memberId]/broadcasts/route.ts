export async function PUT(request: Request, context: { params: Promise<{ memberId: string }> }) {
  const { memberId } = await context.params;
  const payload = await request.json();

  return Response.json({
    memberId,
    broadcasts: payload.broadcasts || [],
    saved: true,
  });
}
