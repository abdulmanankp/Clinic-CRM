import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext.tsx';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  CalendarCheck,
  ClockAlert,
  Settings,
  BotMessageSquare,
  UserCheck,
  ChevronRight,
  ChevronDown,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Lock,
  LogOut,
} from 'lucide-react';
import { UserRole } from '../types/crm.ts';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    conversations,
    leads,
    appointments,
    followups,
    currentUser,
    setCurrentUser,
    logout,
    staffUsers,
    simulateEnquiry,
    resetDemoData,
    showToast,
  } = useCrm();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSimMenu, setShowSimMenu] = useState(false);
  const [simulating, setSimulating] = useState(false);

  if (!currentUser) {
    return null;
  }

  const unreadCount = conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0);
  const pendingFollowups = followups.filter((f) => f.status === 'pending').length;
  const activeAppointments = appointments.filter((a) => a.status === 'confirmed').length;
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super_admin';
  const isSuperAdmin = currentUser.role === 'super_admin';

  const scenarios = [
    { id: 1, title: 'Whitening (10:40 PM)', desc: 'After-hours price enquiry' },
    { id: 2, title: 'Botox Units & Price', desc: 'Allergan botox quote' },
    { id: 3, title: 'فيلر شفايف (Arabic)', desc: 'Arabic lip filler query' },
    { id: 4, title: 'Invisalign Scan', desc: '3D scan consultation' },
    { id: 5, title: 'Reschedule Request', desc: 'Time change request' },
    { id: 6, title: 'Urgent Handover', desc: 'Clinical emergency triage' },
  ];

  const handleSimulate = async (id: number) => {
    setSimulating(true);
    setShowSimMenu(false);
    await simulateEnquiry(id);
    setSimulating(false);
  };

  const navItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'inbox' as const,
      label: 'Live Inbox',
      icon: MessageSquare,
      count: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      id: 'leads' as const,
      label: 'Leads Pipeline',
      icon: Users,
      count: leads.length,
    },
    {
      id: 'appointments' as const,
      label: 'Appointments',
      icon: CalendarCheck,
      count: activeAppointments,
    },
    {
      id: 'followups' as const,
      label: 'Follow-ups',
      icon: ClockAlert,
      count: pendingFollowups > 0 ? pendingFollowups : undefined,
    },
    {
      id: 'settings' as const,
      label: 'Settings',
      icon: Settings,
      locked: !isAdmin,
      roleTag: !isAdmin ? 'Admin' : undefined,
    },
    ...(isSuperAdmin
      ? [
          {
            id: 'users' as const,
            label: 'Users & Roles',
            icon: UserCheck,
          },
        ]
      : []),
    {
      id: 'widget-preview' as const,
      label: 'Website Widget',
      icon: BotMessageSquare,
    },
  ];

  const handleNavClick = (item: (typeof navItems)[number]) => {
    if (item.locked) {
      showToast('Settings are restricted to Admin and Super Admin accounts.', 'info');
      return;
    }
    setActiveTab(item.id);
  };

  const formatRole = (role: UserRole) => {
    if (role === 'super_admin') return 'Super Admin';
    if (role === 'admin') return 'Admin';
    return 'Staff';
  };

  return (
    <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-between py-6 px-4 flex-shrink-0">
      <div className="space-y-6">
        {/* User Profile Header (like the uploaded image) */}
        <div className="relative text-center pb-4 border-b border-slate-100">
          <div className="relative inline-block">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150'}
              alt={currentUser.name}
              className="w-16 h-16 rounded-full mx-auto object-cover ring-4 ring-slate-100/80 shadow-sm"
            />
            <span className="absolute bottom-0 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>

          {/* Switch User Dropdown Trigger */}
          <div className="mt-2.5">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="inline-flex items-center space-x-1 text-slate-800 font-bold text-sm hover:text-indigo-600 transition-colors"
            >
              <span>{currentUser.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <p className="text-[11px] text-slate-400 font-medium">
              {formatRole(currentUser.role)} · Dubai, UAE
            </p>
          </div>

          {/* User Role Switcher Dropdown */}
          {showUserDropdown && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 text-left">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                Switch Role / Profile
              </p>
              {staffUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    setCurrentUser(u);
                    setShowUserDropdown(false);
                    showToast(`Active profile: ${u.name} (${formatRole(u.role)})`, 'info');
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors ${
                    currentUser.id === u.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <img src={u.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                    <div className="truncate">
                      <p className="truncate font-semibold">{u.name}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{formatRole(u.role)}</p>
                    </div>
                  </div>
                  {currentUser.id === u.id && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                </button>
              ))}

              <div className="pt-1 mt-1 border-t border-slate-100">
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    logout();
                  }}
                  className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 transition-colors font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Menu (exactly matching the image layout) */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-[#f0f3fd] text-[#4f46e5] font-bold shadow-xs'
                    : item.locked
                    ? 'text-slate-300 hover:text-slate-400 cursor-not-allowed'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {item.locked ? (
                    <Lock className="w-4 h-4 text-slate-300" />
                  ) : (
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#4f46e5]' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  )}
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center space-x-1.5">
                  {item.count !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-[#4f46e5] text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                  {item.roleTag && (
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                      {item.roleTag}
                    </span>
                  )}
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-[#4f46e5]' : 'text-slate-300 group-hover:translate-x-0.5'}`} />
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Simulator & Controls */}
      <div className="pt-4 border-t border-slate-100 space-y-2">
        {/* Simulate Enquiry Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSimMenu(!showSimMenu)}
            disabled={simulating}
            className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-between border border-slate-200/80 transition-colors"
          >
            <span className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>{simulating ? 'Simulating...' : 'Simulate Enquiry'}</span>
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showSimMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-50 max-h-60 overflow-y-auto">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                Demo Patient Queries
              </p>
              {scenarios.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => handleSimulate(sc.id)}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-indigo-50 hover:text-indigo-900 transition-colors flex items-center space-x-2"
                >
                  <span className="w-4 h-4 rounded bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                    {sc.id}
                  </span>
                  <div className="truncate">
                    <p className="font-semibold text-slate-800 text-[11px] truncate">{sc.title}</p>
                    <p className="text-[10px] text-slate-400 truncate">{sc.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reset Data */}
        <button
          onClick={resetDemoData}
          className="w-full py-1.5 px-3 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 font-medium text-[11px] flex items-center justify-center space-x-1.5 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset Demo Data</span>
        </button>

        {/* Secure Log Out Button */}
        <button
          onClick={logout}
          className="w-full py-2 px-3 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50/60 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log Out</span>
        </button>

        <p className="text-center text-[10px] text-slate-300 font-mono">
          Demo Clinic · Dubai Marina
        </p>
      </div>
    </aside>
  );
};
