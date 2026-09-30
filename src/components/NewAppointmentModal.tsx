import React, { useState, useEffect } from 'react';
import { useCrm } from '../context/CrmContext.tsx';
import { X, Calendar, Clock, AlertCircle, CheckCircle2, User, Sparkles } from 'lucide-react';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedLeadId?: string;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  isOpen,
  onClose,
  preselectedLeadId,
}) => {
  const { leads, treatments, settings, createAppointment, showToast } = useCrm();

  const [leadId, setLeadId] = useState(preselectedLeadId || (leads[0]?.id || ''));
  const [treatmentId, setTreatmentId] = useState(treatments[0]?.id || '');
  const [date, setDate] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [time, setTime] = useState('11:00');
  const [notes, setNotes] = useState('');
  const [channel, setChannel] = useState<'whatsapp' | 'web' | 'instagram'>('whatsapp');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedLeadId && preselectedLeadId !== 'new') {
      setLeadId(preselectedLeadId);
    }
  }, [preselectedLeadId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId || !treatmentId) return;

    setLoading(true);
    setError(null);

    const startIso = new Date(`${date}T${time}:00`).toISOString();

    const res = await createAppointment({
      lead_id: leadId,
      start: startIso,
      treatment: treatmentId,
      channel: channel,
      notes: notes.trim() || undefined,
    });

    setLoading(false);

    if (res.ok) {
      onClose();
    } else {
      setError(res.error || 'Slot is full. Slot capacity reached for this time window.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
              <Calendar className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Schedule Appointment</h3>
              <p className="text-xs text-slate-400">Capacity verified · Dubai Marina (GST)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Slot Unavailable</p>
                <p className="text-[11px] mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Patient Selection */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Patient</label>
            <select
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              required
            >
              <option value="">Select a patient</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.phone})
                </option>
              ))}
            </select>
          </div>

          {/* Treatment Selection */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Treatment & Procedure</label>
            <select
              value={treatmentId}
              onChange={(e) => setTreatmentId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              required
            >
              {treatments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.duration_min} min) {t.price_note ? `· ${t.price_note}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Start Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Requested Dr. Sarah, sensitive gums"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-[11px] text-indigo-900 flex items-center justify-between">
            <span>Capacity constraint:</span>
            <span className="font-bold">{settings?.slot_capacity || 1} patient / slot</span>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center space-x-1.5 disabled:opacity-50"
            >
              <span>{loading ? 'Confirming...' : 'Book Appointment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
