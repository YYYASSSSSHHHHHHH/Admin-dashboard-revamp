import { relativeTime } from '@/lib/constants';

export function mapBroadcastStatus(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === 'approved' || normalized === 'live') return 'live';
  if (normalized === 'rejected') return 'rejected';
  if (normalized === 'hidden' || normalized === 'hide') return 'hide';
  return 'pending';
}

export function toFrontendBroadcast(broadcast: {
  id: string;
  at: string;
  companyName: string;
  type: string;
  condition: string;
  mainCategory: string;
  subCategory: string;
  text: string;
  qty: number;
  priceOption: string;
  priceAmount: number;
  sendingOption: string;
  audience: string;
  status: string;
}) {
  const mapAudience = (audience: string) => {
    const map: Record<string, string> = {
      'All Members': 'allMembers',
      'Charger suppliers': 'chargerSuppliers',
      'Electronics distributors': 'electronicsDistributors',
      'Mobile buyers': 'mobileBuyers',
    };
    return map[audience] || 'allMembers';
  };

  return {
    id: broadcast.id,
    submittedAt: broadcast.at,
    submittedAgo: relativeTime(broadcast.at),
    companyName: broadcast.companyName,
    type: (broadcast.type.toLowerCase() === 'wts' ? 'wts' : 'wtb') as 'wtb' | 'wts',
    productCondition: broadcast.condition.toLowerCase(),
    mainCategory: broadcast.mainCategory.toLowerCase().replace(/\s+/g, ''),
    subCategory: broadcast.subCategory,
    message: broadcast.text,
    quantity: String(broadcast.qty),
    price: broadcast.priceOption === 'Fixed' ? `$${broadcast.priceAmount}` : 'Quote',
    sendTo: broadcast.sendingOption === 'SendToAll' || broadcast.sendingOption === 'Send to All' ? 'sendToAll' : 'sendToGroup',
    audience: mapAudience(broadcast.audience),
    status: mapBroadcastStatus(broadcast.status),
    rejectionReason: undefined as string | undefined,
    hideReason: undefined as string | undefined,
  };
}

export type FrontendBroadcast = ReturnType<typeof toFrontendBroadcast> & {
  rejectionReason?: string;
  hideReason?: string;
};
