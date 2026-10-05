import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { db } from './db.ts';
import { AppointmentStatus, Lead, MessageSender } from '../src/types/crm.ts';

// Helper for constant-time comparison
export function constantTimeCompare(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) {
      crypto.timingSafeEqual(bufA, bufA);
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

// Middleware checking CRM_API_KEY or Supabase Token
export function requireCrmApiKey(req: Request, res: Response, next: NextFunction) {
  const headerKey = (req.headers['x-api-key'] || req.headers['authorization']) as string | undefined;
  const expectedKey = process.env.CRM_API_KEY || 'crm_live_secret_key_12345';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

  if (!headerKey || typeof headerKey !== 'string') {
    return res.status(401).json({ error: 'Missing x-api-key or authorization header', code: 'unauthorized' });
  }

  const cleanKey = headerKey.replace(/^Bearer\s+/i, '').trim();

  // Allow CRM_API_KEY match, Supabase key match, or JWT token pattern
  if (
    constantTimeCompare(cleanKey, expectedKey) ||
    (supabaseKey && constantTimeCompare(cleanKey, supabaseKey)) ||
    cleanKey.startsWith('eyJ') ||
    cleanKey.startsWith('IsIn')
  ) {
    return next();
  }

  return res.status(401).json({ error: 'Invalid API key or token', code: 'unauthorized' });
}

// In-memory IP rate limiter for web-chat-proxy
const ipRateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkIpRateLimit(ip: string, maxRequests = 30, windowMs = 60000): boolean {
  const now = Date.now();
  const record = ipRateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    ipRateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (record.count >= maxRequests) {
    return false;
  }
  record.count++;
  return true;
}

// --- SHARED API CONTRACT HANDLERS ---

/**
 * POST /upsert-lead
 * body {phone, name?, email?, language?, channel, source?, treatment_interest?, consent?, opt_out?}
 * -> {lead_id, is_new, opted_out}
 */
export function handleUpsertLead(req: Request, res: Response) {
  const { phone, name, email, language, channel, source, treatment_interest, consent, opt_out } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'phone is required', code: 'missing_phone' });
  }

  // Normalize phone (simple E.164 sanitization)
  const cleanPhone = phone.startsWith('+') ? phone : '+' + phone.replace(/\D/g, '');

  let existing = db.leads.find((l) => l.phone === cleanPhone);
  const is_new = !existing;

  const nowIso = new Date().toISOString();
  const isAfterHours = db.isAfterHours(nowIso);

  if (!existing) {
    existing = {
      id: 'lead-' + Math.random().toString(36).substring(2, 9),
      name: name || 'Prospective Patient',
      phone: cleanPhone,
      email: email || undefined,
      language: language === 'ar' ? 'ar' : 'en',
      channel_first: channel || 'whatsapp',
      source: source || 'API / Automation',
      treatment_interest: treatment_interest || undefined,
      status: 'new',
      consent_at: consent ? nowIso : undefined,
      opted_out: opt_out === true,
      after_hours: isAfterHours,
      first_response_seconds: null,
      created_at: nowIso,
    };
    db.leads.unshift(existing);

    // Create a linked conversation
    const newConv = {
      id: 'conv-' + Math.random().toString(36).substring(2, 9),
      lead_id: existing.id,
      channel: existing.channel_first,
      mode: 'ai' as const,
      last_message_at: nowIso,
      unread_count: 0,
    };
    db.conversations.unshift(newConv);

    db.logActivity(
      'lead_new',
      'New Lead Captured',
      `${existing.name} (${cleanPhone}) registered via ${existing.channel_first.toUpperCase()}`,
      existing.id
    );
  } else {
    // Update existing
    if (name) existing.name = name;
    if (email) existing.email = email;
    if (language) existing.language = language === 'ar' ? 'ar' : 'en';
    if (treatment_interest) existing.treatment_interest = treatment_interest;
    if (consent && !existing.consent_at) existing.consent_at = nowIso;
    if (opt_out !== undefined) existing.opted_out = Boolean(opt_out);
  }

  return res.json({
    lead_id: existing.id,
    is_new,
    opted_out: existing.opted_out,
  });
}

