export type FeaturePrivilege = {
  key: string;
  type: 'yes' | 'no' | 'value';
  value: string;
};

export type MembershipPlanCatalog = {
  id: string;
  name: string;
  price: number;
  billing: string;
  validity: string;
  status: 'Active' | 'Inactive';
  dailyBroadcast: string;
  dailyDirectEmail: string;
  features: FeaturePrivilege[];
};

export const DEFAULT_PLAN_PERMISSIONS: FeaturePrivilege[] = [
  { key: 'Send to all', type: 'no', value: '' },
  { key: 'State', type: 'yes', value: '' },
  { key: 'City', type: 'yes', value: '' },
  { key: 'Add Contacts', type: 'no', value: '' },
  { key: 'Address Book', type: 'no', value: '' },
  { key: 'Phone no (Show / Hide)', type: 'yes', value: '' },
];

export function formatPlanPrice(price: number) {
  return price <= 0 ? 'Free' : `$${price}`;
}

export function featureIncludedDisplay(feat: FeaturePrivilege) {
  if (feat.type === 'yes') return 'yes';
  if (feat.type === 'no') return 'no';
  return feat.value || '—';
}
