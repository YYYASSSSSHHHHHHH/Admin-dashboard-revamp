'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  Layers,
  AlertTriangle,
  Mail,
  Send,
  MapPin,
  Users,
  BookOpen,
  Phone,
  Check,
  X,
  Tag,
  FileText,
  HelpCircle,
  Eye,
  Download
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Header } from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SearchBar } from '@/components/dashboard/SearchBar';
import { FilterSelect } from '@/components/dashboard/FilterSelect';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { toast } from 'sonner';
import { PLANS as SEED_PLANS, Plan } from '@/lib/mockData';

// Types for Membership Plans
interface EnhancedPlan extends Plan {
  subscribersCount: number;
  bannerColor: string;
}

const BANNER_COLOR_POOL = [
  'from-indigo-600 to-violet-600 bg-linear-to-r',
  'from-emerald-600 to-teal-600 bg-linear-to-r',
  'from-blue-600 to-cyan-600 bg-linear-to-r',
  'from-amber-500 to-orange-600 bg-linear-to-r',
  'from-rose-600 to-pink-600 bg-linear-to-r',
  'from-purple-600 to-fuchsia-600 bg-linear-to-r',
  'from-sky-500 to-indigo-600 bg-linear-to-r',
];

// Types for App Membership Labels
interface FeaturePrivilege {
  key: string;
  type: 'yes' | 'no' | 'value';
  value: string;
}

interface MembershipLabel {
  id: string;
  labelName: string;
  hexColor: string;
  planName: string;
  planRate: string;
  duration: string;
  status: 'active' | 'inactive';
  features: FeaturePrivilege[];
}

// Initial/Pre-loaded Labels Registry
const SEED_LABELS: MembershipLabel[] = [
  {
    id: '04',
    labelName: 'TK lite',
    hexColor: '#4880FF',
    planName: 'Tk-Lite',
    planRate: 'Free Trial',
    duration: '15 Days',
    status: 'active',
    features: [
      { key: 'Daily Broadcast', type: 'value', value: '5' },
      { key: 'Send to all', type: 'no', value: '' },
      { key: 'Send within State', type: 'yes', value: '' },
    ]
  },
  {
    id: '03',
    labelName: 'TK Standard',
    hexColor: '#10b981',
    planName: 'Standard',
    planRate: '1000',
    duration: '3 months',
    status: 'active',
    features: [
      { key: 'Daily Broadcast', type: 'value', value: '50' },
      { key: 'Send to all', type: 'yes', value: '' },
      { key: 'Send within State', type: 'yes', value: '' },
    ]
  },
  {
    id: '02',
    labelName: 'TK Premium',
    hexColor: '#f59e0b',
    planName: 'Premium',
    planRate: '2000',
    duration: '6 Months',
    status: 'active',
    features: [
      { key: 'Daily Broadcast', type: 'value', value: '100' },
      { key: 'Send to all', type: 'yes', value: '' },
      { key: 'Send within State', type: 'yes', value: '' },
    ]
  },
  {
    id: '01',
    labelName: 'TK-FREE',
    hexColor: '#8b5cf6',
    planName: 'PLAN',
    planRate: 'Free',
    duration: '15 Days',
    status: 'active',
    features: [
      { key: 'Daily Broadcast', type: 'value', value: '2' },
      { key: 'Send to all', type: 'no', value: '' },
      { key: 'Send within State', type: 'no', value: '' },
    ]
  }
];

