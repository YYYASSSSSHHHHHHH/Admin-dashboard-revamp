export const MOCK_EMAILS = [
  {
    id: 'EML-1102',
    recipient: { name: 'Aria Lindqvist', email: 'aria.lindqvist@northwave.io' },
    from: 'ops',
    sentBy: 'Olivia Chen',
    type: 'transactional',
    subject: 'Welcome to your membership dashboard',
    message: '<p>Hi Aria,</p><p>Your membership workspace is ready. Sign in anytime to manage broadcasts, contacts, and billing.</p>',
    status: 'sent',
    sentAt: '2026-05-01T10:00:00.000Z',
  },
  {
    id: 'EML-1098',
    recipient: { name: 'Aria Lindqvist', email: 'aria.lindqvist@northwave.io' },
    from: 'billing',
    sentBy: 'Jayesh Jain',
    type: 'reminder',
    subject: 'Invoice INV/2026/9004 is ready',
    message: '<p>Hi Aria,</p><p>Your latest invoice is available in the billing section.</p>',
    status: 'sent',
    sentAt: '2026-05-18T14:20:00.000Z',
  },
  {
    id: 'EML-1091',
    recipient: { name: 'Aria Lindqvist', email: 'aria.lindqvist@northwave.io' },
    from: 'support',
    sentBy: 'Olivia Chen',
    type: 'marketing',
    subject: 'Broadcast tips for faster responses',
    message: '<p>Include quantity, condition, and category in every broadcast.</p>',
    status: 'draft',
    sentAt: '2026-05-19T09:15:00.000Z',
  },
] as const;

export type FrontendEmail = {
  id: string;
  recipient: { name: string; email: string };
  from: string;
  sentBy: string;
  type: string;
  subject: string;
  message: string;
  status: string;
  sentAt: string;
};
