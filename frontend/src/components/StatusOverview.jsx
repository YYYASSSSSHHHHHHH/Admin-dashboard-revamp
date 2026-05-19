import { CalendarClock, CreditCard, ShieldCheck, Sparkles } from "lucide-react";
import { formatDate, daysUntil } from "@/data/mockData";

const Card = ({ label, value, sub, icon: Icon, accent, testid, valueClass = "" }) => (
  <div
    data-testid={testid}
    className="group bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300"
  >
    <div className="flex items-start justify-between mb-4">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </span>
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${accent}`}>
        <Icon className="h-4 w-4" />
      </div>
    </div>
    <div className={`font-display text-2xl font-semibold tracking-tight text-slate-900 ${valueClass}`}>
      {value}
    </div>
    {sub && <div className="text-xs text-slate-500 mt-1.5">{sub}</div>}
  </div>
);

const PaymentBadge = ({ status }) => {
  const map = {
    paid: { label: "Paid", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    pending: { label: "Pending", cls: "bg-amber-50 text-amber-700 border-amber-200" },
    overdue: { label: "Overdue", cls: "bg-red-50 text-red-700 border-red-200" },
  };
  const { label, cls } = map[status] || map.paid;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${cls}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
};

const MemberBadge = ({ status }) => {
  const map = {
    active: { label: "Active", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    suspended: { label: "Suspended", cls: "bg-red-50 text-red-700 border-red-200" },
    inactive: { label: "Inactive", cls: "bg-slate-100 text-slate-700 border-slate-200" },
  };
  const { label, cls } = map[status] || map.active;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${cls}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
};

export const StatusOverview = ({ member }) => {
  const days = daysUntil(member.expiry);
  const isExpired = days < 0;
  const isCritical = !isExpired && days <= 7;
  const expirySub = isExpired
    ? `Expired ${Math.abs(days)}d ago`
    : days === 0
      ? "Expires today"
      : `${days} days remaining`;
  const subClass = isExpired
    ? "text-red-600 font-medium"
    : isCritical
      ? "text-amber-600 font-medium"
      : "text-slate-500";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" data-testid="status-overview">
      <Card
        testid="card-current-plan"
        label="Current Plan"
        value={member.plan.name}
        sub={`$${member.plan.price}/${member.plan.billing}`}
        icon={Sparkles}
        accent="bg-slate-900 text-white"
      />
      <div
        data-testid="card-expiry"
        className="group bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300"
      >
        <div className="flex items-start justify-between mb-4">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Expiry Date
          </span>
          <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <CalendarClock className="h-4 w-4" />
          </div>
        </div>
        <div className="font-display text-xl font-semibold tracking-tight text-slate-900">
          {formatDate(member.expiry)}
        </div>
        <div className={`text-xs mt-1.5 inline-flex items-center gap-1.5 ${subClass}`} data-testid="expiry-sub">
          {(isExpired || isCritical) && (
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
          )}
          {expirySub}
        </div>
      </div>
      <div
        data-testid="card-payment-status"
        className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300"
      >
        <div className="flex items-start justify-between mb-4">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Payment Status
          </span>
          <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CreditCard className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-1">
          <PaymentBadge status={member.paymentStatus} />
        </div>
        <div className="text-xs text-slate-500 mt-3">
          Invoice {member.invoice.id} · ${member.invoice.amount.toFixed(2)}
        </div>
      </div>
      <div
        data-testid="card-member-status"
        className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300"
      >
        <div className="flex items-start justify-between mb-4">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Member Status
          </span>
          <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <ShieldCheck className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-1">
          <MemberBadge status={member.status} />
        </div>
        <div className="text-xs text-slate-500 mt-3">{member.company}</div>
      </div>
    </div>
  );
};
