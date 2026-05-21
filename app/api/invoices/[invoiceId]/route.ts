export async function PATCH(request: Request, context: any) {
  const { invoiceId } = await context.params;
  const payload = await request.json();
  return Response.json({ id: invoiceId, ...payload });
}

export async function DELETE(_request: Request, context: any) {
  const { invoiceId } = await context.params;
  return Response.json({ id: invoiceId, deleted: true });
}
