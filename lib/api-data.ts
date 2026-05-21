export const members = [
  { id: 'aria-lindqvist', initials: 'AL', name: 'Aria Lindqvist', companyName: 'Northwave Inc', location: 'Stockholm, Sweden', email: 'aria.lindqvist@northwave.io', mobileNumber: '+46 8 123 4567', plan: 'Growth', planPrice: '$49/monthly', status: 'ACTIVE', payment: 'PAID', expiryDate: 'Jun 6, 2026', daysLeft: '18d left', registrationDate: '14-Jan-2026' },
  { id: 'tomas-beltran', initials: 'TB', name: 'Tomas Beltran', companyName: 'Meridian Shop', location: 'Madrid, Spain', email: 'tbeltran@meridian.shop', mobileNumber: '+34 91 123 4567', plan: 'Starter', planPrice: '$19/monthly', status: 'ACTIVE', payment: 'PENDING', expiryDate: 'May 23, 2026', daysLeft: '4d left', registrationDate: '18-Feb-2026' },
  { id: 'priya-raghavan', initials: 'PR', name: 'Priya Raghavan', companyName: 'Orbit Labs', location: 'Bangalore, India', email: 'priya@orbitlabs.dev', mobileNumber: '+91 98765 43210', plan: 'Scale', planPrice: '$99/monthly', status: 'SUSPENDED', payment: 'OVERDUE', expiryDate: 'May 13, 2026', daysLeft: 'Expired 6d ago', registrationDate: '22-Mar-2026' },
  { id: 'mateo-ferrari', initials: 'MF', name: 'Mateo Ferrari', companyName: 'Brightboard Co', location: 'Milan, Italy', email: 'mateo.f@brightboard.co', mobileNumber: '+39 02 123 4567', plan: 'Enterprise', planPrice: '$249/monthly', status: 'ACTIVE', payment: 'PAID', expiryDate: 'Jul 14, 2026', daysLeft: '56d left', registrationDate: '02-Apr-2026' },
  { id: 'hana-okonkwo', initials: 'HO', name: 'Hana Okonkwo', companyName: 'Looplane Studio', location: 'Lagos, Nigeria', email: 'hana@looplane.studio', mobileNumber: '+234 803 123 4567', plan: 'Growth', planPrice: '$49/monthly', status: 'ACTIVE', payment: 'PAID', expiryDate: 'May 31, 2026', daysLeft: '12d left', registrationDate: '19-Apr-2026' },
  { id: 'sarah-jenkins', initials: 'SJ', name: 'Sarah Jenkins', companyName: 'Apex Data', location: 'London, UK', email: 'sarah@apexdata.co.uk', mobileNumber: '+44 20 7946 0192', plan: 'Scale', planPrice: '$99/monthly', status: 'ACTIVE', payment: 'PAID', expiryDate: 'Jun 18, 2026', daysLeft: '30d left', registrationDate: '05-May-2026' },
  { id: 'yuki-tanaka', initials: 'YT', name: 'Yuki Tanaka', companyName: 'Nippon Media', location: 'Tokyo, Japan', email: 'y.tanaka@nipponmedia.jp', mobileNumber: '+81 3 5555 0142', plan: 'Starter', planPrice: '$19/monthly', status: 'ACTIVE', payment: 'PAID', expiryDate: 'Jun 22, 2026', daysLeft: '34d left', registrationDate: '12-May-2026' },
  { id: 'liam-oconnor', initials: 'LO', name: "Liam O'Connor", companyName: 'Emerald Tech', location: 'Dublin, Ireland', email: 'liam@emeraldtech.ie', mobileNumber: '+353 1 496 0123', plan: 'Growth', planPrice: '$49/monthly', status: 'PENDING', payment: 'PENDING', expiryDate: 'Jun 19, 2026', daysLeft: '31d left', registrationDate: '20-May-2026' },
  { id: 'chloe-dupont', initials: 'CD', name: 'Chloe Dupont', companyName: 'Atelier Design', location: 'Paris, France', email: 'chloe@atelierdesign.fr', mobileNumber: '+33 1 42 27 78 90', plan: 'Starter', planPrice: '$19/monthly', status: 'PENDING', payment: 'PENDING', expiryDate: 'Jun 20, 2026', daysLeft: '32d left', registrationDate: '20-May-2026' },
  { id: 'noah-al-fayed', initials: 'NF', name: 'Noah Al-Fayed', companyName: 'Crescent Trading', location: 'Cairo, Egypt', email: 'noah@crescent.com.eg', mobileNumber: '+20 2 2720 0110', plan: 'Scale', planPrice: '$99/monthly', status: 'PENDING', payment: 'PENDING', expiryDate: 'Jun 21, 2026', daysLeft: '33d left', registrationDate: '20-May-2026' },
  { id: 'marcus-vance', initials: 'MV', name: 'Marcus Vance', companyName: 'Vance Logistics', location: 'Chicago, USA', email: 'marcus@vancelogistics.com', mobileNumber: '+1 312 555 0199', plan: 'Growth', planPrice: '$49/monthly', status: 'SUSPENDED', payment: 'OVERDUE', expiryDate: 'May 10, 2026', daysLeft: 'Expired 9d ago', registrationDate: '10-Feb-2026' },
  { id: 'elena-rostova', initials: 'ER', name: 'Elena Rostova', companyName: 'Aurora Media', location: 'Moscow, Russia', email: 'elena@auroramedia.ru', mobileNumber: '+7 495 123 4567', plan: 'Starter', planPrice: '$19/monthly', status: 'INCOMPLETE', payment: 'PENDING', expiryDate: 'Jun 25, 2026', daysLeft: '37d left', registrationDate: '20-May-2026' },
  { id: 'isabella-rossi', initials: 'IR', name: 'Isabella Rossi', companyName: 'Rossi Moda', location: 'Rome, Italy', email: 'isabella@rossimoda.it', mobileNumber: '+39 06 1234567', plan: 'Growth', planPrice: '$49/monthly', status: 'INACTIVE', payment: 'OVERDUE', expiryDate: 'Apr 30, 2026', daysLeft: 'Expired 20d ago', registrationDate: '05-Mar-2026' },
];

