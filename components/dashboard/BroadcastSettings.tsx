'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Monitor,
  Laptop,
  Server,
  Network,
  Smartphone,
  HardDrive,
  Cable,
  Printer,
  Lock,
  Check,
  Info,
  Radio,
  CircleSlash,
} from 'lucide-react';
import { toast } from 'sonner';

interface BroadcastCategory {
  id: string;
  name: string;
  icon: keyof typeof ICON_MAP;
  status: 'Active' | 'Inactive';
}

interface BroadcastSettingsProps {
  memberId: string;
  memberName: string;
}

const ICON_MAP = {
  Monitor,
  Laptop,
  Server,
  Network,
  Smartphone,
  HardDrive,
  Cable,
  Printer,
};

function CategoryCard({
  category,
  subscribed,
  onToggle,
}: {
  category: BroadcastCategory;
  subscribed: boolean;
  onToggle: (id: string) => void;
}) {
  const Icon = ICON_MAP[category.icon] || Radio;
  const isInactive = category.status === 'Inactive';

  const handleClick = () => {
    if (isInactive) {
      if (!subscribed) {
        toast.error('This category has been disabled by the system administrator.');
      }
      return;
    }
    onToggle(category.id);
  };

  return (
    <button
      type="button"
      data-testid={`broadcast-category-${category.id}`}
      data-subscribed={subscribed ? 'true' : 'false'}
      data-inactive={isInactive ? 'true' : 'false'}
      onClick={handleClick}
      disabled={isInactive && !subscribed}
      aria-pressed={subscribed}
      className={`group relative flex flex-col items-center justify-center gap-2 px-4 py-4 rounded-xl border transition-all duration-200 text-center min-w-[112px] ${
        isInactive
          ? subscribed
            ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
            : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-70'
          : subscribed
            ? 'bg-slate-900 text-white border-slate-900 shadow-sm hover:bg-slate-800'
            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-900 hover:shadow-sm cursor-pointer'
      }`}
    >
      {isInactive && (
        <span
          data-testid={`broadcast-category-${category.id}-lock`}
          className="absolute top-2 right-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-amber-100 text-amber-700 border border-amber-200"
          title="Disabled by administrator"
        >
          <Lock className="h-2.5 w-2.5" />
        </span>
      )}

      {subscribed && !isInactive && (
        <span className="absolute top-2 right-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-white text-slate-900 border border-white">
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
      )}

      <div
        className={`h-10 w-10 rounded-lg flex items-center justify-center ${
          isInactive
            ? 'bg-slate-100 text-slate-400'
            : subscribed
              ? 'bg-white/10 text-white'
              : 'bg-slate-50 text-slate-600 group-hover:bg-slate-100'
        }`}
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <div className="text-sm font-medium leading-tight">{category.name}</div>
      {isInactive ? (
        <span
          data-testid={`broadcast-category-${category.id}-badge`}
          className="text-[10px] font-semibold uppercase tracking-wider text-amber-700"
        >
          Inactive
        </span>
      ) : (
        <span
          className={`text-[10px] font-semibold uppercase tracking-wider ${
            subscribed ? 'text-white/80' : 'text-slate-400'
          }`}
        >
          {subscribed ? 'Subscribed' : 'Available'}
        </span>
      )}
    </button>
  );
}

