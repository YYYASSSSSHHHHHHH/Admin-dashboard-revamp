'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Header } from '@/components/dashboard/Header';
import { SearchBar } from '@/components/dashboard/SearchBar';
import { FilterSelect } from '@/components/dashboard/FilterSelect';
import { MembersTable } from '@/components/dashboard/MembersTable';

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
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [planFilter, setPlanFilter] = useState('All plans');

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

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (member) =>
          member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'All statuses') {
      filtered = filtered.filter((member) => member.status === statusFilter);
    }

    // Filter by plan
    if (planFilter !== 'All plans') {
      filtered = filtered.filter((member) => member.plan === planFilter);
    }

    setFilteredMembers(filtered);
  }, [searchTerm, statusFilter, planFilter, members]);

  const statusOptions = ['All statuses', 'ACTIVE', 'SUSPENDED'];
  const planOptions = [
    'All plans',
    'Starter',
    'Growth',
    'Scale',
    'Enterprise',
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-foreground/60">Loading members...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        {/* Header Section */}
        <div className="mb-5">
          <Header
            title="Members"
            subtitle="Browse, search, and manage every member's plan and billing."
            memberCount={filteredMembers.length}
            totalMembers={members.length}
          />
        </div>

        {/* Search and Filters Section - White Container */}
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

        {/* Table Section */}
        <MembersTable members={filteredMembers} />
      </div>
    </DashboardLayout>
  );
}