export const plans = [
  { id: 'starter', name: 'Starter', price: 19, billing: 'monthly', features: ['Member directory access', 'Basic broadcasts', 'Email support'] },
  { id: 'growth', name: 'Growth', price: 49, billing: 'monthly', features: ['Advanced broadcasts', 'Contact requests', 'Priority support'] },
  { id: 'scale', name: 'Scale', price: 99, billing: 'monthly', features: ['Higher broadcast limits', 'Invoice controls', 'Team contacts'] },
  { id: 'enterprise', name: 'Enterprise', price: 249, billing: 'monthly', features: ['Unlimited operations', 'Dedicated support', 'Custom workflow access'] },
];

export const broadcasts = [
  { id: 'BR-1009', at: '2026-05-20T10:25:00.000Z', sender: 'Aria Lindqvist', companyName: 'Northwave Inc', type: 'WTB', condition: 'New', mainCategory: 'Accessories', subCategory: 'Chargers', text: 'Looking for 100 Type-C fast chargers with sealed retail packaging.', qty: 100, unit: 'Pcs', priceOption: 'Quote', priceAmount: 0, sendingOption: 'SendToAll', audience: 'All Members', status: 'Approved' },
  { id: 'BR-1008', at: '2026-05-19T15:10:00.000Z', sender: 'Priya Raghavan', companyName: 'Orbit Labs', type: 'WTS', condition: 'Used', mainCategory: 'Electronics', subCategory: 'Laptops', text: 'Available refurbished business laptops, Grade A, warranty included.', qty: 40, unit: 'Pcs', priceOption: 'Fixed', priceAmount: 320, sendingOption: 'SendToGroup', audience: 'Electronics distributors', status: 'Hidden' },
  { id: 'BR-1007', at: '2026-05-18T08:40:00.000Z', sender: 'Mateo Ferrari', companyName: 'Brightboard Co', type: 'WTB', condition: 'New', mainCategory: 'Mobile', subCategory: 'iPhone', text: 'Need sealed iPhone units for distributor allocation.', qty: 25, unit: 'Pcs', priceOption: 'Quote', priceAmount: 0, sendingOption: 'SendToGroup', audience: 'Mobile buyers', status: 'Rejected' },
];

