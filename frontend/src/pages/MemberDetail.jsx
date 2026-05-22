import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
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
} from "lucide-react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { MEMBERS, MOCK_BROADCASTS, MOCK_EMAILS, MOCK_BROADCAST_CATEGORIES, INITIAL_BROADCAST_SUBSCRIPTIONS, formatDate, relativeTime } from "@/data/mockData";
import { CompanyTab } from "@/components/CompanyTab";
import { ContactTab } from "@/components/ContactTab";
import { AddressTab } from "@/components/AddressTab";
import { AssignPlanTab } from "@/components/AssignPlanTab";
import { BroadcastTab } from "@/components/BroadcastTab";
import { BroadcastSettingTab } from "@/components/BroadcastSettingTab";
import { EmailTab } from "@/components/EmailTab";

const StatTile = ({ icon: Icon, label, value, accent = "bg-slate-50 text-slate-700 border border-slate-200" }) => (
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

export default function MemberDetail() {
  const { memberId } = useParams();
  const seed = useMemo(
    () => MEMBERS.find((m) => m.id === memberId) || MEMBERS[0],
    [memberId]
  );

  // Local editable state for tabs (mockup persistence within this screen)
  const [companyName, setCompanyName] = useState(seed.company);
  const [companyDetails, setCompanyDetails] = useState(seed.companyDetails);
  const [contacts, setContacts] = useState(seed.contacts);
  const [addresses, setAddresses] = useState(seed.addresses);
  // Plan-related state shared between persistent header and AssignPlanTab
  const [plan, setPlan] = useState(seed.plan);
  const [status, setStatus] = useState(seed.status);
  const [expiry, setExpiry] = useState(seed.expiry);
  const [timeline, setTimeline] = useState(seed.timeline);
  const [invoices, setInvoices] = useState(() =>
    [seed.invoice, ...(seed.invoiceHistory || [])].filter(Boolean)
  );
  // Broadcast tab state
  const [broadcasts, setBroadcasts] = useState(() =>
    MOCK_BROADCASTS.map((b) => ({ ...b }))
  );
  const [approvalRequired, setApprovalRequired] = useState(true);
  // Email tab state
  const [emails, setEmails] = useState(() => MOCK_EMAILS.map((e) => ({ ...e })));
  // Broadcast Setting (per-member category subscriptions)
  const [broadcastSubscriptions, setBroadcastSubscriptions] = useState(
    () => INITIAL_BROADCAST_SUBSCRIPTIONS[seed.id] || []
  );

  const handleCompanySave = (form) => {
    const { companyName: newName, ...rest } = form;
    setCompanyName(newName);
    setCompanyDetails(rest);
  };

  const city = addresses?.[0]?.city || "—";

  return (
    <div className="p-6 md:p-8 lg:p-10" data-testid="member-detail-page">
      {/* Back link */}
      <Link
        to="/members"
        data-testid="member-detail-back"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors mb-5"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Members
      </Link>

      {/* Persistent stats header (visible across all tabs) */}
      <header
        data-testid="persistent-header"
        className="bg-white border border-slate-200/80 rounded-xl shadow-sm p-6 mb-6"
      >
        <div className="flex items-center gap-4 mb-5">
          <div className="h-14 w-14 rounded-full bg-slate-900 text-white flex items-center justify-center font-display text-base font-semibold shrink-0">
            {seed.avatar}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-1">
              Member · {seed.id}
            </div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 truncate">
                {seed.name}
              </h1>
              {seed.verified && (
                <BadgeCheck
                  data-testid="verified-tick"
                  className="h-6 w-6 shrink-0"
                  strokeWidth={1.5}
                  style={{ color: "white", fill: "#3b82f6" }}
                />
              )}
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
            icon={status === "active" ? CheckCircle2 : PauseCircle}
            label="Status"
            value={status === "active" ? "Active" : "Suspended"}
            accent={
              status === "active"
                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                : "bg-red-50 text-red-600 border border-red-200"
            }
          />
          <StatTile icon={MapPin} label="City" value={city} />
          <StatTile icon={CalendarIcon} label="Join Date" value={formatDate(seed.joinedAt)} />
          <StatTile icon={Globe} label="Join IP" value={seed.joinIp || "—"} />
          <StatTile icon={Hash} label="Total Posts" value={(seed.totalPosts ?? 0).toLocaleString()} />
          <StatTile icon={Clock} label="Last Login" value={seed.lastLogin ? relativeTime(seed.lastLogin) : "—"} />
          <StatTile icon={CalendarIcon} label="Plan Expiry" value={formatDate(expiry)} />
        </div>
      </header>

      {/* Tabs */}
      <Tabs defaultValue="company" data-testid="member-detail-tabs">
        <TabsList className="bg-white border border-slate-200/80 h-11 p-1 rounded-lg shadow-sm mb-5">
          <TabsTrigger
            value="company"
            data-testid="tab-company"
            className="h-9 px-4 data-[state=active]:bg-slate-900 data-[state=active]:text-white text-slate-600 rounded-md transition-all"
          >
            <Building2 className="h-3.5 w-3.5 mr-2" />
            Company
          </TabsTrigger>
          <TabsTrigger
            value="contact"
            data-testid="tab-contact"
            className="h-9 px-4 data-[state=active]:bg-slate-900 data-[state=active]:text-white text-slate-600 rounded-md transition-all"
          >
            <UsersIcon className="h-3.5 w-3.5 mr-2" />
            Contact
            <span className="ml-2 text-[10px] font-semibold tabular-nums opacity-70">
              {contacts.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="address"
            data-testid="tab-address"
            className="h-9 px-4 data-[state=active]:bg-slate-900 data-[state=active]:text-white text-slate-600 rounded-md transition-all"
          >
            <MapPin className="h-3.5 w-3.5 mr-2" />
            Address
            <span className="ml-2 text-[10px] font-semibold tabular-nums opacity-70">
              {addresses.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="assign-plan"
            data-testid="tab-assign-plan"
            className="h-9 px-4 data-[state=active]:bg-slate-900 data-[state=active]:text-white text-slate-600 rounded-md transition-all"
          >
            <Wallet className="h-3.5 w-3.5 mr-2" />
            Assign Plan
          </TabsTrigger>
          <TabsTrigger
            value="broadcast"
            data-testid="tab-broadcast"
            className="h-9 px-4 data-[state=active]:bg-slate-900 data-[state=active]:text-white text-slate-600 rounded-md transition-all"
          >
            <Radio className="h-3.5 w-3.5 mr-2" />
            Broadcast
            <span className="ml-2 text-[10px] font-semibold tabular-nums opacity-70">
              {broadcasts.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="broadcast-setting"
            data-testid="tab-broadcast-setting"
            className="h-9 px-4 data-[state=active]:bg-slate-900 data-[state=active]:text-white text-slate-600 rounded-md transition-all"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 mr-2" />
            Broadcast Setting
            <span className="ml-2 text-[10px] font-semibold tabular-nums opacity-70">
              {broadcastSubscriptions.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="email"
            data-testid="tab-email"
            className="h-9 px-4 data-[state=active]:bg-slate-900 data-[state=active]:text-white text-slate-600 rounded-md transition-all"
          >
            <Mail className="h-3.5 w-3.5 mr-2" />
            Email
            <span className="ml-2 text-[10px] font-semibold tabular-nums opacity-70">
              {emails.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="mt-0">
          <CompanyTab
            companyName={companyName}
            details={companyDetails}
            onSave={handleCompanySave}
          />
        </TabsContent>

        <TabsContent value="contact" className="mt-0">
          <ContactTab contacts={contacts} onChange={setContacts} />
        </TabsContent>

        <TabsContent value="address" className="mt-0">
          <AddressTab addresses={addresses} onChange={setAddresses} />
        </TabsContent>

        <TabsContent value="assign-plan" className="mt-0">
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

        <TabsContent value="broadcast" className="mt-0">
          <BroadcastTab
            companyName={companyName}
            broadcasts={broadcasts}
            setBroadcasts={setBroadcasts}
            approvalRequired={approvalRequired}
            setApprovalRequired={setApprovalRequired}
          />
        </TabsContent>

        <TabsContent value="broadcast-setting" className="mt-0">
          <BroadcastSettingTab
            categories={MOCK_BROADCAST_CATEGORIES}
            subscriptions={broadcastSubscriptions}
            onChange={setBroadcastSubscriptions}
            memberName={seed.name}
          />
        </TabsContent>

        <TabsContent value="email" className="mt-0">
          <EmailTab emails={emails} setEmails={setEmails} member={seed} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
