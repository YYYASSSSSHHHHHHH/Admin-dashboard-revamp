export interface Plan {
  id: string;
  name: string;
  price: number;
  billing: '15days' | 'monthly' | 'quarterly' | 'halfyearly' | 'yearly';
  features: string[];
  dailyBroadcasts: number;
  email: string;
  status: 'active' | 'inactive';
  permissions: {
    sendall: boolean;
    state: boolean;
    city: boolean;
    contacts: boolean;
    address: boolean;
    phone: boolean;
  };
}

export const PLANS: Plan[] = [
  {
    id: "tk-lite",
    name: "TK-LITE",
    price: 0,
    billing: "monthly",
    features: ["5 Broadcasts daily", "lite@tk.com outbound email", "State targeting", "City targeting", "Phone No Show/Hide"],
    dailyBroadcasts: 5,
    email: "lite@tk.com",
    status: "active",
    permissions: {
      sendall: false,
      state: true,
      city: true,
      contacts: false,
      address: false,
      phone: true,
    },
  },
  {
    id: "tk-premium",
    name: "TK-PREMIUM",
    price: 18500,
    billing: "yearly",
    features: ["100 Broadcasts daily", "premium@tk.com outbound email", "All permission flags enabled"],
    dailyBroadcasts: 100,
    email: "premium@tk.com",
    status: "active",
    permissions: {
      sendall: true,
      state: true,
      city: true,
      contacts: true,
      address: true,
      phone: true,
    },
  },
  {
    id: "tk-standard",
    name: "TK-STANDARD",
    price: 15000,
    billing: "monthly",
    features: ["50 Broadcasts daily", "standard@tk.com outbound email", "All permission flags enabled"],
    dailyBroadcasts: 50,
    email: "standard@tk.com",
    status: "active",
    permissions: {
      sendall: true,
      state: true,
      city: true,
      contacts: true,
      address: true,
      phone: true,
    },
  },
  {
    id: "tk-free",
    name: "TK FREE",
    price: 0,
    billing: "15days",
    features: ["2 Broadcasts daily", "free@tk.com outbound email", "All permission flags disabled"],
    dailyBroadcasts: 2,
    email: "free@tk.com",
    status: "active",
    permissions: {
      sendall: false,
      state: false,
      city: false,
      contacts: false,
      address: false,
      phone: false,
    },
  },
];

export const DESIGNATIONS = [
  { id: "owner", label: "Owner" },
  { id: "admin", label: "Admin" },
  { id: "billing", label: "Billing / Accounts" },
  { id: "manager", label: "Operations Manager" },
];

export const ADDRESS_TITLES = [
  { id: "company", label: "Company Address" },
  { id: "work", label: "Work" },
  { id: "factory", label: "Factory" },
  { id: "warehouse", label: "Warehouse" },
];

export const COUNTRIES = [
  { id: "in", label: "India" },
  { id: "us", label: "United States" },
  { id: "gb", label: "United Kingdom" },
];

export const STATES_BY_COUNTRY: Record<string, string[]> = {
  in: ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Gujarat", "Telangana"],
  us: ["California", "New York", "Texas", "Washington", "Florida", "Illinois"],
  gb: ["England", "Scotland", "Wales", "Northern Ireland"],
};

export const ACTIONS = [
  { id: "assign", label: "Assign Plan" },
  { id: "extend", label: "Extend Plan" },
  { id: "upgrade", label: "Upgrade Plan" },
  { id: "suspend", label: "Suspend Member" },
  { id: "reactivate", label: "Reactivate Member" },
];

export const SUSPEND_REASONS = [
  { id: "policy_violation", label: "Policy Violation" },
  { id: "payment_failure", label: "Payment Failure" },
  { id: "voluntary_pause", label: "Voluntary Pause" },
  { id: "other", label: "Other (specify)" },
];

export function formatDate(dateInput: string | Date | undefined): string {
  if (!dateInput) return "—";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) {
    if (typeof dateInput === "string") return dateInput;
    return "—";
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function relativeTime(dateInput: string | Date | undefined): string {
  if (!dateInput) return "—";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "—";
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) {
    return `${Math.max(1, diffMins)}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else {
    return `${diffDays}d ago`;
  }
}

export const MOCK_ACTIVITIES = [
  {
    memberId: "aria-lindqvist",
    memberName: "Aria Lindqvist",
    avatar: "AL",
    type: "payment_received",
    title: "payment received",
    description: "Successfully processed monthly invoice of $49",
    at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    memberId: "tomas-beltran",
    memberName: "Tomás Beltrán",
    avatar: "TB",
    type: "plan_extended",
    title: "plan extended",
    description: "Renewed subscription for Starter Plan",
    at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
  {
    memberId: "priya-raghavan",
    memberName: "Priya Raghavan",
    avatar: "PR",
    type: "member_suspended",
    title: "member suspended",
    description: "Account suspended due to overdue invoice",
    at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    memberId: "mateo-ferrari",
    memberName: "Mateo Ferrari",
    avatar: "MF",
    type: "payment_received",
    title: "payment received",
    description: "Successfully processed monthly invoice of $249",
    at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
  {
    memberId: "hana-okonkwo",
    memberName: "Hana Okonkwo",
    avatar: "HO",
    type: "plan_upgraded",
    title: "plan upgraded",
    description: "Upgraded from Starter to Growth Plan",
    at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
  },
];
