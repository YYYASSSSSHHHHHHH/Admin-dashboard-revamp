export async function POST(request: Request) {
  const payload = await request.json();

  return Response.json({
    id: `PUSH-${Date.now().toString().slice(-6)}`,
    ...payload,
    status: payload.status || 'QUEUED',
    channel: 'push',
  });
}
