import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  requireCrmApiKey,
  handleUpsertLead,
  handleGetLeadContext,
  handleLogMessage,
  handleGetAvailableSlots,
  handleCreateAppointment,
  handleUpdateAppointment,
  handleHandover,
  handleGetClinicSettings,
  handleGetDueFollowups,
  handleFollowupSent,
  handleDailyDigest,
  handleMetaWebhookVerification,
  handleMetaWebhookMessage,
} from './server/api.ts';
import {
  handleWebChatProxy,
  handleStaffSendMessage,
  handleSimulateDemoEnquiry,
} from './server/webChatProxy.ts';
import { db } from './server/db.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Native CORS middleware
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-api-key, Authorization');
  if (_req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

app.use(express.json());

// ==========================================
// 1. EXACT SHARED API CONTRACT (CRM Endpoints)
// Authenticated with x-api-key == CRM_API_KEY
// Accessible at both root ('/...') and '/api/...'
// ==========================================

// POST /upsert-lead
app.post(['/upsert-lead', '/api/upsert-lead'], requireCrmApiKey, handleUpsertLead);

// GET /lead-context?phone=
app.get(['/lead-context', '/api/lead-context'], requireCrmApiKey, handleGetLeadContext);

// POST /log-message
app.post(['/log-message', '/api/log-message'], requireCrmApiKey, handleLogMessage);

// GET /available-slots
app.get(['/available-slots', '/api/available-slots'], (req, res, next) => {
  // Allow frontend internal calls or API key for external n8n calls
  if (req.headers['x-api-key']) {
    return requireCrmApiKey(req, res, next);
  }
  next();
}, handleGetAvailableSlots);

// POST /create-appointment
app.post(['/create-appointment', '/api/create-appointment'], (req, res, next) => {
  if (req.headers['x-api-key']) {
    return requireCrmApiKey(req, res, next);
  }
  next();
}, handleCreateAppointment);

// POST /update-appointment
app.post(['/update-appointment', '/api/update-appointment'], (req, res, next) => {
  if (req.headers['x-api-key']) {
    return requireCrmApiKey(req, res, next);
  }
  next();
}, handleUpdateAppointment);

// POST /handover
app.post(['/handover', '/api/handover'], (req, res, next) => {
  if (req.headers['x-api-key']) {
    return requireCrmApiKey(req, res, next);
  }
  next();
}, handleHandover);

// GET /clinic-settings
app.get(['/clinic-settings', '/api/clinic-settings'], (req, res, next) => {
  if (req.headers['x-api-key']) {
    return requireCrmApiKey(req, res, next);
  }
  next();
}, handleGetClinicSettings);

// GET /due-followups
app.get(['/due-followups', '/api/due-followups'], requireCrmApiKey, handleGetDueFollowups);

// POST /followup-sent
app.post(['/followup-sent', '/api/followup-sent'], requireCrmApiKey, handleFollowupSent);

// GET /daily-digest
app.get(['/daily-digest', '/api/daily-digest'], (req, res, next) => {
  if (req.headers['x-api-key']) {
    return requireCrmApiKey(req, res, next);
  }
  next();
}, handleDailyDigest);

// ==========================================
// 2. PUBLIC & INTEGRATION ENDPOINTS
// ==========================================

// Web Chat Proxy (called by /widget, rate limited by IP)
app.post(['/web-chat-proxy', '/api/web-chat-proxy'], handleWebChatProxy);

// Meta WhatsApp Cloud Webhook (Verification & Ingestion)
app.get(['/meta-webhook', '/api/meta-webhook'], handleMetaWebhookVerification);
app.post(['/meta-webhook', '/api/meta-webhook'], handleMetaWebhookMessage);

// Staff message sending (from CRM Inbox, checks 24h WhatsApp window)
app.post('/api/staff-send-message', handleStaffSendMessage);

// Demo Simulation & Reset
app.post('/api/demo/simulate', handleSimulateDemoEnquiry);

app.post('/api/demo/reset', (_req, res) => {
  db.seedDemoData();
  return res.json({ ok: true, message: 'Demo data reseeded with 12 fictional leads, 8 appointments, and messages.' });
});

// Full state endpoint for the Staff UI frontend
app.get('/api/staff/bundle', (_req, res) => {
  db.checkNoBookingFollowups();
  return res.json({
    settings: db.settings,
    treatments: db.treatments,
    kb_entries: db.kb_entries,
    leads: db.leads,
    conversations: db.conversations,
    messages: db.messages,
    appointments: db.appointments,
    followups: db.followups,
    activities: db.activities,
    staff_users: db.getStaffUsers(),
  });
});

// Database-backed Staff Authentication
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ ok: false, error: 'Email and password credentials are required.' });
  }
  const result = db.authenticateUser(email, password);
  if (!result.ok) {
    return res.status(401).json(result);
  }
  return res.json(result);
});