export function BroadcastSettings({ memberId, memberName }: BroadcastSettingsProps) {
  const [categories, setCategories] = useState<BroadcastCategory[]>([]);
  const [subscriptions, setSubscriptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch(`/api/broadcast-settings?memberId=${memberId}`);
        if (!response.ok) throw new Error('Failed to fetch broadcast settings');
        const data = await response.json();
        setCategories(data.categories || []);
        setSubscriptions(data.subscriptions || []);
      } catch (error) {
        console.error('Failed to fetch broadcast settings:', error);
        toast.error('Failed to load broadcast settings');
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [memberId]);

  const sortedCategories = useMemo(() => {
    const active = categories.filter((category) => category.status === 'Active');
    const inactive = categories.filter((category) => category.status !== 'Active');
    return [...active, ...inactive];
  }, [categories]);

  const subscribedSet = useMemo(() => new Set(subscriptions), [subscriptions]);

  const subscribedCategories = useMemo(
    () => categories.filter((category) => subscribedSet.has(category.id)),
    [categories, subscribedSet]
  );

  const activeSubscribedCount = useMemo(
    () => subscribedCategories.filter((category) => category.status === 'Active').length,
    [subscribedCategories]
  );

  const activeCategoriesCount = categories.filter((category) => category.status === 'Active').length;

  const saveSubscriptions = async (next: string[], message: string) => {
    const previous = subscriptions;
    setSubscriptions(next);

    try {
      const response = await fetch('/api/broadcast-settings/subscriptions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, subscriptions: next }),
      });
      if (!response.ok) throw new Error('Failed to save broadcast subscriptions');
      toast.success(message);
    } catch (error) {
      setSubscriptions(previous);
      console.error('Failed to save broadcast subscriptions:', error);
      toast.error('Failed to save broadcast settings');
    }
  };

  const handleToggle = (id: string) => {
    const isSubscribed = subscribedSet.has(id);
    const category = categories.find((item) => item.id === id);
    const next = isSubscribed
      ? subscriptions.filter((subscription) => subscription !== id)
      : [...subscriptions, id];

    saveSubscriptions(
      next,
      isSubscribed ? `Unsubscribed from ${category?.name}` : `Subscribed to ${category?.name}`
    );
  };

  const handleUnsubscribeFromList = (id: string, isInactive: boolean) => {
    if (isInactive) {
      toast.error('This category has been disabled by the system administrator.');
      return;
    }
    handleToggle(id);
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-sm text-slate-500 shadow-sm">
        Loading broadcast settings...
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="broadcast-setting-tab">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-display text-lg font-semibold text-slate-900">
                Broadcast Categories
              </h3>
            </div>
            <p className="text-sm text-slate-500">
              Choose which broadcast categories <span className="font-medium text-slate-700">{memberName}</span> should receive. Changes save automatically.
            </p>
          </div>
          <div
            data-testid="broadcast-subscription-count"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold"
          >
            <span className="tabular-nums">{activeSubscribedCount}</span>
            <span className="text-white/60">/</span>
            <span className="tabular-nums">{activeCategoriesCount}</span>
            <span className="text-white/80 font-medium ml-1">Categories</span>
          </div>
        </div>

        <div
          data-testid="broadcast-categories-grid"
          className="flex flex-wrap gap-3"
        >
          {sortedCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              subscribed={subscribedSet.has(category.id)}
              onToggle={handleToggle}
            />
          ))}
        </div>

        <div className="mt-5 flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-50/60 border border-amber-100 text-amber-800">
          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <p className="text-xs">
            Inactive categories are disabled by the system administrator and cannot be modified.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-base font-semibold text-slate-900">
              Active Subscriptions
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Categories this member currently receives broadcasts from.
            </p>
          </div>
          <span
            data-testid="broadcast-subscribed-count"
            className="text-xs font-semibold text-slate-500 tabular-nums"
          >
            {subscribedCategories.length} subscribed
          </span>
        </div>

        {subscribedCategories.length === 0 ? (
          <div
            data-testid="broadcast-empty-state"
            className="flex flex-col items-center justify-center py-10 text-center"
          >
            <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
              <CircleSlash className="h-4 w-4" />
            </div>
            <p className="text-sm font-medium text-slate-700">
              No active subscriptions
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Pick a category above to start receiving broadcasts.
            </p>
          </div>
        ) : (
          <ul
            data-testid="broadcast-subscribed-list"
            className="divide-y divide-slate-100"
          >
            {subscribedCategories.map((category) => {
              const Icon = ICON_MAP[category.icon] || Radio;
              const isInactive = category.status !== 'Active';
              return (
                <li
                  key={category.id}
                  data-testid={`broadcast-subscribed-${category.id}`}
                  className="flex items-center gap-3 py-3"
                >
                  <div
                    className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                      isInactive
                        ? 'bg-slate-100 text-slate-400'
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div
                        className={`text-sm font-medium ${
                          isInactive ? 'text-slate-500' : 'text-slate-900'
                        }`}
                      >
                        {category.name}
                      </div>
                      {isInactive && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                          <Lock className="h-2.5 w-2.5" />
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {isInactive
                        ? 'Locked - disabled by administrator.'
                        : 'Active - receiving broadcasts.'}
                    </div>
                  </div>
                  <button
                    type="button"
                    data-testid={`broadcast-unsubscribe-${category.id}`}
                    onClick={() => handleUnsubscribeFromList(category.id, isInactive)}
                    disabled={isInactive}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-md border transition-colors ${
                      isInactive
                        ? 'border-slate-200 text-slate-400 cursor-not-allowed'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Unsubscribe
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
