export async function PATCH(request: Request, context: any) {
  const { requestId } = await context.params;
  const payload = await request.json();
  return Response.json({ id: requestId, ...payload });
}