// Staff Users Database Management Endpoints
app.get('/api/staff-users', (_req, res) => {
  return res.json({ ok: true, staff_users: db.getStaffUsers() });
});

app.post('/api/staff-users', (req, res) => {
  const { name, email, role, password } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ ok: false, error: 'Name, email, and role are required' });
  }
  const newUser = db.createStaffUser({ name, email, role, password });
  return res.json({ ok: true, user: newUser });
});

app.put('/api/staff-users/:id/role', (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const ok = db.updateStaffUserRole(id, role);
  return res.json({ ok });
});

app.delete('/api/staff-users/:id', (req, res) => {
  const { id } = req.params;
  const ok = db.deleteStaffUser(id);
  return res.json({ ok });
});

// Update treatment / KB / settings from frontend
app.post('/api/settings/update', (req, res) => {
  const updates = req.body;
  if (updates.name) db.settings.name = updates.name;
  if (updates.timezone) db.settings.timezone = updates.timezone;
  if (updates.working_hours) db.settings.working_hours = updates.working_hours;
  if (updates.slot_capacity) db.settings.slot_capacity = updates.slot_capacity;
  if (updates.emergency_text) db.settings.emergency_text = updates.emergency_text;
  if (updates.consent_text) db.settings.consent_text = updates.consent_text;
  if (updates.retention_days) db.settings.retention_days = updates.retention_days;
  if (updates.first_response_target_seconds)
    db.settings.first_response_target_seconds = updates.first_response_target_seconds;

  return res.json({ ok: true, settings: db.settings });
});

app.post('/api/treatments/upsert', (req, res) => {
  const trt = req.body;
  const existingIdx = db.treatments.findIndex((t) => t.id === trt.id);
  if (existingIdx >= 0) {
    db.treatments[existingIdx] = { ...db.treatments[existingIdx], ...trt };
  } else {
    const newTrt = {
      id: 'trt-' + Math.random().toString(36).substring(2, 9),
      name: trt.name || 'New Treatment',
      category: trt.category || 'dental',
      duration_min: Number(trt.duration_min) || 45,
      active: trt.active !== false,
      price_note: trt.price_note || '',
    };
    db.treatments.push(newTrt);
  }
  return res.json({ ok: true, treatments: db.treatments });
});

app.post('/api/kb/upsert', (req, res) => {
  const kb = req.body;
  const existingIdx = db.kb_entries.findIndex((k) => k.id === kb.id);
  if (existingIdx >= 0) {
    db.kb_entries[existingIdx] = { ...db.kb_entries[existingIdx], ...kb };
  } else {
    db.kb_entries.push({
      id: 'kb-' + Math.random().toString(36).substring(2, 9),
      topic: kb.topic || 'New Topic',
      answer: kb.answer || '',
    });
  }
  return res.json({ ok: true, kb_entries: db.kb_entries });
});

app.delete('/api/kb/:id', (req, res) => {
  const { id } = req.params;
  db.kb_entries = db.kb_entries.filter((k) => k.id !== id);
  return res.json({ ok: true, kb_entries: db.kb_entries });
});

// Update conversation mode (AI vs Human handover)
app.post('/api/conversations/:id/mode', (req, res) => {
  const { id } = req.params;
  const { mode, reason } = req.body;
  const conv = db.conversations.find((c) => c.id === id);
  if (!conv) return res.status(404).json({ error: 'Conversation not found' });
  conv.mode = mode === 'human' ? 'human' : 'ai';
  if (reason) conv.handover_reason = reason;
  return res.json({ ok: true, conversation: conv });
});

// Update lead status or opt-out
app.post('/api/leads/:id', (req, res) => {
  const { id } = req.params;
  const { status, opted_out, treatment_interest } = req.body;
  const lead = db.leads.find((l) => l.id === id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  if (status) lead.status = status;
  if (opted_out !== undefined) lead.opted_out = opted_out;
  if (treatment_interest) lead.treatment_interest = treatment_interest;
  return res.json({ ok: true, lead });
});

// ==========================================
// 3. FRONTEND VITE INTEGRATION
// ==========================================
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Clinic Flow CRM server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
