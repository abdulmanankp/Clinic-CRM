import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext.tsx';
import {
  Sparkles,
  RefreshCw,
  Play,
  ShieldAlert,
  Radio,
  ChevronDown,
  UserCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    settings,
    currentUser,
    setCurrentUser,
    staffUsers,
    simulateEnquiry,
    resetDemoData,
    toastMessage,
    activeTab,
    setActiveTab,
  } = useCrm();

  const [simulating, setSimulating] = useState(false);
  const [showSimMenu, setShowSimMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const scenarios = [
    { id: 1, title: 'Whitening (10:40 PM)', desc: 'After-hours price enquiry' },
    { id: 2, title: 'Botox Units & Price', desc: 'Allergan botox quote' },
    { id: 3, title: 'فيلر شفايف (Arabic)', desc: 'Arabic lip filler query' },
    { id: 4, title: 'Invisalign Scan', desc: '3D scan consultation' },
    { id: 5, title: 'Reschedule', desc: 'Time change request' },
    { id: 6, title: 'Urgent Handover', desc: 'Clinical emergency triage' },
  ];

  const handleSimulate = async (id: number) => {
    setSimulating(true);
    setShowSimMenu(false);
    await simulateEnquiry(id);
    setSimulating(false);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'admin':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const formatRole = (role: string) => {
    if (role === 'super_admin') return 'Super Admin';
    if (role === 'admin') return 'Admin';
    return 'Staff';
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Toast notification banner */}
      {toastMessage && (
        <div
          className={`px-4 py-1.5 text-xs font-semibold text-center transition-all ${
            toastMessage.type === 'error'
              ? 'bg-rose-500 text-white'
              : toastMessage.type === 'info'
              ? 'bg-teal-700 text-white'
              : 'bg-emerald-600 text-white'
          }`}
        >
          {toastMessage.text}
        </div>
      )}

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo & Clinic Info */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center text-white font-bold text-xs shadow-2xs tracking-wider">
              CF
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-slate-900 tracking-tight">Clinic Flow</span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-500 font-medium">Demo Clinic</span>
              </div>
            </div>
          </div>

          {/* Quick Actions & Demo Controls */}
          <div className="flex items-center space-x-2">
            {/* Simulate Enquiry Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSimMenu(!showSimMenu);
                  setShowUserMenu(false);
                }}
                disabled={simulating}
                className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulate</span>
                <ChevronDown className="w-3 h-3 opacity-80" />
              </button>

              {showSimMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50">
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Sample Inquiries</p>
                  </div>
                  <div className="py-1 max-h-64 overflow-y-auto">
                    {scenarios.map((sc) => (
                      <button
                        key={sc.id}
                        onClick={() => handleSimulate(sc.id)}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-teal-50 transition-colors flex items-center space-x-2"
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
                </div>
              )}
            </div>

            {/* Reset Demo Data button */}
            <button
              onClick={resetDemoData}
              className="inline-flex items-center space-x-1 px-2 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
              title="Reset data"
            >
              <RefreshCw className="w-3 h-3 text-slate-500" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            {/* Staff User Switcher */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowSimMenu(false);
                }}
                className="flex items-center space-x-2 p-1 rounded-lg hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-200"
                />
                <div className="hidden sm:block text-left text-xs leading-none">
                  <p className="font-bold text-slate-800 text-[11px]">{currentUser.name.split(' ')[0]}</p>
                  <span
                    className={`inline-block mt-0.5 px-1 py-0.2 rounded text-[9px] font-extrabold border ${getRoleBadge(
                      currentUser.role
                    )}`}
                  >
                    {formatRole(currentUser.role)}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                  <div className="px-3 py-1 border-b border-slate-100">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Switch User Role</p>
                  </div>
                  {staffUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        setCurrentUser(user);
                        setShowUserMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        currentUser.id === user.id ? 'bg-teal-50 text-teal-900 font-semibold' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <img src={user.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                        <div>
                          <p className="text-xs font-semibold leading-tight">{user.name}</p>
                          <span
                            className={`inline-block text-[9px] font-bold px-1 rounded ${getRoleBadge(
                              user.role
                            )}`}
                          >
                            {formatRole(user.role)}
                          </span>
                        </div>
                      </div>
                      {currentUser.id === user.id && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
