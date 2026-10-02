import React from 'react';
import { useCrm } from '../context/CrmContext.tsx';
import {
  Bell,
  Mail,
  Plus,
  Clock,
  Sparkles,
  Globe,
} from 'lucide-react';

interface TopBarProps {
  onOpenBookingModal?: () => void;
  onGoToLanding?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenBookingModal, onGoToLanding }) => {
  const { activeTab, setActiveTab, conversations } = useCrm();

  const unreadMessagesCount = conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0);
  const handoversCount = conversations.filter((c) => c.mode === 'human').length;

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard';
      case 'inbox':
        return 'Live Inbox';
      case 'leads':
        return 'Leads Pipeline';
      case 'appointments':
        return 'Appointments';
      case 'followups':
        return 'Follow-ups Queue';
      case 'settings':
        return 'Settings & Integrations';
      case 'users':
        return 'User Management';
      case 'widget-preview':
        return 'Website Chat Widget';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="flex items-center justify-between pb-4 sm:pb-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800">
          {getPageTitle()}
        </h1>
      </div>

      {/* Top Right Notification & Action Controls (matching image) */}
      <div className="flex items-center space-x-3">
        {/* Messages Icon with Badge */}
        <button
          onClick={() => setActiveTab('inbox')}
          className="relative p-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80 shadow-2xs transition-colors"
          title="Live Inbox"
        >
          <Mail className="w-4 h-4 text-slate-600" />
          {unreadMessagesCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
              {unreadMessagesCount}
            </span>
          )}
        </button>

        {/* Notification Bell with Badge */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className="relative p-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80 shadow-2xs transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4 text-slate-600" />
          {handoversCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
              {handoversCount}
            </span>
          )}
        </button>

        {/* Homepage Navigation Button */}
        {onGoToLanding && (
          <button
            onClick={onGoToLanding}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200/80 shadow-2xs transition-colors cursor-pointer"
            title="View Public Homepage & Features"
          >
            <Globe className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden md:inline">Homepage</span>
          </button>
        )}

        {/* Quick New Booking Button */}
        {onOpenBookingModal && (
          <button
            onClick={onOpenBookingModal}
            className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Booking</span>
          </button>
        )}
      </div>
    </div>
  );
};
