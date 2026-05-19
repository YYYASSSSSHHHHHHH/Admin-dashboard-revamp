export interface Plan {
  id: string;
  name: string;
  price: number;
  billing: string;
  features: string[];
}

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 19,
    billing: "monthly",
    features: [
      "Basic workspace access",
      "Up to 10 active listings",
      "Standard email support",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: 49,
    billing: "monthly",
    features: [
      "Advanced workspace access",
      "Up to 50 active listings",
      "Priority email support",
      "Detailed analytics dashboard",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    price: 99,
    billing: "monthly",
    features: [
      "Full workspace access",
      "Unlimited listings",
      "24/7 dedicated support",
      "Custom integrations",
      "Advanced analytics & reports",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 249,
    billing: "monthly",
    features: [
      "Custom workspace setup",
      "Unlimited listings & seats",
      "Dedicated account manager",
      "SLA & custom terms",
      "Custom training & onboarding",
    ],
  },
];

export const DESIGNATIONS = [
  { id: "owner", label: "Owner" },
  { id: "admin", label: "Admin" },
  { id: "billing", label: "Billing / Accounts" },
  { id: "manager", label: "Operations Manager" },
];

export const ADDRESS_TITLES = [
  { id: "home", label: "Home Address" },
  { id: "work", label: "Work / Office" },
  { id: "billing", label: "Billing Address" },
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
