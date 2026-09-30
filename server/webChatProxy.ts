import { Request, Response } from 'express';
import { db } from './db.ts';
import { checkIpRateLimit } from './api.ts';

// Intelligent clinic responder for web widget & demo when n8n is offline or in simulated mode
function generateClinicReply(
  text: string,
  leadName?: string
): { reply: string; handover: boolean; reason?: string } {
  const lower = text.toLowerCase();

  // Clinical emergency or human handover keywords
  const isEmergency =
    lower.includes('bleeding') ||
    lower.includes('severe pain') ||
    lower.includes('infection') ||
    lower.includes('swelling') ||
    lower.includes('throbbing') ||
    lower.includes('fever') ||
    lower.includes('human') ||
    lower.includes('doctor') ||
    lower.includes('talk to a human') ||
    lower.includes('نزيف') ||
    lower.includes('ألم شديد') ||
    lower.includes('طبيب');

  if (isEmergency) {
    const isArabic = /[\u0600-\u06FF]/.test(text);
    if (isArabic) {
      return {
        reply:
          'تم تحويل محادثتك فوراً إلى الفريق الطبي والمشرف الإكلينيكي في عيادة ديمو. إذا كانت الحالة طارئة جداً أو تشعر بضيق في التنفس، يُرجى التوجه لأقرب طوارئ فوراً أو الاتصال بالرقم 999. سيتواصل معك فريقنا خلال دقائق.',
        handover: true,
        reason: 'حالة إكلينيكية عاجلة أو طلب التحدث مع أخصائي',
      };
    }
    return {
      reply:
        'I have immediately escalated your conversation to our on-duty clinical coordinator at Demo Dental & Aesthetic Clinic. If you are experiencing acute trauma, severe bleeding, or difficulty breathing, please seek immediate emergency care or call 999. Our staff is reviewing your case right now.',
      handover: true,
      reason: 'Urgent clinical symptom or explicit request for staff',
    };
  }

  // Arabic Lip filler
  if (/[\u0600-\u06FF]/.test(text) && (lower.includes('فيلر') || text.includes('شفايف') || text.includes('سعر'))) {
    return {
      reply:
        'أهلاً وسهلاً بك في عيادة ديمو للأسنان والجلدية والتجميل! ✨ يبدأ فيلر الشفايف لدينا من 1,200 درهم للإبرة (1 مل) باستخدام أجود المنتجات العالمية المعتمدة مثل Juvederm و Restylane وبإشراف استشاري الجلدية والتجميل. هل ترغبين في حجز موعد استشارة مع د. سارة؟',
      handover: false,
    };
  }

  // Reschedule
  if (lower.includes('reschedule') || lower.includes('change my appointment') || lower.includes('تغيير موعد')) {
    return {
      reply:
        'I would be happy to help you reschedule your appointment at Demo Dental & Aesthetic Clinic. Could you please confirm your phone number or preferred new date and time?',
      handover: false,
    };
  }

  // Whitening
  if (lower.includes('whitening') || lower.includes('zoom') || lower.includes('تبييض')) {
    return {
      reply:
        'Our in-office Philips Zoom Whitening is available from AED 850 (includes full shade guide assessment and enamel protection). It takes just 45-60 minutes to brighten your smile up to 8 shades! Would you like me to check available slots for this week?',
      handover: false,
    };
  }

  // Botox
  if (lower.includes('botox') || lower.includes('wrinkle') || lower.includes('بوتوكس') || lower.includes('بوتكس')) {
    return {
      reply:
        'Our Botox treatments start from AED 950 per area using 100% genuine FDA-approved Allergan botulinum toxin. Common areas include forehead lines, frown lines, and crow’s feet. Would you like a consultation slot with our aesthetic doctor?',
      handover: false,
    };
  }

  // Invisalign
  if (lower.includes('invisalign') || lower.includes('aligners') || lower.includes('تقويم')) {
    return {
      reply:
        'We offer complimentary 3D iTero digital scans with our certified Invisalign specialists! You get to see your projected smile transformation in 3D during your first consultation. Would morning or afternoon suit you best?',
      handover: false,
    };
  }

  // Location / Parking
  if (lower.includes('location') || lower.includes('address') || lower.includes('parking') || lower.includes('موقع')) {
    return {
      reply:
        'We are located on Floor 3, Al Razi Healthcare Building, Dubai Marina Walk, Dubai. Complimentary reserved valet parking is provided for all clinic patients.',
      handover: false,
    };
  }

  // General friendly greeting
  const greetingName = leadName ? ` ${leadName}` : '';
  return {
    reply: `Hello${greetingName}! Thank you for contacting Demo Dental & Aesthetic Clinic. We offer specialized dental and aesthetic treatments including Philips Zoom Whitening, Invisalign, Dental Implants, Botox, and HydraFacial Elite. How may we assist your smile or skincare journey today?`,
    handover: false,
  };
}

