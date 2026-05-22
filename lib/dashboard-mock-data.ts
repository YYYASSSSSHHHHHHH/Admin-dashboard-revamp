import { members as apiMembers, broadcasts as apiBroadcasts } from '@/lib/api-data';
import { MOCK_EMAILS } from '@/lib/email-seed';
import { toFrontendBroadcast } from '@/lib/broadcast-utils';

export { MOCK_EMAILS };
export type { FrontendEmail } from '@/lib/email-seed';

export const MEMBERS = apiMembers.map((member) => ({
  id: member.id,
  name: member.name,
  email: member.email,
  company: member.companyName,
  avatar: member.initials,
  verified: ['aria-lindqvist', 'mateo-ferrari', 'sarah-jenkins', 'yuki-tanaka'].includes(member.id),
}));

export const FROM_EMAILS = [
  { id: 'ops', name: 'Northgate Ops', address: 'ops@northgate.io', verified: true },
  { id: 'billing', name: 'Northgate Billing', address: 'billing@northgate.io', verified: true },
  { id: 'support', name: 'Northgate Support', address: 'support@northgate.io', verified: true },
];

export const EMAIL_TYPES = [
  { id: 'transactional', label: 'Transactional' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'reminder', label: 'Reminder' },
];

export const EMAIL_TEMPLATES = [
  {
    id: 'welcome',
    name: 'Welcome email',
    type: 'transactional',
    subject: 'Welcome to your membership dashboard',
    message: '<p>Hi {{member_name}},</p><p>Your membership workspace is ready. Sign in anytime to manage broadcasts, contacts, and billing.</p>',
  },
  {
    id: 'renewal',
    name: 'Renewal reminder',
    type: 'reminder',
    subject: 'Your plan renewal is coming up',
    message: '<p>Hi {{member_name}},</p><p>Your current plan renews soon. Review your invoice and confirm payment to avoid interruption.</p>',
  },
  {
    id: 'broadcast-tip',
    name: 'Broadcast best practices',
    type: 'marketing',
    subject: 'Tips for better broadcast response rates',
    message: '<p>Hi {{member_name}},</p><p>Include quantity, condition, and category details in every broadcast for faster matches.</p>',
  },
];

export const EMAIL_STATUSES = [
  { id: 'sent', label: 'Sent', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'draft', label: 'Draft', cls: 'bg-slate-50 text-slate-600 border-slate-200' },
  { id: 'queued', label: 'Queued', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'failed', label: 'Failed', cls: 'bg-red-50 text-red-700 border-red-200' },
];

export const EMAIL_VARIABLES = [
  { id: 'member_name', label: 'Member name' },
  { id: 'company_name', label: 'Company name' },
  { id: 'plan_name', label: 'Plan name' },
  { id: 'expiry_date', label: 'Expiry date' },
];

export const BROADCAST_TYPES = [
  { id: 'wtb', label: 'Want to buy', prefix: 'WTB' },
  { id: 'wts', label: 'Want to sell', prefix: 'WTS' },
];

export const BROADCAST_STATUSES = [
  { id: 'live', label: 'Live', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'pending', label: 'Pending', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'rejected', label: 'Rejected', cls: 'bg-red-50 text-red-700 border-red-200' },
  { id: 'hide', label: 'Hidden', cls: 'bg-slate-50 text-slate-600 border-slate-200' },
];

export const PRODUCT_CONDITIONS = [
  { id: 'new', label: 'New' },
  { id: 'used', label: 'Used' },
];

export const MAIN_CATEGORIES = [
  { id: 'accessories', label: 'Accessories' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'mobile', label: 'Mobile' },
];

export const SUB_CATEGORIES_BY_MAIN: Record<string, string[]> = {
  accessories: ['Chargers', 'Cases', 'Cables'],
  electronics: ['Laptops', 'Monitors', 'Keyboards'],
  mobile: ['iPhone', 'Samsung Galaxy', 'Google Pixel'],
};

export const SEND_TO_OPTIONS = [
  { id: 'sendToAll', label: 'Send to All' },
  { id: 'sendToGroup', label: 'Send to group' },
];

export const AUDIENCE_OPTIONS = [
  { id: 'allMembers', label: 'All Members' },
  { id: 'chargerSuppliers', label: 'Charger suppliers' },
  { id: 'electronicsDistributors', label: 'Electronics distributors' },
  { id: 'mobileBuyers', label: 'Mobile buyers' },
];

export const REJECT_REASONS = [
  { id: 'inappropriate', label: 'Inappropriate Content' },
  { id: 'duplicate', label: 'Duplicate Broadcast' },
  { id: 'spam', label: 'Spam / Misleading' },
  { id: 'policy', label: 'Policy Violation' },
  { id: 'other', label: 'Other' },
];

export const HIDE_REASONS = [
  { id: 'review', label: 'Under Review' },
  { id: 'outdated', label: 'Outdated Listing' },
  { id: 'owner_request', label: 'Owner Request' },
  { id: 'compliance', label: 'Compliance Hold' },
  { id: 'other', label: 'Other' },
];

export const MOCK_BROADCASTS = apiBroadcasts.map(toFrontendBroadcast);

export type { FrontendBroadcast } from '@/lib/broadcast-utils';
export { toFrontendBroadcast };
