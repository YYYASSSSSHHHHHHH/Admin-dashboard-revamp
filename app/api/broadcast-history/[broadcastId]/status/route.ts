export async function PATCH(request: Request, context: any) {
  const { broadcastId } = await context.params;
  const payload = await request.json();
  return Response.json({ id: broadcastId, ...payload });
}
