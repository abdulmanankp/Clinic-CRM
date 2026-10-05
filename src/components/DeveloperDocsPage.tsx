import React, { useState } from 'react';
import {
  Code2,
  Terminal,
  Server,
  Zap,
  Database,
  Key,
  Copy,
  Check,
  ArrowLeft,
  ExternalLink,
  Shield,
  Layers,
  FileCode,
  Globe,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

interface DeveloperDocsPageProps {
  onBackToLanding: () => void;
  onOpenPortal: () => void;
}

export const DeveloperDocsPage: React.FC<DeveloperDocsPageProps> = ({
  onBackToLanding,
  onOpenPortal,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeDocSection, setActiveDocSection] = useState<'endpoints' | 'n8n' | 'env' | 'database'>('endpoints');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const API_BASE = typeof window !== 'undefined' ? window.location.origin : 'https://clinic.wovextech.com';

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#070b14]/90 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBackToLanding}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors flex items-center space-x-1.5 text-xs font-bold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Clinic Site</span>
            </button>

            <div className="h-5 w-px bg-slate-800 hidden sm:block"></div>

            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base text-white">ClinicFlow API & Integration Hub</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                v2.4 Production
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <a
              href="https://calendly.com/abdulmanankp0/clinic-ai-automation-meeting"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700"
            >
              <span>Developer Q&A Call</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            <button
              onClick={onOpenPortal}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/30 transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <span>Launch CRM Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4 mb-8">
          <button
            onClick={() => setActiveDocSection('endpoints')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeDocSection === 'endpoints'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>REST API Endpoints</span>
          </button>

          <button
            onClick={() => setActiveDocSection('n8n')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeDocSection === 'n8n'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-rose-400" />
            <span>n8n Multi-Channel Workflow</span>
          </button>

          <button
            onClick={() => setActiveDocSection('env')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeDocSection === 'env'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>Environment & Secrets</span>
          </button>

          <button
            onClick={() => setActiveDocSection('database')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeDocSection === 'database'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Database Triggers & Concurrency</span>
          </button>
        </div>

        {/* SECTION 1: REST API ENDPOINTS */}
        {activeDocSection === 'endpoints' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-extrabold text-white">REST API Reference</h2>
              <p className="text-xs text-slate-400 mt-1">
                Authenticate all requests with <code className="text-teal-400">x-api-key: crm_live_secret_key_12345</code> or <code className="text-teal-400">Authorization: Bearer &lt;token&gt;</code>.
              </p>
            </div>

            {/* Endpoint 1: Upsert Lead */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2.5">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
                    POST
                  </span>
                  <span className="font-mono text-sm font-bold text-white">/api/upsert-lead</span>
                </div>
                <span className="text-[11px] text-slate-400">Creates or updates patient lead</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <p className="text-slate-400 text-[11px] mb-1 font-sans font-semibold">Request Body:</p>
                  <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 overflow-x-auto">
{`{
  "phone": "+971501234567",
  "name": "Sarah Mansoor",
  "channel": "whatsapp",
  "treatment_interest": "Zoom Teeth Whitening",
  "source": "n8n Multi-Channel Clinic Booking"
}`}
                  </pre>
                </div>
                <div>
                  <p className="text-slate-400 text-[11px] mb-1 font-sans font-semibold">Response (200 OK):</p>
                  <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-teal-300 overflow-x-auto">
{`{
  "lead_id": "lead-oq4n4ob",
  "is_new": true,
  "opted_out": false
}`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Endpoint 2: Available Slots */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2.5">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-mono font-bold">
                    GET
                  </span>
                  <span className="font-mono text-sm font-bold text-white">/api/available-slots?treatment=trt-1</span>
                </div>
                <span className="text-[11px] text-slate-400">Returns conflict-free available chair slots</span>
              </div>

              <div className="text-xs font-mono">
                <p className="text-slate-400 text-[11px] mb-1 font-sans font-semibold">Response (200 OK):</p>
                <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-teal-300 overflow-x-auto">
{`{
  "slots": [
    { "start": "2026-10-06T09:00:00.000Z", "end": "2026-10-06T10:00:00.000Z" },
    { "start": "2026-10-06T11:00:00.000Z", "end": "2026-10-06T12:00:00.000Z" }
  ]
}`}
                </pre>
              </div>
            </div>

            {/* Endpoint 3: Create Appointment */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2.5">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
                    POST
                  </span>
                  <span className="font-mono text-sm font-bold text-white">/api/create-appointment</span>
                </div>
                <span className="text-[11px] text-slate-400">Enforces capacity & blocks overlapping bookings</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <p className="text-slate-400 text-[11px] mb-1 font-sans font-semibold">Request Body:</p>
                  <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 overflow-x-auto">
{`{
  "lead_id": "lead-oq4n4ob",
  "start": "2026-10-06T09:00:00.000Z",
  "treatment": "trt-1",
  "channel": "whatsapp",
  "notes": "Central booking via n8n"
}`}
                  </pre>
                </div>
                <div>
                  <p className="text-slate-400 text-[11px] mb-1 font-sans font-semibold">Response (200 OK / 409 Conflict):</p>
                  <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-teal-300 overflow-x-auto">
{`{
  "appointment_id": "apt-td06a99",
  "status": "confirmed"
}
/* If double-booked: 409 { "code": "slot_unavailable" } */`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Endpoint 4: Reschedule / Cancel / Confirm */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2.5">
                  <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-mono font-bold">
                    PATCH / POST
                  </span>
                  <span className="font-mono text-sm font-bold text-white">/api/reschedule-appointment</span>
                </div>
                <span className="text-[11px] text-slate-400">Reschedules appointment time with capacity check</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <p className="text-slate-400 text-[11px] mb-1 font-sans font-semibold">Request Body:</p>
                  <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 overflow-x-auto">
{`{
  "appointment_id": "apt-td06a99",
  "start": "2026-10-06T11:00:00.000Z",
  "treatment": "trt-1"
}`}
                  </pre>
                </div>
                <div>
                  <p className="text-slate-400 text-[11px] mb-1 font-sans font-semibold">Response (200 OK):</p>
                  <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-teal-300 overflow-x-auto">
{`{
  "ok": true,
  "appointment_id": "apt-td06a99",
  "status": "confirmed",
  "start_at": "2026-10-06T11:00:00.000Z"
}`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Endpoint 5: Handover */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2.5">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
                    POST
                  </span>
                  <span className="font-mono text-sm font-bold text-white">/api/handover</span>
                </div>
                <span className="text-[11px] text-slate-400">Escalates patient chat to front-desk staff</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <p className="text-slate-400 text-[11px] mb-1 font-sans font-semibold">Request Body:</p>
                  <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 overflow-x-auto">
{`{
  "lead_id": "lead-oq4n4ob",
  "reason": "Patient requested human coordinator"
}`}
                  </pre>
                </div>
                <div>
                  <p className="text-slate-400 text-[11px] mb-1 font-sans font-semibold">Response (200 OK):</p>
                  <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-teal-300 overflow-x-auto">
{`{
  "ok": true
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: n8n WORKFLOW INTEGRATION */}
        {activeDocSection === 'n8n' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-white">n8n Master Multi-Channel Workflow</h2>
              <p className="text-xs text-slate-400 mt-1">
                Architectural breakdown of the n8n automation graph and node mapping.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h3 className="font-bold text-sm text-teal-300">How n8n Connects to ClinicFlow</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                The n8n workflow operates as the central conversational and scheduling engine. It normalizes inbound webhooks from Meta WhatsApp Cloud API, Instagram DM, and the website chat, parses intents, executes deterministic slot matching against ClinicFlow’s live API, creates the appointment, appends to the Google Sheet reminder ledger, and syncs with Google Calendar.
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="font-bold text-white mb-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>1. Inbound Ingestion (Meta Webhook)</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Webhook path: <code className="text-teal-300">/clinic-inbound</code> or <code className="text-teal-300">/whatsapp-cloud-inbound</code>. Handles Meta verify challenge and inbound messages.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="font-bold text-white mb-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    <span>2. Deterministic Slot Matching</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Calls <code className="text-teal-300">GET /api/available-slots</code>. Formats interactive WhatsApp list message rows with button payloads formatted as: <code className="text-slate-300">BOOK_SLOT|treatment_id|YYYY-MM-DD|HH:mm</code>.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="font-bold text-white mb-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                    <span>3. Concurrency Lock & Confirmation</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Calls <code className="text-teal-300">POST /api/create-appointment</code>. Creates event in Google Calendar, appends to Google Sheet ledger, and sends WhatsApp confirmation template.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="font-bold text-white mb-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span>4. 24h & 2h Automated Reminder Cron</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    n8n Schedule Trigger scans Google Sheet ledger every 15 minutes, finds appointments due in 24 hours, and dispatches interactive quick-reply templates: <code className="text-slate-300">CONFIRM_APPOINTMENT|id</code>, <code className="text-slate-300">RESCHEDULE_APPOINTMENT|id</code>, <code className="text-slate-300">CANCEL_APPOINTMENT|id</code>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: ENVIRONMENT VARIABLES & SECRETS */}
        {activeDocSection === 'env' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-white">Environment Variables & Configuration</h2>
              <p className="text-xs text-slate-400 mt-1">
                Configure these keys in your n8n workflow settings or .env file.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-white">n8n Environment Configuration:</span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `CLINIC_API_KEY=crm_live_secret_key_12345
CLINIC_API_BEARER_TOKEN=crm_live_secret_key_12345
CLINIC_NAME=Demo Dental & Aesthetic Clinic (Dubai Marina)
DEFAULT_CLINIC_TREATMENT_ID=trt-1
CLINIC_RESCHEDULE_URL=${API_BASE}/api/reschedule-appointment
CLINIC_CANCEL_URL=${API_BASE}/api/cancel-appointment
CLINIC_CONFIRM_URL=${API_BASE}/api/confirm-appointment
META_GRAPH_VERSION=v24.0
WHATSAPP_PHONE_NUMBER_ID=your_meta_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_meta_system_user_token
WHATSAPP_VERIFY_TOKEN=clinic_meta_verify_token_2026`,
                      'n8n-env'
                    )
                  }
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 text-[11px] font-bold border border-slate-700 flex items-center space-x-1 cursor-pointer"
                >
                  {copiedKey === 'n8n-env' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'n8n-env' ? 'Copied' : 'Copy Configuration'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
{`# ClinicFlow CRM Authentication
CLINIC_API_KEY=crm_live_secret_key_12345
CLINIC_API_BEARER_TOKEN=crm_live_secret_key_12345
CLINIC_NAME=Demo Dental & Aesthetic Clinic (Dubai Marina)
DEFAULT_CLINIC_TREATMENT_ID=trt-1

# Reschedule, Cancel & Confirm Endpoints (Enabled)
CLINIC_RESCHEDULE_URL=${API_BASE}/api/reschedule-appointment
CLINIC_CANCEL_URL=${API_BASE}/api/cancel-appointment
CLINIC_CONFIRM_URL=${API_BASE}/api/confirm-appointment

# WhatsApp Meta Cloud API
META_GRAPH_VERSION=v24.0
WHATSAPP_PHONE_NUMBER_ID=your_meta_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_meta_system_user_token
WHATSAPP_VERIFY_TOKEN=clinic_meta_verify_token_2026`}
              </pre>
            </div>
          </div>
        )}

        {/* SECTION 4: DATABASE & CONCURRENCY */}
        {activeDocSection === 'database' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-white">Database Triggers & Concurrency Locking</h2>
              <p className="text-xs text-slate-400 mt-1">
                PostgreSQL and memory-backed slot capacity validation to eliminate double-bookings.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h3 className="font-bold text-sm text-teal-300">Concurrency Double-Booking Prevention</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                When an appointment is requested via <code className="text-teal-400">/api/create-appointment</code>, the engine performs a synchronized range overlap check:
              </p>

              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto">
{`-- Overlap Condition:
WHERE (new_start < existing_end) AND (new_end > existing_start)
AND status = 'confirmed'

-- Capacity Gate:
IF COUNT(overlapping) >= slot_capacity THEN
  RAISE EXCEPTION 'slot_unavailable' (HTTP 409 Conflict);
END IF;`}
              </pre>

              <p className="text-xs text-slate-300 leading-relaxed">
                If the slot is full, the server returns <code className="text-rose-400">409 Conflict</code>. The n8n workflow detects this via its <code className="text-teal-300">Slot Validity Gate</code> and routes the user to <code className="text-teal-300">Slot Unavailable Response</code>, querying the latest available alternatives without crashing.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
