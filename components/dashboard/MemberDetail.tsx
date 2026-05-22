'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  Building2,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Globe,
  Hash,
  Mail,
  MapPin,
  PauseCircle,
  Radio,
  SlidersHorizontal,
  Users as UsersIcon,
  Wallet,
} from 'lucide-react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { CompanyTab } from '@/components/dashboard/CompanyTab';
import { ContactTab } from '@/components/dashboard/ContactTab';
import { AddressTab } from '@/components/dashboard/AddressTab';
import { AssignPlanTab } from '@/components/dashboard/AssignPlanTab';
import { EmailTab } from '@/components/dashboard/EmailTab';
import { BroadcastTab } from '@/components/dashboard/BroadcastTab';
import { BroadcastSettings } from '@/components/dashboard/BroadcastSettings';
import { LoginLogTab } from '@/components/dashboard/LoginLogTab';
import { StampTab } from '@/components/dashboard/StampTab';
import { formatDate, relativeTime } from '@/lib/constants';

interface Member {
  id: string;
  initials: string;
  name: string;
  email: string;
  plan: string;
  planPrice: string;
  status: string;
  payment: string;
  expiryDate: string;
  daysLeft: string;
  company?: string;
}

interface StatTileProps {
  icon: any;
  label: string;
  value: string | number;
  accent?: string;
}

function StatTile({ icon: Icon, label, value, accent = 'bg-slate-50 text-slate-700 border border-slate-200' }: StatTileProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-200/80 bg-white">
      <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${accent}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {label}
        </div>
        <div className="text-sm font-medium text-slate-900 truncate mt-0.5">{value}</div>
      </div>
    </div>
  );
}

