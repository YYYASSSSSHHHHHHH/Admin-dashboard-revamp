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

  // Closed by default, opens dynamically
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    billing: false,
    communication: false,
    request: false,
    settings: false,
  });

  // Track the active nested sub-route to drive active parent headers
  const [activeRoute, setActiveRoute] = useState<string>('');

  // Expand parent accordions on initial mount if path matches a child
  useEffect(() => {
    if (pathname) {
      setActiveRoute(pathname);
      if (pathname === '/plans' || pathname === '/membership-label' || pathname === '/invoices') {
        setOpenSections((prev) => ({ ...prev, billing: true }));
      }
    }
  }, [pathname]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSubLinkClick = (href: string) => {
    setActiveRoute(href);
  };

  // Main direct routes (Dashboard, Members) turn black when matched
  const getLinkClass = (href: string) => {
    const isActive = activeRoute === href || (href !== '/' && activeRoute.startsWith(href));
    return `flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all duration-150 cursor-pointer ${isActive
        ? 'bg-slate-900 text-white font-semibold shadow-sm'
        : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900 font-medium'
      }`;
  };

  // Dropdown section helper: checks if any of its children are currently active
  const isSectionActive = (section: string) => {
    if (section === 'billing') {
      return activeRoute === '/plans' || activeRoute === '/membership-label' || activeRoute === '/invoices';
    }
    if (section === 'communication') {
      return activeRoute === '/send-email' || activeRoute === '/broadcast-history';
    }
    if (section === 'request') {
      return activeRoute === '#call-request' || activeRoute === '#contact-request';
    }
    if (section === 'settings') {
      return activeRoute === '#field-setting' || activeRoute === '#templates';
    }
    return false;
  };

  // Dropdown parent header class: turns black ONLY if a child inside it is active
  const getHeaderClass = (section: string) => {
    const isActive = isSectionActive(section);
    return `w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all duration-150 cursor-pointer ${isActive
        ? 'bg-slate-900 text-white font-semibold shadow-sm'
        : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900 font-medium'
      }`;
  };

  // Child sub-link class: active turns soft dark tint with bold text
  const getSubLinkClass = (href: string) => {
    const isActive = activeRoute === href;
    return `flex items-center gap-2.5 py-1.5 px-3 rounded-md text-[11px] transition-all duration-150 cursor-pointer ${isActive
        ? 'bg-slate-900/5 text-slate-950 font-semibold border-l-2 border-slate-900 rounded-l-none pl-2.5'
        : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50/70 font-medium'
      }`;
  };

  return (
    <aside
      data-testid="sidebar"
      className="hidden lg:flex w-[240px] shrink-0 h-screen sticky top-0 flex-col bg-white border-r border-slate-200/80 shadow-[1px_0_4px_rgba(0,0,0,0.01)]"
    >
      {/* Brand Header */}
      <div className="px-5 py-6 border-b border-slate-100/80">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="font-display font-bold text-slate-900 text-sm tracking-tight leading-tight">
              Northgate
            </div>
            <div className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase mt-0.5">
              Marketplace Admin
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links Scroll Area */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1.5 overflow-y-auto select-none">

        {/* Workspace Category Title */}
        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 px-3 mb-1">
          Navigation
        </div>

        {/* Dashboard */}
        <Link
          href="/"
          onClick={() => handleSubLinkClick('/')}
          className={getLinkClass('/')}
          data-testid="sidebar-dashboard"
        >
          <LayoutDashboard className="h-4 w-4 shrink-0" />
          <span>Dashboard</span>
        </Link>

        {/* Members */}
        <Link
          href="/members"
          onClick={() => handleSubLinkClick('/members')}
          className={getLinkClass('/members')}
          data-testid="sidebar-members"
        >
          <Users className="h-4 w-4 shrink-0" />
          <span>Members</span>
        </Link>

        {/* Members & Billing Collapsible Accordion */}
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
              <ChevronDown className={`h-3.5 w-3.5 ${isSectionActive('billing') ? 'text-white' : 'text-slate-455'}`} />
            ) : (
              <ChevronRight className={`h-3.5 w-3.5 ${isSectionActive('billing') ? 'text-white' : 'text-slate-400'}`} />
            )}
          </button>

          {/* Children items with tree line vertical border styling */}
          <div
            className={`pl-4 ml-5 border-l border-slate-100 space-y-1.5 overflow-hidden transition-all duration-350 ease-in-out ${
              openSections.billing ? 'max-h-40 py-1.5 opacity-100' : 'max-h-0 py-0 opacity-0 pointer-events-none'
            }`}
          >
            <Link
              href="/plans"
              onClick={() => handleSubLinkClick('/plans')}
              className={getSubLinkClass('/plans')}
              data-testid="sub-membership-plans"
            >
              <Package className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span>Membership Plans</span>
            </Link>
            <Link
              href="/membership-label"
              onClick={() => handleSubLinkClick('/membership-label')}
              className={getSubLinkClass('/membership-label')}
              data-testid="sub-membership-label"
            >
              <Tag className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span>App Membership Label</span>
            </Link>
            <Link
              href="/invoices"
              onClick={() => handleSubLinkClick('/invoices')}
              className={getSubLinkClass('/invoices')}
              data-testid="sub-invoices"
            >
              <FileText className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span>Invoice</span>
            </Link>
          </div>
        </div>

        {/* Communication Collapsible Accordion */}
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
              <ChevronDown className={`h-3.5 w-3.5 ${isSectionActive('communication') ? 'text-white' : 'text-slate-455'}`} />
            ) : (
              <ChevronRight className={`h-3.5 w-3.5 ${isSectionActive('communication') ? 'text-white' : 'text-slate-400'}`} />
            )}
          </button>

          <div
            className={`pl-4 ml-5 border-l border-slate-100 space-y-1.5 overflow-hidden transition-all duration-350 ease-in-out ${openSections.communication ? 'max-h-32 py-1.5 opacity-100' : 'max-h-0 py-0 opacity-0 pointer-events-none'
              }`}
          >
            <Link
              href="/send-email"
              onClick={() => handleSubLinkClick('/send-email')}
              className={getSubLinkClass('/send-email')}
              data-testid="sub-send-email"
            >
              <Send className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span>Send Email Notification</span>
            </Link>
            <Link
              href="/broadcast-history"
              onClick={() => handleSubLinkClick('/broadcast-history')}
              className={getSubLinkClass('/broadcast-history')}
              data-testid="sub-broadcast-history"
            >
              <Radio className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span>Broadcast History</span>
            </Link>
          </div>
        </div>

        {/* Request Collapsible Accordion */}
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
              <ChevronDown className={`h-3.5 w-3.5 ${isSectionActive('request') ? 'text-white' : 'text-slate-455'}`} />
            ) : (
              <ChevronRight className={`h-3.5 w-3.5 ${isSectionActive('request') ? 'text-white' : 'text-slate-400'}`} />
            )}
          </button>

          <div
            className={`pl-4 ml-5 border-l border-slate-100 space-y-1.5 overflow-hidden transition-all duration-350 ease-in-out ${openSections.request ? 'max-h-32 py-1.5 opacity-100' : 'max-h-0 py-0 opacity-0 pointer-events-none'
              }`}
          >
            <Link
              href="#"
              onClick={() => handleSubLinkClick('#call-request')}
              className={getSubLinkClass('#call-request')}
              data-testid="sub-call-request"
            >
              <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span>Call Request</span>
            </Link>
            <Link
              href="#"
              onClick={() => handleSubLinkClick('#contact-request')}
              className={getSubLinkClass('#contact-request')}
              data-testid="sub-contact-request"
            >
              <Contact className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span>Contact Request</span>
            </Link>
          </div>
        </div>

        {/* Settings Collapsible Accordion */}
        <div className="space-y-0.5 mt-1">
          <button
            onClick={() => toggleSection('settings')}
            className={getHeaderClass('settings')}
          >
            <div className="flex items-center gap-3">
              <SettingsIcon className={`h-4 w-4 shrink-0 ${isSectionActive('settings') ? 'text-white' : 'text-slate-500'}`} />
              <span>Settings</span>
            </div>
            {openSections.settings ? (
              <ChevronDown className={`h-3.5 w-3.5 ${isSectionActive('settings') ? 'text-white' : 'text-slate-455'}`} />
            ) : (
              <ChevronRight className={`h-3.5 w-3.5 ${isSectionActive('settings') ? 'text-white' : 'text-slate-400'}`} />
            )}
          </button>

          <div
            className={`pl-4 ml-5 border-l border-slate-100 space-y-1.5 overflow-hidden transition-all duration-350 ease-in-out ${openSections.settings ? 'max-h-32 py-1.5 opacity-100' : 'max-h-0 py-0 opacity-0 pointer-events-none'
              }`}
          >
            <Link
              href="#"
              onClick={() => handleSubLinkClick('#field-setting')}
              className={getSubLinkClass('#field-setting')}
              data-testid="sub-field-setting"
            >
              <Sliders className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span>Field Setting</span>
            </Link>
            <Link
              href="#"
              onClick={() => handleSubLinkClick('#templates')}
              className={getSubLinkClass('#templates')}
              data-testid="sub-templates"
            >
              <FileCode className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span>Templates</span>
            </Link>
          </div>
        </div>

      </nav>

      {/* User Footer Profile */}
      <div className="px-4 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50/80 transition-colors cursor-default">
          <div className="h-8 w-8 rounded-full bg-slate-950 text-white flex items-center justify-center text-xs font-semibold shadow-sm border border-slate-900/10">
            OC
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-slate-900 truncate">
              Olivia Chen
            </div>
            <div className="text-[10px] font-semibold text-slate-400 truncate tracking-wide mt-0.5">ADMIN</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
