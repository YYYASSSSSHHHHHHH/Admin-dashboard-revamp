'use client';

import { useState, useEffect } from 'react';
import { SlidersHorizontal, MapPin, Briefcase, Ruler, UserCog, CircleSlash } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  SetupSection,
  SetupDialog,
  SetupDeleteDialog,
  withSetupMeta,
  type SetupItem,
} from '@/components/dashboard/MasterSetupUI';
import { toast } from 'sonner';

type TabType = 'address-title' | 'business-type' | 'uom' | 'designation' | 'inactive-status';

interface TabConfig {
  key: TabType;
  title: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  testidPrefix: string;
}

const TABS: TabConfig[] = [
  {
    key: 'address-title',
    title: 'Address Labels',
    label: 'Address Label',
    icon: MapPin,
    testidPrefix: 'address-label',
  },
  {
    key: 'business-type',
    title: 'Business Types',
    label: 'Business Type',
    icon: Briefcase,
    testidPrefix: 'business-type',
  },
  {
    key: 'uom',
    title: 'UOM',
    label: 'UOM',
    icon: Ruler,
    testidPrefix: 'uom',
  },
  {
    key: 'designation',
    title: 'Designation',
    label: 'Designation',
    icon: UserCog,
    testidPrefix: 'designation',
  },
  {
    key: 'inactive-status',
    title: 'Inactive Status',
    label: 'Inactive Status',
    icon: CircleSlash,
    testidPrefix: 'inactive-status',
  },
];

export default function FieldSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('address-title');
  const [items, setItems] = useState<SetupItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [setupMode, setSetupMode] = useState<'add' | 'edit'>('add');
  const [setupEditing, setSetupEditing] = useState<SetupItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SetupItem | null>(null);

  const activeTabConfig = TABS.find((t) => t.key === activeTab)!;

  useEffect(() => {
    const fetchFieldSettings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/field-settings?tab=${activeTab}`);
        if (response.ok) {
          const data = await response.json();
          setItems(data.map((item: SetupItem) => withSetupMeta(item)));
        }
      } catch (error) {
        console.error('Failed to fetch field settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFieldSettings();
  }, [activeTab]);

  const openSetupAdd = () => {
    setSetupMode('add');
    setSetupEditing(null);
    setSetupDialogOpen(true);
  };

  const openSetupEdit = (item: SetupItem) => {
    setSetupMode('edit');
    setSetupEditing(item);
    setSetupDialogOpen(true);
  };

  const handleSetupSave = async ({ name, status }: { name: string; status?: string }) => {
    const isEdit = setupMode === 'edit';
    const payload = {
      name,
      status: status || 'Active',
      updatedOn: new Date().toISOString(),
    };

    try {
      const url = isEdit
        ? `/api/field-settings/${activeTab}/${setupEditing?.id}`
        : `/api/field-settings/${activeTab}`;
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const savedItem = withSetupMeta(await res.json());

      setItems((prev) =>
        isEdit ? prev.map((x) => (x.id === setupEditing?.id ? { ...x, ...savedItem } : x)) : [savedItem, ...prev],
      );
      toast.success(`${activeTabConfig.label} ${isEdit ? 'updated' : 'added'} successfully.`);
      setSetupDialogOpen(false);
    } catch {
      toast.error('Failed to save setting');
    }
  };

  const confirmSetupDelete = async () => {
    if (!deleteTarget) return;
    try {
      await fetch(`/api/field-settings/${activeTab}/${deleteTarget.id}`, { method: 'DELETE' });
      setItems((prev) => prev.filter((x) => x.id !== deleteTarget.id));
      toast.success(`${activeTabConfig.label} deleted.`);
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete setting');
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 w-full" data-testid="master-setup-page">
        <div className="flex items-start gap-4 mb-6">
          <div className="h-11 w-11 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
            <SlidersHorizontal className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Configuration
            </div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900 mt-1">
              Master Setup
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Maintain the reference data used by member profiles, addresses, company classifications,
              units of measure, designations, and inactive-status reasons.
            </p>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TabType)}
          className="w-full"
        >
          <TabsList
            data-testid="master-setup-tabs"
            className="bg-white border border-slate-200 p-1 h-auto flex flex-wrap gap-1 w-full justify-start"
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.key}
                  data-testid={`tab-${tab.key}`}
                  value={tab.key}
                  className="gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white px-4 py-2 text-sm"
                >
                  <Icon className="h-4 w-4" />
                  {tab.title}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {TABS.map((tab) => (
            <TabsContent key={tab.key} value={tab.key} className="mt-6">
              <SetupSection
                testidPrefix={tab.testidPrefix}
                itemLabel={tab.label}
                items={tab.key === activeTab ? items : []}
                isLoading={tab.key === activeTab && isLoading}
                showStatus
                showUpdatedOn
                onAdd={openSetupAdd}
                onEdit={openSetupEdit}
                onDelete={setDeleteTarget}
              />
            </TabsContent>
          ))}
        </Tabs>

        <SetupDialog
          open={setupDialogOpen}
          onOpenChange={setSetupDialogOpen}
          mode={setupMode}
          itemLabel={activeTabConfig.label}
          initial={setupEditing}
          showStatus
          onSave={handleSetupSave}
          testidPrefix={activeTabConfig.testidPrefix}
        />

        <SetupDeleteDialog
          open={!!deleteTarget}
          itemName={deleteTarget?.name}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmSetupDelete}
        />
      </div>
    </DashboardLayout>
  );
}
