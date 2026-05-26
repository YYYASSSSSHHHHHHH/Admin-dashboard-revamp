'use client';

import { TableRow } from './TableRow';

interface Member {
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
}

interface MembersTableProps {
  members: Member[];
  pageOffset?: number;
}

export function MembersTable({ members, pageOffset = 0 }: MembersTableProps) {
  return (
    <div className="bg-white border overflow-hidden" style={{ borderColor: '#E5E7EB', borderTopLeftRadius: '0', borderTopRightRadius: '0', borderBottomLeftRadius: '0', borderBottomRightRadius: '0' }}>
      <table className="w-full">
        <thead className="bg-white border-b" style={{ borderColor: '#EEF2F6' }}>
          <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            <th className="px-6 py-3.5 font-semibold w-16 text-center">SR.NO</th>
            <th className="px-6 py-3.5 font-semibold">MEMBER & COMPANY</th>
            <th className="px-6 py-3.5 font-semibold">LOCATION</th>
            <th className="px-6 py-3.5">EMAIL ADDRESS</th>
            <th className="px-6 py-3.5">MOBILE NUMBER</th>
            <th className="px-6 py-3.5 font-semibold">PLAN NAME</th>
            <th className="px-6 py-3.5 font-semibold">STATUS</th>
            <th className="px-6 py-3.5 font-semibold">JOIN DATE</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {members.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-6 py-12 text-center text-sm text-slate-500" data-testid="members-empty">
                No members match your filters.
              </td>
            </tr>
          ) : (
            members.map((member, index) => (
              <TableRow key={member.id} member={member} index={pageOffset + index} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
