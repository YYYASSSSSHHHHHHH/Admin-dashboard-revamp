export async function PUT(request: Request) {
  const payload = await request.json();

  return Response.json({
    memberId: payload.memberId,
    subscriptions: payload.subscriptions || [],
    saved: true,
  });
}
