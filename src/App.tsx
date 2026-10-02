import React, { useState, useEffect } from 'react';
import { CrmProvider, useCrm } from './context/CrmContext.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { TopBar } from './components/TopBar.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { Inbox } from './components/Inbox.tsx';
import { LeadsView } from './components/LeadsView.tsx';
import { AppointmentsView } from './components/AppointmentsView.tsx';
import { FollowupsView } from './components/FollowupsView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { UsersManagementView } from './components/UsersManagementView.tsx';
import { WidgetView } from './components/WidgetView.tsx';
import { NewAppointmentModal } from './components/NewAppointmentModal.tsx';
import { LoginScreen } from './components/LoginScreen.tsx';
import { ExternalLink } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { activeTab, loading, toastMessage, isAuthenticated } = useCrm();
  const [bookingModalLeadId, setBookingModalLeadId] = useState<string | null>(null);

  // Reset window and container scroll whenever tab changes so screen is always at the top
  useEffect(() => {
    window.scrollTo(0, 0);
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.scrollTop = 0;
  }, [activeTab]);

  // Direct standalone widget route
  if (typeof window !== 'undefined' && window.location.pathname === '/widget') {
    return (
      <div className="h-screen w-full bg-[#f6f8fc] flex items-center justify-center p-2 sm:p-4 overflow-hidden">
        <WidgetView />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#f6f8fc] flex items-center justify-center">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-600">Loading Clinic Flow Portal...</p>
        </div>
      </div>
    );
  }

  // Authentication Gate: show LoginScreen if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        {toastMessage && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-2xl text-xs font-bold text-white shadow-xl transition-all ${
              toastMessage.type === 'error'
                ? 'bg-rose-500'
                : toastMessage.type === 'info'
                ? 'bg-indigo-600'
                : 'bg-emerald-600'
            }`}
          >
            {toastMessage.text}
          </div>
        )}
        <LoginScreen />
      </>
    );
  }

  return (
    <div className="h-screen w-full bg-[#f6f8fc] flex flex-col md:flex-row overflow-hidden font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-2xl text-xs font-bold text-white shadow-xl transition-all ${
            toastMessage.type === 'error'
              ? 'bg-rose-500'
              : toastMessage.type === 'info'
              ? 'bg-indigo-600'
              : 'bg-emerald-600'
          }`}
        >
          {toastMessage.text}
        </div>
      )}

      {/* Left Sidebar - Full Screen Height */}
      <Sidebar />

      {/* Main Viewport Workspace - Full Screen Height with Clean Scroll */}
      <main className="flex-1 h-full min-h-0 bg-[#f6f8fc] p-3 sm:p-5 lg:p-6 flex flex-col overflow-hidden">
        {/* Top Bar with Page Title and Global Actions */}
        <TopBar onOpenBookingModal={() => setBookingModalLeadId('new')} />

        {/* Dynamic Tab Body: Inbox is full-height fit-to-screen, other views have dedicated smooth scroll */}
        {activeTab === 'inbox' ? (
          <div className="flex-1 min-h-0 h-full flex flex-col overflow-hidden">
            <Inbox />
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto pb-8 pr-1">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'leads' && (
              <LeadsView onOpenBookingModal={(leadId) => setBookingModalLeadId(leadId)} />
            )}
            {activeTab === 'appointments' && <AppointmentsView />}
            {activeTab === 'followups' && <FollowupsView />}
            {activeTab === 'settings' && <SettingsView />}
            {activeTab === 'users' && <UsersManagementView />}

            {/* Widget Preview Tab */}
            {activeTab === 'widget-preview' && (
              <div className="space-y-4 max-w-4xl mx-auto">
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-800">Website Chat Widget (/widget)</h2>
                    <p className="text-xs text-slate-400">English & Arabic with RTL. Tested with /web-chat-proxy</p>
                  </div>

                  <a
                    href="/widget"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-xs"
                  >
                    <span>Open in Tab</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="flex justify-center p-4 sm:p-8 bg-slate-100/60 rounded-3xl border border-dashed border-slate-200">
                  <WidgetView />
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Global Booking Modal */}
      {bookingModalLeadId && (
        <NewAppointmentModal
          isOpen={Boolean(bookingModalLeadId)}
          onClose={() => setBookingModalLeadId(null)}
          preselectedLeadId={bookingModalLeadId === 'new' ? undefined : bookingModalLeadId}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <CrmProvider>
      <MainAppContent />
    </CrmProvider>
  );
}
