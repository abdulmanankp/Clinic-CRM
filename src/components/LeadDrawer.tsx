import React from 'react';
import { useCrm } from '../context/CrmContext.tsx';
import {
  X,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Moon,
  Clock,
  ExternalLink,
  Ban,
  CheckCircle,
  Tag,
  AlertTriangle,
} from 'lucide-react';
import { LeadStatus } from '../types/crm.ts';

interface LeadDrawerProps {
  onOpenBookingModal?: (leadId: string) => void;
}

export const LeadDrawer: React.FC<LeadDrawerProps> = ({ onOpenBookingModal }) => {
  const {
    leads,
    selectedLeadId,
    setSelectedLeadId,
    conversations,
    messages,
    appointments,
    treatments,
    setSelectedConversationId,
    setActiveTab,
    updateLead,
    showToast,
  } = useCrm();

  if (!selectedLeadId) return null;

  const lead = leads.find((l) => l.id === selectedLeadId);
  if (!lead) return null;

  const conv = conversations.find((c) => c.lead_id === lead.id);
  const leadMessages = conv
    ? messages
        .filter((m) => m.conversation_id === conv.id)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    : [];

  const leadAppts = appointments.filter((a) => a.lead_id === lead.id);

  const statuses: { id: LeadStatus; label: string; color: string }[] = [
    { id: 'new', label: 'New', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { id: 'engaged', label: 'Engaged', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { id: 'booked', label: 'Booked', color: 'bg-teal-50 text-teal-700 border-teal-200' },
    { id: 'visited', label: 'Visited', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { id: 'no_show', label: 'No Show', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    { id: 'lost', label: 'Lost', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  ];

  const handleStatusChange = async (newStatus: LeadStatus) => {
    await updateLead(lead.id, { status: newStatus });
  };

  const handleToggleOptOut = async () => {
    await updateLead(lead.id, { opted_out: !lead.opted_out });
    showToast(lead.opted_out ? 'Patient opted back in' : 'Patient marked as Opted Out', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
              {lead.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-800">{lead.name}</h2>
                {lead.language === 'ar' && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded">
                    العربية
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono">{lead.phone}</p>
            </div>
          </div>

          <button
            onClick={() => setSelectedLeadId(null)}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            {conv && (
              <button
                onClick={() => {
                  setSelectedConversationId(conv.id);
                  setActiveTab('inbox');
                  setSelectedLeadId(null);
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Open in Inbox</span>
              </button>
            )}

            <button
              onClick={() => {
                if (onOpenBookingModal) {
                  onOpenBookingModal(lead.id);
                } else {
                  setActiveTab('appointments');
                  setSelectedLeadId(null);
                }
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 shadow-xs"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </button>
          </div>

          {/* Status Progression */}
          <div>
            <label className="text-xs font-bold text-slate-700 mb-2 block">Pipeline Status</label>
            <div className="grid grid-cols-3 gap-1.5">
              {statuses.map((st) => (
                <button
                  key={st.id}
                  onClick={() => handleStatusChange(st.id)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                    lead.status === st.id
                      ? `${st.color} font-bold ring-2 ring-indigo-500 shadow-2xs`
                      : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Key Attributes */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Patient Attributes</h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Emirates / National ID</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {lead.national_id || 'Not registered'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Email Address</span>
                <span className="font-semibold text-slate-800 truncate block">
                  {lead.email || 'No email on file'}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[11px]">Residential Address / Area</span>
                <span className="font-semibold text-slate-800 block">
                  {lead.address || 'Dubai Marina, UAE (Default)'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Primary Channel</span>
                <span className="font-semibold text-slate-800 capitalize">{lead.channel_first}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Source</span>
                <span className="font-semibold text-slate-800">{lead.source || 'Direct Intake'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Treatment Interest</span>
                <span className="font-semibold text-slate-800 truncate block">
                  {lead.treatment_interest || 'General'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">First Response Speed</span>
                <span className="font-semibold text-emerald-600">
                  {lead.first_response_seconds ? `${lead.first_response_seconds}s` : 'Pending reply'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">After-Hours Lead?</span>
                <span className="font-semibold text-slate-800 flex items-center space-x-1">
                  {lead.after_hours ? (
                    <>
                      <Moon className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="text-indigo-600">Yes (Captured outside hours)</span>
                    </>
                  ) : (
                    <span>No (During working hours)</span>
                  )}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Marketing Consent</span>
                <span className="font-semibold text-slate-800">
                  {lead.consent_at ? `Given ${new Date(lead.consent_at).toLocaleDateString()}` : 'Implied by intake'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
              <span className="text-xs text-slate-600">Opt-out of automated SMS/WhatsApp</span>
              <button
                onClick={handleToggleOptOut}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors ${
                  lead.opted_out
                    ? 'bg-rose-50 text-rose-700 border-rose-300'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {lead.opted_out ? 'Opted Out' : 'Active (Subscribed)'}
              </button>
            </div>
          </div>

          {/* Appointments History */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Appointments ({leadAppts.length})
            </h4>
            {leadAppts.length === 0 ? (
              <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-200">
                No appointments booked yet.
              </p>
            ) : (
              <div className="space-y-2">
                {leadAppts.map((appt) => {
                  const trt = treatments.find((t) => t.id === appt.treatment_id);
                  const isPast = new Date(appt.start_at).getTime() < Date.now();
                  return (
                    <div
                      key={appt.id}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{trt?.name || 'Consultation'}</p>
                        <p className="text-slate-500 text-[11px]">
                          {new Date(appt.start_at).toLocaleString([], {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </p>
                        {appt.notes && <p className="text-[11px] text-slate-600 italic mt-0.5">"{appt.notes}"</p>}
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          appt.status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-800'
                            : appt.status === 'completed'
                            ? 'bg-blue-50 text-blue-800'
                            : appt.status === 'no_show'
                            ? 'bg-rose-50 text-rose-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {appt.status.replace('_', ' ')}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Conversation Preview */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Recent Message Log ({leadMessages.length})
            </h4>
            {leadMessages.length === 0 ? (
              <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-200">
                No message transcript recorded.
              </p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {leadMessages.slice(-6).map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-2.5 rounded-xl text-xs ${
                      msg.sender === 'patient'
                        ? 'bg-slate-100 text-slate-900'
                        : 'bg-teal-50 text-teal-900 border border-teal-200'
                    }`}
                  >
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold mb-0.5">
                      <span>{msg.sender === 'patient' ? lead.name : msg.sender === 'ai' ? 'AI Triage' : 'Staff'}</span>
                      <span>
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="leading-snug">{msg.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
