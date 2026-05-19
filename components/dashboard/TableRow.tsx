'use client';

import { MemberAvatar } from './MemberAvatar';
import { StatusBadge } from './StatusBadge';
import { Settings2, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface TableRowProps {
  member: {
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
  };
}

export function TableRow({ member }: TableRowProps) {
  const getPaymentStyles = (payment: string) => {
    switch (payment) {
      case 'PAID':
        return { color: '#067647', borderColor: '#ABEFC6', bg: '#ECFDF3' };
      case 'PENDING':
        return { color: '#B54708', borderColor: '#FEDF89', bg: '#FFFAEB' };
      case 'OVERDUE':
        return { color: '#B42318', borderColor: '#FECDCA', bg: '#FEF3F2' };
      default:
        return { color: '#344054', borderColor: '#D0D5DD', bg: '#FFFFFF' };
    }
  };

  const paymentStyles = getPaymentStyles(member.payment);

  const getDaysLeftColor = (days: string | undefined, status: string | undefined) => {
    if (!days) return '#64748B';
    if (status === 'SUSPENDED') return '#B42318'; // Red for expired/suspended
    if (days.includes('Expired')) return '#B42318';
    if (parseInt(days) < 5) return '#B54708'; // Orange for soon
    return '#64748B'; // Default slate gray
  };

  return (
    <tr className="border-b hover:bg-slate-50 transition-colors bg-white" style={{ borderColor: '#F1F5F9' }}>
      {/* MEMBER */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <MemberAvatar initials={member.initials} />
          <div className="flex flex-col">
            <span style={{ color: '#0F172A', fontSize: '13px', fontWeight: '600' }}>{member.name}</span>
            <span style={{ color: '#64748B', fontSize: '12px' }}>{member.email}</span>
          </div>
        </div>
      </td>

      {/* PLAN */}
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span style={{ color: '#0F172A', fontSize: '13px', fontWeight: '600' }}>{member.plan}</span>
          <span style={{ color: '#64748B', fontSize: '12px' }}>{member.planPrice}</span>
        </div>
      </td>

      {/* STATUS */}
      <td className="px-6 py-4">
        <StatusBadge status={member.status} />
      </td>

      {/* PAYMENT */}
      <td className="px-6 py-4">
        <div 
          className="inline-flex items-center justify-center rounded px-2 py-0.5 text-[10px] font-bold tracking-wide border uppercase"
          style={{
            backgroundColor: paymentStyles.bg,
            borderColor: paymentStyles.borderColor,
            color: paymentStyles.color,
          }}
        >
          {member.payment}
        </div>
      </td>

      {/* EXPIRY */}
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span style={{ color: '#0F172A', fontSize: '13px', fontWeight: '500' }}>{member.expiryDate}</span>
          <span style={{ color: getDaysLeftColor(member.daysLeft, member.status), fontSize: '12px' }}>{member.daysLeft}</span>
        </div>
      </td>

      {/* ACTIONS */}
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <Link 
            href={`/members/${member.id}/manage`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 px-2.5 py-1.5 rounded-md transition-all"
          >
            <Settings2 className="h-3 w-3" />
            Plan
          </Link>
          <Link 
            href={`/members/${member.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 px-2.5 py-1.5 rounded-md transition-all"
          >
            View
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </td>
    </tr>
  );
}