export function MemberDetail({ defaultTab = 'company' }: { defaultTab?: string }) {
  const { memberId } = useParams();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const [companyName, setCompanyName] = useState('');
  const [companyDetails, setCompanyDetails] = useState<any>({});
  const [contacts, setContacts] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [plan, setPlan] = useState<any>({ id: 'growth', name: 'Growth', price: 49, billing: 'monthly' });
  const [status, setStatus] = useState('ACTIVE');
  const [expiry, setExpiry] = useState('');
  const [timeline, setTimeline] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [emails, setEmails] = useState<any[]>([]);
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [loginLogs, setLoginLogs] = useState<any[]>([]);
  const [stamps, setStamps] = useState<any[]>([]);

  useEffect(() => {
    async function fetchMemberDetails() {
      try {
        const response = await fetch(`/api/members/${memberId}`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        
        setCompanyName(data.companyName || '');
        setCompanyDetails(data.companyDetails || {});
        setContacts(data.contacts || []);
        setAddresses(data.addresses || []);
        setPlan(data.plan || {});
        setStatus(data.status || 'ACTIVE');
        setExpiry(data.expiry || '');
        setTimeline(data.timeline || []);
        setInvoices(data.invoices || []);
        setEmails(data.emails || []);
        setBroadcasts(data.broadcasts || []);
        setLoginLogs(data.loginLogs || []);
        setStamps(data.stamps || []);
        
        setMembers([{
          id: data.id || memberId,
          initials: data.initials || 'AD',
          name: data.name || 'Admin User',
          email: data.email || 'admin@example.com',
          plan: data.plan?.name || 'Growth',
          planPrice: String(data.plan?.price || '49'),
          status: data.status || 'ACTIVE',
          payment: data.payment || 'PAID',
          expiryDate: data.expiry || '',
          daysLeft: '30',
          company: data.companyName || 'Company Inc'
        }]);
      } catch (error) {
        console.error('Error fetching member details:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchMemberDetails();
  }, [memberId]);

  const seed = members[0];

  if (loading || !seed) {
    return (
      <DashboardLayout>
        <div className="p-6 md:p-8 lg:p-10 flex items-center justify-center min-h-[50vh]">
          <p className="text-slate-500">Loading member detail...</p>
        </div>
      </DashboardLayout>
    );
  }

  const handleCompanySave = (form: any) => {
    const { companyName: newName, ...rest } = form;
    setCompanyName(newName);
    setCompanyDetails(rest);
  };

  const city = addresses?.[0]?.city || '—';

  return (
    <DashboardLayout>
      <div data-testid="member-detail-page" className="p-6 md:p-8 lg:p-10">
        <Link
          href="/members"
          data-testid="member-detail-back"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors mb-5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Members
        </Link>

        <header
          data-testid="persistent-header"
          className="bg-white border border-slate-200/80 rounded-xl shadow-sm p-6 mb-6"
        >
          <div className="flex items-center gap-4 mb-5">
            <div className="h-14 w-14 rounded-full bg-slate-900 text-white flex items-center justify-center font-display text-base font-semibold shrink-0">
              {seed.initials}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-1">
                Member · {seed.id}
              </div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 truncate">
                  {seed.name}
                </h1>
                <BadgeCheck
                  data-testid="verified-tick"
                  className="h-6 w-6 shrink-0"
                  strokeWidth={1.5}
                  style={{ color: 'white', fill: '#3b82f6' }}
                />
              </div>
              <div className="text-sm text-slate-500 mt-0.5">{companyName}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <StatTile
              icon={Wallet}
              label="Plan Name"
              value={`${plan.name} · $${plan.price}`}
              accent="bg-slate-900 text-white border border-slate-900"
            />
            <StatTile
              icon={status === 'active' ? CheckCircle2 : PauseCircle}
              label="Status"
              value={status === 'active' ? 'Active' : 'Suspended'}
              accent={
                status === 'active'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'bg-red-50 text-red-600 border border-red-200'
              }
            />
            <StatTile icon={MapPin} label="City" value={city} />
            <StatTile icon={CalendarIcon} label="Join Date" value={formatDate(new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString())} />
            <StatTile icon={Globe} label="Join IP" value="192.168.1.100" />
            <StatTile icon={Hash} label="Total Posts" value="1,420" />
            <StatTile icon={Clock} label="Last Login" value={relativeTime(new Date(Date.now() - 3 * 3600 * 1000).toISOString())} />
            <StatTile icon={CalendarIcon} label="Plan Expiry" value={formatDate(expiry)} />
          </div>
        </header>

        <Tabs defaultValue={defaultTab} data-testid="member-detail-tabs">
          <TabsList className="bg-white border border-slate-200/80 h-11 p-1 rounded-lg shadow-sm mb-5 flex w-max">
            <TabsTrigger
              value="company"
              data-testid="tab-company"
              className="h-9 px-4 data-[state=active]:bg-slate-900 data-[state=active]:text-white text-slate-600 rounded-md transition-all flex items-center cursor-pointer"
            >
              <Building2 className="h-3.5 w-3.5 mr-2" />
              Company
            </TabsTrigger>
            <TabsTrigger
              value="contact"
              data-testid="tab-contact"
              className="h-9 px-4 data-[state=active]:bg-slate-900 data-[state=active]:text-white text-slate-600 rounded-md transition-all flex items-center cursor-pointer"
            >
              <UsersIcon className="h-3.5 w-3.5 mr-2" />
              Contact
            </TabsTrigger>
            <TabsTrigger
              value="address"
              data-testid="tab-address"
              className="h-9 px-4 data-[state=active]:bg-slate-900 data-[state=active]:text-white text-slate-600 rounded-md transition-all flex items-center cursor-pointer"
            >
              <MapPin className="h-3.5 w-3.5 mr-2" />
              Address
            </TabsTrigger>
            <TabsTrigger
              value="assign-plan"
              data-testid="tab-assign-plan"
              className="h-9 px-4 data-[state=active]:bg-slate-900 data-[state=active]:text-white text-slate-600 rounded-md transition-all flex items-center cursor-pointer"
            >
              <Wallet className="h-3.5 w-3.5 mr-2" />
              Assign Plan
            </TabsTrigger>
            <TabsTrigger
              value="email"
              data-testid="tab-email"
              className="h-9 px-4 data-[state=active]:bg-slate-900 data-[state=active]:text-white text-slate-600 rounded-md transition-all flex items-center cursor-pointer"
            >
              <Mail className="h-3.5 w-3.5 mr-2" />
              Email Log
            </TabsTrigger>
            <TabsTrigger
              value="broadcast"
              data-testid="tab-broadcast"
              className="h-9 px-4 data-[state=active]:bg-slate-900 data-[state=active]:text-white text-slate-600 rounded-md transition-all flex items-center cursor-pointer"
            >
              <Radio className="h-3.5 w-3.5 mr-2" />
              Broadcast
            </TabsTrigger>
            <TabsTrigger
              value="broadcast-settings"
              data-testid="tab-broadcast-settings"
              className="h-9 px-4 data-[state=active]:bg-slate-900 data-[state=active]:text-white text-slate-600 rounded-md transition-all flex items-center cursor-pointer"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 mr-2" />
              Broadcast Setting
            </TabsTrigger>
            <TabsTrigger
              value="login-log"
              data-testid="tab-login-log"
              className="h-9 px-4 data-[state=active]:bg-slate-900 data-[state=active]:text-white text-slate-600 rounded-md transition-all flex items-center cursor-pointer"
            >
              <Clock className="h-3.5 w-3.5 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger
              value="stamp"
              data-testid="tab-stamp"
              className="h-9 px-4 data-[state=active]:bg-slate-900 data-[state=active]:text-white text-slate-600 rounded-md transition-all flex items-center cursor-pointer"
            >
              <Award className="h-3.5 w-3.5 mr-2" />
              Stamp
            </TabsTrigger>
          </TabsList>

          <TabsContent value="company" className="mt-0 focus-visible:outline-none">
            <CompanyTab
              companyName={companyName}
              details={companyDetails}
              onSave={handleCompanySave}
            />
          </TabsContent>

          <TabsContent value="contact" className="mt-0 focus-visible:outline-none">
            <ContactTab contacts={contacts} onChange={setContacts} />
          </TabsContent>

          <TabsContent value="address" className="mt-0 focus-visible:outline-none">
            <AddressTab addresses={addresses} onChange={setAddresses} />
          </TabsContent>

          <TabsContent value="assign-plan" className="mt-0 focus-visible:outline-none">
            <AssignPlanTab
              member={seed}
              plan={plan}
              setPlan={setPlan}
              status={status}
              setStatus={setStatus}
              expiry={expiry}
              setExpiry={setExpiry}
              timeline={timeline}
              setTimeline={setTimeline}
              invoices={invoices}
              setInvoices={setInvoices}
            />
          </TabsContent>

          <TabsContent value="email" className="mt-0 focus-visible:outline-none">
            <EmailTab member={seed} emails={emails} setEmails={setEmails} />
          </TabsContent>

          <TabsContent value="broadcast" className="mt-0 focus-visible:outline-none">
            <BroadcastTab member={seed} broadcasts={broadcasts} setBroadcasts={setBroadcasts} />
          </TabsContent>

          <TabsContent value="broadcast-settings" className="mt-0 focus-visible:outline-none">
            <BroadcastSettings memberId={String(memberId)} memberName={seed.name} />
          </TabsContent>

          <TabsContent value="login-log" className="mt-0 focus-visible:outline-none">
            <LoginLogTab logs={loginLogs} />
          </TabsContent>

          <TabsContent value="stamp" className="mt-0 focus-visible:outline-none">
            <StampTab stamps={stamps} setStamps={setStamps} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
