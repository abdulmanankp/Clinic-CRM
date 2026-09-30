import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext.tsx';
import {
  Search,
  Filter,
  Kanban,
  Table as TableIcon,
  Moon,
  MessageCircle,
  Calendar,
  ChevronRight,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Channel, LeadStatus, Lead } from '../types/crm.ts';
import { LeadDrawer } from './LeadDrawer.tsx';

interface LeadsViewProps {
  onOpenBookingModal?: (leadId: string) => void;
}

export const LeadsView: React.FC<LeadsViewProps> = ({ onOpenBookingModal }) => {
  const { leads, setSelectedLeadId, updateLead, treatments, showToast } = useCrm();

  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [treatmentFilter, setTreatmentFilter] = useState<string>('all');
  const [afterHoursOnly, setAfterHoursOnly] = useState(false);

  // Status Columns definition
  const columns: { id: LeadStatus; label: string; color: string; badgeBg: string }[] = [
    { id: 'new', label: 'New Enquiries', color: 'border-blue-400', badgeBg: 'bg-blue-100 text-blue-800' },
    { id: 'engaged', label: 'Engaged', color: 'border-purple-400', badgeBg: 'bg-purple-100 text-purple-800' },
    { id: 'booked', label: 'Appointment Booked', color: 'border-teal-500', badgeBg: 'bg-teal-100 text-teal-800' },
    { id: 'visited', label: 'Attended / Visited', color: 'border-emerald-500', badgeBg: 'bg-emerald-100 text-emerald-800' },
    { id: 'no_show', label: 'No Show', color: 'border-rose-400', badgeBg: 'bg-rose-100 text-rose-800' },
    { id: 'lost', label: 'Lost / Opt-Out', color: 'border-slate-300', badgeBg: 'bg-slate-200 text-slate-700' },
  ];

  // Filtering
  const filteredLeads = leads.filter((l) => {
    if (search) {
      const q = search.toLowerCase();
      const matchName = l.name.toLowerCase().includes(q);
      const matchPhone = l.phone.includes(q);
      if (!matchName && !matchPhone) return false;
    }
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    if (channelFilter !== 'all' && l.channel_first !== channelFilter) return false;
    if (treatmentFilter !== 'all' && l.treatment_interest !== treatmentFilter) return false;
    if (afterHoursOnly && !l.after_hours) return false;
    return true;
  });

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: LeadStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain');
    if (leadId) {
      await updateLead(leadId, { status: targetStatus });
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & View Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="engaged">Engaged</option>
            <option value="booked">Booked</option>
            <option value="visited">Visited</option>
            <option value="no_show">No Show</option>
            <option value="lost">Lost</option>
          </select>

          {/* Channel Filter */}
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Channels</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="web">Website Widget</option>
            <option value="instagram">Instagram</option>
          </select>

          {/* Treatment Filter */}
          <select
            value={treatmentFilter}
            onChange={(e) => setTreatmentFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 max-w-[170px] truncate"
          >
            <option value="all">All Treatments</option>
            {treatments.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>

          {/* After Hours Checkbox */}
          <label className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-200/50 transition-colors">
            <input
              type="checkbox"
              checked={afterHoursOnly}
              onChange={(e) => setAfterHoursOnly(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <Moon className="w-3.5 h-3.5 text-indigo-600" />
            <span>After-Hours Only</span>
          </label>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Kanban className="w-3.5 h-3.5 text-teal-700" />
            <span>Kanban Pipeline</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5 text-teal-700" />
            <span>Table View</span>
          </button>
        </div>
      </div>

      {/* KANBAN PIPELINE VIEW */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 items-start overflow-x-auto pb-4">
          {columns.map((col) => {
            const colLeads = filteredLeads.filter((l) => l.status === col.id);

            return (
              <div
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                className="bg-slate-100/70 border border-slate-200 rounded-2xl p-3 min-h-[500px] flex flex-col"
              >
                {/* Column Header */}
                <div className={`pb-2.5 mb-2.5 border-b-2 flex items-center justify-between ${col.color}`}>
                  <span className="text-xs font-bold text-slate-800">{col.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${col.badgeBg}`}>
                    {colLeads.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="space-y-2.5 flex-1">
                  {colLeads.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-slate-400 border border-dashed border-slate-300/80 rounded-xl">
                      Drop leads here
                    </div>
                  ) : (
                    colLeads.map((lead) => (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onClick={() => setSelectedLeadId(lead.id)}
                        className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                            {lead.name}
                          </h4>
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            {lead.channel_first}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">{lead.phone}</p>

                        <div className="mt-2 text-[11px] font-medium text-slate-700 bg-slate-50 p-1.5 rounded-lg border border-slate-100 truncate">
                          {lead.treatment_interest || 'General Consultation'}
                        </div>

                        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 text-[10px]">
                          {lead.after_hours ? (
                            <span className="flex items-center space-x-1 text-indigo-700 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded">
                              <Moon className="w-3 h-3" />
                              <span>After-Hours</span>
                            </span>
                          ) : (
                            <span className="text-slate-400">
                              {lead.first_response_seconds ? `${lead.first_response_seconds}s reply` : 'New'}
                            </span>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLeadId(lead.id);
                            }}
                            className="text-teal-600 hover:text-teal-800 font-bold flex items-center"
                          >
                            Details &rarr;
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Treatment Interest</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Timing</th>
                  <th className="py-3 px-4">Language</th>
                  <th className="py-3 px-4">Consent</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLeadId(lead.id)}
                    className="hover:bg-teal-50/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{lead.name}</p>
                      <p className="text-slate-400 font-mono text-[11px]">{lead.phone}</p>
                    </td>

                    <td className="py-3 px-4 capitalize font-semibold">
                      <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[11px]">
                        {lead.channel_first}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-800">
                      {lead.treatment_interest || 'General'}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          lead.status === 'booked'
                            ? 'bg-teal-100 text-teal-800'
                            : lead.status === 'visited'
                            ? 'bg-emerald-100 text-emerald-800'
                            : lead.status === 'new'
                            ? 'bg-blue-100 text-blue-800'
                            : lead.status === 'no_show'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {lead.after_hours ? (
                        <span className="flex items-center space-x-1 text-indigo-700 font-bold text-[11px]">
                          <Moon className="w-3 h-3" />
                          <span>After-Hours</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Working Hours</span>
                      )}
                    </td>

                    <td className="py-3 px-4 uppercase font-semibold text-[11px]">
                      {lead.language}
                    </td>

                    <td className="py-3 px-4 text-[11px]">
                      {lead.opted_out ? (
                        <span className="text-rose-600 font-bold">Opted Out</span>
                      ) : (
                        <span className="text-emerald-700 font-semibold">Subscribed</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLeadId(lead.id);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-100 rounded-lg transition-colors"
                      >
                        View &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Render Lead Drawer */}
      <LeadDrawer onOpenBookingModal={onOpenBookingModal} />
    </div>
  );
};
