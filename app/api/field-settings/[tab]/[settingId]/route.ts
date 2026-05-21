export async function PUT(request: Request, context: any) {
  const { settingId } = await context.params;
  const payload = await request.json();
  return Response.json({ id: settingId, ...payload });
}

export async function DELETE(_request: Request, context: any) {
  const { settingId } = await context.params;
  return Response.json({ id: settingId, deleted: true });
}
