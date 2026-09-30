import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext.tsx';
import {
  Calendar,
  Clock,
  Plus,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  List,
  CalendarDays,
  ShieldAlert,
} from 'lucide-react';
import { Appointment, AppointmentStatus } from '../types/crm.ts';
import { NewAppointmentModal } from './NewAppointmentModal.tsx';

export const AppointmentsView: React.FC = () => {
  const {
    appointments,
    leads,
    treatments,
    updateAppointment,
    setSelectedLeadId,
  } = useCrm();

  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reschedulingApptId, setReschedulingApptId] = useState<string | null>(null);
  const [newRescheduleTime, setNewRescheduleTime] = useState<string>('');

  // Filtering
  const filteredAppointments = appointments.filter((a) => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    return true;
  });

  // Week days calculation for calendar view
  const today = new Date();
  const startOfWeek = new Date(today);
  // Sunday or Monday start
  startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const hours = Array.from({ length: 11 }, (_, i) => 9 + i); // 9:00 to 19:00

  const handleStatusChange = async (apptId: string, status: AppointmentStatus) => {
    await updateAppointment(apptId, status);
  };

  const handleRescheduleSubmit = async (apptId: string) => {
    if (!newRescheduleTime) return;
    await updateAppointment(apptId, undefined, new Date(newRescheduleTime).toISOString());
    setReschedulingApptId(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-900">Appointments</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 font-semibold border border-teal-200">
              Capacity: 1
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Week calendar & booking manager
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Appointments</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="no_show">No Show</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-all ${
                viewMode === 'calendar' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 text-indigo-600" />
              <span>Week Grid</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5 text-indigo-600" />
              <span>Agenda List</span>
            </button>
          </div>

          {/* Schedule Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Book Patient</span>
          </button>
        </div>
      </div>

      {/* CALENDAR WEEK VIEW */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Calendar Header with Days */}
          <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-700">
            <div className="p-3 text-center text-slate-400 font-semibold border-r border-slate-200">
              Dubai Time
            </div>
            {weekDays.map((day, idx) => {
              const isToday = day.toISOString().slice(0, 10) === today.toISOString().slice(0, 10);
              return (
                <div
                  key={idx}
                  className={`p-3 text-center border-r border-slate-200 last:border-r-0 ${
                    isToday ? 'bg-teal-50 text-teal-900' : ''
                  }`}
                >
                  <p className="text-[11px] uppercase tracking-wider text-slate-400">
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <p className="text-sm font-extrabold mt-0.5">{day.getDate()}</p>
                </div>
              );
            })}
          </div>

          {/* Grid Hours */}
          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {hours.map((hour) => {
              const hourLabel = `${hour.toString().padStart(2, '0')}:00`;
              return (
                <div key={hour} className="grid grid-cols-8 min-h-[72px]">
                  {/* Hour label column */}
                  <div className="p-2 text-center text-[11px] font-mono text-slate-400 border-r border-slate-100 bg-slate-50/50 flex items-center justify-center">
                    {hourLabel}
                  </div>

                  {/* 7 Days Columns for this hour */}
                  {weekDays.map((day, dIdx) => {
                    const dayIso = day.toISOString().slice(0, 10);

                    // Find appointments starting in this day and hour
                    const matchingAppts = filteredAppointments.filter((a) => {
                      const aDate = new Date(a.start_at);
                      return aDate.toISOString().slice(0, 10) === dayIso && aDate.getHours() === hour;
                    });

                    return (
                      <div
                        key={dIdx}
                        className="p-1 border-r border-slate-100 last:border-r-0 hover:bg-slate-50/60 transition-colors relative flex flex-col gap-1"
                      >
                        {matchingAppts.map((appt) => {
                          const lead = leads.find((l) => l.id === appt.lead_id);
                          const trt = treatments.find((t) => t.id === appt.treatment_id);

                          return (
                            <div
                              key={appt.id}
                              onClick={() => {
                                if (lead) setSelectedLeadId(lead.id);
                              }}
                              className={`p-1.5 rounded-lg text-[10px] font-semibold transition-all shadow-2xs cursor-pointer border ${
                                appt.status === 'confirmed'
                                  ? 'bg-teal-50 border-teal-300 text-teal-900 hover:bg-teal-100'
                                  : appt.status === 'completed'
                                  ? 'bg-blue-50 border-blue-300 text-blue-900'
                                  : appt.status === 'no_show'
                                  ? 'bg-rose-50 border-rose-300 text-rose-900'
                                  : 'bg-slate-100 border-slate-200 text-slate-500 line-through'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold truncate">{lead?.name || 'Patient'}</span>
                                <span className="text-[9px] uppercase font-mono">{appt.created_by}</span>
                              </div>
                              <p className="truncate text-[9px] text-slate-600 mt-0.5">{trt?.name}</p>
                              <span className="text-[9px] font-mono text-slate-400">
                                {new Date(appt.start_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AGENDA LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Procedure</th>
                  <th className="py-3 px-4">Booked Via</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No appointments matching this filter.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appt) => {
                    const lead = leads.find((l) => l.id === appt.lead_id);
                    const trt = treatments.find((t) => t.id === appt.treatment_id);

                    return (
                      <tr key={appt.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">
                            {new Date(appt.start_at).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                          <p className="text-slate-400 font-mono text-[11px]">
                            {new Date(appt.start_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            -{' '}
                            {new Date(appt.end_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
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

                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-800">{trt?.name || 'Consultation'}</p>
                          <p className="text-slate-400 text-[10px] capitalize">
                            {trt?.category} • {trt?.duration_min} min
                          </p>
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold uppercase text-[10px]">
                            {appt.created_by} ({appt.channel})
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              appt.status === 'confirmed'
                                ? 'bg-teal-100 text-teal-800'
                                : appt.status === 'completed'
                                ? 'bg-blue-100 text-blue-800'
                                : appt.status === 'no_show'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {appt.status.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {appt.status === 'confirmed' && (
                              <>
                                <button
                                  onClick={() => handleStatusChange(appt.id, 'completed')}
                                  className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                                  title="Mark Attended/Visited"
                                >
                                  Complete
                                </button>
                                <button
                                  onClick={() => handleStatusChange(appt.id, 'no_show')}
                                  className="px-2 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors"
                                  title="Mark No-Show (Creates followup)"
                                >
                                  No-Show
                                </button>
                                <button
                                  onClick={() => {
                                    setReschedulingApptId(appt.id);
                                    setNewRescheduleTime(appt.start_at.slice(0, 16));
                                  }}
                                  className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                                >
                                  Reschedule
                                </button>
                                <button
                                  onClick={() => handleStatusChange(appt.id, 'cancelled')}
                                  className="px-2 py-1 text-[11px] font-semibold text-slate-400 hover:text-rose-600 transition-colors"
                                >
                                  Cancel
                                </button>
                              </>
                            )}

                            {appt.status !== 'confirmed' && (
                              <button
                                onClick={() => handleStatusChange(appt.id, 'confirmed')}
                                className="px-2 py-1 text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
                              >
                                Re-Confirm
                              </button>
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
      )}

      {/* Reschedule Modal */}
      {reschedulingApptId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-sm w-full border border-slate-100 shadow-2xl space-y-4 animate-in zoom-in-95">
            <h3 className="text-sm font-bold text-slate-800">Reschedule Appointment</h3>
            <p className="text-xs text-slate-400">
              Select new start date & time. Automated followups recompute automatically.
            </p>
            <input
              type="datetime-local"
              value={newRescheduleTime}
              onChange={(e) => setNewRescheduleTime(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
            <div className="flex justify-end space-x-2 pt-1">
              <button
                onClick={() => setReschedulingApptId(null)}
                className="px-3.5 py-2 text-xs text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRescheduleSubmit(reschedulingApptId)}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Appointment Modal */}
      <NewAppointmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
