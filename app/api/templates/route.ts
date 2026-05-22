const categories = [
  { id: '1', name: 'Welcome Series', channel: 'email', status: 'active' },
  { id: '2', name: 'Billing Receipts', channel: 'email', status: 'active' },
  { id: '3', name: 'Account Security Alerts', channel: 'push', status: 'active' },
  { id: '4', name: 'Promo Broadcasts', channel: 'email', status: 'inactive' },
  { id: '5', name: 'System Maintenance Notices', channel: 'push', status: 'active' },
];

const templates = [
  { id: '1', categoryId: '1', name: 'New Signup Confirmation', subject: 'Welcome to Northgate, {name}!', type: 'Transactional', content: 'Hello {name},\n\nThank you for signing up at {company}! Your registration is successfully confirmed under the {plan} plan.' },
  { id: '2', categoryId: '1', name: 'Onboarding Checklist Guide', subject: 'Quick onboarding guide to set up your account', type: 'Marketing', content: 'Hey {name},\n\nTo help you get the most out of your {plan} plan, we have prepared a quick start dashboard checklist.' },
  { id: '3', categoryId: '2', name: 'Invoice Payment Receipt', subject: 'Receipt for your invoice #{invoiceNum}', type: 'Transactional', content: 'Dear Partner,\n\nWe have received your payment. A confirmation statement has been sent to your account.' },
  { id: '4', categoryId: '2', name: 'Subscription Renewal Alert', subject: 'Your plan {plan} will renew soon', type: 'Transactional', content: 'Hello {name},\n\nThis is a friendly reminder that your subscription will auto-renew on {expiry}.' },
  { id: '5', categoryId: '3', name: 'Failed Login Alert Notification', type: 'Transactional', content: 'Alert: Unrecognized login attempt detected on your corporate account.' },
  { id: '6', categoryId: '3', name: 'Security Settings Updated', type: 'Transactional', content: 'Your master account credentials have been changed successfully.' },
];

export async function GET() {
  return Response.json({ categories, templates });
}

export async function PUT(request: Request) {
  const payload = await request.json();

  return Response.json({
    categories: payload.categories || [],
    templates: payload.templates || [],
    saved: true,
  });
}
