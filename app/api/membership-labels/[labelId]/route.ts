export async function PUT(request: Request, context: any) {
  const { labelId } = await context.params;
  const payload = await request.json();
  return Response.json({ id: labelId, ...payload });
}

export async function DELETE(_request: Request, context: any) {
  const { labelId } = await context.params;
  return Response.json({ id: labelId, deleted: true });
}
