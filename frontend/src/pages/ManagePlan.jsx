import { useMemo, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Sparkles } from "lucide-react";
import { MemberSelector } from "@/components/MemberSelector";
import { StatusOverview } from "@/components/StatusOverview";
import { ActionPanel } from "@/components/ActionPanel";
import { InvoicePanel } from "@/components/InvoicePanel";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { MEMBERS, formatDate } from "@/data/mockData";

const addDays = (iso, days) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

let nextEventId = 9999;
const newEventId = () => ++nextEventId;

export default function ManagePlan() {
  const { memberId } = useParams();
  const [members, setMembers] = useState(MEMBERS);
  const [selectedId, setSelectedId] = useState(memberId || MEMBERS[0].id);

  useEffect(() => {
    if (memberId && members.find((m) => m.id === memberId)) {
      setSelectedId(memberId);
    }
  }, [memberId, members]);

  const member = useMemo(
    () => members.find((m) => m.id === selectedId) || members[0],
    [members, selectedId]
  );

  const updateMember = (updater) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === selectedId ? { ...m, ...updater(m) } : m))
    );
  };

  const pushEvent = (m, evt) => ({
    timeline: [{ ...evt, id: newEventId(), at: new Date().toISOString(), actor: "Olivia Chen" }, ...m.timeline],
  });

  const handleApply = (payload) => {
    if (payload.action === "assign") {
      updateMember((m) => ({
        plan: payload.plan,
        expiry: payload.expiryDate,
        status: "active",
        ...pushEvent(m, {
          type: "plan_assigned",
          title: "Plan assigned",
          description: `${payload.plan.name} plan · ${formatDate(payload.startDate)} → ${formatDate(payload.expiryDate)}`,
        }),
      }));
      toast.success(`${payload.plan.name} plan assigned`, {
        description: `${formatDate(payload.startDate)} → ${formatDate(payload.expiryDate)}`,
      });
    } else if (payload.action === "extend") {
      updateMember((m) => ({
        expiry: addDays(m.expiry, payload.days),
        ...pushEvent(m, {
          type: "plan_extended",
          title: "Plan extended",
          description: `Extended by ${payload.days} days`,
        }),
      }));
      toast.success(`Plan extended by ${payload.days} days`);
    } else if (payload.action === "suspend") {
      updateMember((m) => ({
        status: "suspended",
        ...pushEvent(m, {
          type: "member_suspended",
          title: "Member suspended",
          description: payload.reason,
        }),
      }));
      toast.success("Member suspended", { description: payload.reason });
    } else if (payload.action === "reactivate") {
      updateMember((m) => ({
        status: "active",
        ...pushEvent(m, {
          type: "member_reactivated",
          title: "Member reactivated",
          description: payload.note,
        }),
      }));
      toast.success("Member reactivated", { description: payload.note });
    } else if (payload.action === "upgrade") {
      updateMember((m) => ({
        plan: payload.plan,
        ...pushEvent(m, {
          type: "plan_upgraded",
          title: "Plan upgraded",
          description: `Upgraded to ${payload.plan.name}${payload.proration ? " (prorated)" : ""}`,
        }),
      }));
      toast.success(`Upgraded to ${payload.plan.name}`, {
        description: payload.proration ? "Charged with proration" : "Will charge next cycle",
      });
    }
    // Optional invoice generation alongside the action
    if (payload.generateInvoice) {
      const targetPlan = payload.plan || member.plan;
      generateInvoiceFor(targetPlan, payload.invoiceType);
    }
  };

  const generateInvoiceFor = (plan, type = "final") => {
    const today = new Date();
    const dueDate = addDays(today.toISOString(), 14);
    const prefix = type === "proforma" ? "PRO" : "INV";
    const newInvoice = {
      id: `${prefix}-${Math.floor(Math.random() * 9000) + 3000}`,
      amount: plan.price,
      type,
      status: type === "proforma" ? "draft" : "pending",
      issuedAt: today.toISOString(),
      dueDate,
    };
    const typeLabel = type === "proforma" ? "Proforma" : "Final";
    updateMember((m) => ({
      invoice: newInvoice,
      invoiceHistory: m.invoice ? [m.invoice, ...(m.invoiceHistory || [])] : (m.invoiceHistory || []),
      paymentStatus: type === "proforma" ? m.paymentStatus : "pending",
      ...pushEvent(m, {
        type: "invoice_generated",
        title: `${typeLabel} invoice generated`,
        description: `${newInvoice.id} · $${newInvoice.amount.toFixed(2)} due ${formatDate(dueDate)}`,
      }),
    }));
    toast.success(`${typeLabel} invoice generated`, {
      description: `${newInvoice.id} · Due ${formatDate(dueDate)}`,
    });
  };

  const handleGenerateInvoice = (type = "final") => {
    generateInvoiceFor(member.plan, type);
  };

  const handleMarkPaid = () => {
    if (!member.invoice || member.invoice.status === "paid") return;
    updateMember((m) => ({
      invoice: { ...m.invoice, status: "paid" },
      paymentStatus: "paid",
      ...pushEvent(m, {
        type: "payment_received",
        title: "Payment received",
        description: `${m.invoice.id} · $${m.invoice.amount.toFixed(2)} marked as paid`,
      }),
    }));
    toast.success("Payment recorded", {
      description: `${member.invoice.id} marked as paid`,
    });
  };

  const handleRefund = () => {
    if (!member.invoice || member.invoice.status !== "paid") return;
    updateMember((m) => ({
      invoice: { ...m.invoice, status: "refunded" },
      paymentStatus: "pending",
      ...pushEvent(m, {
        type: "invoice_refunded",
        title: "Invoice refunded",
        description: `${m.invoice.id} · $${m.invoice.amount.toFixed(2)} refunded`,
      }),
    }));
    toast.success("Refund issued", {
      description: `${member.invoice.id} refunded`,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50" data-testid="manage-plan-page">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-10 py-8 md:py-10">
        {/* Back link */}
        <Link
          to="/members"
          data-testid="manage-plan-back"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors mb-5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Members
        </Link>

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 mt-1">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-1.5">
                Marketplace · Admin
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
                Manage Plan
              </h1>
              <p className="text-sm text-slate-500 mt-1.5">
                One screen, minimal clicks. Update plans, billing, and access for any member.
              </p>
            </div>
          </div>
          <div className="w-full md:w-auto">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">
              Member
            </div>
            <MemberSelector
              members={members}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
        </header>

        {/* Status Overview */}
        <StatusOverview member={member} />

        {/* Main Action + Invoice */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          <ActionPanel member={member} onApply={handleApply} />
          <InvoicePanel
            invoice={member.invoice}
            history={member.invoiceHistory || []}
            member={member}
            onGenerate={handleGenerateInvoice}
            onMarkPaid={handleMarkPaid}
            onRefund={handleRefund}
          />
        </div>

        {/* Activity Timeline */}
        <ActivityTimeline events={member.timeline} />

        <footer className="mt-12 text-center text-xs text-slate-400">
          <span className="font-mono">Manage Plan</span> · {member.company} · Admin Console
        </footer>
      </div>
    </div>
  );
}
