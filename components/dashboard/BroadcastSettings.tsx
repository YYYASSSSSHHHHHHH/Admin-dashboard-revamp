'use client';

import { useState, Fragment } from 'react';
import { ChevronDown, ChevronUp, SlidersHorizontal, Check } from 'lucide-react';
import { toast } from 'sonner';

const INVENTORY_SETTINGS: Record<string, string[]> = {
  'Stainless Steel': ['Circle', 'Plate', 'Pipe', 'Sheet', 'Coil', 'Strip'],
  'Mobile': ['Iphone', 'Samsung', 'Google Pixel', 'OnePlus', 'Xiaomi', 'Oppo'],
  'Components': ['Motherboard', 'Memory', 'Processor', 'Graphic Card', 'SSD', 'PSU'],
  'Aluminium': ['Sheet', 'Extrusion', 'Ingot', 'Foil', 'Plate', 'Rod'],
  'Server': ['Hard Drive', 'Rack', 'CPU', 'Power Supply', 'RAM', 'Chassis'],
  'PC': ['Monitor', 'Keyboard', 'Mouse', 'UPS', 'Speaker', 'Webcam'],
  'Laptop': ['Display', 'Battery', 'Keyboard', 'Touchpad', 'Charger', 'RAM'],
};

const SETTINGS_CATEGORIES = [
  { id: 'cat-1', name: 'Stainless Steel', displayName: '1. Stainless Steel', available: INVENTORY_SETTINGS['Stainless Steel'] },
  { id: 'cat-2', name: 'Mobile', displayName: '2. Mobile', available: INVENTORY_SETTINGS['Mobile'] },
  { id: 'cat-3', name: 'Components', displayName: '3. Components', available: INVENTORY_SETTINGS['Components'] },
  { id: 'cat-4', name: 'Aluminium', displayName: '4. Aluminium', available: INVENTORY_SETTINGS['Aluminium'] },
  { id: 'cat-5', name: 'Server', displayName: '5. Server', available: INVENTORY_SETTINGS['Server'] },
  { id: 'cat-6', name: 'PC', displayName: '6. PC', available: INVENTORY_SETTINGS['PC'] },
  { id: 'cat-7', name: 'Laptop', displayName: '7. Laptop', available: INVENTORY_SETTINGS['Laptop'] },
];

export function BroadcastSettings() {
  const [expandedSettingsIds, setExpandedSettingsIds] = useState<Record<string, boolean>>({});
  const [categorySettings, setCategorySettings] = useState<Record<string, string[]>>({
    'Stainless Steel': ['Circle', 'Plate'],
    'Mobile': ['Iphone', 'Samsung', 'Google Pixel'],
    'Components': ['Motherboard', 'Memory'],
    'Aluminium': ['Sheet'],
    'Server': ['Hard Drive', 'Rack'],
    'PC': ['Monitor', 'Keyboard'],
    'Laptop': ['Display', 'Battery'],
  });

  const toggleSettingsExpand = (id: string) => {
    const isExpanding = !expandedSettingsIds[id];
    setExpandedSettingsIds((prev) => ({ ...prev, [id]: !prev[id] }));

    if (isExpanding) {
      setTimeout(() => {
        const el = document.getElementById(`settings-row-expand-${id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 150);
    }
  };

  const handleToggleSubcategory = (category: string, sub: string) => {
    setCategorySettings((prev) => {
      const current = prev[category] || [];
      const updated = current.includes(sub) ? current.filter((s) => s !== sub) : [...current, sub];
      toast.success(current.includes(sub) ? `Removed ${sub} from ${category}` : `Added ${sub} to ${category}`);
      return { ...prev, [category]: updated };
    });
  };

  const handleSelectAllCategory = (category: string, allSelected: boolean) => {
    setCategorySettings((prev) => ({
      ...prev,
      [category]: allSelected ? [] : [...INVENTORY_SETTINGS[category]],
    }));
    toast.success(allSelected ? `Deselected all subcategories under ${category}` : `Selected all subcategories under ${category}`);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 border-b border-slate-100">
            <th className="px-6 py-3">CATEGORY NAME</th>
            <th className="px-6 py-3">CURRENTLY ACTIVE SUBCATEGORIES</th>
            <th className="px-6 py-3">SUBSCRIPTION RATIO</th>
            <th className="px-6 py-3 text-right">CONFIGURE</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {SETTINGS_CATEGORIES.map((c) => {
            const isExpanded = !!expandedSettingsIds[c.id];
            const selected = categorySettings[c.name] || [];
            const allSelected = selected.length === c.available.length;

            return (
              <Fragment key={c.id}>
                <tr
                  className="hover:bg-slate-50/50 transition-all duration-300 cursor-pointer"
                  onClick={() => toggleSettingsExpand(c.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                    {c.displayName}
                  </td>
                  <td className="px-6 py-4 text-slate-900 font-normal">
                    {selected.length === 0 ? (
                      <span className="text-slate-400 font-normal italic">None Selected</span>
                    ) : (
                      <span className="truncate max-w-[280px] block">{selected.join(', ')}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${allSelected
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : selected.length === 0
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                      {selected.length} of {c.available.length} Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <button
                      className="text-slate-500 hover:text-slate-900 font-medium inline-flex items-center gap-1.5 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSettingsExpand(c.id);
                      }}
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </td>
                </tr>

                <tr
                  id={`settings-row-expand-${c.id}`}
                  className={`bg-slate-50/50 transition-all duration-300 ${isExpanded ? 'border-t border-slate-100' : 'border-none'}`}
                >
                  <td colSpan={4} className="p-0">
                    <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                      <div className="overflow-hidden">
                        <div className="px-8 py-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div className="space-y-4 pr-6 border-r border-slate-200/80">
                            <div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Quick Management</div>
                              <h4 className="text-sm font-semibold text-slate-900">{c.name} Feed Scope</h4>
                              <p className="text-xs text-slate-500 mt-1 leading-relaxed">Mass configure and toggle feed parameters. Outbound notifications will trigger only for checked feeds.</p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectAllCategory(c.name, allSelected);
                              }}
                              className="text-xs font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-white shadow-sm transition-colors cursor-pointer w-full justify-center"
                            >
                              {allSelected ? 'Deselect All Feeds' : 'Select All Feeds'}
                            </button>
                          </div>
                          <div className="md:col-span-2 space-y-3">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subcategory Feeds Inventory</div>
                            <div className="flex flex-wrap gap-2 pt-1">
                              {c.available.map((sub) => {
                                const isChecked = selected.includes(sub);
                                return (
                                  <button
                                    key={sub}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleSubcategory(c.name, sub);
                                    }}
                                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-200 inline-flex items-center gap-1.5 cursor-pointer select-none ${isChecked ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-slate-50 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border-slate-200/80'
                                      }`}
                                  >
                                    {isChecked && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
                                    {sub}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
