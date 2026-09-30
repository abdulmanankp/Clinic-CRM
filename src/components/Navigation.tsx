import React from 'react';
import { useCrm } from '../context/CrmContext.tsx';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  CalendarCheck,
  ClockAlert,
  Settings,
  BotMessageSquare,
  Lock,
  UserCheck,
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    conversations,
    leads,
    appointments,
    followups,
    currentUser,
    showToast,
  } = useCrm();

  const unreadCount = conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0);
  const pendingFollowups = followups.filter((f) => f.status === 'pending').length;
  const activeAppointments = appointments.filter((a) => a.status === 'confirmed').length;
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super_admin';
  const isSuperAdmin = currentUser.role === 'super_admin';

  const navItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'inbox' as const,
      label: 'Inbox',
      icon: MessageSquare,
      count: unreadCount > 0 ? unreadCount : undefined,
      countHighlight: true,
    },
    {
      id: 'leads' as const,
      label: 'Leads',
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
      roleTag: !isAdmin ? 'Admin' : currentUser.role === 'super_admin' ? 'Super' : undefined,
    },
    ...(isSuperAdmin
      ? [
          {
            id: 'users' as const,
            label: 'Users',
            icon: UserCheck,
          },
        ]
      : []),
    {
      id: 'widget-preview' as const,
      label: 'Widget',
      icon: BotMessageSquare,
      accent: true,
    },
  ];

  const handleItemClick = (item: (typeof navItems)[number]) => {
    if (item.locked) {
      showToast('Settings are restricted to Admin and Super Admin accounts.', 'info');
      return;
    }
    setActiveTab(item.id);
  };

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-6 overflow-x-auto py-0 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`flex items-center space-x-2 py-3 px-1 border-b-2 text-xs sm:text-sm whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-teal-700 text-teal-900 font-bold'
                    : item.locked
                    ? 'border-transparent text-slate-300 hover:text-slate-400 cursor-not-allowed'
                    : item.accent
                    ? 'border-transparent text-teal-700 hover:text-teal-900 font-medium'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300 font-medium'
                }`}
              >
                {item.locked ? (
                  <Lock className="w-3.5 h-3.5 text-slate-300" />
                ) : (
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-700' : 'text-slate-400'}`} />
                )}
                <span>{item.label}</span>

                {item.count !== undefined && (
                  <span
                    className={`ml-1 text-[11px] font-semibold ${
                      item.countHighlight
                        ? 'text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded-full font-bold'
                        : 'text-slate-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}

                {item.roleTag && (
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider ml-1">
                    ({item.roleTag})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
