export async function PUT(request: Request, context: { params: Promise<{ planId: string }> }) {
  const { planId } = await context.params;
  const payload = await request.json();
  return Response.json({ id: planId, ...payload });
}