/**
 * POST /web-chat-proxy
 * Public rate-limited proxy for website chat widget.
 * Forwards to n8n /webhook/web-chat with N8N_API_KEY.
 * Falls back to intelligent clinic response if n8n is offline or unreachable.
 */
export async function handleWebChatProxy(req: Request, res: Response) {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

  // 1. IP Rate Limiting (30 requests/minute)
  if (!checkIpRateLimit(clientIp, 30, 60000)) {
    return res.status(429).json({
      error: 'Rate limit exceeded. Please wait a minute before sending more messages.',
      code: 'rate_limited',
    });
  }

  const { session_id, text, name, phone } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text is required', code: 'missing_text' });
  }

  const sessionId = session_id || 'sess_' + Math.random().toString(36).substring(2, 9);
  const n8nBase = process.env.N8N_BASE_URL || 'https://n8n.wovextech.internal';
  const n8nApiKey = process.env.N8N_API_KEY || 'n8n_sec_key_67890';
  const n8nUrl = `${n8nBase.replace(/\/$/, '')}/webhook/web-chat`;

  let replyText = '';
  let isHandover = false;

  // Try forwarding to n8n webhook with N8N_API_KEY
  try {
    const n8nRes = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': n8nApiKey,
      },
      body: JSON.stringify({
        session_id: sessionId,
        text,
        name: name || undefined,
        phone: phone || undefined,
      }),
      signal: AbortSignal.timeout(3500),
    });

    if (n8nRes.ok) {
      const data = (await n8nRes.json()) as any;
      replyText = data.reply || '';
      isHandover = Boolean(data.handover);
    }
  } catch (err) {
    // n8n service offline or demo simulation mode
  }

  // If n8n did not return a response, run the intelligent fallback
  if (!replyText) {
    const fallback = generateClinicReply(text, name);
    replyText = fallback.reply;
    isHandover = fallback.handover;

    // Sync into CRM database so staff Inbox sees live conversation
    const dummyPhone = phone || `+97150${Math.floor(1000000 + Math.random() * 9000000)}`;
    let lead = db.leads.find((l) => (phone && l.phone === phone) || l.name === (name || 'Web Visitor'));

    const nowIso = new Date().toISOString();
    if (!lead) {
      lead = {
        id: 'lead-' + Math.random().toString(36).substring(2, 9),
        name: name || 'Web Visitor',
        phone: dummyPhone,
        language: /[\u0600-\u06FF]/.test(text) ? 'ar' : 'en',
        channel_first: 'web',
        source: 'Website Chat Widget',
        treatment_interest: text.slice(0, 40),
        status: 'new',
        consent_at: nowIso,
        opted_out: false,
        after_hours: db.isAfterHours(nowIso),
        first_response_seconds: 8,
        created_at: nowIso,
      };
      db.leads.unshift(lead);
    }

    let conv = db.conversations.find((c) => c.lead_id === lead!.id);
    if (!conv) {
      conv = {
        id: 'conv-' + Math.random().toString(36).substring(2, 9),
        lead_id: lead.id,
        channel: 'web',
        mode: isHandover ? 'human' : 'ai',
        handover_reason: fallback.reason,
        last_message_at: nowIso,
        last_patient_message_at: nowIso,
        unread_count: 1,
      };
      db.conversations.unshift(conv);
    } else {
      conv.last_message_at = nowIso;
      conv.last_patient_message_at = nowIso;
      if (isHandover) {
        conv.mode = 'human';
        conv.handover_reason = fallback.reason;
      }
      conv.unread_count = (conv.unread_count || 0) + 1;
    }

    // Log patient message
    db.messages.push({
      id: 'msg-' + Math.random().toString(36).substring(2, 9),
      conversation_id: conv.id,
      direction: 'in',
      sender: 'patient',
      text,
      created_at: nowIso,
    });

    // Log AI reply
    db.messages.push({
      id: 'msg-' + Math.random().toString(36).substring(2, 9),
      conversation_id: conv.id,
      direction: 'out',
      sender: isHandover ? 'staff' : 'ai',
      text: replyText,
      created_at: new Date(Date.now() + 1500).toISOString(),
    });

    db.logActivity(
      isHandover ? 'handover' : 'message_received',
      isHandover ? 'Urgent Web Chat Handover' : 'Web Chat Message',
      `"${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
      lead.id
    );
  }

  return res.json({
    reply: replyText,
    handover: isHandover,
    session_id: sessionId,
  });
}

/**
 * POST /api/staff-send-message
 * Staff replies to patient from CRM Inbox.
 * Validates 24-hour WhatsApp messaging window.
 * Forwards to n8n /webhook/crm-send-message.
 */
export async function handleStaffSendMessage(req: Request, res: Response) {
  const { conversation_id, text, is_template, template_name } = req.body;

  if (!conversation_id || !text) {
    return res.status(400).json({ error: 'conversation_id and text required', code: 'missing_fields' });
  }

  const conv = db.conversations.find((c) => c.id === conversation_id);
  if (!conv) {
    return res.status(404).json({ error: 'Conversation not found', code: 'not_found' });
  }

  const lead = db.leads.find((l) => l.id === conv.lead_id);
  if (!lead) {
    return res.status(404).json({ error: 'Lead not found', code: 'not_found' });
  }

  const now = Date.now();
  const lastPatientMs = conv.last_patient_message_at ? new Date(conv.last_patient_message_at).getTime() : 0;
  const hoursSinceLastPatientMsg = (now - lastPatientMs) / (1000 * 60 * 60);

  // Check 24-hour WhatsApp window
  if (conv.channel === 'whatsapp' && !is_template) {
    if (!lastPatientMs || hoursSinceLastPatientMsg > 24) {
      return res.status(409).json({
        error: 'The WhatsApp 24-hour window is closed. Send an approved template instead.',
        code: 'window_closed',
      });
    }
  }

  const nowIso = new Date().toISOString();

  // Create staff message
  const newMsg = {
    id: 'msg-' + Math.random().toString(36).substring(2, 9),
    conversation_id: conv.id,
    direction: 'out' as const,
    sender: 'staff' as const,
    text,
    created_at: nowIso,
  };
  db.messages.push(newMsg);

  conv.last_message_at = nowIso;
  conv.unread_count = 0;

  // Forward to n8n /webhook/crm-send-message
  const n8nBase = process.env.N8N_BASE_URL || 'https://n8n.wovextech.internal';
  const n8nApiKey = process.env.N8N_API_KEY || 'n8n_sec_key_67890';
  const n8nUrl = `${n8nBase.replace(/\/$/, '')}/webhook/crm-send-message`;

  (async () => {
    try {
      await fetch(n8nUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': n8nApiKey,
        },
        body: JSON.stringify({
          lead_id: lead.id,
          phone: lead.phone,
          channel: conv.channel,
          text,
          last_patient_message_at: conv.last_patient_message_at,
          template_name: is_template ? template_name : undefined,
        }),
        signal: AbortSignal.timeout(3500),
      });
    } catch {
      // Expected in standalone mode
    }
  })();

  db.logActivity('message_received', `Staff replied to ${lead.name}`, `"${text.substring(0, 45)}..."`, lead.id);

  return res.json({ ok: true, message: newMsg });
}

/**
 * POST /api/demo/simulate
 * Simulates one of the 6 core clinic enquiries
 */
export async function handleSimulateDemoEnquiry(req: Request, res: Response) {
  const { scenario_id } = req.body;
  const nowIso = new Date().toISOString();

  let scenarioName = '';
  let patientName = '';
  let phone = '';
  let text = '';
  let channel = 'whatsapp';
  let isAfterHours = false;
  let forceHandover = false;

  switch (scenario_id) {
    case 1:
      // 1. whitening at 10:40pm (after-hours test)
      scenarioName = 'Teeth Whitening at 10:40 PM';
      patientName = 'Kareem Badawi';
      phone = '+971501144778';
      text = 'Good evening. Is your in-office whitening safe for sensitive enamel and what is the current special price?';
      channel = 'whatsapp';
      isAfterHours = true;
      break;

    case 2:
      // 2. Botox pricing
      scenarioName = 'Botox Pricing Enquiry';
      patientName = 'Lina Al-Hassan';
      phone = '+971552233889';
      text = 'Hi there! How much is Botox for forehead and crow feet, and which brand do you use?';
      channel = 'whatsapp';
      isAfterHours = false;
      break;

    case 3:
      // 3. Arabic lip filler question
      scenarioName = 'Arabic Lip Filler Question';
      patientName = 'مريم العتيبي';
      phone = '+971549988221';
      text = 'مرحبا، حابة أسأل عن فيلر الشفايف الطبيعي، كم سعره وهل يوجد تورم بعد الجلسة؟';
      channel = 'whatsapp';
      isAfterHours = false;
      break;

    case 4:
      // 4. Invisalign consultation
      scenarioName = 'Invisalign Consultation Booking';
      patientName = 'Rami Haddad';
      phone = '+971526677990';
      text = 'Hello, I want to book an Invisalign 3D digital scan for next Monday. Are consultations free?';
      channel = 'web';
      isAfterHours = false;
      break;

    case 5:
      // 5. Reschedule upcoming appointment
      scenarioName = 'Reschedule Request';
      patientName = 'Nour Al-Sabah';
      phone = '+971501234567';
      text = 'Hello team, can I please push my appointment by 2 hours? Something urgent came up at work.';
      channel = 'whatsapp';
      isAfterHours = false;
      break;

    case 6:
    default:
      // 6. Clinical question that must hand over
      scenarioName = 'Urgent Clinical Handover';
      patientName = 'Omar Al-Jaberi';
      phone = '+971508822119';
      text =
        'URGENT: I had a surgical molar extraction yesterday and the bleeding has become heavy and very painful. Can a doctor advise immediately?';
      channel = 'whatsapp';
      isAfterHours = false;
      forceHandover = true;
      break;
  }

  // Upsert lead
  let lead = db.leads.find((l) => l.phone === phone);
  if (!lead) {
    lead = {
      id: 'lead-' + Math.random().toString(36).substring(2, 9),
      name: patientName,
      phone,
      language: /[\u0600-\u06FF]/.test(text) ? 'ar' : 'en',
      channel_first: channel as any,
      source: 'Demo Simulation',
      treatment_interest: scenarioName,
      status: 'new',
      consent_at: nowIso,
      opted_out: false,
      after_hours: isAfterHours,
      first_response_seconds: 35,
      created_at: nowIso,
    };
    db.leads.unshift(lead);
  }

  let conv = db.conversations.find((c) => c.lead_id === lead!.id);
  if (!conv) {
    conv = {
      id: 'conv-' + Math.random().toString(36).substring(2, 9),
      lead_id: lead.id,
      channel: channel as any,
      mode: forceHandover ? 'human' : 'ai',
      handover_reason: forceHandover ? 'Post-op surgical bleeding reported by patient' : undefined,
      last_message_at: nowIso,
      last_patient_message_at: nowIso,
      unread_count: 1,
    };
    db.conversations.unshift(conv);
  } else {
    conv.last_message_at = nowIso;
    conv.last_patient_message_at = nowIso;
    if (forceHandover) {
      conv.mode = 'human';
      conv.handover_reason = 'Post-op surgical bleeding reported by patient';
    }
    conv.unread_count = (conv.unread_count || 0) + 1;
  }

  // Patient incoming message
  const pMsg = {
    id: 'msg-' + Math.random().toString(36).substring(2, 9),
    conversation_id: conv.id,
    direction: 'in' as const,
    sender: 'patient' as const,
    text,
    created_at: nowIso,
  };
  db.messages.push(pMsg);

  // AI response
  const triage = generateClinicReply(text, patientName);
  const aiMsg = {
    id: 'msg-' + Math.random().toString(36).substring(2, 9),
    conversation_id: conv.id,
    direction: 'out' as const,
    sender: forceHandover ? ('staff' as const) : ('ai' as const),
    text: triage.reply,
    created_at: new Date(Date.now() + 1000).toISOString(),
  };
  db.messages.push(aiMsg);

  db.logActivity(
    forceHandover ? 'handover' : 'message_received',
    `Simulated: ${scenarioName}`,
    `Message processed for ${patientName}`,
    lead.id
  );

  return res.json({
    ok: true,
    scenario: scenarioName,
    lead,
    conversation: conv,
    patient_message: pMsg,
    reply: aiMsg,
  });
}
