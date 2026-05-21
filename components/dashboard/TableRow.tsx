'use client';

import { MemberAvatar } from './MemberAvatar';
import { StatusBadge } from './StatusBadge';
import { useRouter } from 'next/navigation';

interface TableRowProps {
  member: {
    id: string;
    initials: string;
    name: string;
    companyName: string;
    location: string;
    email: string;
    mobileNumber: string;
    plan: string;
    planPrice: string;
    status: string;
    payment: string;
    expiryDate: string;
    daysLeft: string;
    registrationDate: string;
  };
  index: number;
}

export function TableRow({ member, index }: TableRowProps) {
  const router = useRouter();

  return (
    <tr 
      onClick={() => router.push(`/members/${member.id}`)}
      className="border-b hover:bg-slate-55 transition-colors bg-white cursor-pointer select-none" 
      style={{ borderColor: '#F1F5F9' }}
    >
      <td className="px-6 py-4 text-center text-slate-400 font-mono text-xs font-semibold">
        {String(index + 1).padStart(2, '0')}
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <MemberAvatar initials={member.initials} />
          <div className="flex flex-col">
            <span style={{ color: '#0F172A', fontSize: '13px', fontWeight: '600' }} className="whitespace-nowrap">{member.name}</span>
            <span style={{ color: '#64748B', fontSize: '11px', fontWeight: '500' }} className="whitespace-nowrap">{member.companyName}</span>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 text-[13px] text-slate-650 font-medium whitespace-nowrap">
        {member.location}
      </td>

      <td className="px-6 py-4 text-[13px] text-slate-650 font-medium">
        {member.email}
      </td>

      <td className="px-6 py-4 text-[13px] text-slate-650 font-medium whitespace-nowrap">
        {member.mobileNumber}
      </td>

      <td className="px-6 py-4 text-[13px] text-slate-900 font-semibold whitespace-nowrap">
        {member.plan}
      </td>

      <td className="px-6 py-4">
        <StatusBadge status={member.status} />
      </td>

      <td className="px-6 py-4 text-[13px] text-slate-650 font-medium whitespace-nowrap">
        {member.registrationDate}
      </td>
    </tr>
  );
}