export const callRequests = [
  { id: 'CR-2041', at: '2026-05-20T11:05:00.000Z', name: 'Sarah Jenkins', initials: 'SJ', companyName: 'Apex Data', location: 'London, UK', mobile: '+44 20 7946 0192', topic: 'Plan upgrade', status: 'OPEN', message: 'Requested a callback to discuss Scale plan billing.' },
  { id: 'CR-2040', at: '2026-05-19T13:35:00.000Z', name: 'Hana Okonkwo', initials: 'HO', companyName: 'Looplane Studio', location: 'Lagos, Nigeria', mobile: '+234 803 123 4567', topic: 'Invoice clarification', status: 'CALLBACK', message: 'Needs confirmation on the latest invoice settlement.' },
  { id: 'CR-2039', at: '2026-05-18T09:15:00.000Z', name: 'Yuki Tanaka', initials: 'YT', companyName: 'Nippon Media', location: 'Tokyo, Japan', mobile: '+81 3 5555 0142', topic: 'Broadcast limits', status: 'CLOSED', message: 'Asked about increasing daily broadcast limits.' },
];

export const contactRequests = [
  { id: 'CTR-501', at: '2026-05-20T07:30:00.000Z', primaryName: 'Aria Lindqvist', primaryInitials: 'AL', companyName: 'Northwave Inc', primaryMobile: '+46 8 123 4567', newContactName: 'Elias Berg', newContactMobile: '+46 8 555 0124', newContactEmail: 'elias@northwave.io', newContactDesignation: 'Operations Manager', location: 'Stockholm, Sweden', status: 'PENDING' },
  { id: 'CTR-500', at: '2026-05-18T12:20:00.000Z', primaryName: 'Mateo Ferrari', primaryInitials: 'MF', companyName: 'Brightboard Co', primaryMobile: '+39 02 123 4567', newContactName: 'Lucia Romano', newContactMobile: '+39 02 555 0192', newContactEmail: 'lucia@brightboard.co', newContactDesignation: 'Billing / Accounts', location: 'Milan, Italy', status: 'APPROVED' },
];

export const invoices = [
  { id: 'INV-9004', invoiceNumber: 'INV/2026/9004', creationDate: '20-May-2026', companyName: 'Northwave Inc', location: 'Stockholm, Sweden', clientEmail: 'billing@northwave.io', billingAmount: '$49', associatedPlan: 'Growth', validityStart: '06-May-2026', validityEnd: '06-Jun-2026', status: 'Paid', settlementDetails: { settlementDate: '20-May-2026', amountPaid: '$49', recipientBank: 'HDFC Bank', paymentMode: 'Bank Transfer', referenceNumber: 'TXN-9928341' } },
  { id: 'INV-9003', invoiceNumber: 'INV/2026/9003', creationDate: '18-May-2026', companyName: 'Meridian Shop', location: 'Madrid, Spain', clientEmail: 'accounts@meridian.shop', billingAmount: '$19', associatedPlan: 'Starter', validityStart: '23-Apr-2026', validityEnd: '23-May-2026', status: 'Unpaid', settlementDetails: null },
  { id: 'INV-9002', invoiceNumber: 'INV/2026/9002', creationDate: '13-May-2026', companyName: 'Orbit Labs', location: 'Bangalore, India', clientEmail: 'finance@orbitlabs.dev', billingAmount: '$99', associatedPlan: 'Scale', validityStart: '13-Apr-2026', validityEnd: '13-May-2026', status: 'Cancel', settlementDetails: null },
];

export const membershipLabels = [
  { id: 'LBL-01', labelName: 'Growth', hexColor: '#2563eb', planName: 'Growth', planRate: '$49', duration: 'Monthly', status: 'active', features: [{ key: 'Daily Broadcast', type: 'value', value: '25' }, { key: 'Send to all', type: 'yes', value: '' }, { key: 'Priority support', type: 'yes', value: '' }] },
  { id: 'LBL-02', labelName: 'Starter', hexColor: '#64748b', planName: 'Starter', planRate: '$19', duration: 'Monthly', status: 'active', features: [{ key: 'Daily Broadcast', type: 'value', value: '5' }, { key: 'Send to all', type: 'no', value: '' }] },
];

