export async function PUT(request: Request, context: { params: Promise<{ memberId: string }> }) {
  const { memberId } = await context.params;
  const payload = await request.json();

  return Response.json({
    memberId,
    companyName: payload.companyName,
    companyDetails: payload.companyDetails || payload,
    saved: true,
  });
}
