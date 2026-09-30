import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext.tsx';
import {
  Settings,
  Clock,
  Calendar,
  Sparkles,
  BookOpen,
  Key,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  ShieldAlert,
  Save,
  Radio,
  FileCode,
  Zap,
  Database,
  Lock,
  Shield,
  Users,
} from 'lucide-react';
import { Treatment, TreatmentCategory, KBEntry, UserRole } from '../types/crm.ts';

export const SettingsView: React.FC = () => {
  const {
    settings,
    treatments,
    kbEntries,
    upsertTreatment,
    upsertKB,
    deleteKB,
    updateSettings,
    showToast,
    setActiveTab,
    currentUser,
    setCurrentUser,
    staffUsers,
    createStaffUser,
    updateStaffUserRole,
    deleteStaffUser,
  } = useCrm();

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'hours' | 'treatments' | 'kb' | 'users' | 'integrations' | 'n8n-prompt' | 'supabase-sql'>('profile');

  // User management local state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('staff');

  // Clinic profile local state
  const [clinicName, setClinicName] = useState(settings?.name || 'Demo Dental & Aesthetic Clinic');
  const [emergencyText, setEmergencyText] = useState(settings?.emergency_text || '');
  const [consentText, setConsentText] = useState(settings?.consent_text || '');
  const [retentionDays, setRetentionDays] = useState(settings?.retention_days || 90);
  const [targetSeconds, setTargetSeconds] = useState(settings?.first_response_target_seconds || 180);
  const [slotCapacity, setSlotCapacity] = useState(settings?.slot_capacity || 1);

  // New treatment form modal / state
  const [editingTreatment, setEditingTreatment] = useState<Partial<Treatment> | null>(null);

  // New KB entry form state
  const [editingKB, setEditingKB] = useState<Partial<KBEntry> | null>(null);

  // Copy state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    showToast(`${label} copied to clipboard`, 'success');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      name: clinicName,
      emergency_text: emergencyText,
      consent_text: consentText,
      retention_days: Number(retentionDays),
      first_response_target_seconds: Number(targetSeconds),
      slot_capacity: Number(slotCapacity),
    });
  };

  const widgetIframeSnippet = `<iframe
  src="${typeof window !== 'undefined' ? window.location.origin : 'https://clinicflow.app'}/widget"
  width="400"
  height="620"
  style="border:none; border-radius:18px; box-shadow:0 20px 25px -5px rgb(0 0 0 / 0.1);"
  title="Clinic Flow Live Chat"
></iframe>`;

  // Role-Based Access Control: Staff cannot access Settings
  if (currentUser.role === 'staff') {
    const adminUser = staffUsers.find((u) => u.role === 'admin') || staffUsers[0];
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4 my-8">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-7 h-7" />
        </div>
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300">
            Role: Staff (Receptionist)
          </span>
          <h2 className="text-lg font-bold text-slate-900 mt-2">Clinic Settings Access Restricted</h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Staff members have full operational access to the <strong>Inbox</strong>, <strong>Leads Pipeline</strong>, <strong>Appointments Calendar</strong>, and <strong>Follow-ups</strong>. Clinic hours, treatment pricing, knowledge base, and API keys are restricted to Administrators ({adminUser.name}).
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <button
            onClick={() => setActiveTab('inbox')}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-colors"
          >
            Go to Staff Inbox
          </button>
          <button
            onClick={() => {
              setCurrentUser(adminUser);
              showToast(`Switched to Administrator (${adminUser.name})`, 'info');
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200 transition-colors"
          >
            Switch to Admin Role
          </button>
        </div>
      </div>
    );
  }

  const isSuperAdmin = currentUser.role === 'super_admin';

  const subTabs = [
    { id: 'profile' as const, label: 'Clinic Details', icon: Settings },
    { id: 'hours' as const, label: 'Hours & Capacity', icon: Clock },
    { id: 'treatments' as const, label: 'Treatments', icon: Sparkles },
    { id: 'kb' as const, label: 'Knowledge Base', icon: BookOpen },
    ...(isSuperAdmin
      ? [
          { id: 'users' as const, label: 'Team & Access', icon: Users, badge: 'Super Admin' },
          { id: 'integrations' as const, label: 'Integrations', icon: Key, badge: 'Super Admin' },
          { id: 'n8n-prompt' as const, label: 'n8n AI Prompt', icon: FileCode },
          { id: 'supabase-sql' as const, label: 'Supabase SQL', icon: Database },
        ]
      : []),
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Sub Tabs */}
      <div className="border-b border-slate-200 bg-slate-50/70 px-4 sm:px-6 flex space-x-1 sm:space-x-4 overflow-x-auto no-scrollbar">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center space-x-2 py-3.5 px-3 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-indigo-600 text-indigo-900 bg-white shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-extrabold">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Clinic Profile & Rules */}
      {activeSubTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="p-6 max-w-3xl space-y-5 text-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Clinic Profile</h3>
            <p className="text-slate-500">Clinic details, emergency text & retention policy</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Clinic Name</label>
              <input
                type="text"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Timezone</label>
              <input
                type="text"
                value={settings?.timezone || 'Asia/Dubai'}
                disabled
                className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs font-mono text-slate-600 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Locked to Dubai GST (UTC+4)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">First Response Target (Seconds)</label>
              <input
                type="number"
                value={targetSeconds}
                onChange={(e) => setTargetSeconds(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:bg-white"
                min={30}
                max={600}
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Default 180s SLA</span>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Message Retention Period (Days)</label>
              <input
                type="number"
                value={retentionDays}
                onChange={(e) => setRetentionDays(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:bg-white"
                min={7}
                max={365}
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Scheduled job automatically purges messages older than this</span>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Emergency Text (AI & Widget Disclaimer)</label>
            <textarea
              rows={3}
              value={emergencyText}
              onChange={(e) => setEmergencyText(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Consent & Marketing Disclaimer Text</label>
            <textarea
              rows={2}
              value={consentText}
              onChange={(e) => setConsentText(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:bg-white"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Clinic Profile</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Hours & Slot Capacity */}
      {activeSubTab === 'hours' && (
        <div className="p-6 max-w-3xl space-y-6 text-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Working Hours & Capacity</h3>
            <p className="text-slate-500">
              Hours determine after-hours triage and prevent double-booking beyond capacity
            </p>
          </div>

          {/* Slot Capacity Control */}
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between">
            <div>
              <p className="font-bold text-teal-900 text-xs">Concurrent Slot Capacity</p>
              <p className="text-[11px] text-teal-800">
                Simultaneous appointments allowed per time block (default: 1)
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min={1}
                max={5}
                value={slotCapacity}
                onChange={async (e) => {
                  const val = Number(e.target.value);
                  setSlotCapacity(val);
                  await updateSettings({ slot_capacity: val });
                }}
                className="w-20 px-3 py-1.5 bg-white border border-teal-300 rounded-lg font-bold text-center"
              />
              <span className="text-xs text-teal-900 font-bold">patient(s)</span>
            </div>
          </div>

          {/* Schedule Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Day</th>
                  <th className="py-2.5 px-4">Opening Time</th>
                  <th className="py-2.5 px-4">Closing Time</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {settings &&
                  Object.entries(settings.working_hours).map(([day, sched]) => (
                    <tr key={day} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-bold capitalize text-slate-900">{day}</td>
                      <td className="py-2.5 px-4 font-mono">{sched.closed ? '—' : sched.open}</td>
                      <td className="py-2.5 px-4 font-mono">{sched.closed ? '—' : sched.close}</td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            sched.closed ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {sched.closed ? 'Closed' : 'Open'}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Holidays */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Clinic Closure Holidays</h4>
            <div className="flex flex-wrap gap-2">
              {settings?.holidays.map((h, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-mono text-xs flex items-center space-x-1"
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{h}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Treatments Catalog */}
      {activeSubTab === 'treatments' && (
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Treatments Catalog</h3>
              <p className="text-xs text-slate-500">
                Procedure durations determine slot lengths
              </p>
            </div>
            <button
              onClick={() =>
                setEditingTreatment({
                  id: '',
                  name: '',
                  category: 'dental',
                  duration_min: 45,
                  active: true,
                  price_note: '',
                })
              }
              className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Treatment</span>
            </button>
          </div>

          {/* Treatments Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Treatment Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Price Note (Optional)</th>
                  <th className="py-3 px-4">Active</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {treatments.map((trt) => (
                  <tr key={trt.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{trt.name}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          trt.category === 'dental'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-pink-100 text-pink-800'
                        }`}
                      >
                        {trt.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">{trt.duration_min} mins</td>
                    <td className="py-3 px-4 text-slate-600 italic">
                      {trt.price_note ? trt.price_note : <span className="text-slate-400 not-italic">—</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          trt.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {trt.active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setEditingTreatment(trt)}
                        className="p-1 text-teal-700 hover:bg-teal-50 rounded"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Treatment Edit Modal */}
          {editingTreatment && (
            <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white p-5 rounded-2xl max-w-md w-full border border-slate-200 shadow-xl space-y-3 text-xs">
                <h3 className="text-sm font-bold text-slate-900">
                  {editingTreatment.id ? 'Edit Treatment' : 'Add New Treatment'}
                </h3>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Name</label>
                  <input
                    type="text"
                    value={editingTreatment.name || ''}
                    onChange={(e) => setEditingTreatment({ ...editingTreatment, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Category</label>
                    <select
                      value={editingTreatment.category || 'dental'}
                      onChange={(e) =>
                        setEditingTreatment({
                          ...editingTreatment,
                          category: e.target.value as TreatmentCategory,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                    >
                      <option value="dental">Dental</option>
                      <option value="aesthetic">Aesthetic</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Duration (Min)</label>
                    <input
                      type="number"
                      value={editingTreatment.duration_min || 45}
                      onChange={(e) =>
                        setEditingTreatment({
                          ...editingTreatment,
                          duration_min: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Price Note (Optional - shown only if filled)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. From AED 850 (includes assessment)"
                    value={editingTreatment.price_note || ''}
                    onChange={(e) =>
                      setEditingTreatment({ ...editingTreatment, price_note: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setEditingTreatment(null)}
                    className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (editingTreatment.name) {
                        await upsertTreatment(editingTreatment);
                        setEditingTreatment(null);
                      }
                    }}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg"
                  >
                    Save Treatment
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Approved Answers (KB) */}
      {activeSubTab === 'kb' && (
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Knowledge Base</h3>
              <p className="text-xs text-slate-500">
                Clinic-approved answers for AI chatbot triage
              </p>
            </div>
            <button
              onClick={() => setEditingKB({ id: '', topic: '', answer: '' })}
              className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Approved Answer</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kbEntries.map((kb) => (
              <div
                key={kb.id}
                className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <h4 className="text-xs font-bold text-slate-900">{kb.topic}</h4>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setEditingKB(kb)}
                        className="p-1 text-slate-500 hover:text-teal-700 rounded"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteKB(kb.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{kb.answer}</p>
                </div>
              </div>
            ))}
          </div>

          {/* KB Edit Modal */}
          {editingKB && (
            <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white p-5 rounded-2xl max-w-md w-full border border-slate-200 shadow-xl space-y-3 text-xs">
                <h3 className="text-sm font-bold text-slate-900">
                  {editingKB.id ? 'Edit Approved Answer' : 'New Approved Answer'}
                </h3>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Topic</label>
                  <input
                    type="text"
                    placeholder="e.g. Free Consultation Policy"
                    value={editingKB.topic || ''}
                    onChange={(e) => setEditingKB({ ...editingKB, topic: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Approved Clinic Answer</label>
                  <textarea
                    rows={4}
                    value={editingKB.answer || ''}
                    onChange={(e) => setEditingKB({ ...editingKB, answer: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setEditingKB(null)}
                    className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (editingKB.topic && editingKB.answer) {
                        await upsertKB(editingKB);
                        setEditingKB(null);
                      }
                    }}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg"
                  >
                    Save Answer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Team & Access Management (Super Admin Only) */}
      {activeSubTab === 'users' && isSuperAdmin && (
        <div className="p-6 space-y-6 text-xs max-w-5xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-teal-700" />
                <h3 className="text-sm font-bold text-slate-900">Team & User Access Control</h3>
              </div>
              <p className="text-slate-500 mt-0.5">
                Super Admin controls user accounts and assigns roles across the CRM
              </p>
            </div>

            <button
              onClick={() => {
                setNewUserName('');
                setNewUserEmail('');
                setNewUserRole('staff');
                setShowAddUserModal(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New User</span>
            </button>
          </div>

          {/* Role Hierarchy Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/60 space-y-1">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-200 text-purple-900">
                Super Admin
              </span>
              <p className="font-bold text-xs text-purple-950">Full Master Access</p>
              <p className="text-[11px] text-purple-900/80">
                Integrations, API keys, Webhooks, User creation, and complete clinic operations.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-teal-200 bg-teal-50/60 space-y-1">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-teal-200 text-teal-900">
                Admin
              </span>
              <p className="font-bold text-xs text-teal-950">Clinic Management</p>
              <p className="text-[11px] text-teal-900/80">
                Clinic Details, Hours, Treatments catalog, Knowledge Base, and patient schedules.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                Staff
              </span>
              <p className="font-bold text-xs text-slate-900">Operations & Inbox</p>
              <p className="text-[11px] text-slate-600">
                Live Inbox, Patient triage, Appointments, and Follow-up queue. Settings locked.
              </p>
            </div>
          </div>

          {/* Users Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Current Role</th>
                  <th className="py-3 px-4">Change Role</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {staffUsers.map((u) => {
                  const isCurrent = currentUser.id === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2.5">
                          <img src={u.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                          <div>
                            <p className="font-bold text-slate-900">
                              {u.name} {isCurrent && <span className="text-[10px] text-teal-600 font-semibold">(You)</span>}
                            </p>
                            <p className="text-[10px] text-slate-400">Added {u.created_at || 'Recent'}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-600">{u.email}</td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            u.role === 'super_admin'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'admin'
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={u.role}
                          onChange={(e) => updateStaffUserRole(u.id, e.target.value as UserRole)}
                          className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-teal-500"
                        >
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {!isCurrent && (
                          <button
                            onClick={() => deleteStaffUser(u.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Add User Modal */}
          {showAddUserModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white p-5 rounded-2xl max-w-sm w-full border border-slate-200 shadow-xl space-y-3 text-xs">
                <h3 className="text-sm font-bold text-slate-900">Create New CRM User</h3>
                <p className="text-slate-500 text-[11px]">Add a team member and assign their permission level</p>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Ahmed Al-Ketbi"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. ahmed@democlinic.ae"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Role & Permissions</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  >
                    <option value="staff">Staff (Inbox & Scheduling)</option>
                    <option value="admin">Admin (Clinic Operations)</option>
                    <option value="super_admin">Super Admin (Full System Control)</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setShowAddUserModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (newUserName.trim() && newUserEmail.trim()) {
                        createStaffUser({
                          name: newUserName.trim(),
                          email: newUserEmail.trim(),
                          role: newUserRole,
                        });
                        setShowAddUserModal(false);
                      }
                    }}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg"
                  >
                    Create User
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Integrations & API (Super Admin Only) */}
      {activeSubTab === 'integrations' && (
        <div className="p-6 space-y-6 text-xs max-w-4xl">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Integrations & API Secrets</h3>
            <p className="text-slate-500">
              API credentials for n8n webhooks and WhatsApp integration
            </p>
          </div>

          {/* Credentials Card */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4 text-teal-700" />
                <span className="font-bold text-slate-900 text-xs">API Authentication Secrets</span>
              </div>
              <span className="text-[10px] text-slate-400">Headers: x-api-key</span>
            </div>

            <div className="space-y-3">
              {/* CRM_API_KEY */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-700">CRM_API_KEY (Secures CRM Endpoints)</label>
                  <span className="text-[10px] text-teal-700 font-semibold">Constant-Time Verified</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="password"
                    value="crm_live_secret_key_12345"
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-slate-600 text-xs"
                  />
                  <button
                    onClick={() => handleCopy('crm_live_secret_key_12345', 'CRM_API_KEY')}
                    className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition-colors flex items-center space-x-1"
                  >
                    {copiedKey === 'CRM_API_KEY' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              {/* N8N_BASE_URL */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">N8N_BASE_URL</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value="https://n8n.wovextech.internal"
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-slate-600 text-xs"
                  />
                  <span className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                    ● Active Hook
                  </span>
                </div>
              </div>

              {/* N8N_API_KEY */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">N8N_API_KEY (Passed in outgoing calls)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="password"
                    value="n8n_sec_key_67890"
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-slate-600 text-xs"
                  />
                  <button
                    onClick={() => handleCopy('n8n_sec_key_67890', 'N8N_API_KEY')}
                    className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition-colors flex items-center space-x-1"
                  >
                    {copiedKey === 'N8N_API_KEY' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* AiSensy WhatsApp API Integration */}
          <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-bold text-emerald-900">AiSensy WhatsApp Business API Integration</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Meta 24h Window Enforced
              </span>
            </div>
            <p className="text-[11px] text-emerald-800">
              Inbound patient messages from AiSensy webhook forward to <code className="bg-emerald-100/70 px-1 rounded font-mono">/log-message</code>.
              Outbound replies verify the 24-hour customer service window; expired conversations automatically prompt for an approved AiSensy template.
            </p>
          </div>

          {/* Website Chat Widget Embed Snippet */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-teal-700" />
                <span className="font-bold text-slate-900">Website Embed Snippet (Points to /widget)</span>
              </div>
              <button
                onClick={() => setActiveTab('widget-preview')}
                className="text-teal-700 font-bold hover:underline flex items-center space-x-1"
              >
                <span>Test Widget Live</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Embed this iframe into your clinic website. It proxies through <code className="bg-slate-200/80 px-1 rounded font-mono">/web-chat-proxy</code> so <code className="font-mono">N8N_API_KEY</code> is never exposed to the client browser.
            </p>
            <div className="relative">
              <pre className="p-3 bg-slate-900 text-teal-300 rounded-xl text-[11px] font-mono overflow-x-auto">
                {widgetIframeSnippet}
              </pre>
              <button
                onClick={() => handleCopy(widgetIframeSnippet, 'Embed Snippet')}
                className="absolute top-2 right-2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] font-bold transition-colors flex items-center space-x-1"
              >
                {copiedKey === 'Embed Snippet' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copy Snippet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: n8n AI Flow Prompt */}
      {activeSubTab === 'n8n-prompt' && (
        <div className="p-6 space-y-6 text-xs max-w-5xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center space-x-2">
                <FileCode className="w-5 h-5 text-teal-700" />
                <h3 className="text-sm font-bold text-slate-900">n8n Flow Prompt</h3>
              </div>
              <p className="text-slate-500 mt-0.5">
                Paste into your AI assistant to generate companion n8n workflows
              </p>
            </div>

            <button
              onClick={() => {
                const promptText = `You are a Senior n8n Automation Engineer. Build the complete set of companion n8n workflows for "Clinic Flow CRM" (Demo Dental & Aesthetic Clinic, Dubai).

CRM CONNECTION SPECIFICATIONS:
- CRM_BASE_URL: "${typeof window !== 'undefined' ? window.location.origin : 'https://clinicflow.app'}"
- CRM_API_KEY: "crm_live_secret_key_12345"
- N8N_BASE_URL: "https://n8n.wovextech.internal"
- N8N_API_KEY: "n8n_sec_key_67890"
- All CRM requests carry header: "x-api-key: crm_live_secret_key_12345"
- All incoming n8n webhooks verify header: "x-api-key: n8n_sec_key_67890"

BUILD THE FOLLOWING 5 PRODUCTION WORKFLOWS:

WORKFLOW 1: APPOINTMENT EVENTS, GOOGLE SHEETS & GMAIL REMINDERS
Trigger: Webhook Node (POST) at /webhook/crm-appointment-event
Header Auth: Verify x-api-key == N8N_API_KEY. Reject with 401 if invalid.
Payload received:
{
  "event": "created" | "rescheduled" | "cancelled" | "completed" | "no_show",
  "appointment": { "id", "lead_id", "treatment_id", "start_at", "end_at", "status", "channel", "notes" },
  "lead": { "id", "name", "phone", "email", "language" },
  "created_by": "ai" | "staff"
}
Steps:
1. Google Sheets Node ("Clinic_Appointments_Master"):
   - On "created": Append Row with [Appointment ID, Lead Name, Phone, Email, Start Time (Dubai UTC+4), Status, Treatment ID, Channel, Created By].
   - On "rescheduled" / "cancelled" / "completed" / "no_show": Update Row matching Appointment ID with new Status and Start Time.
2. If/Else Switch on "event":
   - IF event == "created":
     a. Gmail Node: Send appointment confirmation email to lead.email (if present) with subject "Confirmed: Your Appointment at Demo Dental & Aesthetic Clinic", HTML body detailing clinic address (Floor 3, Al Razi Healthcare Building, Dubai Marina Walk), reserved free valet parking, and date/time.
     b. AiSensy WhatsApp Node: Send WhatsApp template "appointment_reminder_24h" to lead.phone via AiSensy API (POST https://backend.aisensy.com/campaign/t1/api/v2).
   - IF event == "cancelled":
     a. Gmail Node: Send cancellation notice to lead.email.
     b. AiSensy WhatsApp Node: Send cancellation confirmation to lead.phone.
   - IF event == "rescheduled":
     a. Gmail Node: Send updated schedule to lead.email.
   - IF event == "no_show":
     a. AiSensy WhatsApp Node: Send "noshow_reschedule_offer" template to lead.phone.
3. Respond to Webhook Node: { "ok": true }

WORKFLOW 2: WEBSITE CHATBOT ENGINE
Trigger: Webhook Node (POST) at /webhook/web-chat
Header Auth: Verify x-api-key == N8N_API_KEY.
Payload received: { "session_id", "text", "name", "phone" }
Steps:
1. HTTP Request Node: GET {{CRM_BASE_URL}}/clinic-settings with x-api-key
   -> Retrieves hours, slot_capacity, emergency_text, treatments, approved_answers (KB).
2. Code Node (Intent / Emergency Check):
   - Check if text contains clinical emergency keywords (severe bleeding, acute pain, difficulty breathing, infection, talk to a human).
   - If emergency detected:
     a. HTTP Request: POST {{CRM_BASE_URL}}/handover with body { "lead_id", "reason": "Urgent symptom / patient requested human" }.
     b. Return { "reply": "Your conversation is immediately escalated to our clinical staff. If severe, dial 999.", "handover": true }.
3. If normal query:
   - AI Agent Node (Gemini 2.5 Flash / OpenAI):
     - System prompt uses clinic approved answers and working hours.
     - Tools provided to AI:
       * check_slots: GET {{CRM_BASE_URL}}/available-slots?treatment={{treatment}}
       * book_slot: POST {{CRM_BASE_URL}}/create-appointment
   - Generate response.
4. Google Sheets Node ("Web_Chat_Leads"): Append lead name, phone, session_id, last query, timestamp.
5. Respond to Webhook Node: { "reply": ai_response, "handover": false }

WORKFLOW 3: WHATSAPP INTEGRATION (AISENSY WEBHOOK & SEND MESSAGE)
Subflow A (Inbound Patient WhatsApp):
1. Webhook Node: Inbound from AiSensy webhook (POST).
2. HTTP Request: POST {{CRM_BASE_URL}}/upsert-lead with { phone, name, channel: "whatsapp" }.
3. HTTP Request: POST {{CRM_BASE_URL}}/log-message with { lead_id, direction: "in", sender: "patient", text, wa_message_id }.
4. HTTP Request: GET {{CRM_BASE_URL}}/lead-context?phone={{phone}}
5. If conversation.mode == "ai": Forward message to Workflow 2 chatbot logic and reply via AiSensy HTTP Node.

Subflow B (Staff Outbound from CRM Inbox):
Trigger: Webhook Node (POST) at /webhook/crm-send-message
Payload received: { "lead_id", "phone", "channel", "text", "last_patient_message_at", "template_name" }
Steps:
1. Code Node: Verify 24-hour Meta window:
   - If channel == "whatsapp" and !template_name and (now - last_patient_message_at > 24h):
     Return HTTP 409 { "error": "The WhatsApp 24-hour window is closed. Send an approved template instead.", "code": "window_closed" }.
2. HTTP Request: POST https://backend.aisensy.com/campaign/t1/api/v2
   - Dispatches message or approved template to patient's WhatsApp.
3. Respond to Webhook: { "ok": true }

WORKFLOW 4: SCHEDULED REMINDERS & FOLLOW-UP POLLER
Trigger: Schedule Trigger Node (Every 5 minutes).
Steps:
1. HTTP Request Node: GET {{CRM_BASE_URL}}/due-followups with x-api-key.
2. Item Lists / SplitInBatches Node: Iterate through each item.
3. For each due followup:
   - If type in ["reminder_24h", "reminder_2h"]:
     * Send WhatsApp template via AiSensy
     * Send reminder email via Gmail Node
   - If type in ["no_booking_1", "no_booking_2", "post_visit", "noshow_reschedule"]:
     * Send appropriate template via AiSensy
   - HTTP Request: POST {{CRM_BASE_URL}}/followup-sent with { "followup_id": item.followup_id, "status": "sent" }.

WORKFLOW 5: DAILY CLINIC DIGEST
Trigger: Schedule Trigger Node (Every day at 08:00 Asia/Dubai time / 04:00 UTC).
Steps:
1. HTTP Request: GET {{CRM_BASE_URL}}/daily-digest with x-api-key.
2. Gmail Node: Send styled daily digest HTML report to clinic management with new leads count, after-hours leads, bookings, handovers, and SLA first response average.`;
                handleCopy(promptText, 'n8n Master Flow Prompt');
              }}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-colors flex-shrink-0"
            >
              {copiedKey === 'n8n Master Flow Prompt' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Prompt Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Full n8n Master Prompt</span>
                </>
              )}
            </button>
          </div>

          {/* Architecture Visual Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-teal-200 text-teal-900">
                Workflow 1 & 2
              </span>
              <h4 className="font-bold text-teal-950 text-xs">Booking & Web Chatbot</h4>
              <p className="text-[11px] text-teal-800 leading-relaxed">
                Connects <code>/webhook/web-chat</code> to Gemini AI agent. Checks slot capacity, prevents double-booking, and logs new patients to Google Sheets.
              </p>
            </div>

            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                Workflow 3
              </span>
              <h4 className="font-bold text-emerald-950 text-xs">WhatsApp & AiSensy</h4>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Inbound WhatsApp message parsing, Meta 24-hour customer service window validation, and staff message dispatching via AiSensy REST API.
              </p>
            </div>

            <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-200 text-indigo-900">
                Workflow 4 & 5
              </span>
              <h4 className="font-bold text-indigo-950 text-xs">Gmail & Automated Follow-ups</h4>
              <p className="text-[11px] text-indigo-800 leading-relaxed">
                Dispatches 24h / 2h Gmail reminders with valet parking instructions, runs the 5-minute followup queue poller, and sends 8 AM daily digest emails.
              </p>
            </div>
          </div>

          {/* Master Prompt Display Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs">Master AI Prompt Content:</span>
              <span className="text-[11px] text-slate-400">Ready to paste into ChatGPT / Claude / n8n AI Assistant</span>
            </div>

            <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl font-mono text-[11px] leading-relaxed max-h-96 overflow-y-auto space-y-4 border border-slate-800">
              <p className="text-teal-400 font-bold"># MASTER PROMPT: CLINIC FLOW CRM & N8N AUTOMATION ENGINE</p>
              <p className="text-slate-400">
                CRM BASE URL: {typeof window !== 'undefined' ? window.location.origin : 'https://clinicflow.app'}
                <br />
                CRM API KEY: crm_live_secret_key_12345
                <br />
                N8N API KEY: n8n_sec_key_67890
              </p>
              <div className="text-slate-300 space-y-2">
                <p className="text-amber-300 font-bold">// 1. APPOINTMENT EVENTS, GOOGLE SHEETS & GMAIL REMINDERS</p>
                <p>Trigger: POST /webhook/crm-appointment-event (x-api-key: n8n_sec_key_67890)</p>
                <p>&bull; Google Sheets: Appends/updates "Clinic_Appointments_Master"</p>
                <p>&bull; Gmail: Dispatches rich HTML reminder with clinic address (Floor 3, Al Razi Healthcare Building, Dubai Marina Walk) & free valet parking</p>
                <p>&bull; AiSensy WhatsApp: Sends template "appointment_reminder_24h"</p>

                <p className="text-amber-300 font-bold pt-2">// 2. WEBSITE CHATBOT TRIAGE</p>
                <p>Trigger: POST /webhook/web-chat (from CRM web-chat-proxy)</p>
                <p>&bull; Calls GET /clinic-settings & GET /available-slots</p>
                <p>&bull; Checks clinical emergency keywords & triggers POST /handover</p>
                <p>&bull; Appends lead to Google Sheets "Web_Chat_Leads"</p>

                <p className="text-amber-300 font-bold pt-2">// 3. WHATSAPP & AISENSY API</p>
                <p>&bull; Webhook receiver calls POST /upsert-lead & POST /log-message</p>
                <p>&bull; Outbound /webhook/crm-send-message enforces Meta 24h window (409 window_closed)</p>

                <p className="text-amber-300 font-bold pt-2">// 4. SCHEDULED FOLLOW-UPS (EVERY 5 MIN)</p>
                <p>&bull; Polls GET /due-followups & updates POST /followup-sent</p>

                <p className="text-amber-300 font-bold pt-2">// 5. DAILY DIGEST REPORT (08:00 AM GST)</p>
                <p>&bull; Calls GET /daily-digest & emails management report via Gmail</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Supabase SQL (RLS & Triggers) */}
      {activeSubTab === 'supabase-sql' && (
        <div className="p-6 space-y-6 text-xs max-w-5xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-teal-700" />
                <h3 className="text-sm font-bold text-slate-900">Supabase SQL Schema</h3>
              </div>
              <p className="text-slate-500 mt-0.5">
                Run in Supabase SQL Editor for all 8 tables, RLS policies & triggers
              </p>
            </div>

            <button
              onClick={() => {
                const sqlScript = `-- ========================================================
-- CLINIC FLOW CRM: SUPABASE POSTGRESQL SCHEMA WITH RLS & TRIGGERS
-- Clinic: Demo Dental & Aesthetic Clinic (Dubai Marina)
-- ========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CLINIC SETTINGS TABLE
CREATE TABLE IF NOT EXISTS clinic_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL DEFAULT 'Demo Dental & Aesthetic Clinic',
  timezone TEXT NOT NULL DEFAULT 'Asia/Dubai',
  working_hours JSONB NOT NULL DEFAULT '{
    "monday": {"open": "09:00", "close": "20:00", "closed": false},
    "tuesday": {"open": "09:00", "close": "20:00", "closed": false},
    "wednesday": {"open": "09:00", "close": "20:00", "closed": false},
    "thursday": {"open": "09:00", "close": "20:00", "closed": false},
    "friday": {"open": "09:00", "close": "20:00", "closed": false},
    "saturday": {"open": "10:00", "close": "18:00", "closed": false},
    "sunday": {"open": "10:00", "close": "16:00", "closed": true}
  }'::jsonb,
  holidays TEXT[] NOT NULL DEFAULT ARRAY['2026-12-02', '2026-12-03', '2026-01-01'],
  slot_capacity INT NOT NULL DEFAULT 1,
  languages TEXT[] NOT NULL DEFAULT ARRAY['English', 'Arabic'],
  emergency_text TEXT NOT NULL DEFAULT 'For severe bleeding, acute trauma, or swelling affecting breathing, please visit the emergency hospital immediately or dial 999.',
  consent_text TEXT NOT NULL DEFAULT 'By messaging Demo Dental & Aesthetic Clinic, you agree to receive appointment reminders and updates via WhatsApp and SMS.',
  retention_days INT NOT NULL DEFAULT 90,
  first_response_target_seconds INT NOT NULL DEFAULT 180,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TREATMENTS TABLE
CREATE TABLE IF NOT EXISTS treatments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('dental', 'aesthetic')),
  duration_min INT NOT NULL DEFAULT 45,
  active BOOLEAN NOT NULL DEFAULT true,
  price_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. KNOWLEDGE BASE (APPROVED AI ANSWERS)
CREATE TABLE IF NOT EXISTS kb_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. LEADS TABLE
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'ar')),
  channel_first TEXT NOT NULL CHECK (channel_first IN ('whatsapp', 'web', 'instagram')),
  source TEXT DEFAULT 'Direct',
  treatment_interest TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'engaged', 'booked', 'visited', 'no_show', 'lost')),
  consent_at TIMESTAMPTZ,
  opted_out BOOLEAN NOT NULL DEFAULT false,
  after_hours BOOLEAN NOT NULL DEFAULT false,
  first_response_seconds INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'web', 'instagram')),
  mode TEXT NOT NULL DEFAULT 'ai' CHECK (mode IN ('ai', 'human')),
  handover_reason TEXT,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_patient_message_at TIMESTAMPTZ,
  unread_count INT NOT NULL DEFAULT 0
);

-- 6. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('in', 'out')),
  sender TEXT NOT NULL CHECK (sender IN ('patient', 'ai', 'staff')),
  text TEXT NOT NULL,
  wa_message_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  treatment_id UUID NOT NULL REFERENCES treatments(id),
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed', 'no_show')),
  created_by TEXT NOT NULL CHECK (created_by IN ('ai', 'staff')),
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'web', 'instagram')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. FOLLOWUPS QUEUE TABLE
CREATE TABLE IF NOT EXISTS followups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('reminder_24h', 'reminder_2h', 'no_booking_1', 'no_booking_2', 'post_visit', 'noshow_reschedule')),
  due_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
  template_name TEXT NOT NULL,
  params JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

ALTER TABLE clinic_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE followups ENABLE ROW LEVEL SECURITY;

-- Staff Policy (Auth users): Full read & write to patient operations
CREATE POLICY "Staff read patient data" ON leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff insert/update patient data" ON leads FOR ALL TO authenticated USING (true);

CREATE POLICY "Staff read conversations" ON conversations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff manage conversations" ON conversations FOR ALL TO authenticated USING (true);

CREATE POLICY "Staff read messages" ON messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff insert messages" ON messages FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Staff manage appointments" ON appointments FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff manage followups" ON followups FOR ALL TO authenticated USING (true);

-- Settings RLS: Only users with role = 'admin' in JWT app_metadata can modify clinic settings
CREATE POLICY "Read clinic settings" ON clinic_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin update clinic settings" ON clinic_settings FOR ALL TO authenticated 
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Read treatments" ON treatments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage treatments" ON treatments FOR ALL TO authenticated 
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Read kb" ON kb_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage kb" ON kb_entries FOR ALL TO authenticated 
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ========================================================
-- AUTOMATIC DATABASE TRIGGERS
-- ========================================================

-- Trigger 1: Double-Booking Prevention Against slot_capacity
CREATE OR REPLACE FUNCTION check_appointment_capacity()
RETURNS TRIGGER AS $$
DECLARE
  v_capacity INT;
  v_overlapping_count INT;
BEGIN
  IF NEW.status = 'confirmed' THEN
    SELECT slot_capacity INTO v_capacity FROM clinic_settings LIMIT 1;
    IF v_capacity IS NULL THEN v_capacity := 1; END IF;

    SELECT COUNT(*) INTO v_overlapping_count
    FROM appointments
    WHERE id <> NEW.id
      AND status = 'confirmed'
      AND NEW.start_at < end_at
      AND NEW.end_at > start_at;

    IF v_overlapping_count >= v_capacity THEN
      RAISE EXCEPTION 'Slot is full. Capacity of % patients reached for this time window.', v_capacity;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_appointment_capacity ON appointments;
CREATE TRIGGER trg_check_appointment_capacity
BEFORE INSERT OR UPDATE OF start_at, end_at, status ON appointments
FOR EACH ROW EXECUTE FUNCTION check_appointment_capacity();

-- Trigger 2: Auto-Create Followups on Confirmed Appointment
CREATE OR REPLACE FUNCTION auto_schedule_appointment_followups()
RETURNS TRIGGER AS $$
DECLARE
  v_lead_name TEXT;
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.status = 'confirmed') OR (TG_OP = 'UPDATE' AND OLD.status <> 'confirmed' AND NEW.status = 'confirmed') THEN
    SELECT name INTO v_lead_name FROM leads WHERE id = NEW.lead_id;

    -- 24h Reminder
    INSERT INTO followups (lead_id, appointment_id, type, due_at, template_name, params)
    VALUES (NEW.lead_id, NEW.id, 'reminder_24h', NEW.start_at - INTERVAL '24 hours', 'appointment_reminder_24h', jsonb_build_object('name', v_lead_name, 'start_at', NEW.start_at));

    -- 2h Urgent Reminder
    INSERT INTO followups (lead_id, appointment_id, type, due_at, template_name, params)
    VALUES (NEW.lead_id, NEW.id, 'reminder_2h', NEW.start_at - INTERVAL '2 hours', 'appointment_reminder_2h', jsonb_build_object('name', v_lead_name, 'start_at', NEW.start_at));

    -- Post-Visit Feedback (end_at + 3 hours)
    INSERT INTO followups (lead_id, appointment_id, type, due_at, template_name, params)
    VALUES (NEW.lead_id, NEW.id, 'post_visit', NEW.end_at + INTERVAL '3 hours', 'post_treatment_checkin', jsonb_build_object('name', v_lead_name));
  END IF;

  -- If appointment cancelled, mark pending followups skipped
  IF TG_OP = 'UPDATE' AND NEW.status = 'cancelled' THEN
    UPDATE followups SET status = 'skipped' WHERE appointment_id = NEW.id AND status = 'pending';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_schedule_followups ON appointments;
CREATE TRIGGER trg_auto_schedule_followups
AFTER INSERT OR UPDATE ON appointments
FOR EACH ROW EXECUTE FUNCTION auto_schedule_appointment_followups();

-- ========================================================
-- INITIAL SEED DATA
-- ========================================================
INSERT INTO clinic_settings (name) VALUES ('Demo Dental & Aesthetic Clinic') ON CONFLICT DO NOTHING;

INSERT INTO treatments (name, category, duration_min, active, price_note) VALUES
('Teeth Whitening (Zoom In-Office)', 'dental', 60, true, 'From AED 850 (includes assessment)'),
('Invisalign Clear Aligners Consultation', 'dental', 45, true, 'Complimentary 3D iTero scan'),
('Dental Implant Assessment', 'dental', 45, true, 'From AED 3,500 per Swiss implant'),
('Routine Dental Hygiene & Polish', 'dental', 45, true, 'AED 350 with ultrasonic scaling'),
('Botox Anti-Wrinkle Injections', 'aesthetic', 30, true, 'From AED 950 per area (Allergan)'),
('Dermal Lip & Cheek Fillers', 'aesthetic', 45, true, 'From AED 1,200 per 1ml Juvederm'),
('HydraFacial Elite MD', 'aesthetic', 60, true, 'AED 650 with lymphatic detox'),
('Laser Skin Rejuvenation', 'aesthetic', 45, true, 'From AED 750 (Clarity II)')
ON CONFLICT DO NOTHING;

INSERT INTO kb_entries (topic, answer) VALUES
('Consultation Fees', 'Our consultations are complimentary when treatment is booked on the same day. Standalone opinions are AED 250.'),
('Location & Parking', 'Floor 3, Al Razi Healthcare Building, Dubai Marina Walk, Dubai. Free reserved valet parking is provided.'),
('Botox Downtime & Aftercare', 'Virtually no downtime. Stay upright for 4 hours post-treatment. Results visible in 4 to 7 days.'),
('Languages Spoken', 'Our clinical and reception team speaks fluent English, Arabic (العربية), French, and Russian.')
ON CONFLICT DO NOTHING;`;
                handleCopy(sqlScript, 'Supabase SQL Script');
              }}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-colors flex-shrink-0"
            >
              {copiedKey === 'Supabase SQL Script' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>SQL Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Full Supabase SQL Script</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <p className="font-bold text-slate-800 text-xs flex items-center space-x-1">
                <Shield className="w-3.5 h-3.5 text-teal-600" />
                <span>Role-Based RLS Policies</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Staff can manage leads, appointments, and inbox messages. Only admins can edit settings, hours, and procedures.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <p className="font-bold text-slate-800 text-xs flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>Automated DB Triggers</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Auto-creates 24h & 2h reminders and 3h post-visit check-ins on appointment confirmation. Skips on cancel.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <p className="font-bold text-slate-800 text-xs flex items-center space-x-1">
                <Database className="w-3.5 h-3.5 text-teal-600" />
                <span>Double-Booking Constraint</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Database trigger blocks any booking that overlaps beyond the clinic's concurrent <code>slot_capacity</code>.
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800 text-xs">Complete PostgreSQL Schema & Trigger Script:</span>
              <span className="text-[11px] text-slate-400">Ready to execute in Supabase SQL Editor</span>
            </div>
            <pre className="p-4 bg-slate-900 text-emerald-400 rounded-2xl font-mono text-[11px] leading-relaxed max-h-96 overflow-y-auto border border-slate-800">
{`-- Run in Supabase SQL Editor:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 8 Core Tables:
-- clinic_settings, treatments, kb_entries, leads, conversations, messages, appointments, followups

-- RLS & Role-Based Policies:
-- Staff can view/reply in Inbox, schedule appointments, and manage leads.
-- Settings, treatments, and API secrets are protected for admin role only.

-- Automated Triggers:
-- 1. check_appointment_capacity() -> Prevents double-booking beyond slot_capacity
-- 2. auto_schedule_appointment_followups() -> Generates reminder_24h, reminder_2h, post_visit (+3h)`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