export const fieldSettings: Record<string, any[]> = {
  category: [{ id: 'CAT-01', name: 'Mobile' }, { id: 'CAT-02', name: 'Electronics' }, { id: 'CAT-03', name: 'Accessories' }],
  subcategory: [{ id: 'SUB-01', name: 'iPhone', category: 'Mobile' }, { id: 'SUB-02', name: 'Chargers', category: 'Accessories' }, { id: 'SUB-03', name: 'Laptops', category: 'Electronics' }],
  condition: [{ id: 'CON-01', name: 'New' }, { id: 'CON-02', name: 'Used' }],
  'wtb-price': [{ id: 'WTB-01', name: 'Quote' }, { id: 'WTB-02', name: 'Fixed' }],
  'wts-price': [{ id: 'WTS-01', name: 'Quote' }, { id: 'WTS-02', name: 'Fixed' }],
  uom: [{ id: 'UOM-01', name: 'Pcs' }, { id: 'UOM-02', name: 'Kg' }, { id: 'UOM-03', name: 'MT' }],
  designation: [{ id: 'DES-01', name: 'Owner' }, { id: 'DES-02', name: 'Operations Manager' }, { id: 'DES-03', name: 'Billing / Accounts' }],
  'inactive-status': [{ id: 'INA-01', name: 'Payment Failure' }, { id: 'INA-02', name: 'Voluntary Pause' }],
  'business-type': [{ id: 'BUS-01', name: 'Distributor' }, { id: 'BUS-02', name: 'Retailer' }, { id: 'BUS-03', name: 'Manufacturer' }],
  'address-title': [{ id: 'ADR-01', name: 'Company Address' }, { id: 'ADR-02', name: 'Warehouse' }],
  'support-category': [{ id: 'SUP-01', name: 'Billing' }, { id: 'SUP-02', name: 'Technical Support' }],
  stamp: [{ id: 'STP-01', name: 'Verified Business', image: '/placeholder-user.jpg' }, { id: 'STP-02', name: 'Trusted Seller', image: '/placeholder-logo.png' }],
  'invoice-setting': [{ id: 'INS-01', startDate: '2026-04-01', endDate: '2027-03-31', prefix: 'INV', invoiceNum: 9005, suffix: 'FY26' }],
  'terms-condition': [{ id: 'TRM-01', date: '2026-05-01', category: 'Terms & Condition', content: 'Standard marketplace terms for member accounts and broadcasts.' }],
};

export function getMemberDetail(memberId: string) {
  const member = members.find((item) => item.id === memberId) || members[0];
  const plan = plans.find((item) => item.name === member.plan) || plans[1];

  return {
    ...member,
    status: member.status === 'SUSPENDED' ? 'suspended' : 'active',
    expiry: member.expiryDate,
    plan,
    companyDetails: { registrationNumber: 'REG-2026-1042', businessType: 'Distributor', website: 'https://example.com', taxId: 'GST-22AAAAA0000A1Z5', about: `${member.companyName} manages verified marketplace transactions and member broadcasts.` },
    contacts: [{ id: 'primary', name: member.name, email: member.email, phone: member.mobileNumber, designation: 'Owner', isMain: true }],
    addresses: [{ id: 'office', title: 'Company Address', addressLine1: '42 Market Street', addressLine2: 'Business District', city: member.location.split(',')[0], state: member.location.split(',')[1]?.trim() || '', country: 'India', pincode: '400001' }],
    timeline: [{ id: 1, type: 'plan_assigned', title: 'Plan assigned', description: `${plan.name} plan activated`, at: '2026-05-01T09:30:00.000Z', actor: 'Admin' }],
    invoices: invoices.filter((invoice) => invoice.companyName === member.companyName).map((invoice) => ({ id: invoice.invoiceNumber, amount: Number(invoice.billingAmount.replace(/[^0-9.]/g, '')), type: 'final', status: invoice.status.toLowerCase(), issuedAt: '2026-05-20T09:30:00.000Z', dueDate: '2026-06-03T09:30:00.000Z' })),
    emails: [{ id: 'EMAIL-01', subject: 'Welcome to your membership dashboard', status: 'SENT', sentAt: '2026-05-01T10:00:00.000Z', body: 'Your membership workspace is ready.' }],
    broadcasts: broadcasts.filter((broadcast) => broadcast.companyName === member.companyName).map((broadcast) => ({ ...broadcast, sendingOption: broadcast.sendingOption === 'SendToAll' ? 'Send to All' : 'Send to group', status: broadcast.status === 'Approved' ? 'Live' : broadcast.status })),
    loginLogs: [{ id: 'LOG-01', at: '2026-05-20T08:15:00.000Z', ip: '192.168.1.100', device: 'Chrome on Windows', location: member.location, status: 'SUCCESS' }],
    stamps: [{ id: 'STAMP-01', name: 'Verified Business', badges: ['Identity', 'Email'], remark: 'Primary verification completed.', at: '2026-05-02T09:00:00.000Z' }],
  };
}

export function makeCreatedItem(tab: string, payload: any) {
  const serial = String((fieldSettings[tab]?.length || 0) + 1).padStart(2, '0');
  return { id: `${tab.slice(0, 3).toUpperCase()}-${serial}`, ...payload };
}