function capitalizePlanName(name: string): string {
  if (!name) return '';
  return name
    .split(/[\s-_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('-');
}

function getValidityLabel(billing: string): string {
  switch (billing) {
    case '15days':
      return '15 Days';
    case 'monthly':
      return '1 Month';
    case 'quarterly':
      return '3 Months';
    case 'halfyearly':
      return '6 Months';
    case 'yearly':
      return '1 Year';
    default:
      return billing;
  }
}

function formatPrice(price: number): string {
  if (price === 0) return 'Free';
  return price.toLocaleString('en-US');
}

export default function PlansPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'plans' | 'labels' | 'invoices'>('plans');

  // Search & Status filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All statuses');

  // ==========================================
  // STATE DEFINITIONS - MEMBERSHIP PLANS
  // ==========================================
  const [plans, setPlans] = useState<EnhancedPlan[]>([]);
  
  // Dialog State - Create Plan
  const [createPlanOpen, setCreatePlanOpen] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanValidity, setNewPlanValidity] = useState<'15days' | 'monthly' | 'quarterly' | 'halfyearly' | 'yearly'>('monthly');
  const [newPlanRate, setNewPlanRate] = useState('');
  const [newDailyBroadcast, setNewDailyBroadcast] = useState('0');
  const [newDailyDirectEmail, setNewDailyDirectEmail] = useState('');
  
  // Permissions Toggles - Create Plan
  const [newPermSendAll, setNewPermSendAll] = useState(true);
  const [newPermState, setNewPermState] = useState(true);
  const [newPermCity, setNewPermCity] = useState(true);
  const [newPermContacts, setNewPermContacts] = useState(false);
  const [newPermPhone, setNewPermPhone] = useState(true);
  const [newPermAddress, setNewPermAddress] = useState(false);

  // Dialog State - Edit Plan
  const [editPlanOpen, setEditPlanOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editPlanName, setEditPlanName] = useState('');
  const [editPlanValidity, setEditPlanValidity] = useState<'15days' | 'monthly' | 'quarterly' | 'halfyearly' | 'yearly'>('monthly');
  const [editPlanRate, setEditPlanRate] = useState('');
  const [editDailyBroadcast, setEditDailyBroadcast] = useState('0');
  const [editDailyDirectEmail, setEditDailyDirectEmail] = useState('');
  const [editPlanStatus, setEditPlanStatus] = useState<'active' | 'inactive'>('active');

  // Permissions Toggles - Edit Plan
  const [editPermSendAll, setEditPermSendAll] = useState(true);
  const [editPermState, setEditPermState] = useState(true);
  const [editPermCity, setEditPermCity] = useState(true);
  const [editPermContacts, setEditPermContacts] = useState(false);
  const [editPermPhone, setEditPermPhone] = useState(true);
  const [editPermAddress, setEditPermAddress] = useState(false);

  const [deletePlanOpen, setDeletePlanOpen] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState<EnhancedPlan | null>(null);

  // ==========================================
  // STATE DEFINITIONS - MEMBERSHIP LABELS
  // ==========================================
  const [labels, setLabels] = useState<MembershipLabel[]>([]);
  
  // Dialog State - Create Label
  const [createLabelOpen, setCreateLabelOpen] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelPlanName, setNewLabelPlanName] = useState('');
  const [newLabelRate, setNewLabelRate] = useState('');
  const [newLabelDuration, setNewLabelDuration] = useState('');
  const [newLabelHex, setNewLabelHex] = useState('#e2e8f0');
  const [newLabelStatus, setNewLabelStatus] = useState<'active' | 'inactive'>('active');
  const [newLabelFeatures, setNewLabelFeatures] = useState<FeaturePrivilege[]>([
    { key: 'Daily Broadcast', type: 'value', value: '5' },
    { key: 'Send to all', type: 'no', value: '' },
    { key: 'Send within State', type: 'yes', value: '' }
  ]);

  // Dialog State - Edit Label
  const [editLabelOpen, setEditLabelOpen] = useState(false);
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editLabelName, setEditLabelName] = useState('');
  const [editLabelPlanName, setEditLabelPlanName] = useState('');
  const [editLabelRate, setEditLabelRate] = useState('');
  const [editLabelDuration, setEditLabelDuration] = useState('');
  const [editLabelHex, setEditLabelHex] = useState('#e2e8f0');
  const [editLabelStatus, setEditLabelStatus] = useState<'active' | 'inactive'>('active');
  const [editLabelFeatures, setEditLabelFeatures] = useState<FeaturePrivilege[]>([]);

  const [deleteLabelOpen, setDeleteLabelOpen] = useState(false);
  const [deletingLabel, setDeletingLabel] = useState<MembershipLabel | null>(null);

  // ==========================================
  // SYNC FROM LOCAL STORAGE & HASH LISTENER
  // ==========================================
  useEffect(() => {
    setIsMounted(true);

    // Sync active route hash
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#membership-label') {
        setActiveTab('labels');
      } else if (hash === '#invoices') {
        setActiveTab('invoices');
      } else {
        setActiveTab('plans');
      }
      // Reset search/filters when transitioning tabs
      setSearchQuery('');
      setStatusFilter('All statuses');
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    // Load data from LocalStorage
    if (typeof window !== 'undefined') {
      // 1. Load Membership Plans
      const storedPlans = localStorage.getItem('northgate_membership_plans');
      if (storedPlans) {
        try {
          setPlans(JSON.parse(storedPlans));
        } catch (e) {
          console.error(e);
          initializeSeedPlans();
        }
      } else {
        initializeSeedPlans();
      }

      // 2. Load Membership Labels
      const storedLabels = localStorage.getItem('northgate_membership_labels');
      if (storedLabels) {
        try {
          setLabels(JSON.parse(storedLabels));
        } catch (e) {
          console.error(e);
          initializeSeedLabels();
        }
      } else {
        initializeSeedLabels();
      }
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const initializeSeedPlans = () => {
    const enhanced: EnhancedPlan[] = SEED_PLANS.map((p, idx) => ({
      ...p,
      subscribersCount: idx === 0 ? 42 : idx === 1 ? 128 : idx === 2 ? 85 : 9,
      bannerColor: BANNER_COLOR_POOL[idx % BANNER_COLOR_POOL.length],
    }));
    setPlans(enhanced);
    localStorage.setItem('northgate_membership_plans', JSON.stringify(enhanced));
  };

  const initializeSeedLabels = () => {
    setLabels(SEED_LABELS);
    localStorage.setItem('northgate_membership_labels', JSON.stringify(SEED_LABELS));
  };

  const savePlansToStorage = (updated: EnhancedPlan[]) => {
    setPlans(updated);
    localStorage.setItem('northgate_membership_plans', JSON.stringify(updated));
  };

  const saveLabelsToStorage = (updated: MembershipLabel[]) => {
    setLabels(updated);
    localStorage.setItem('northgate_membership_labels', JSON.stringify(updated));
  };

  // ==========================================
  // PLAN CRUD OPERATIONS
  // ==========================================
  const handleCreatePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPlanName.trim()) {
      toast.error('Plan Name is required');
      return;
    }

    if (newPlanRate.trim() === '' || isNaN(Number(newPlanRate)) || Number(newPlanRate) < 0) {
      toast.error('Please enter a valid numeric Plan Rate');
      return;
    }

    const features = [
      `${newDailyBroadcast} Broadcasts daily`,
      newDailyDirectEmail ? `${newDailyDirectEmail} outbound email` : 'No outbound email',
    ];
    if (newPermSendAll) features.push('Send to all');
    if (newPermState) features.push('State targeting');
    if (newPermCity) features.push('City targeting');
    if (newPermPhone) features.push('Phone No Show/Hide');

    const newPlan: EnhancedPlan = {
      id: String(Date.now()),
      name: newPlanName.trim(),
      price: Number(newPlanRate),
      billing: newPlanValidity,
      features,
      dailyBroadcasts: Number(newDailyBroadcast) || 0,
      email: newDailyDirectEmail.trim(),
      status: 'active',
      permissions: {
        sendall: newPermSendAll,
        state: newPermState,
        city: newPermCity,
        contacts: newPermContacts,
        address: newPermAddress,
        phone: newPermPhone,
      },
      subscribersCount: 0,
      bannerColor: BANNER_COLOR_POOL[plans.length % BANNER_COLOR_POOL.length],
    };

    const updated = [...plans, newPlan];
    savePlansToStorage(updated);
    toast.success(`Plan "${capitalizePlanName(newPlan.name)}" created successfully`);

    // Reset
    setNewPlanName('');
    setNewPlanValidity('monthly');
    setNewPlanRate('');
    setNewDailyBroadcast('0');
    setNewDailyDirectEmail('');
    setNewPermSendAll(true);
    setNewPermState(true);
    setNewPermCity(true);
    setNewPermContacts(false);
    setNewPermPhone(true);
    setNewPermAddress(false);
    setCreatePlanOpen(false);
  };

  const triggerEditPlan = (plan: EnhancedPlan) => {
    setEditingPlanId(plan.id);
    setEditPlanName(plan.name);
    setEditPlanValidity(plan.billing);
    setEditPlanRate(plan.price.toString());
    setEditDailyBroadcast(plan.dailyBroadcasts.toString());
    setEditDailyDirectEmail(plan.email || '');
    setEditPlanStatus(plan.status);

    setEditPermSendAll(plan.permissions.sendall);
    setEditPermState(plan.permissions.state);
    setEditPermCity(plan.permissions.city);
    setEditPermContacts(plan.permissions.contacts);
    setEditPermPhone(plan.permissions.phone);
    setEditPermAddress(plan.permissions.address);

    setEditPlanOpen(true);
  };

  const handleEditPlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlanId) return;

    if (!editPlanName.trim()) {
      toast.error('Plan Name is required');
      return;
    }

    if (editPlanRate.trim() === '' || isNaN(Number(editPlanRate)) || Number(editPlanRate) < 0) {
      toast.error('Please enter a valid numeric Plan Rate');
      return;
    }

    const features = [
      `${editDailyBroadcast} Broadcasts daily`,
      editDailyDirectEmail ? `${editDailyDirectEmail} outbound email` : 'No outbound email',
    ];
    if (editPermSendAll) features.push('Send to all');
    if (editPermState) features.push('State targeting');
    if (editPermCity) features.push('City targeting');
    if (editPermPhone) features.push('Phone No Show/Hide');

    const updated = plans.map((p) => {
      if (p.id === editingPlanId) {
        return {
          ...p,
          name: editPlanName.trim(),
          price: Number(editPlanRate),
          billing: editPlanValidity,
          features,
          dailyBroadcasts: Number(editDailyBroadcast) || 0,
          email: editDailyDirectEmail.trim(),
          status: editPlanStatus,
          permissions: {
            sendall: editPermSendAll,
            state: editPermState,
            city: editPermCity,
            contacts: editPermContacts,
            address: editPermAddress,
            phone: editPermPhone,
          },
        };
      }
      return p;
    });

    savePlansToStorage(updated);
    toast.success('Plan details updated successfully');
    setEditPlanOpen(false);
    setEditingPlanId(null);
  };

  const handleDeletePlan = () => {
    if (!deletingPlan) return;
    const updated = plans.filter((p) => p.id !== deletingPlan.id);
    savePlansToStorage(updated);
    toast.success(`Plan "${capitalizePlanName(deletingPlan.name)}" deleted successfully`);
    setDeletePlanOpen(false);
    setDeletingPlan(null);
  };

  // ==========================================
  // LABEL CRUD OPERATIONS
  // ==========================================
  const isHexValid = (color: string) => {
    return /^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{3}$/.test(color);
  };

  const handleCreateLabelSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newLabelName.trim()) {
      toast.error('Label Name is required');
      return;
    }
    if (!newLabelPlanName.trim()) {
      toast.error('Linked Plan Name is required');
      return;
    }
    if (!newLabelRate.trim()) {
      toast.error('Plan Rate description is required');
      return;
    }
    if (!newLabelDuration.trim()) {
      toast.error('Duration is required');
      return;
    }

    const hexColorCode = isHexValid(newLabelHex) ? newLabelHex : '#e2e8f0';

    // Build new label ID dynamically (two digit format if possible, e.g. 05)
    const nextIdVal = labels.length > 0 ? Math.max(...labels.map(l => parseInt(l.id))) + 1 : 1;
    const nextIdStr = String(nextIdVal).padStart(2, '0');

    const newLabel: MembershipLabel = {
      id: nextIdStr,
      labelName: newLabelName.trim(),
      hexColor: hexColorCode,
      planName: newLabelPlanName.trim(),
      planRate: newLabelRate.trim(),
      duration: newLabelDuration.trim(),
      status: newLabelStatus,
      features: newLabelFeatures.filter(f => f.key.trim() !== '')
    };

    const updated = [newLabel, ...labels]; // prepend newest labels
    saveLabelsToStorage(updated);
    toast.success(`Label "${newLabel.labelName}" created successfully`);

    // Reset fields
    setNewLabelName('');
    setNewLabelPlanName('');
    setNewLabelRate('');
    setNewLabelDuration('');
    setNewLabelHex('#e2e8f0');
    setNewLabelStatus('active');
    setNewLabelFeatures([
      { key: 'Daily Broadcast', type: 'value', value: '5' },
      { key: 'Send to all', type: 'no', value: '' },
      { key: 'Send within State', type: 'yes', value: '' }
    ]);
    setCreateLabelOpen(false);
  };

  const triggerEditLabel = (label: MembershipLabel) => {
    setEditingLabelId(label.id);
    setEditLabelName(label.labelName);
    setEditLabelPlanName(label.planName);
    setEditLabelRate(label.planRate);
    setEditLabelDuration(label.duration);
    setEditLabelHex(label.hexColor);
    setEditLabelStatus(label.status);
    setEditLabelFeatures([...label.features]);
    setEditLabelOpen(true);
  };

  const handleEditLabelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLabelId) return;

    if (!editLabelName.trim()) {
      toast.error('Label Name is required');
      return;
    }
    if (!editLabelPlanName.trim()) {
      toast.error('Linked Plan Name is required');
      return;
    }
    if (!editLabelRate.trim()) {
      toast.error('Plan Rate description is required');
      return;
    }
    if (!editLabelDuration.trim()) {
      toast.error('Duration is required');
      return;
    }

    const hexColorCode = isHexValid(editLabelHex) ? editLabelHex : '#e2e8f0';

    const updated = labels.map((l) => {
      if (l.id === editingLabelId) {
        return {
          ...l,
          labelName: editLabelName.trim(),
          hexColor: hexColorCode,
          planName: editLabelPlanName.trim(),
          planRate: editLabelRate.trim(),
          duration: editLabelDuration.trim(),
          status: editLabelStatus,
          features: editLabelFeatures.filter(f => f.key.trim() !== '')
        };
      }
      return l;
    });

    saveLabelsToStorage(updated);
    toast.success(`Label settings saved successfully`);
    setEditLabelOpen(false);
    setEditingLabelId(null);
  };

  const handleDeleteLabel = () => {
    if (!deletingLabel) return;
    const updated = labels.filter((l) => l.id !== deletingLabel.id);
    saveLabelsToStorage(updated);
    toast.success(`Label "${deletingLabel.labelName}" deleted successfully`);
    setDeleteLabelOpen(false);
    setDeletingLabel(null);
  };

  // Helper dynamic feature row manipulators
  const addFeatureRow = (isEdit: boolean) => {
    const emptyRow: FeaturePrivilege = { key: '', type: 'yes', value: '' };
    if (isEdit) {
      setEditLabelFeatures([...editLabelFeatures, emptyRow]);
    } else {
      setNewLabelFeatures([...newLabelFeatures, emptyRow]);
    }
  };

  const removeFeatureRow = (index: number, isEdit: boolean) => {
    if (isEdit) {
      const updated = editLabelFeatures.filter((_, idx) => idx !== index);
      setEditLabelFeatures(updated);
    } else {
      const updated = newLabelFeatures.filter((_, idx) => idx !== index);
      setNewLabelFeatures(updated);
    }
  };

  const updateFeatureRow = (index: number, field: keyof FeaturePrivilege, val: string, isEdit: boolean) => {
    const list = isEdit ? editLabelFeatures : newLabelFeatures;
    const updated = list.map((item, idx) => {
      if (idx === index) {
        const updatedItem = { ...item, [field]: val };
        // Clear value input if type switches to Yes/No
        if (field === 'type' && val !== 'value') {
          updatedItem.value = '';
        }
        return updatedItem;
      }
      return item;
    });

    if (isEdit) setEditLabelFeatures(updated);
    else setNewLabelFeatures(updated);
  };

  // ==========================================
  // FILTERING COMPUTATIONS
  // ==========================================
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const matchesSearch =
        plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getValidityLabel(plan.billing).toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.price.toString().includes(searchQuery) ||
        (plan.email && plan.email.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'All statuses' ||
        (statusFilter === 'Active' && plan.status === 'active') ||
        (statusFilter === 'Inactive' && plan.status === 'inactive');

      return matchesSearch && matchesStatus;
    });
  }, [plans, searchQuery, statusFilter]);

  const filteredLabels = useMemo(() => {
    return labels.filter((lbl) => {
      const matchesSearch =
        lbl.labelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lbl.planName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lbl.planRate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lbl.duration.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'All statuses' ||
        (statusFilter === 'Active' && lbl.status === 'active') ||
        (statusFilter === 'Inactive' && lbl.status === 'inactive');

      return matchesSearch && matchesStatus;
    });
  }, [labels, searchQuery, statusFilter]);

  const statusOptions = ['All statuses', 'Active', 'Inactive'];

  if (!isMounted) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-slate-500 font-medium animate-pulse">Loading workspace billing configurations...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div data-testid="plans-page" className="space-y-0">
        
        {/* ============================================================== */}
        {/* TAB 1: MEMBERSHIP PLANS RENDERING                              */}
        {/* ============================================================== */}
        {activeTab === 'plans' && (
          <>
            {/* Page Header */}
            <div className="mb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <Header
                title="Membership Plans"
                subtitle="Administer core service plan tiers, pricing matrices and feature toggle allowances."
              />
            </div>

            {/* White Container Search & Action Section */}
            <div 
              className="p-4 border bg-white flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
              style={{ borderColor: '#E5E7EB', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', borderBottomWidth: '0' }}
            >
              <SearchBar
                placeholder="Search by plan name, validity, email or rate..."
                onSearch={setSearchQuery}
              />
              <FilterSelect
                label="All statuses"
                options={statusOptions}
                defaultValue={statusFilter}
                onChange={setStatusFilter}
                showFilterIcon={true}
              />
              <Button
                onClick={() => setCreatePlanOpen(true)}
                data-testid="add-plan-btn"
                className="h-10 bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all duration-150 shrink-0 shadow-sm rounded-md flex items-center gap-2 cursor-pointer px-4 text-xs sm:ml-auto"
              >
                <Plus className="h-4 w-4" />
                Add Plan
              </Button>
            </div>

            {/* Plans Table */}
            <div 
              className="bg-white border overflow-hidden" 
              style={{ borderColor: '#E5E7EB', borderTopLeftRadius: '0', borderTopRightRadius: '0', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}
            >
              <table className="w-full">
                <thead className="bg-white border-b" style={{ borderColor: '#EEF2F6' }}>
                  <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    <th className="px-6 py-3.5 font-semibold w-16 text-center whitespace-nowrap">SR NO</th>
                    <th className="px-6 py-3.5 font-semibold">PLAN DETAILS</th>
                    <th className="px-6 py-3.5 font-semibold">VALIDITY</th>
                    <th className="px-6 py-3.5 font-semibold">RATE / PRICE</th>
                    <th className="px-6 py-3.5 font-semibold">DAILY BROADCASTS & ALLOWANCES</th>
                    <th className="px-6 py-3.5 font-semibold">STATUS</th>
                    <th className="px-6 py-3.5 font-semibold text-center w-28 whitespace-nowrap">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPlans.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">
                        No plans match your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredPlans.map((plan, index) => {
                      const srNo = String(index + 1).padStart(2, '0');
                      const capName = capitalizePlanName(plan.name);
                      const validityLabel = getValidityLabel(plan.billing);
                      const rateLabel = formatPrice(plan.price);
                      
                      return (
                        <tr
                          key={plan.id}
                          data-testid={`plan-row-${plan.id}`}
                          className="border-b hover:bg-slate-50/70 transition-colors bg-white"
                          style={{ borderColor: '#F1F5F9' }}
                        >
                          <td className="px-6 py-4 text-center text-slate-400 font-mono text-xs font-semibold">
                            {srNo}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-[13px] font-semibold text-slate-900 flex items-center gap-1.5">
                                {capName}
                                {plan.price === 0 && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold bg-slate-100 text-slate-650 border border-slate-200 uppercase">
                                    FREE
                                  </span>
                                )}
                              </span>
                              <span className="text-xs text-slate-500 mt-0.5">
                                {plan.subscribersCount} active subscribers
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[13px] text-slate-650 font-medium whitespace-nowrap">
                            {validityLabel}
                          </td>
                          <td className="px-6 py-4 text-[13px] text-slate-650 font-medium whitespace-nowrap">
                            {plan.price > 0 ? `₹${rateLabel}` : 'Free'}
                          </td>
                          <td className="px-6 py-4">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  data-testid={`features-trigger-${plan.id}`}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-xs group cursor-pointer text-slate-700"
                                >
                                  <span>{plan.dailyBroadcasts} Broadcasts</span>
                                  <ChevronDown className="h-3 w-3 text-slate-400 group-aria-expanded:rotate-180 transition-transform duration-200" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80 p-4 border border-slate-200 bg-white shadow-xl rounded-xl focus:outline-hidden z-50">
                                <div className="space-y-3">
                                  <div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                      Privileges & Permissions
                                    </h4>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                      Configured allowances for plan: <span className="font-semibold text-slate-800">{capName}</span>
                                    </p>
                                  </div>
                                  <div className="divide-y divide-slate-100 text-xs">
                                    <div className="py-2 flex items-center justify-between">
                                      <span className="text-slate-500 flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-slate-400" /> Daily Direct Email</span>
                                      <span className="font-semibold text-slate-800 ml-4 break-all select-all">{plan.email ? plan.email : 'None (Disabled)'}</span>
                                    </div>
                                    <div className="py-2 flex items-center justify-between">
                                      <span className="text-slate-500 flex items-center gap-1.5"><Send className="h-3.5 w-3.5 text-slate-400" /> Send to all</span>
                                      <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded border ${plan.permissions.sendall ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>{plan.permissions.sendall ? 'YES' : 'NO'}</span>
                                    </div>
                                    <div className="py-2 flex items-center justify-between">
                                      <span className="text-slate-500 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400" /> State filter targeting</span>
                                      <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded border ${plan.permissions.state ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>{plan.permissions.state ? 'YES' : 'NO'}</span>
                                    </div>
                                    <div className="py-2 flex items-center justify-between">
                                      <span className="text-slate-500 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400" /> City filter targeting</span>
                                      <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded border ${plan.permissions.city ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>{plan.permissions.city ? 'YES' : 'NO'}</span>
                                    </div>
                                    <div className="py-2 flex items-center justify-between">
                                      <span className="text-slate-500 flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-slate-400" /> Add contacts</span>
                                      <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded border ${plan.permissions.contacts ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>{plan.permissions.contacts ? 'YES' : 'NO'}</span>
                                    </div>
                                    <div className="py-2 flex items-center justify-between">
                                      <span className="text-slate-500 flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5 text-slate-400" /> Address book</span>
                                      <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded border ${plan.permissions.address ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>{plan.permissions.address ? 'YES' : 'NO'}</span>
                                    </div>
                                    <div className="py-2 flex items-center justify-between">
                                      <span className="text-slate-500 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-slate-400" /> Phone visibility</span>
                                      <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded border ${plan.permissions.phone ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>{plan.permissions.phone ? 'SHOW' : 'HIDE'}</span>
                                    </div>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={plan.status.toUpperCase()} />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                onClick={() => triggerEditPlan(plan)}
                                variant="outline"
                                size="icon"
                                data-testid={`edit-plan-${plan.id}`}
                                className="h-8 w-8 text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-md cursor-pointer bg-white"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                onClick={() => {
                                  setDeletingPlan(plan);
                                  setDeletePlanOpen(true);
                                }}
                                variant="outline"
                                size="icon"
                                data-testid={`delete-plan-${plan.id}`}
                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-md cursor-pointer bg-white"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ============================================================== */}
        {/* TAB 2: APP MEMBERSHIP LABELS RENDERING                         */}
        {/* ============================================================== */}
        {activeTab === 'labels' && (
          <>
            {/* Page Header */}
            <div className="mb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <Header
                title="App Membership Label"
                subtitle="Administer system membership labels, linked plans, durations, and dynamic feature privileges."
              />
            </div>

            {/* White Container Search & Action Section */}
            <div 
              className="p-4 border bg-white flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
              style={{ borderColor: '#E5E7EB', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', borderBottomWidth: '0' }}
            >
              <SearchBar
                placeholder="Search by label, plan name, validity or price..."
                onSearch={setSearchQuery}
              />
              <FilterSelect
                label="All statuses"
                options={statusOptions}
                defaultValue={statusFilter}
                onChange={setStatusFilter}
                showFilterIcon={true}
              />
              <Button
                onClick={() => setCreateLabelOpen(true)}
                data-testid="add-label-btn"
                className="h-10 bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all duration-150 shrink-0 shadow-sm rounded-md flex items-center gap-2 cursor-pointer px-4 text-xs sm:ml-auto"
              >
                <Plus className="h-4 w-4" />
                Add New Label
              </Button>
            </div>

            {/* App Labels Table */}
            <div 
              className="bg-white border overflow-hidden" 
              style={{ borderColor: '#E5E7EB', borderTopLeftRadius: '0', borderTopRightRadius: '0', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}
            >
              <table className="w-full">
                <thead className="bg-white border-b" style={{ borderColor: '#EEF2F6' }}>
                  <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    <th className="px-6 py-3.5 font-semibold w-16 text-center whitespace-nowrap">SR NO</th>
                    <th className="px-6 py-3.5 font-semibold">LABEL DETAILS</th>
                    <th className="px-6 py-3.5 font-semibold">LINKED PLAN</th>
                    <th className="px-6 py-3.5 font-semibold">DURATION</th>
                    <th className="px-6 py-3.5 font-semibold">RATE / PRICE</th>
                    <th className="px-6 py-3.5 font-semibold">PRIVILEGES & PRIVILEGE FLAGS</th>
                    <th className="px-6 py-3.5 font-semibold">STATUS</th>
                    <th className="px-6 py-3.5 font-semibold text-right w-28">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLabels.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-sm text-slate-500">
                        No membership labels match your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredLabels.map((lbl, index) => {
                      const srNo = String(index + 1).padStart(2, '0');
                      
                      return (
                        <tr
                          key={lbl.id}
                          data-testid={`label-row-${lbl.id}`}
                          className="border-b hover:bg-slate-50/70 transition-colors bg-white"
                          style={{ borderColor: '#F1F5F9' }}
                        >
                          {/* SR NO */}
                          <td className="px-6 py-4 text-center text-slate-400 font-mono text-xs font-semibold">
                            {lbl.id}
                          </td>

                          {/* LABEL DETAILS */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2.5">
                              <span
                                className="h-5 px-2 rounded flex items-center justify-center text-[10px] font-bold text-white font-mono uppercase tracking-wide select-none shrink-0"
                                style={{ backgroundColor: lbl.hexColor }}
                              >
                                {lbl.hexColor}
                              </span>
                              <span className="text-[13px] font-semibold text-slate-900 whitespace-nowrap">
                                {lbl.labelName}
                              </span>
                            </div>
                          </td>

                          {/* LINKED PLAN */}
                          <td className="px-6 py-4 text-[13px] text-slate-650 font-medium whitespace-nowrap">
                            {lbl.planName}
                          </td>

                          {/* DURATION */}
                          <td className="px-6 py-4 text-[13px] text-slate-650 font-medium whitespace-nowrap">
                            {lbl.duration}
                          </td>

                          {/* RATE */}
                          <td className="px-6 py-4 text-[13px] text-slate-650 font-medium whitespace-nowrap">
                            {lbl.planRate}
                          </td>

                          {/* FEATURES PRIVILEGES POPOVER */}
                          <td className="px-6 py-4">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-xs text-slate-700 cursor-pointer"
                                >
                                  <span>{lbl.features.length} Feature Flags</span>
                                  <ChevronDown className="h-3 w-3 text-slate-400" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80 p-4 border border-slate-200 bg-white shadow-xl rounded-xl z-50 focus:outline-hidden">
                                <div className="space-y-3">
                                  <div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                      Dynamic Privileges Grid
                                    </h4>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                      Privilege rules for label: <span className="font-semibold text-slate-800">{lbl.labelName}</span>
                                    </p>
                                  </div>
                                  <div className="divide-y divide-slate-100 text-xs">
                                    {lbl.features.length === 0 ? (
                                      <p className="py-3 text-center text-[11px] text-slate-400">No privileges configured for this label.</p>
                                    ) : (
                                      lbl.features.map((feat, idx) => (
                                        <div key={idx} className="py-2 flex items-center justify-between">
                                          <span className="text-slate-550 font-medium">{feat.key}</span>
                                          <div>
                                            {feat.type === 'yes' && (
                                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                                                <Check className="h-2.5 w-2.5 stroke-[3] mr-0.5" /> YES
                                              </span>
                                            )}
                                            {feat.type === 'no' && (
                                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-red-650 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">
                                                <X className="h-2.5 w-2.5 stroke-[3] mr-0.5" /> NO
                                              </span>
                                            )}
                                            {feat.type === 'value' && (
                                              <span className="font-semibold font-mono text-[11px] text-slate-800 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                                                Limit: {feat.value}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </td>

                          {/* STATUS */}
                          <td className="px-6 py-4">
                            <StatusBadge status={lbl.status.toUpperCase()} />
                          </td>

                          {/* ACTIONS */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                onClick={() => triggerEditLabel(lbl)}
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-md cursor-pointer bg-white"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                onClick={() => {
                                  setDeletingLabel(lbl);
                                  setDeleteLabelOpen(true);
                                }}
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-md cursor-pointer bg-white"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ============================================================== */}
        {/* TAB 3: MOCK INVOICES RENDERING                                  */}
        {/* ============================================================== */}
        {activeTab === 'invoices' && (
          <>
            {/* Page Header */}
            <div className="mb-5">
              <Header
                title="Invoice History"
                subtitle="View, track, and download professional PDF receipts generated for active member plans."
              />
            </div>

            {/* White Container Search & Filters */}
            <div 
              className="p-4 border bg-white flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
              style={{ borderColor: '#E5E7EB', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', borderBottomWidth: '0' }}
            >
              <SearchBar
                placeholder="Search invoices by ID, member name, email or price..."
                onSearch={setSearchQuery}
              />
              <FilterSelect
                label="All statuses"
                options={['All statuses', 'PAID', 'PENDING', 'OVERDUE']}
                defaultValue="All statuses"
                showFilterIcon={true}
              />
            </div>

            {/* Invoices Mock Table */}
            <div 
              className="bg-white border overflow-hidden" 
              style={{ borderColor: '#E5E7EB', borderTopLeftRadius: '0', borderTopRightRadius: '0', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}
            >
              <table className="w-full">
                <thead className="bg-white border-b" style={{ borderColor: '#EEF2F6' }}>
                  <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    <th className="px-6 py-3.5 font-semibold w-16 text-center whitespace-nowrap">SR NO</th>
                    <th className="px-6 py-3.5 font-semibold">INVOICE ID</th>
                    <th className="px-6 py-3.5 font-semibold">MEMBER</th>
                    <th className="px-6 py-3.5 font-semibold">PLAN TIER</th>
                    <th className="px-6 py-3.5 font-semibold">AMOUNT PAID</th>
                    <th className="px-6 py-3.5 font-semibold">BILLING DATE</th>
                    <th className="px-6 py-3.5 font-semibold">STATUS</th>
                    <th className="px-6 py-3.5 font-semibold text-right w-28">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="border-b hover:bg-slate-50 transition-colors bg-white" style={{ borderColor: '#F1F5F9' }}>
                    <td className="px-6 py-4 text-center text-slate-400 font-mono text-xs font-semibold">01</td>
                    <td className="px-6 py-4 font-mono font-semibold text-slate-900 text-xs">INV-2026-009</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-semibold text-slate-900">Aditya Verma</span>
                        <span className="text-xs text-slate-500 mt-0.5">aditya@outlook.com</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-slate-650 font-medium whitespace-nowrap">TK Standard</td>
                    <td className="px-6 py-4 text-[13px] text-slate-650 font-medium whitespace-nowrap">₹15,000</td>
                    <td className="px-6 py-4 text-[13px] text-slate-650 font-medium whitespace-nowrap">May 19, 2026</td>
                    <td className="px-6 py-4">
                      <StatusBadge status="PAID" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs text-slate-700 hover:text-slate-900 border border-slate-200 cursor-pointer bg-white" onClick={() => toast.info('Receipt PDF downloading initiated!')}>
                        <Download className="h-3 w-3" /> PDF
                      </Button>
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-slate-50 transition-colors bg-white" style={{ borderColor: '#F1F5F9' }}>
                    <td className="px-6 py-4 text-center text-slate-400 font-mono text-xs font-semibold">02</td>
                    <td className="px-6 py-4 font-mono font-semibold text-slate-900 text-xs">INV-2026-008</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-semibold text-slate-900">Rajesh Kumar</span>
                        <span className="text-xs text-slate-500 mt-0.5">rajesh@gmail.com</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-slate-650 font-medium whitespace-nowrap">TK Premium</td>
                    <td className="px-6 py-4 text-[13px] text-slate-650 font-medium whitespace-nowrap">₹18,500</td>
                    <td className="px-6 py-4 text-[13px] text-slate-650 font-medium whitespace-nowrap">May 15, 2026</td>
                    <td className="px-6 py-4">
                      <StatusBadge status="PAID" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs text-slate-700 hover:text-slate-900 border border-slate-200 cursor-pointer bg-white" onClick={() => toast.info('Receipt PDF downloading initiated!')}>
                        <Download className="h-3 w-3" /> PDF
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ============================================================== */}
        {/* DIALOGS SECTION - MEMBERSHIP PLANS                             */}
        {/* ============================================================== */}
        
        {/* CREATE PLAN */}
        <Dialog open={createPlanOpen} onOpenChange={setCreatePlanOpen}>
          <DialogContent data-testid="create-plan-dialog" className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-slate-250 p-6 shadow-xl rounded-xl z-[100]">
            <DialogHeader>
              <DialogTitle className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-slate-500" />
                Create Membership Plan
              </DialogTitle>
              <DialogDescription className="text-slate-550 text-xs">
                Build a new service billing tier.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreatePlanSubmit} className="space-y-5 py-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="create-name" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Plan Name</Label>
                  <Input id="create-name" data-testid="create-name-input" placeholder="e.g. tk-lite" value={newPlanName} onChange={(e) => setNewPlanName(e.target.value)} className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white animate-none" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="create-validity" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Plan Validity</Label>
                  <Select value={newPlanValidity} onValueChange={(val: any) => setNewPlanValidity(val)}>
                    <SelectTrigger id="create-validity" data-testid="create-validity-select" className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white border border-slate-200 z-[120]">
                      <SelectItem value="15days">15 Days</SelectItem>
                      <SelectItem value="monthly">1 Month</SelectItem>
                      <SelectItem value="quarterly">3 Months</SelectItem>
                      <SelectItem value="halfyearly">6 Months</SelectItem>
                      <SelectItem value="yearly">1 Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="create-rate" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Plan Rate (₹)</Label>
                  <Input id="create-rate" data-testid="create-rate-input" type="number" min="0" placeholder="e.g. 15000" value={newPlanRate} onChange={(e) => setNewPlanRate(e.target.value)} className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white font-mono" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="create-broadcasts" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Daily Broadcasts</Label>
                  <Input id="create-broadcasts" data-testid="create-broadcasts-input" type="number" min="0" placeholder="e.g. 50" value={newDailyBroadcast} onChange={(e) => setNewDailyBroadcast(e.target.value)} className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white font-mono" />
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <Label htmlFor="create-email" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Daily Direct Email</Label>
                  <Input id="create-email" data-testid="create-email-input" type="email" placeholder="e.g. standard@tk.com (leave blank for none)" value={newDailyDirectEmail} onChange={(e) => setNewDailyDirectEmail(e.target.value)} className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white animate-none" />
                </div>
              </div>

              <div className="pt-3 border-t border-dashed border-slate-200">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 flex items-center gap-1.5 mb-3">
                  <Layers className="h-3.5 w-3.5" /> Plan Permissions & Privilege Flags
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition-colors">
                    <div className="space-y-0.5"><Label htmlFor="new-perm-sendall" className="text-xs font-semibold text-slate-800 cursor-pointer">Send to all</Label></div>
                    <Switch id="new-perm-sendall" checked={newPermSendAll} onCheckedChange={setNewPermSendAll} className="data-[state=checked]:bg-slate-900" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition-colors">
                    <div className="space-y-0.5"><Label htmlFor="new-perm-state" className="text-xs font-semibold text-slate-800 cursor-pointer">State Targeting</Label></div>
                    <Switch id="new-perm-state" checked={newPermState} onCheckedChange={setNewPermState} className="data-[state=checked]:bg-slate-900" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition-colors">
                    <div className="space-y-0.5"><Label htmlFor="new-perm-city" className="text-xs font-semibold text-slate-800 cursor-pointer">City Targeting</Label></div>
                    <Switch id="new-perm-city" checked={newPermCity} onCheckedChange={setNewPermCity} className="data-[state=checked]:bg-slate-900" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition-colors">
                    <div className="space-y-0.5"><Label htmlFor="new-perm-contacts" className="text-xs font-semibold text-slate-800 cursor-pointer">Add Contacts</Label></div>
                    <Switch id="new-perm-contacts" checked={newPermContacts} onCheckedChange={setNewPermContacts} className="data-[state=checked]:bg-slate-900" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition-colors">
                    <div className="space-y-0.5"><Label htmlFor="new-perm-phone" className="text-xs font-semibold text-slate-800 cursor-pointer">Phone No (Show/Hide)</Label></div>
                    <Switch id="new-perm-phone" checked={newPermPhone} onCheckedChange={setNewPermPhone} className="data-[state=checked]:bg-slate-900" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition-colors">
                    <div className="space-y-0.5"><Label htmlFor="new-perm-address" className="text-xs font-semibold text-slate-800 cursor-pointer">Address Book</Label></div>
                    <Switch id="new-perm-address" checked={newPermAddress} onCheckedChange={setNewPermAddress} className="data-[state=checked]:bg-slate-900" />
                  </div>
                </div>
              </div>
              <DialogFooter className="pt-4 border-t border-slate-100 gap-2">
                <Button type="button" variant="outline" onClick={() => setCreatePlanOpen(false)} className="h-10 text-xs font-semibold hover:bg-slate-50 cursor-pointer">Cancel</Button>
                <Button type="submit" className="h-10 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white cursor-pointer">Save & Publish Plan</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* EDIT PLAN */}
        <Dialog open={editPlanOpen} onOpenChange={setEditPlanOpen}>
          <DialogContent data-testid="edit-plan-dialog" className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-slate-250 p-6 shadow-xl rounded-xl z-[100]">
            <DialogHeader>
              <DialogTitle className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-slate-500" />
                Edit Membership Plan
              </DialogTitle>
              <DialogDescription className="text-slate-550 text-xs">
                Modify billing structure and override flag tolerances.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditPlanSubmit} className="space-y-5 py-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-name" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Plan Name</Label>
                  <Input id="edit-name" data-testid="edit-name-input" value={editPlanName} onChange={(e) => setEditPlanName(e.target.value)} className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white animate-none" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-validity" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Plan Validity</Label>
                  <Select value={editPlanValidity} onValueChange={(val: any) => setEditPlanValidity(val)}>
                    <SelectTrigger id="edit-validity" data-testid="edit-validity-select" className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white border border-slate-200 z-[120]">
                      <SelectItem value="15days">15 Days</SelectItem>
                      <SelectItem value="monthly">1 Month</SelectItem>
                      <SelectItem value="quarterly">3 Months</SelectItem>
                      <SelectItem value="halfyearly">6 Months</SelectItem>
                      <SelectItem value="yearly">1 Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-rate" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Plan Rate (₹)</Label>
                  <Input id="edit-rate" data-testid="edit-rate-input" type="number" min="0" value={editPlanRate} onChange={(e) => setEditPlanRate(e.target.value)} className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white font-mono" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-broadcasts" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Daily Broadcasts</Label>
                  <Input id="edit-broadcasts" data-testid="edit-broadcasts-input" type="number" min="0" value={editDailyBroadcast} onChange={(e) => setEditDailyBroadcast(e.target.value)} className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white font-mono" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-email" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Daily Direct Email</Label>
                  <Input id="edit-email" data-testid="edit-email-input" type="email" placeholder="standard@tk.com (leave blank for none)" value={editDailyDirectEmail} onChange={(e) => setEditDailyDirectEmail(e.target.value)} className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white animate-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-status" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Plan Status</Label>
                  <Select value={editPlanStatus} onValueChange={(val: any) => setEditPlanStatus(val)}>
                    <SelectTrigger id="edit-status" data-testid="edit-status-select" className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white font-semibold"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white border border-slate-200 z-[120]">
                      <SelectItem value="active" className="text-emerald-750 font-semibold focus:text-emerald-800">Active</SelectItem>
                      <SelectItem value="inactive" className="text-slate-550 font-semibold">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-3 border-t border-dashed border-slate-200">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 flex items-center gap-1.5 mb-3">
                  <Layers className="h-3.5 w-3.5" /> Plan Permissions & Privilege Flags
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition-colors">
                    <div className="space-y-0.5"><Label htmlFor="edit-perm-sendall" className="text-xs font-semibold text-slate-800 cursor-pointer">Send to all</Label></div>
                    <Switch id="edit-perm-sendall" checked={editPermSendAll} onCheckedChange={setEditPermSendAll} className="data-[state=checked]:bg-slate-900" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition-colors">
                    <div className="space-y-0.5"><Label htmlFor="edit-perm-state" className="text-xs font-semibold text-slate-800 cursor-pointer">State Targeting</Label></div>
                    <Switch id="edit-perm-state" checked={editPermState} onCheckedChange={setEditPermState} className="data-[state=checked]:bg-slate-900" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition-colors">
                    <div className="space-y-0.5"><Label htmlFor="edit-perm-city" className="text-xs font-semibold text-slate-800 cursor-pointer">City Targeting</Label></div>
                    <Switch id="edit-perm-city" checked={editPermCity} onCheckedChange={setEditPermCity} className="data-[state=checked]:bg-slate-900" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition-colors">
                    <div className="space-y-0.5"><Label htmlFor="edit-perm-contacts" className="text-xs font-semibold text-slate-800 cursor-pointer">Add Contacts</Label></div>
                    <Switch id="edit-perm-contacts" checked={editPermContacts} onCheckedChange={setEditPermContacts} className="data-[state=checked]:bg-slate-900" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition-colors">
                    <div className="space-y-0.5"><Label htmlFor="edit-perm-phone" className="text-xs font-semibold text-slate-800 cursor-pointer">Phone No (Show/Hide)</Label></div>
                    <Switch id="edit-perm-phone" checked={editPermPhone} onCheckedChange={setEditPermPhone} className="data-[state=checked]:bg-slate-900" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition-colors">
                    <div className="space-y-0.5"><Label htmlFor="edit-perm-address" className="text-xs font-semibold text-slate-800 cursor-pointer">Address Book</Label></div>
                    <Switch id="edit-perm-address" checked={editPermAddress} onCheckedChange={setEditPermAddress} className="data-[state=checked]:bg-slate-900" />
                  </div>
                </div>
              </div>
              <DialogFooter className="pt-4 border-t border-slate-100 gap-2">
                <Button type="button" variant="outline" onClick={() => setEditPlanOpen(false)} className="h-10 text-xs font-semibold hover:bg-slate-50 cursor-pointer">Cancel</Button>
                <Button type="submit" className="h-10 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white cursor-pointer">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* DELETE PLAN CONFIRMATION */}
        <Dialog open={deletePlanOpen} onOpenChange={setDeletePlanOpen}>
          <DialogContent data-testid="delete-confirmation-dialog" className="sm:max-w-md bg-white border border-slate-250 p-6 shadow-xl rounded-xl z-[150]">
            <DialogHeader>
              <DialogTitle className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-655" /> Delete Membership Plan?
              </DialogTitle>
              <DialogDescription className="text-slate-550 text-xs mt-1">
                Are you absolutely sure you want to delete <span className="font-semibold text-slate-850">"{deletingPlan ? capitalizePlanName(deletingPlan.name) : ''}"</span>? This action is permanent.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4 gap-2">
              <Button type="button" variant="outline" onClick={() => { setDeletePlanOpen(false); setDeletingPlan(null); }} className="h-9 text-xs font-semibold hover:bg-slate-50 cursor-pointer">Cancel</Button>
              <Button type="button" onClick={handleDeletePlan} className="h-9 text-xs font-semibold bg-red-650 hover:bg-red-700 text-white cursor-pointer">Delete Plan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ============================================================== */}
        {/* DIALOGS SECTION - APP MEMBERSHIP LABELS                        */}
        {/* ============================================================== */}
        
        {/* CREATE LABEL */}
        <Dialog open={createLabelOpen} onOpenChange={setCreateLabelOpen}>
          <DialogContent data-testid="create-label-dialog" className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-white border border-slate-250 p-6 shadow-xl rounded-xl z-[100]">
            <DialogHeader>
              <DialogTitle className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                <Tag className="h-5 w-5 text-slate-550" />
                Add New Membership Label
              </DialogTitle>
              <DialogDescription className="text-slate-550 text-xs">
                Build a new membership brand label, linked plan parameters, color themes, and dynamic privileges.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateLabelSubmit} className="space-y-5 py-3">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Label Name */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="lbl-name" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Label Name</Label>
                  <Input id="lbl-name" placeholder="e.g. TK lite" value={newLabelName} onChange={(e) => setNewLabelName(e.target.value)} className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white animate-none" required />
                </div>

                {/* Linked Plan Name */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="lbl-plan" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Linked Plan Name</Label>
                  <Input id="lbl-plan" placeholder="e.g. Tk-Lite" value={newLabelPlanName} onChange={(e) => setNewLabelPlanName(e.target.value)} className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white animate-none" required />
                </div>

                {/* Plan Rate */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="lbl-rate" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Plan Rate (Text Description)</Label>
                  <Input id="lbl-rate" placeholder="e.g. Free Trial or 1000" value={newLabelRate} onChange={(e) => setNewLabelRate(e.target.value)} className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white animate-none" required />
                </div>

                {/* Duration */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="lbl-duration" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Duration (Validity Text)</Label>
                  <Input id="lbl-duration" placeholder="e.g. 15 Days or 3 months" value={newLabelDuration} onChange={(e) => setNewLabelDuration(e.target.value)} className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white animate-none" required />
                </div>

                {/* Hex Color Code with adjacent Color Preview Circle */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <Label htmlFor="lbl-hex" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Hex Color Code</Label>
                  <div className="flex items-center gap-3">
                    {/* Circle preview updates dynamically on valid input */}
                    <div 
                      className="h-10 w-10 rounded-full border border-slate-200 shadow-sm shrink-0 transition-colors duration-200"
                      style={{ backgroundColor: isHexValid(newLabelHex) ? newLabelHex : '#e2e8f0' }}
                      title="Live Color Preview"
                    />
                    <Input id="lbl-hex" placeholder="e.g. #4880FF (starts with #)" value={newLabelHex} onChange={(e) => setNewLabelHex(e.target.value)} className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white font-mono animate-none flex-1" required />
                  </div>
                  <p className="text-[10px] text-slate-450">Input a valid hex pattern (e.g. #FF5500 or #FFF) to update the circle preview.</p>
                </div>

                {/* Status Radio Buttons */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Status</Label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 text-xs text-slate-800 font-semibold cursor-pointer select-none">
                      <input type="radio" name="lbl-create-status" checked={newLabelStatus === 'active'} onChange={() => setNewLabelStatus('active')} className="h-4 w-4 accent-slate-900 cursor-pointer" />
                      Active
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-800 font-semibold cursor-pointer select-none">
                      <input type="radio" name="lbl-create-status" checked={newLabelStatus === 'inactive'} onChange={() => setNewLabelStatus('inactive')} className="h-4 w-4 accent-slate-900 cursor-pointer" />
                      Inactive
                    </label>
                  </div>
                </div>

              </div>

              {/* Form Dynamic Feature Privileges Grid */}
              <div className="pt-4 border-t border-dashed border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-450 flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5" /> Dynamic Feature Privileges Grid
                  </h4>
                  <Button type="button" variant="outline" size="sm" onClick={() => addFeatureRow(false)} className="h-8 text-[11px] border-slate-200 text-slate-800 bg-white hover:bg-slate-50 cursor-pointer">
                    <Plus className="h-3 w-3 mr-1" /> Add Feature Row
                  </Button>
                </div>

                {/* Features rows */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {newLabelFeatures.length === 0 ? (
                    <p className="text-center py-4 text-xs text-slate-400">No feature variables added. Click "Add Feature Row" to start adding privileges.</p>
                  ) : (
                    newLabelFeatures.map((feat, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg border border-slate-100 bg-slate-50/50">
                        {/* 1. Feature Key Text */}
                        <div className="col-span-5">
                          <Input placeholder="Feature Name (e.g. Daily Broadcast)" value={feat.key} onChange={(e) => updateFeatureRow(index, 'key', e.target.value, false)} className="h-9 bg-white text-xs border-slate-200 animate-none" required />
                        </div>
                        {/* 2. Type Selector Dropdown */}
                        <div className="col-span-3">
                          <Select value={feat.type} onValueChange={(val: any) => updateFeatureRow(index, 'type', val, false)}>
                            <SelectTrigger className="h-9 bg-white text-xs border-slate-200"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-white border border-slate-200 z-[120]">
                              <SelectItem value="yes">Yes</SelectItem>
                              <SelectItem value="no">No</SelectItem>
                              <SelectItem value="value">Value</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {/* 3. Value Input / Icon Display */}
                        <div className="col-span-3">
                          {feat.type === 'yes' && (
                            <span className="h-9 w-9 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto" title="Green Checkmark (Enabled)">
                              <Check className="h-4.5 w-4.5 stroke-[3.5]" />
                            </span>
                          )}
                          {feat.type === 'no' && (
                            <span className="h-9 w-9 rounded-md bg-red-50 border border-red-100 text-red-550 flex items-center justify-center mx-auto" title="Red Cross (Disabled)">
                              <X className="h-4.5 w-4.5 stroke-[3.5]" />
                            </span>
                          )}
                          {feat.type === 'value' && (
                            <Input placeholder="Limit (e.g. 5)" value={feat.value} onChange={(e) => updateFeatureRow(index, 'value', e.target.value, false)} className="h-9 bg-white text-xs border-slate-200 animate-none text-center font-mono font-bold" required />
                          )}
                        </div>
                        {/* 4. Delete Action Button */}
                        <div className="col-span-1 text-center">
                          <Button type="button" variant="outline" size="icon" onClick={() => removeFeatureRow(index, false)} className="h-9 w-9 border-slate-200 text-red-650 hover:text-red-700 hover:bg-red-50 cursor-pointer">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <DialogFooter className="pt-4 border-t border-slate-100 gap-2">
                <Button type="button" variant="outline" onClick={() => setCreateLabelOpen(false)} className="h-10 text-xs font-semibold hover:bg-slate-50 cursor-pointer">Cancel</Button>
                <Button type="submit" className="h-10 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white cursor-pointer">Save & Publish Label</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* EDIT LABEL */}
        <Dialog open={editLabelOpen} onOpenChange={setEditLabelOpen}>
          <DialogContent data-testid="edit-label-dialog" className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-white border border-slate-250 p-6 shadow-xl rounded-xl z-[100]">
            <DialogHeader>
              <DialogTitle className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-slate-550" />
                Edit Membership Label
              </DialogTitle>
              <DialogDescription className="text-slate-550 text-xs">
                Modify selected membership label settings, color profiles, and dynamic privileges.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleEditLabelSubmit} className="space-y-5 py-3">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Label Name */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-lbl-name" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Label Name</Label>
                  <Input id="edit-lbl-name" value={editLabelName} onChange={(e) => setEditLabelName(e.target.value)} className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white animate-none" required />
                </div>

                {/* Linked Plan Name */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-lbl-plan" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Linked Plan Name</Label>
                  <Input id="edit-lbl-plan" value={editLabelPlanName} onChange={(e) => setEditLabelPlanName(e.target.value)} className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white animate-none" required />
                </div>

                {/* Plan Rate */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-lbl-rate" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Plan Rate (Text Description)</Label>
                  <Input id="edit-lbl-rate" value={editLabelRate} onChange={(e) => setEditLabelRate(e.target.value)} className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white animate-none" required />
                </div>

                {/* Duration */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-lbl-duration" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Duration (Validity Text)</Label>
                  <Input id="edit-lbl-duration" value={editLabelDuration} onChange={(e) => setEditLabelDuration(e.target.value)} className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white animate-none" required />
                </div>

                {/* Hex Color Code with Preview Circle */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <Label htmlFor="edit-lbl-hex" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Hex Color Code</Label>
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-10 w-10 rounded-full border border-slate-200 shadow-sm shrink-0 transition-colors duration-200"
                      style={{ backgroundColor: isHexValid(editLabelHex) ? editLabelHex : '#e2e8f0' }}
                    />
                    <Input id="edit-lbl-hex" value={editLabelHex} onChange={(e) => setEditLabelHex(e.target.value)} className="h-10 bg-slate-50/50 border-slate-200 text-sm focus:bg-white font-mono animate-none flex-1" required />
                  </div>
                  <p className="text-[10px] text-slate-450">Input a valid hex pattern (e.g. #FF5500 or #FFF) to update the circle preview.</p>
                </div>

                {/* Status Radio Buttons */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Status</Label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 text-xs text-slate-800 font-semibold cursor-pointer select-none">
                      <input type="radio" name="lbl-edit-status" checked={editLabelStatus === 'active'} onChange={() => setEditLabelStatus('active')} className="h-4 w-4 accent-slate-900 cursor-pointer" />
                      Active
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-800 font-semibold cursor-pointer select-none">
                      <input type="radio" name="lbl-edit-status" checked={editLabelStatus === 'inactive'} onChange={() => setEditLabelStatus('inactive')} className="h-4 w-4 accent-slate-900 cursor-pointer" />
                      Inactive
                    </label>
                  </div>
                </div>

              </div>

              {/* Dynamic Feature Privileges Grid */}
              <div className="pt-4 border-t border-dashed border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-450 flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5" /> Dynamic Feature Privileges Grid
                  </h4>
                  <Button type="button" variant="outline" size="sm" onClick={() => addFeatureRow(true)} className="h-8 text-[11px] border-slate-200 text-slate-800 bg-white hover:bg-slate-50 cursor-pointer">
                    <Plus className="h-3 w-3 mr-1" /> Add Feature Row
                  </Button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {editLabelFeatures.length === 0 ? (
                    <p className="text-center py-4 text-xs text-slate-400">No feature variables added. Click "Add Feature Row" to start adding privileges.</p>
                  ) : (
                    editLabelFeatures.map((feat, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg border border-slate-100 bg-slate-50/50">
                        <div className="col-span-5">
                          <Input placeholder="Feature Name" value={feat.key} onChange={(e) => updateFeatureRow(index, 'key', e.target.value, true)} className="h-9 bg-white text-xs border-slate-200 animate-none" required />
                        </div>
                        <div className="col-span-3">
                          <Select value={feat.type} onValueChange={(val: any) => updateFeatureRow(index, 'type', val, true)}>
                            <SelectTrigger className="h-9 bg-white text-xs border-slate-200"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-white border border-slate-200 z-[120]">
                              <SelectItem value="yes">Yes</SelectItem>
                              <SelectItem value="no">No</SelectItem>
                              <SelectItem value="value">Value</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-3">
                          {feat.type === 'yes' && (
                            <span className="h-9 w-9 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                              <Check className="h-4.5 w-4.5 stroke-[3.5]" />
                            </span>
                          )}
                          {feat.type === 'no' && (
                            <span className="h-9 w-9 rounded-md bg-red-50 border border-red-100 text-red-550 flex items-center justify-center mx-auto">
                              <X className="h-4.5 w-4.5 stroke-[3.5]" />
                            </span>
                          )}
                          {feat.type === 'value' && (
                            <Input placeholder="Limit (e.g. 5)" value={feat.value} onChange={(e) => updateFeatureRow(index, 'value', e.target.value, true)} className="h-9 bg-white text-xs border-slate-200 animate-none text-center font-mono font-bold" required />
                          )}
                        </div>
                        <div className="col-span-1 text-center">
                          <Button type="button" variant="outline" size="icon" onClick={() => removeFeatureRow(index, true)} className="h-9 w-9 border-slate-200 text-red-650 hover:text-red-700 hover:bg-red-50 cursor-pointer">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Dialog Footer */}
              <DialogFooter className="pt-4 border-t border-slate-100 gap-2">
                <Button type="button" variant="outline" onClick={() => setEditLabelOpen(false)} className="h-10 text-xs font-semibold hover:bg-slate-50 cursor-pointer">Cancel</Button>
                <Button type="submit" className="h-10 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white cursor-pointer">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* DELETE LABEL CONFIRMATION */}
        <Dialog open={deleteLabelOpen} onOpenChange={setDeleteLabelOpen}>
          <DialogContent className="sm:max-w-md bg-white border border-slate-250 p-6 shadow-xl rounded-xl z-[150]">
            <DialogHeader>
              <DialogTitle className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-655" /> Delete Membership Label?
              </DialogTitle>
              <DialogDescription className="text-slate-550 text-xs mt-1">
                Are you absolutely sure you want to delete label <span className="font-semibold text-slate-850">"{deletingLabel ? deletingLabel.labelName : ''}"</span>? This will eliminate this label definitions from the system.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4 gap-2">
              <Button type="button" variant="outline" onClick={() => { setDeleteLabelOpen(false); setDeletingLabel(null); }} className="h-9 text-xs font-semibold hover:bg-slate-50 cursor-pointer">Cancel</Button>
              <Button type="button" onClick={handleDeleteLabel} className="h-9 text-xs font-semibold bg-red-650 hover:bg-red-700 text-white cursor-pointer">Delete Label</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  );
}
