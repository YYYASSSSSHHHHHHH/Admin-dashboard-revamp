export async function POST(request: Request, context: any) {
  const { invoiceId } = await context.params;
  const payload = await request.json();
  return Response.json({ id: invoiceId, queued: true, ...payload });
}
