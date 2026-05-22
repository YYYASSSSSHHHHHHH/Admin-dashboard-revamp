const categories = [
  { id: 'monitor', name: 'Monitor', icon: 'Monitor', status: 'Active' },
  { id: 'laptop', name: 'Laptop', icon: 'Laptop', status: 'Active' },
  { id: 'server', name: 'Server', icon: 'Server', status: 'Active' },
  { id: 'network', name: 'Network', icon: 'Network', status: 'Active' },
  { id: 'mobile', name: 'Mobile', icon: 'Smartphone', status: 'Active' },
  { id: 'storage', name: 'Storage', icon: 'HardDrive', status: 'Active' },
  { id: 'cables', name: 'Cables', icon: 'Cable', status: 'Inactive' },
  { id: 'printer', name: 'Printer', icon: 'Printer', status: 'Inactive' },
];

const subscriptionsByMember: Record<string, string[]> = {
  'aria-lindqvist': ['monitor', 'laptop', 'server'],
  'tomas-beltran': ['mobile', 'network'],
  'priya-raghavan': ['server', 'storage', 'cables'],
  default: ['monitor', 'laptop', 'network'],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get('memberId') || 'default';

  return Response.json({
    categories,
    subscriptions: subscriptionsByMember[memberId] || subscriptionsByMember.default,
  });
}
