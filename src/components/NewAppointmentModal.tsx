import React, { useState, useEffect, useMemo } from 'react';
import { useCrm } from '../context/CrmContext.tsx';
import {
  X,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  User,
  Sparkles,
  Search,
  UserPlus,
  Mail,
  Phone,
  CreditCard,
  MapPin,
  Send,
  Check,
  Globe,
  Bell,
  MessageCircle,
} from 'lucide-react';
import { Lead } from '../types/crm.ts';

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
  const {
    leads,
    treatments,
    settings,
    createAppointment,
    checkPatient,
    registerPatient,
    showToast,
  } = useCrm();

  // Patient Mode: 'existing' or 'new'
  const [patientMode, setPatientMode] = useState<'existing' | 'new'>('existing');

  // Existing Patient Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Lead | null>(null);

  // New Patient Form Fields
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('+971 ');
  const [newNationalId, setNewNationalId] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newLanguage, setNewLanguage] = useState<'en' | 'ar'>('en');
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);
  const [sendWelcomeWhatsApp, setSendWelcomeWhatsApp] = useState(true);

  // Appointment Details
  const [treatmentId, setTreatmentId] = useState(treatments[0]?.id || '');
  const [date, setDate] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [time, setTime] = useState('11:00');
  const [notes, setNotes] = useState('');
  const [channel, setChannel] = useState<'whatsapp' | 'web' | 'instagram'>('whatsapp');
  const [sendConfirmEmail, setSendConfirmEmail] = useState(true);
  const [sendConfirmWhatsApp, setSendConfirmWhatsApp] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preselection on open
  useEffect(() => {
    if (preselectedLeadId && preselectedLeadId !== 'new') {
      const found = leads.find((l) => l.id === preselectedLeadId);
      if (found) {
        setSelectedPatient(found);
        setPatientMode('existing');
        setTreatmentId(
          treatments.find((t) => t.name === found.treatment_interest)?.id || treatments[0]?.id || ''
        );
      }
    } else if (preselectedLeadId === 'new') {
      setPatientMode('new');
    }
  }, [preselectedLeadId, leads, treatments]);

  // Real-time matched patients for 'existing' tab
  const matchedPatients = useMemo(() => {
    if (!searchQuery.trim()) {
      return leads.slice(0, 6);
    }
    const q = searchQuery.toLowerCase().trim();
    const qClean = q.replace(/[-\s]/g, '');
    return leads.filter((l) => {
      const matchName = l.name.toLowerCase().includes(q);
      const matchPhone = l.phone.replace(/[-\s]/g, '').includes(qClean);
      const matchEmail = l.email?.toLowerCase().includes(q);
      const matchId = l.national_id?.replace(/[-\s]/g, '').toLowerCase().includes(qClean);
      const matchAddress = l.address?.toLowerCase().includes(q);
      return matchName || matchPhone || matchEmail || matchId || matchAddress;
    });
  }, [searchQuery, leads]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let targetLeadId = '';

      if (patientMode === 'new') {
        // Validation
        if (!newName.trim() || !newPhone.trim()) {
          setError('Please provide patient full name and phone number.');
          setLoading(false);
          return;
        }

        // Register new patient in database
        const regRes = await registerPatient({
          name: newName.trim(),
          phone: newPhone.trim(),
          national_id: newNationalId.trim() || undefined,
          email: newEmail.trim() || undefined,
          address: newAddress.trim() || undefined,
          language: newLanguage,
          treatment_interest: treatments.find((t) => t.id === treatmentId)?.name,
          send_welcome_email: sendWelcomeEmail,
          send_welcome_whatsapp: sendWelcomeWhatsApp,
        });

        if (!regRes.ok || !regRes.patient) {
          setError(regRes.error || 'Failed to register new patient.');
          setLoading(false);
          return;
        }

        targetLeadId = regRes.patient.id;
      } else {
        // Existing patient selected
        if (!selectedPatient) {
          setError('Please select an existing patient or switch to "+ Register New Patient".');
          setLoading(false);
          return;
        }
        targetLeadId = selectedPatient.id;
      }

      // Schedule Appointment
      const startIso = new Date(`${date}T${time}:00`).toISOString();
      const res = await createAppointment({
        lead_id: targetLeadId,
        start: startIso,
        treatment: treatmentId,
        channel: channel,
        notes: notes.trim() || undefined,
      });

      if (!res.ok) {
        setError(res.error || 'Slot is full. Slot capacity reached for this time window.');
        setLoading(false);
        return;
      }

      // Success
      setLoading(false);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating booking.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Book Appointment & Patient Intake
              </h3>
              <p className="text-xs text-slate-500">
                Patient check · National ID verification · Automated Email & WhatsApp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Scroll Area */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Booking Warning</p>
                <p className="text-[11px] mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* PATIENT SELECTION TABS: Check Existing vs Register New */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                1. Patient Verification & Selection
              </label>
              <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setPatientMode('existing')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center space-x-1.5 ${
                    patientMode === 'existing'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Check Existing Patient</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPatientMode('new')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center space-x-1.5 ${
                    patientMode === 'new'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Register New Patient</span>
                </button>
              </div>
            </div>

            {/* TAB 1: CHECK EXISTING PATIENT */}
            {patientMode === 'existing' && (
              <div className="space-y-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by Mobile, Emirates ID (784-...), Email, or Name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all"
                  />
                </div>

                {/* Patient Search Results */}
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100">
                  {matchedPatients.length === 0 ? (
                    <div className="py-6 text-center text-slate-400">
                      <p>No matching patient found in clinic database.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setPatientMode('new');
                          if (/^\+?\d+$/.test(searchQuery)) {
                            setNewPhone(searchQuery);
                          } else if (searchQuery.includes('@')) {
                            setNewEmail(searchQuery);
                          } else {
                            setNewName(searchQuery);
                          }
                        }}
                        className="mt-2 text-teal-700 font-bold underline text-xs"
                      >
                        Register "{searchQuery}" as a New Patient ➔
                      </button>
                    </div>
                  ) : (
                    matchedPatients.map((p) => {
                      const isSelected = selectedPatient?.id === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => setSelectedPatient(p)}
                          className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-teal-50 border border-teal-300 shadow-2xs'
                              : 'bg-white hover:bg-slate-100 border border-slate-200/80'
                          }`}
                        >
                          <div className="min-w-0 flex items-center space-x-2.5">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                                isSelected
                                  ? 'bg-teal-600 text-white'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {p.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center space-x-1.5 flex-wrap">
                                <span className="font-bold text-slate-900 truncate">{p.name}</span>
                                <span className="text-[11px] text-slate-500 font-mono">{p.phone}</span>
                                {p.national_id && (
                                  <span className="text-[10px] px-1.5 py-0.2 bg-indigo-50 text-indigo-700 rounded font-mono font-semibold">
                                    ID: {p.national_id}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                {p.email || 'No email registered'} {p.address ? `• ${p.address}` : ''}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                            {isSelected ? (
                              <span className="px-2 py-1 rounded-lg bg-teal-600 text-white font-bold text-[10px] flex items-center space-x-1">
                                <Check className="w-3 h-3" />
                                <span>Selected</span>
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-500 hover:text-slate-900 font-semibold">
                                Select
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {selectedPatient && (
                  <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-center justify-between text-[11px]">
                    <span className="font-bold">
                      ✓ Selected Patient: {selectedPatient.name} ({selectedPatient.phone})
                    </span>
                    <span className="text-emerald-700 font-mono text-[10px]">
                      {selectedPatient.national_id ? `Emirates ID: ${selectedPatient.national_id}` : 'No ID on file'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: REGISTER NEW PATIENT */}
            {patientMode === 'new' && (
              <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-900 flex items-center gap-1.5 text-xs">
                    <UserPlus className="w-4 h-4 text-teal-700" />
                    New Patient Profile Intake (UAE / GCC)
                  </span>
                  <span className="text-[10px] bg-teal-200/70 text-teal-800 px-2 py-0.5 rounded-full font-bold">
                    Full Profile
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Full Legal Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="e.g. Fatima Al-Zahra"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        required={patientMode === 'new'}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Mobile / WhatsApp Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="+971 50 123 4567"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        required={patientMode === 'new'}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Emirates ID / National ID Number
                    </label>
                    <div className="relative">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="784-1990-1234567-1"
                        value={newNationalId}
                        onChange={(e) => setNewNationalId(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Email Address (For Confirmation & Care Guides)
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        placeholder="fatima.alzahra@example.ae"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">
                      Residential Address / Community (Dubai / UAE)
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="e.g. Marina Promenade, Tower 2, Dubai Marina"
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Automated Welcome Dispatches for New Patient */}
                <div className="pt-2 border-t border-teal-200/80 space-y-1.5">
                  <label className="flex items-center space-x-2 cursor-pointer text-[11px] font-medium text-teal-900">
                    <input
                      type="checkbox"
                      checked={sendWelcomeEmail}
                      onChange={(e) => setSendWelcomeEmail(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>
                      ✉️ Send automated <strong>Welcome Email</strong> (Clinic overview, free valet parking & concierge link)
                    </span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer text-[11px] font-medium text-teal-900">
                    <input
                      type="checkbox"
                      checked={sendWelcomeWhatsApp}
                      onChange={(e) => setSendWelcomeWhatsApp(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>
                      💬 Send automated <strong>Welcome WhatsApp Message</strong> to patient's phone
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: APPOINTMENT SCHEDULING DETAILS */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              2. Appointment & Consultation Details
            </label>

            {/* Treatment Selection */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Clinical Treatment / Procedure <span className="text-rose-500">*</span>
              </label>
              <select
                value={treatmentId}
                onChange={(e) => setTreatmentId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                  required
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Start Time (GST)</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            {/* Booking Channel & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Booking Channel</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                >
                  <option value="whatsapp">WhatsApp System (Direct Cloud)</option>
                  <option value="web">Website Live Chat Widget</option>
                  <option value="instagram">Instagram Direct / Reception Call</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Doctor / Internal Notes</label>
                <input
                  type="text"
                  placeholder="e.g. VIP patient, requested Dr. Tariq"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Automated Booking Confirmation Toggles */}
            <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-1.5 text-[11px] text-indigo-950">
              <span className="font-bold block text-indigo-900">
                ⚡ Automated Dispatch Triggers (Email, WhatsApp & n8n):
              </span>
              <label className="flex items-center space-x-2 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={sendConfirmEmail}
                  onChange={(e) => setSendConfirmEmail(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Auto-dispatch <strong>Booking Confirmation Email</strong> with Google Calendar event</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={sendConfirmWhatsApp}
                  onChange={(e) => setSendConfirmWhatsApp(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Auto-dispatch <strong>WhatsApp Booking Confirmation</strong> message & 24h reminder queue</span>
              </label>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Slot capacity: {settings?.slot_capacity || 1} patient / window
            </span>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-sm transition-colors flex items-center space-x-1.5 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>
                  {loading
                    ? 'Processing...'
                    : patientMode === 'new'
                    ? 'Register Patient & Confirm Booking'
                    : 'Confirm Appointment'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
