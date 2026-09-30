import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext.tsx';
import {
  ClockAlert,
  Send,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Calendar,
  Filter,
  Check,
  Ban,
  ArrowRight,
} from 'lucide-react';
import { FollowupStatus, FollowupType } from '../types/crm.ts';

export const FollowupsView: React.FC = () => {
  const { followups, leads, triggerFollowup, setSelectedLeadId } = useCrm();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'sent' | 'skipped' | 'failed'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredFollowups = followups.filter((f) => {
    if (statusFilter !== 'all' && f.status !== statusFilter) return false;
    if (typeFilter !== 'all' && f.type !== typeFilter) return false;
    return true;
  });

  const getTypeBadge = (type: FollowupType) => {
    switch (type) {
      case 'reminder_24h':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">24h Reminder</span>;
      case 'reminder_2h':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">2h Urgent Reminder</span>;
      case 'post_visit':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Post-Visit (+3h)</span>;
      case 'no_booking_1':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">No-Booking Nudge 1</span>;
      case 'no_booking_2':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800">No-Booking Nudge 2</span>;
      case 'noshow_reschedule':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">No-Show Reschedule</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Automated Rules Overview */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <ClockAlert className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Follow-ups</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated reminders, post-visit check-ins & rebooking nudges
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold">
            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200">
              {followups.filter((f) => f.status === 'pending').length} Pending
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
              {followups.filter((f) => f.status === 'sent').length} Sent
            </span>
          </div>
        </div>

        {/* 4 Automated Trigger Rules explanation */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4 text-xs">
          <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100">
            <p className="font-bold text-teal-900 flex items-center space-x-1">
              <span>📅</span>
              <span>1. Reminders</span>
            </p>
            <p className="text-[11px] text-teal-800/80 mt-1">
              Sent 24h & 2h before appointment. Skipped on cancel.
            </p>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <p className="font-bold text-emerald-900 flex items-center space-x-1">
              <span>🌟</span>
              <span>2. Post-Visit</span>
            </p>
            <p className="text-[11px] text-emerald-800/80 mt-1">
              Sent 3h after visit for satisfaction check-in.
            </p>
          </div>

          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
            <p className="font-bold text-amber-900 flex items-center space-x-1">
              <span>💬</span>
              <span>3. Unbooked Nudges</span>
            </p>
            <p className="text-[11px] text-amber-800/80 mt-1">
              Sent 24h & 72h if not booked. Max 2.
            </p>
          </div>

          <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100">
            <p className="font-bold text-rose-900 flex items-center space-x-1">
              <span>🔄</span>
              <span>4. No-Show Recovery</span>
            </p>
            <p className="text-[11px] text-rose-800/80 mt-1">
              Sent 1h after missed slot to reschedule.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center space-x-1 text-xs font-semibold">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All ({followups.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === 'pending' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Pending ({followups.filter((f) => f.status === 'pending').length})
          </button>
          <button
            onClick={() => setStatusFilter('sent')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === 'sent' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Sent ({followups.filter((f) => f.status === 'sent').length})
          </button>
          <button
            onClick={() => setStatusFilter('skipped')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === 'skipped' ? 'bg-slate-700 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Skipped ({followups.filter((f) => f.status === 'skipped').length})
          </button>
        </div>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="all">All Followup Types</option>
          <option value="reminder_24h">24h Reminder</option>
          <option value="reminder_2h">2h Urgent Reminder</option>
          <option value="post_visit">Post-Visit (+3h)</option>
          <option value="no_booking_1">No-Booking 1 (24h)</option>
          <option value="no_booking_2">No-Booking 2 (72h)</option>
          <option value="noshow_reschedule">No-Show Recovery</option>
        </select>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Due Date & Time</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Trigger Type</th>
                <th className="py-3 px-4">Template Name</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredFollowups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No followups in this queue filter.
                  </td>
                </tr>
              ) : (
                filteredFollowups.map((fol) => {
                  const lead = leads.find((l) => l.id === fol.lead_id);
                  const isDuePast = new Date(fol.due_at).getTime() <= Date.now();

                  return (
                    <tr key={fol.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">
                          {new Date(fol.due_at).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-slate-400 font-mono text-[11px]">
                          {new Date(fol.due_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        {fol.status === 'pending' && isDuePast && (
                          <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                            Due Now
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <p
                          className="font-bold text-teal-800 hover:underline cursor-pointer"
                          onClick={() => lead && setSelectedLeadId(lead.id)}
                        >
                          {lead?.name || 'Unknown Patient'}
                        </p>
                        <p className="text-slate-400 font-mono text-[11px]">{lead?.phone}</p>
                      </td>

                      <td className="py-3 px-4">{getTypeBadge(fol.type)}</td>

                      <td className="py-3 px-4">
                        <code className="text-[11px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                          {fol.template_name}
                        </code>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            fol.status === 'sent'
                              ? 'bg-emerald-100 text-emerald-800'
                              : fol.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : fol.status === 'skipped'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {fol.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {fol.status === 'pending' && (
                            <>
                              <button
                                onClick={() => triggerFollowup(fol.id, 'sent')}
                                className="px-2.5 py-1 text-[11px] font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs transition-colors flex items-center space-x-1"
                                title="Dispatch message via n8n worker"
                              >
                                <Send className="w-3 h-3" />
                                <span>Send Now</span>
                              </button>
                              <button
                                onClick={() => triggerFollowup(fol.id, 'skipped')}
                                className="px-2 py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                              >
                                Skip
                              </button>
                            </>
                          )}

                          {fol.status === 'sent' && (
                            <span className="text-[11px] text-emerald-600 font-semibold flex items-center space-x-1">
                              <Check className="w-3.5 h-3.5" />
                              <span>Delivered</span>
                            </span>
                          )}

                          {fol.status === 'skipped' && (
                            <span className="text-[11px] text-slate-400">Skipped by Rule</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
