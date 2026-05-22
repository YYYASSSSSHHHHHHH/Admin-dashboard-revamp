export async function POST(request: Request, context: { params: Promise<{ memberId: string }> }) {
  const { memberId } = await context.params;
  const payload = await request.json();

  return Response.json({
    memberId,
    email: payload.email,
    saved: true,
  });
}

export async function PUT(request: Request, context: { params: Promise<{ memberId: string }> }) {
  const { memberId } = await context.params;
  const payload = await request.json();

  return Response.json({
    memberId,
    emails: payload.emails || [],
    saved: true,
  });
}
