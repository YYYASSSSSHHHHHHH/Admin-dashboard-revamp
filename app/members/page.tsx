'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Header } from '@/components/dashboard/Header';
import { SearchBar } from '@/components/dashboard/SearchBar';
import { FilterSelect } from '@/components/dashboard/FilterSelect';
import { MembersTable } from '@/components/dashboard/MembersTable';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

const PAGE_SIZE = 10;

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [planFilter, setPlanFilter] = useState('All plans');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchMembers() {
      try {
        const response = await fetch('/api/members');
        const data = await response.json();
        setMembers(data);
        setFilteredMembers(data);
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchMembers();
  }, []);

  useEffect(() => {
    let filtered = members;

    if (searchTerm) {
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.companyName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'All statuses') {
      filtered = filtered.filter((m) => m.status === statusFilter);
    }

    if (planFilter !== 'All plans') {
      filtered = filtered.filter((m) => m.plan === planFilter);
    }

    setFilteredMembers(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, planFilter, members]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE));

  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredMembers.slice(start, start + PAGE_SIZE);
  }, [filteredMembers, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const rangeStart = filteredMembers.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, filteredMembers.length);

  const statusOptions = [
    'All statuses',
    'ACTIVE',
    'PENDING',
    'SUSPENDED',
    'INCOMPLETE',
    'INACTIVE',
  ];
  const planOptions = ['All plans', 'Starter', 'Growth', 'Scale', 'Enterprise'];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 md:p-8 lg:p-10 flex items-center justify-center min-h-screen">
          <p className="text-foreground/60">Loading members...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 lg:p-10">
        <div className="mb-5">
          <Header
            title="Members"
            subtitle="Browse, search, and manage every member's plan and billing."
            memberCount={filteredMembers.length}
            totalMembers={members.length}
          />
        </div>

        <div
          className="p-4 border border-b-0 bg-white flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
          style={{ borderColor: '#E5E7EB', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}
        >
          <SearchBar
            placeholder="Search by name, email, company..."
            onSearch={setSearchTerm}
          />
          <FilterSelect
            label="All statuses"
            options={statusOptions}
            defaultValue={statusFilter}
            onChange={setStatusFilter}
            showFilterIcon={true}
          />
          <FilterSelect
            label="All plans"
            options={planOptions}
            defaultValue={planFilter}
            onChange={setPlanFilter}
          />
        </div>

        <MembersTable members={paginatedMembers} pageOffset={(currentPage - 1) * PAGE_SIZE} />

        {filteredMembers.length > 0 && (
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-3.5 bg-white border border-t-0"
            style={{
              borderColor: '#E5E7EB',
              borderBottomLeftRadius: '12px',
              borderBottomRightRadius: '12px',
            }}
            data-testid="members-pagination"
          >
            <p className="text-sm text-slate-500">
              Showing <span className="font-medium text-slate-700">{rangeStart}</span>–
              <span className="font-medium text-slate-700">{rangeEnd}</span> of{' '}
              <span className="font-medium text-slate-700">{filteredMembers.length}</span> members
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                data-testid="members-prev-page"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-xs font-medium text-slate-600 px-2 tabular-nums">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                data-testid="members-next-page"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
