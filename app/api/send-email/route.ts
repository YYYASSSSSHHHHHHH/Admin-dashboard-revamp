export async function POST(request: Request) {
  const payload = await request.json();

  return Response.json({
    id: `EMAIL-${Date.now().toString().slice(-6)}`,
    ...payload,
    status: payload.status || 'QUEUED',
  });
}