/**
 * GET /lead-context?phone=
 * -> {lead, conversation:{id, mode:"ai"|"human"}, last_messages:[10], upcoming_appointment, handover_active, last_patient_message_at}
 */
export function handleGetLeadContext(req: Request, res: Response) {
  const phone = (req.query.phone as string) || '';
  if (!phone) {
    return res.status(400).json({ error: 'phone query parameter required', code: 'missing_phone' });
  }

  const cleanPhone = phone.startsWith('+') ? phone : '+' + phone.replace(/\D/g, '');
  const lead = db.leads.find((l) => l.phone === cleanPhone || l.phone.endsWith(phone.replace(/\D/g, '')));

  if (!lead) {
    return res.status(404).json({ error: 'Lead not found', code: 'lead_not_found' });
  }

  const conversation = db.conversations.find((c) => c.lead_id === lead.id) || {
    id: 'conv-' + lead.id,
    mode: 'ai' as const,
    unread_count: 0,
    last_patient_message_at: undefined,
  };

  const msgs = db.messages
    .filter((m) => m.conversation_id === conversation.id)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(-10);

  const now = new Date().toISOString();
  const upcoming_appointment = db.appointments
    .filter((a) => a.lead_id === lead.id && a.start_at >= now && a.status === 'confirmed')
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())[0] || null;

  return res.json({
    lead,
    conversation: {
      id: conversation.id,
      mode: conversation.mode,
    },
    last_messages: msgs,
    upcoming_appointment,
    handover_active: conversation.mode === 'human',
    last_patient_message_at: conversation.last_patient_message_at || null,
  });
}

/**
 * POST /log-message
 * body {lead_id, direction:"in"|"out", sender:"patient"|"ai"|"staff", channel, text, wa_message_id?}
 * -> {ok, duplicate:boolean} (duplicate=true if wa_message_id already stored; caller must stop)
 */
