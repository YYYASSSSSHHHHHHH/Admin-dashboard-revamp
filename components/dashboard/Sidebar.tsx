'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Package,
  Tag,
  FileText,
  MessageSquare,
  Send,
  Radio,
  ClipboardList,
  Phone,
  Contact,
  Settings as SettingsIcon,
  Sliders,
  FileCode,
  Sparkles,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    billing: false,
    communication: false,
    request: false,
    settings: false,
  });

  const [activeRoute, setActiveRoute] = useState<string>('');

  useEffect(() => {
    if (pathname) {
      setActiveRoute(pathname);
      if (pathname === '/plans' || pathname === '/membership-label' || pathname === '/invoices') {
        setOpenSections((prev) => ({ ...prev, billing: true }));
      }
      if (pathname === '/call-request' || pathname === '/contact-request') {
        setOpenSections((prev) => ({ ...prev, request: true }));
      }
      if (pathname === '/field-setting' || pathname === '/templates') {
        setOpenSections((prev) => ({ ...prev, settings: true }));
      }
    }
  }, [pathname]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSubLinkClick = (href: string) => {
    setActiveRoute(href);
  };

  const getLinkClass = (href: string) => {
    const isActive = activeRoute === href || (href !== '/' && activeRoute.startsWith(href));
    return `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${isActive
      ? 'bg-slate-900 text-white font-semibold shadow-sm'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
      }`;
  };

  const isSectionActive = (section: string) => {
    if (section === 'billing') {
      return activeRoute === '/plans' || activeRoute === '/membership-label' || activeRoute === '/invoices';
    }
    if (section === 'communication') {
      return activeRoute === '/send-email' || activeRoute === '/broadcast-history';
    }
    if (section === 'request') {
      return activeRoute === '/call-request' || activeRoute === '/contact-request';
    }
    if (section === 'settings') {
      return activeRoute === '/field-setting' || activeRoute === '/templates';
    }
    return false;
  };

  const getHeaderClass = (section: string) => {
    const isActive = isSectionActive(section);
    return `w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${isActive
      ? 'bg-slate-900 text-white font-semibold shadow-sm'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
      }`;
  };

  const getSubLinkClass = (href: string) => {
    const isActive = activeRoute === href;
    return `flex items-center gap-3 py-2 px-3 rounded-lg text-sm transition-all duration-200 cursor-pointer ${isActive
      ? 'bg-slate-900/5 text-slate-950 font-semibold border-l-2 border-slate-900 rounded-l-none pl-2.5'
      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
      }`;
  };

  return (
    <aside
      data-testid="sidebar"
      className="hidden lg:flex w-[240px] shrink-0 h-screen sticky top-0 flex-col bg-white border-r border-slate-200"
    >
      <div className="px-5 py-6 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="font-display font-semibold text-slate-900 leading-tight">
              Northgate
            </div>
            <div className="text-[11px] text-slate-500 leading-tight">
              Marketplace Admin
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto select-none">

        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 px-3 mb-2">
          Workspace
        </div>

        <Link
          href="/"
          onClick={() => handleSubLinkClick('/')}
          className={getLinkClass('/')}
          data-testid="sidebar-dashboard"
        >
          <LayoutDashboard className={`h-4 w-4 shrink-0 ${activeRoute === '/' ? 'text-white' : 'text-slate-500'}`} />
          <span className="font-medium">Dashboard</span>
        </Link>

        <Link
          href="/members"
          onClick={() => handleSubLinkClick('/members')}
          className={getLinkClass('/members')}
          data-testid="sidebar-members"
        >
          <Users className={`h-4 w-4 shrink-0 ${activeRoute === '/members' || activeRoute.startsWith('/members/') ? 'text-white' : 'text-slate-500'}`} />
          <span className="font-medium">Members</span>
        </Link>

        <div className="space-y-0.5">
          <button
            onClick={() => toggleSection('billing')}
            className={getHeaderClass('billing')}
          >
            <div className="flex items-center gap-3">
              <CreditCard className={`h-4 w-4 shrink-0 ${isSectionActive('billing') ? 'text-white' : 'text-slate-500'}`} />
              <span>Members & Billing</span>
            </div>
            {openSections.billing ? (
              <ChevronDown className={`h-4 w-4 ${isSectionActive('billing') ? 'text-white' : 'text-slate-500'}`} />
            ) : (
              <ChevronRight className={`h-4 w-4 ${isSectionActive('billing') ? 'text-white' : 'text-slate-500'}`} />
            )}
          </button>

          <div
            className={`pl-4 ml-5 border-l border-slate-100 space-y-1 overflow-hidden transition-all duration-350 ease-in-out ${openSections.billing ? 'max-h-48 py-1.5 opacity-100' : 'max-h-0 py-0 opacity-0 pointer-events-none'
              }`}
          >
            <Link
              href="/plans"
              onClick={() => handleSubLinkClick('/plans')}
              className={getSubLinkClass('/plans')}
              data-testid="sub-membership-plans"
            >
              <Package className="h-4 w-4 shrink-0 text-slate-500" />
              <span>Membership Plans</span>
            </Link>
            <Link
              href="/membership-label"
              onClick={() => handleSubLinkClick('/membership-label')}
              className={getSubLinkClass('/membership-label')}
              data-testid="sub-membership-label"
            >
              <Tag className="h-4 w-4 shrink-0 text-slate-500" />
              <span>App Membership Label</span>
            </Link>
            <Link
              href="/invoices"
              onClick={() => handleSubLinkClick('/invoices')}
              className={getSubLinkClass('/invoices')}
              data-testid="sub-invoices"
            >
              <FileText className="h-4 w-4 shrink-0 text-slate-500" />
              <span>Invoice</span>
            </Link>
          </div>
        </div>

        <div className="space-y-0.5 mt-1">
          <button
            onClick={() => toggleSection('communication')}
            className={getHeaderClass('communication')}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className={`h-4 w-4 shrink-0 ${isSectionActive('communication') ? 'text-white' : 'text-slate-500'}`} />
              <span>Communication</span>
            </div>
            {openSections.communication ? (
              <ChevronDown className={`h-4 w-4 ${isSectionActive('communication') ? 'text-white' : 'text-slate-500'}`} />
            ) : (
              <ChevronRight className={`h-4 w-4 ${isSectionActive('communication') ? 'text-white' : 'text-slate-500'}`} />
            )}
          </button>

          <div
            className={`pl-4 ml-5 border-l border-slate-100 space-y-1 overflow-hidden transition-all duration-350 ease-in-out ${openSections.communication ? 'max-h-40 py-1.5 opacity-100' : 'max-h-0 py-0 opacity-0 pointer-events-none'
              }`}
          >
            <Link
              href="/send-email"
              onClick={() => handleSubLinkClick('/send-email')}
              className={getSubLinkClass('/send-email')}
              data-testid="sub-send-email"
            >
              <Send className="h-4 w-4 shrink-0 text-slate-500" />
              <span>Send Email Notification</span>
            </Link>
            <Link
              href="/broadcast-history"
              onClick={() => handleSubLinkClick('/broadcast-history')}
              className={getSubLinkClass('/broadcast-history')}
              data-testid="sub-broadcast-history"
            >
              <Radio className="h-4 w-4 shrink-0 text-slate-500" />
              <span>Broadcast History</span>
            </Link>
          </div>
        </div>

        <div className="space-y-0.5 mt-1">
          <button
            onClick={() => toggleSection('request')}
            className={getHeaderClass('request')}
          >
            <div className="flex items-center gap-3">
              <ClipboardList className={`h-4 w-4 shrink-0 ${isSectionActive('request') ? 'text-white' : 'text-slate-500'}`} />
              <span>Request</span>
            </div>
            {openSections.request ? (
              <ChevronDown className={`h-4 w-4 ${isSectionActive('request') ? 'text-white' : 'text-slate-500'}`} />
            ) : (
              <ChevronRight className={`h-4 w-4 ${isSectionActive('request') ? 'text-white' : 'text-slate-500'}`} />
            )}
          </button>

          <div
            className={`pl-4 ml-5 border-l border-slate-100 space-y-1 overflow-hidden transition-all duration-350 ease-in-out ${openSections.request ? 'max-h-40 py-1.5 opacity-100' : 'max-h-0 py-0 opacity-0 pointer-events-none'
              }`}
          >
            <Link
              href="/call-request"
              onClick={() => handleSubLinkClick('/call-request')}
              className={getSubLinkClass('/call-request')}
              data-testid="sub-call-request"
            >
              <Phone className="h-4 w-4 shrink-0 text-slate-500" />
              <span>Call Request</span>
            </Link>
            <Link
              href="/contact-request"
              onClick={() => handleSubLinkClick('/contact-request')}
              className={getSubLinkClass('/contact-request')}
              data-testid="sub-contact-request"
            >
              <Contact className="h-4 w-4 shrink-0 text-slate-500" />
              <span>Contact Request</span>
            </Link>
          </div>
        </div>

        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 px-3 mt-6 mb-2">
          System
        </div>

        <div className="space-y-0.5">
          <button
            onClick={() => toggleSection('settings')}
            className={getHeaderClass('settings')}
          >
            <div className="flex items-center gap-3">
              <SettingsIcon className={`h-4 w-4 shrink-0 ${isSectionActive('settings') ? 'text-white' : 'text-slate-500'}`} />
              <span>Settings</span>
            </div>
            {openSections.settings ? (
              <ChevronDown className={`h-4 w-4 ${isSectionActive('settings') ? 'text-white' : 'text-slate-500'}`} />
            ) : (
              <ChevronRight className={`h-4 w-4 ${isSectionActive('settings') ? 'text-white' : 'text-slate-500'}`} />
            )}
          </button>

          <div
            className={`pl-4 ml-5 border-l border-slate-100 space-y-1 overflow-hidden transition-all duration-350 ease-in-out ${openSections.settings ? 'max-h-36 py-1.5 opacity-100' : 'max-h-0 py-0 opacity-0 pointer-events-none'
              }`}
          >
            <Link
              href="/field-setting"
              onClick={() => handleSubLinkClick('/field-setting')}
              className={getSubLinkClass('/field-setting')}
              data-testid="sub-field-setting"
            >
              <Sliders className="h-4 w-4 shrink-0 text-slate-500" />
              <span>Master Setup</span>
            </Link>
            <Link
              href="/templates"
              onClick={() => handleSubLinkClick('/templates')}
              className={getSubLinkClass('/templates')}
              data-testid="sub-templates"
            >
              <FileCode className="h-4 w-4 shrink-0 text-slate-500" />
              <span>Templates</span>
            </Link>
          </div>
        </div>

      </nav>

      <div className="px-4 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-default">
          <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-semibold border border-slate-200">
            OC
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-slate-900 truncate">
              Olivia Chen
            </div>
            <div className="text-xs text-slate-500 truncate">Admin</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