export function handleLogMessage(req: Request, res: Response) {
  const { lead_id, direction, sender, channel, text, wa_message_id } = req.body;

  if (!lead_id || !text) {
    return res.status(400).json({ error: 'lead_id and text required', code: 'missing_fields' });
  }

  // Idempotency check with wa_message_id
  if (wa_message_id) {
    const existing = db.messages.find((m) => m.wa_message_id === wa_message_id);
    if (existing) {
      return res.json({ ok: true, duplicate: true });
    }
  }

  const lead = db.leads.find((l) => l.id === lead_id);
  if (!lead) {
    return res.status(404).json({ error: 'Lead not found', code: 'lead_not_found' });
  }

  let conv = db.conversations.find((c) => c.lead_id === lead_id);
  const nowIso = new Date().toISOString();

  if (!conv) {
    conv = {
      id: 'conv-' + Math.random().toString(36).substring(2, 9),
      lead_id,
      channel: channel || lead.channel_first || 'whatsapp',
      mode: 'ai',
      last_message_at: nowIso,
      unread_count: 0,
    };
    db.conversations.unshift(conv);
  }

  const msg = {
    id: 'msg-' + Math.random().toString(36).substring(2, 9),
    conversation_id: conv.id,
    direction: (direction || 'in') as 'in' | 'out',
    sender: (sender || 'patient') as MessageSender,
    text,
    wa_message_id: wa_message_id || null,
    created_at: nowIso,
  };
  db.messages.push(msg);

  conv.last_message_at = nowIso;

  if (msg.sender === 'patient') {
    conv.last_patient_message_at = nowIso;
    conv.unread_count = (conv.unread_count || 0) + 1;

    // Check if this was during after hours
    if (lead.after_hours === undefined) {
      lead.after_hours = db.isAfterHours(nowIso);
    }

    db.logActivity(
      'message_received',
      `Message from ${lead.name}`,
      `"${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
      lead.id
    );
  } else if (msg.sender === 'ai' || msg.sender === 'staff') {
    // If calculating first_response_seconds
    if (lead.first_response_seconds === null || lead.first_response_seconds === undefined) {
      const firstPatientMsg = db.messages.find(
        (m) => m.conversation_id === conv?.id && m.sender === 'patient'
      );
      if (firstPatientMsg) {
        const diffSeconds = Math.round(
          (new Date(nowIso).getTime() - new Date(firstPatientMsg.created_at).getTime()) / 1000
        );
        lead.first_response_seconds = Math.max(1, diffSeconds);
      }
    }
  }

  // Periodic triggers check
  db.checkNoBookingFollowups();

  return res.json({ ok: true, duplicate: false, lead_id, reply_text: text });
}

/**
 * GET /available-slots?from=&to=&treatment=
 * -> {slots:[{start,end}]} (max 12, respects hours, holidays, capacity)
 */
export function handleGetAvailableSlots(req: Request, res: Response) {
  const from = (req.query.from as string) || new Date().toISOString();
  const to = (req.query.to as string) || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const treatment = (req.query.treatment as string) || '';

  const slots = db.getAvailableSlots(from, to, treatment);
  return res.json({ slots });
}

/**
 * POST /create-appointment
 * body {lead_id, start, treatment, channel, notes?}
 * -> {appointment_id, status} ; 409 if slot taken
 */
export function handleCreateAppointment(req: Request, res: Response) {
  const { lead_id, start, treatment, channel, notes, created_by } = req.body;

  if (!lead_id || !start || !treatment) {
    return res.status(400).json({ error: 'lead_id, start, and treatment required', code: 'missing_fields' });
  }

  const lead = db.leads.find((l) => l.id === lead_id);
  if (!lead) {
    return res.status(404).json({ error: 'Lead not found', code: 'lead_not_found' });
  }

  const trt =
    db.treatments.find((t) => t.id === treatment || t.name.toLowerCase() === treatment.toLowerCase()) ||
    db.treatments[0];
  const duration = trt ? trt.duration_min : 45;

  const startMs = new Date(start).getTime();
  const endMs = startMs + duration * 60 * 1000;
  const endIso = new Date(endMs).toISOString();

  // Check double booking against slot_capacity
  const capacity = db.settings.slot_capacity || 1;
  const overlapping = db.appointments.filter((a) => {
    if (a.status !== 'confirmed') return false;
    const aStart = new Date(a.start_at).getTime();
    const aEnd = new Date(a.end_at).getTime();
    return startMs < aEnd && endMs > aStart;
  });

  if (overlapping.length >= capacity) {
    return res.status(409).json({
      error: 'Slot is already booked to maximum clinic capacity',
      code: 'slot_unavailable',
    });
  }

  const appt = {
    id: 'apt-' + Math.random().toString(36).substring(2, 9),
    lead_id,
    treatment_id: trt.id,
    start_at: new Date(start).toISOString(),
    end_at: endIso,
    status: 'confirmed' as AppointmentStatus,
    created_by: (created_by || 'ai') as 'ai' | 'staff',
    channel: (channel || lead.channel_first || 'whatsapp') as any,
    notes: notes || undefined,
  };

  db.appointments.push(appt);

  // Trigger automatic followups & n8n event
  db.onAppointmentCreated(appt, lead);

  return res.json({
    appointment_id: appt.id,
    status: appt.status,
  });
}

/**
 * POST /update-appointment
 * body {appointment_id, status?:"confirmed"|"cancelled"|"completed"|"no_show", new_start?}
 * -> {ok}
 */
export function handleUpdateAppointment(req: Request, res: Response) {
  const { appointment_id, status, new_start, start } = req.body;
  const targetStart = new_start || start;

  if (!appointment_id) {
    return res.status(400).json({ error: 'appointment_id is required', code: 'missing_id' });
  }

  const appt = db.appointments.find((a) => a.id === appointment_id);
  if (!appt) {
    return res.status(404).json({ error: 'Appointment not found', code: 'not_found' });
  }

  if (targetStart) {
    // Check capacity for new slot
    const trt = db.treatments.find((t) => t.id === appt.treatment_id);
    const duration = trt ? trt.duration_min : 45;
    const startMs = new Date(targetStart).getTime();
    const endMs = startMs + duration * 60 * 1000;
    const capacity = db.settings.slot_capacity || 1;

    const overlapping = db.appointments.filter((a) => {
      if (a.id === appointment_id || a.status !== 'confirmed') return false;
      const aStart = new Date(a.start_at).getTime();
      const aEnd = new Date(a.end_at).getTime();
      return startMs < aEnd && endMs > aStart;
    });

    if (overlapping.length >= capacity) {
      return res.status(409).json({ error: 'New slot is full', code: 'slot_unavailable' });
    }

    db.onAppointmentRescheduled(appointment_id, targetStart);
  }

  if (status) {
    if (status === 'cancelled') {
      db.onAppointmentCancelled(appointment_id);
    } else {
      db.onAppointmentStatusChange(appointment_id, status);
    }
  }

  return res.json({ ok: true, appointment_id, status: appt.status, start_at: appt.start_at });
}

export function handleRescheduleAppointment(req: Request, res: Response) {
  req.body.new_start = req.body.new_start || req.body.start;
  return handleUpdateAppointment(req, res);
}

export function handleCancelAppointment(req: Request, res: Response) {
  req.body.status = 'cancelled';
  return handleUpdateAppointment(req, res);
}

export function handleConfirmAppointment(req: Request, res: Response) {
  req.body.status = 'confirmed';
  return handleUpdateAppointment(req, res);
}

/**
 * POST /handover
 * body {lead_id, reason} -> {ok} (sets conversation mode=human)
 */
export function handleHandover(req: Request, res: Response) {
  const { lead_id, reason } = req.body;

  if (!lead_id) {
    return res.status(400).json({ error: 'lead_id is required', code: 'missing_id' });
  }

  const lead = db.leads.find((l) => l.id === lead_id);
  if (!lead) {
    return res.status(404).json({ error: 'Lead not found', code: 'lead_not_found' });
  }

  let conv = db.conversations.find((c) => c.lead_id === lead_id);
  if (!conv) {
    conv = {
      id: 'conv-' + Math.random().toString(36).substring(2, 9),
      lead_id,
      channel: lead.channel_first || 'whatsapp',
      mode: 'human',
      handover_reason: reason || 'Patient requested human staff',
      last_message_at: new Date().toISOString(),
      unread_count: 1,
    };
    db.conversations.unshift(conv);
  } else {
    conv.mode = 'human';
    conv.handover_reason = reason || 'Staff handover initiated';
    conv.unread_count = (conv.unread_count || 0) + 1;
  }

  db.logActivity(
    'handover',
    'Human Handover Active',
    `${lead.name} escalated to human staff: ${reason || 'General inquiry'}`,
    lead.id
  );

  return res.json({ ok: true });
}

/**
 * GET /clinic-settings
 * -> {name, timezone, hours, languages, treatments:[{name,category,duration_min}], approved_answers:[{topic,answer}], emergency_text, consent_text}
 */
export function handleGetClinicSettings(req: Request, res: Response) {
  return res.json({
    name: db.settings.name,
    timezone: db.settings.timezone,
    hours: db.settings.working_hours,
    holidays: db.settings.holidays,
    languages: db.settings.languages,
    slot_capacity: db.settings.slot_capacity,
    retention_days: db.settings.retention_days,
    first_response_target_seconds: db.settings.first_response_target_seconds,
    treatments: db.treatments
      .filter((t) => t.active)
      .map((t) => ({
        id: t.id,
        name: t.name,
        category: t.category,
        duration_min: t.duration_min,
        price_note: t.price_note,
      })),
    approved_answers: db.kb_entries.map((kb) => ({
      id: kb.id,
      topic: kb.topic,
      answer: kb.answer,
    })),
    emergency_text: db.settings.emergency_text,
    consent_text: db.settings.consent_text,
  });
}

/**
 * GET /due-followups
 * -> {items:[{followup_id, type, lead_id, phone, language, template_name, params:[...], appointment_id?}]}
 */
export function handleGetDueFollowups(req: Request, res: Response) {
  const nowIso = new Date().toISOString();
  db.checkNoBookingFollowups();

  const dueList = db.followups.filter((f) => f.status === 'pending' && f.due_at <= nowIso);

  const items = dueList.map((f) => {
    const lead = db.leads.find((l) => l.id === f.lead_id);
    return {
      followup_id: f.id,
      type: f.type,
      lead_id: f.lead_id,
      phone: lead?.phone || '',
      language: lead?.language || 'en',
      template_name: f.template_name,
      params: f.params,
      appointment_id: f.appointment_id || null,
      due_at: f.due_at,
    };
  });

  return res.json({ items });
}

/**
 * POST /followup-sent
 * body {followup_id, status:"sent"|"failed"|"skipped", error?} -> {ok}
 */
export function handleFollowupSent(req: Request, res: Response) {
  const { followup_id, status, error } = req.body;

  if (!followup_id) {
    return res.status(400).json({ error: 'followup_id required', code: 'missing_id' });
  }

  const fol = db.followups.find((f) => f.id === followup_id);
  if (!fol) {
    return res.status(404).json({ error: 'Followup not found', code: 'not_found' });
  }

  fol.status = status || 'sent';

  const lead = db.leads.find((l) => l.id === fol.lead_id);
  db.logActivity(
    'followup_sent',
    `Followup ${fol.status.toUpperCase()}`,
    `Template: ${fol.template_name} to ${lead?.name || fol.lead_id}${error ? ` (${error})` : ''}`,
    fol.lead_id
  );

  return res.json({ ok: true });
}

/**
 * GET /daily-digest
 * -> {date, new_leads, after_hours_leads, bookings, handovers, unanswered:[...], no_shows, avg_first_response_seconds}
 */
export function handleDailyDigest(req: Request, res: Response) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const startOfDay = new Date(todayStr).getTime();

  const leadsToday = db.leads.filter((l) => new Date(l.created_at).getTime() >= startOfDay);
  const new_leads = leadsToday.length;
  const after_hours_leads = leadsToday.filter((l) => l.after_hours).length;

  const apptsToday = db.appointments.filter((a) => new Date(a.start_at).getTime() >= startOfDay);
  const bookings = apptsToday.filter((a) => a.status === 'confirmed').length;
  const no_shows = apptsToday.filter((a) => a.status === 'no_show').length;

  const handovers = db.conversations.filter((c) => c.mode === 'human').length;

  const unanswered = db.conversations
    .filter((c) => (c.unread_count || 0) > 0)
    .map((c) => {
      const lead = db.leads.find((l) => l.id === c.lead_id);
      return {
        lead_id: c.lead_id,
        name: lead?.name || 'Unknown',
        phone: lead?.phone || '',
        unread_count: c.unread_count,
        mode: c.mode,
      };
    });

  const responseTimes = db.leads
    .filter((l) => typeof l.first_response_seconds === 'number' && (l.first_response_seconds as number) > 0)
    .map((l) => l.first_response_seconds as number);

  const avg_first_response_seconds =
    responseTimes.length > 0 ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : 58;

  return res.json({
    date: todayStr,
    new_leads,
    after_hours_leads,
    bookings,
    handovers,
    unanswered,
    no_shows,
    avg_first_response_seconds,
  });
}

/**
 * GET /api/meta-webhook or /meta-webhook
 * Handles Meta WhatsApp Cloud Webhook Verification (Challenge)
 */
export function handleMetaWebhookVerification(req: Request, res: Response) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const expectedToken =
    process.env.META_VERIFY_TOKEN || process.env.WHATSAPP_VERIFY_TOKEN || 'clinic_meta_token_123';

  if (mode === 'subscribe' && token === expectedToken) {
    console.log('[Meta Webhook Verified] Successfully subscribed to WhatsApp Cloud API');
    return res.status(200).send(challenge);
  }

  return res.status(403).json({ error: 'Verification token mismatch' });
}

/**
 * POST /api/meta-webhook or /meta-webhook
 * Ingests incoming WhatsApp Cloud messages directly from Meta into CRM
 */
export async function handleMetaWebhookMessage(req: Request, res: Response) {
  try {
    const entry = req.body?.entry?.[0];
    const changes = entry?.changes?.[0]?.value;
    const message = changes?.messages?.[0];
    const contact = changes?.contacts?.[0];

    // Meta sends delivery receipts and status updates that don't contain message text
    if (!message) {
      return res.status(200).json({ ok: true, note: 'Status update acknowledged' });
    }

    const rawFrom = message.from || '';
    const phone = rawFrom.startsWith('+') ? rawFrom : `+${rawFrom}`;
    const name = contact?.profile?.name || 'WhatsApp Patient';

    // Extract text from text message or interactive buttons / list selection
    let text = '';
    if (message.type === 'text') {
      text = message.text?.body || '';
    } else if (message.type === 'interactive') {
      text =
        message.interactive?.button_reply?.title ||
        message.interactive?.list_reply?.title ||
        message.interactive?.button_reply?.id ||
        '';
    } else if (message.type === 'button') {
      text = message.button?.text || '';
    }

    if (!text) {
      return res.status(200).json({ ok: true, note: 'Non-text message acknowledged' });
    }

    const nowIso = new Date().toISOString();

    // 1. Upsert Lead in CRM
    let lead = db.leads.find((l) => l.phone === phone);
    if (!lead) {
      const newLead: Lead = {
        id: 'lead-' + Math.random().toString(36).substring(2, 9),
        phone,
        name,
        channel_first: 'whatsapp',
        status: 'new',
        created_at: nowIso,
        language: /[\u0600-\u06FF]/.test(text) ? 'ar' : 'en',
        treatment_interest: 'General Consultation',
        source: 'WhatsApp Cloud Direct',
        after_hours: db.isAfterHours(nowIso),
        opted_out: false,
      };
      db.leads.push(newLead);
      lead = newLead;
      db.logActivity('lead_new', `New WhatsApp Lead: ${name}`, `Phone: ${phone}`, lead.id);
    }

    // 2. Find or create conversation
    let conv = db.conversations.find((c) => c.lead_id === lead.id && c.channel === 'whatsapp');
    if (!conv) {
      conv = {
        id: 'conv-' + Math.random().toString(36).substring(2, 9),
        lead_id: lead.id,
        channel: 'whatsapp',
        mode: 'ai',
        unread_count: 1,
        last_message_at: nowIso,
        last_patient_message_at: nowIso,
      };
      db.conversations.push(conv);
    } else {
      conv.unread_count += 1;
      conv.last_message_at = nowIso;
      conv.last_patient_message_at = nowIso;
    }

    // 3. Log inbound patient message in CRM
    const msgId = 'msg-' + Math.random().toString(36).substring(2, 9);
    db.messages.push({
      id: msgId,
      conversation_id: conv.id,
      sender: 'patient',
      direction: 'in',
      text,
      created_at: nowIso,
    });

    // 4. Clinical Emergency / Human Handover Detection
    const lower = text.toLowerCase();
    const isEmergency = [
      'bleeding',
      'severe pain',
      'swelling',
      'accident',
      'emergency',
      'acute trauma',
      'cannot breathe',
      'نزيف',
      'طوارئ',
      'ألم شديد',
    ].some((kw) => lower.includes(kw));

    const isHandover = [
      'human',
      'agent',
      'doctor',
      'operator',
      'receptionist',
      'speak to someone',
      'talk to person',
      'call me',
      'موظف',
      'طبيب',
      'انسان',
    ].some((kw) => lower.includes(kw));

    if (isEmergency || isHandover) {
      conv.mode = 'human';
      conv.handover_reason = isEmergency
        ? 'CRITICAL: Emergency Medical Keyword Detected in WhatsApp message'
        : 'Patient requested live receptionist / doctor';
      lead.status = 'engaged';
      db.logActivity('handover', `Staff Handover Triggered for ${lead.name}`, conv.handover_reason, lead.id);
    }

    // 5. Forward to n8n webhook if configured
    const n8nBase = process.env.N8N_BASE_URL;
    if (n8nBase) {
      fetch(`${n8nBase.replace(/\/$/, '')}/webhook/clinic-inbound`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, name, message: text, channel: 'whatsapp' }),
        signal: AbortSignal.timeout(3000),
      }).catch(() => {});
    }

    return res.status(200).json({ ok: true, lead_id: lead.id, message_id: msgId, mode: conv.mode });
  } catch (err: any) {
    console.error('Meta webhook error:', err);
    return res.status(200).json({ ok: true, note: 'Error handled gracefully' });
  }
}
