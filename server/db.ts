import {
  ClinicSettings,
  Treatment,
  KBEntry,
  Lead,
  Conversation,
  Message,
  Appointment,
  Followup,
  ActivityEvent,
  AppointmentStatus,
  StaffUser,
  UserRole,
  Channel,
  SmtpSettings,
  EmailLog,
} from '../src/types/crm.ts';
import {
  defaultSmtpSettings,
  emailLogs,
  dispatchEmail,
  buildWelcomeEmailHtml,
  buildBookingConfirmationEmailHtml,
} from './emailService.ts';

// Initial Clinic Settings
const defaultSettings: ClinicSettings = {
  name: 'Demo Dental & Aesthetic Clinic',
  timezone: 'Asia/Dubai',
  working_hours: {
    monday: { open: '09:00', close: '20:00', closed: false },
    tuesday: { open: '09:00', close: '20:00', closed: false },
    wednesday: { open: '09:00', close: '20:00', closed: false },
    thursday: { open: '09:00', close: '20:00', closed: false },
    friday: { open: '09:00', close: '20:00', closed: false },
    saturday: { open: '10:00', close: '18:00', closed: false },
    sunday: { open: '10:00', close: '16:00', closed: true },
  },
  holidays: ['2026-12-02', '2026-12-03', '2026-01-01'],
  slot_capacity: 1,
  languages: ['English', 'Arabic'],
  emergency_text:
    'For severe bleeding, acute facial swelling affecting breathing, or critical dental trauma, please visit the emergency hospital immediately or dial 999 (Dubai Police / Ambulance).',
  consent_text:
    'By messaging Demo Dental & Aesthetic Clinic, you agree to receive appointment reminders and care updates via WhatsApp and SMS. Reply STOP anytime to unsubscribe.',
  retention_days: 90,
  first_response_target_seconds: 180,
};

const defaultTreatments: Treatment[] = [
  {
    id: 'trt-1',
    name: 'Teeth Whitening (Zoom In-Office)',
    category: 'dental',
    duration_min: 60,
    active: true,
    price_note: 'From AED 850 (includes enamel check & shade guide)',
  },
  {
    id: 'trt-2',
    name: 'Invisalign Clear Aligners Consultation',
    category: 'dental',
    duration_min: 45,
    active: true,
    price_note: 'Complimentary 3D iTero digital scan',
  },
  {
    id: 'trt-3',
    name: 'Dental Implant Assessment',
    category: 'dental',
    duration_min: 45,
    active: true,
    price_note: 'From AED 3,500 per premium Swiss implant',
  },
  {
    id: 'trt-4',
    name: 'Routine Dental Hygiene & Polish',
    category: 'dental',
    duration_min: 45,
    active: true,
    price_note: 'AED 350 with ultrasonic scaling',
  },
  {
    id: 'trt-5',
    name: 'Botox Anti-Wrinkle Injections',
    category: 'aesthetic',
    duration_min: 30,
    active: true,
    price_note: 'From AED 950 per area (Allergan FDA-approved)',
  },
  {
    id: 'trt-6',
    name: 'Dermal Lip & Cheek Fillers',
    category: 'aesthetic',
    duration_min: 45,
    active: true,
    price_note: 'From AED 1,200 per 1ml Juvederm / Restylane',
  },
  {
    id: 'trt-7',
    name: 'HydraFacial Elite MD',
    category: 'aesthetic',
    duration_min: 60,
    active: true,
    price_note: 'AED 650 with lymphatic detox therapy',
  },
  {
    id: 'trt-8',
    name: 'Laser Skin Rejuvenation',
    category: 'aesthetic',
    duration_min: 45,
    active: true,
    price_note: 'From AED 750 (Clarity II dual wavelength)',
  },
];

const defaultKB: KBEntry[] = [
  {
    id: 'kb-1',
    topic: 'Consultation Fees',
    answer:
      'Our aesthetic skin and dental cosmetic consultations are complimentary when treatment is booked on the same day. Standalone specialist second opinions are AED 250.',
  },
  {
    id: 'kb-2',
    topic: 'Location & Parking',
    answer:
      'We are located on Floor 3, Al Razi Healthcare Building, Dubai Marina Walk, Dubai, UAE. Free reserved valet parking is provided for all clinic patients.',
  },
  {
    id: 'kb-3',
    topic: 'Botox Downtime & Aftercare',
    answer:
      'Botox involves virtually no downtime. Patients should stay upright for 4 hours post-injection, avoid strenuous workouts for 24 hours, and results become visible in 4 to 7 days.',
  },
  {
    id: 'kb-4',
    topic: 'Teeth Whitening Sensitivity',
    answer:
      'We apply a protective gingival barrier and potassium nitrate desensitizer. Mild transient sensitivity may last 12-24 hours and is relieved with the take-home soothing serum provided.',
  },
  {
    id: 'kb-5',
    topic: 'Languages Spoken',
    answer:
      'Our clinical and concierge team speaks fluent English, Arabic (العربية), French, and Russian.',
  },
  {
    id: 'kb-6',
    topic: 'Accepted Insurances',
    answer:
      'We offer direct billing with major premium networks for qualifying dental treatments and provide itemized medical claim reimbursement packs for all aesthetic and out-of-network services.',
  },
];

export const defaultStaffUsers: StaffUser[] = [
  {
    id: 'user-abdul-manan',
    name: 'Abdul Manan',
    email: 'abdulmanankp0@gmail.com',
    role: 'super_admin',
    password: 'Manana!@1234',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-01-01',
  },
  {
    id: 'user-super-admin',
    name: 'Dr. Tariq Mansoor',
    email: 'tariq.mansoor@democlinic.ae',
    role: 'admin',
    password: 'ClinicAdmin2026!',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-01-01',
  },
  {
    id: 'user-admin',
    name: 'Dr. Sarah Al-Mansoori',
    email: 'sarah.mansoori@democlinic.ae',
    role: 'admin',
    password: 'ClinicAdmin2026!',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-01-15',
  },
  {
    id: 'user-staff',
    name: 'Layla Al-Amiri',
    email: 'layla.amiri@democlinic.ae',
    role: 'staff',
    password: 'StaffLayla2026!',
    avatar: 'https://images.unsplash.com/photo-1594824813572-c2e8c2a80693?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-02-01',
  },
];

class ClinicDatabase {
  settings: ClinicSettings = JSON.parse(JSON.stringify(defaultSettings));
  treatments: Treatment[] = JSON.parse(JSON.stringify(defaultTreatments));
  kb_entries: KBEntry[] = JSON.parse(JSON.stringify(defaultKB));
  staff_users: StaffUser[] = JSON.parse(JSON.stringify(defaultStaffUsers));
  leads: Lead[] = [];
  conversations: Conversation[] = [];
  messages: Message[] = [];
  appointments: Appointment[] = [];
  followups: Followup[] = [];
  activities: ActivityEvent[] = [];
  smtp: SmtpSettings = { ...defaultSmtpSettings };
  email_logs: EmailLog[] = emailLogs;

  constructor() {
    this.seedDemoData();
  }

  // --- DATABASE AUTHENTICATION ---
  authenticateUser(
    email: string,
    pass: string
  ): { ok: boolean; user?: Omit<StaffUser, 'password'>; error?: string } {
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = this.staff_users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return {
        ok: false,
        error: 'Database Authentication Error: No registered staff record found with this email.',
      };
    }

    if (user.password && user.password !== pass) {
      return {
        ok: false,
        error: 'Database Authentication Error: Incorrect password credentials.',
      };
    }

    // Do not return plain password to client
    const { password, ...safeUser } = user;
    this.logActivity(
      'message_received',
      `Staff Authenticated in Database: ${safeUser.name}`,
      `Role: ${safeUser.role.toUpperCase()} (${safeUser.email})`
    );

    return { ok: true, user: safeUser };
  }

  getStaffUsers(): Omit<StaffUser, 'password'>[] {
    return this.staff_users.map(({ password, ...u }) => u);
  }

  createStaffUser(userData: {
    name: string;
    email: string;
    role: UserRole;
    password?: string;
  }): Omit<StaffUser, 'password'> {
    const newUser: StaffUser = {
      id: 'user-' + Math.random().toString(36).substring(2, 9),
      name: userData.name,
      email: userData.email.trim().toLowerCase(),
      role: userData.role,
      password: userData.password || 'Clinic2026!',
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      created_at: new Date().toISOString().slice(0, 10),
    };
    this.staff_users.push(newUser);
    this.logActivity('lead_new', `New Staff User Created: ${newUser.name}`, `Role: ${newUser.role}`);
    const { password, ...safe } = newUser;
    return safe;
  }

  updateStaffUserRole(id: string, role: UserRole): boolean {
    const user = this.staff_users.find((u) => u.id === id);
    if (!user) return false;
    user.role = role;
    this.logActivity('lead_new', `Staff Role Updated: ${user.name}`, `New Role: ${role}`);
    return true;
  }

  deleteStaffUser(id: string): boolean {
    const idx = this.staff_users.findIndex((u) => u.id === id);
    if (idx === -1) return false;
    const removed = this.staff_users.splice(idx, 1)[0];
    this.logActivity('lead_new', `Staff User Deleted: ${removed.name}`, `Email: ${removed.email}`);
    return true;
  }

  // --- PATIENT CHECK & REGISTRATION ---
  checkPatientExists(query: { phone?: string; national_id?: string; email?: string; search?: string }): {
    found: boolean;
    patient?: Lead;
    recentAppointments?: Appointment[];
  } {
    const rawPhone = (query.phone || query.search || '').replace(/\D/g, '');
    const cleanId = (query.national_id || query.search || '').trim().toLowerCase();
    const cleanEmail = (query.email || query.search || '').trim().toLowerCase();
    const rawSearch = (query.search || '').trim().toLowerCase();

    const patient = this.leads.find((l) => {
      // 1. Phone match
      if (rawPhone && rawPhone.length >= 7) {
        const pDigits = l.phone.replace(/\D/g, '');
        if (pDigits.includes(rawPhone) || rawPhone.includes(pDigits)) return true;
      }
      // 2. National ID match (Emirates ID / National ID)
      if (cleanId && l.national_id && l.national_id.replace(/[-\s]/g, '').toLowerCase() === cleanId.replace(/[-\s]/g, '')) {
        return true;
      }
      // 3. Email match
      if (cleanEmail && l.email && l.email.toLowerCase() === cleanEmail) {
        return true;
      }
      // 4. Name match (if search string provided)
      if (rawSearch && l.name.toLowerCase().includes(rawSearch)) {
        return true;
      }
      return false;
    });

    if (patient) {
      const recentAppts = this.appointments
        .filter((a) => a.lead_id === patient.id)
        .sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime())
        .slice(0, 3);
      return { found: true, patient, recentAppointments: recentAppts };
    }

    return { found: false };
  }

  createOrUpdatePatient(data: {
    name: string;
    phone: string;
    national_id?: string;
    email?: string;
    address?: string;
    language?: 'en' | 'ar';
    channel?: Channel;
    treatment_interest?: string;
    send_welcome_email?: boolean;
    send_welcome_whatsapp?: boolean;
    source?: string;
  }): { is_new: boolean; patient: Lead } {
    const cleanPhone = data.phone.startsWith('+') ? data.phone : '+' + data.phone.replace(/\D/g, '');
    const nowIso = new Date().toISOString();
    let existing = this.leads.find(
      (l) =>
        l.phone === cleanPhone ||
        (data.national_id && l.national_id && l.national_id.replace(/[-\s]/g, '') === data.national_id.replace(/[-\s]/g, '')) ||
        (data.email && l.email && l.email.toLowerCase() === data.email.trim().toLowerCase())
    );

    if (existing) {
      // Update details
      if (data.name) existing.name = data.name;
      if (data.national_id) existing.national_id = data.national_id;
      if (data.email) existing.email = data.email.trim().toLowerCase();
      if (data.address) existing.address = data.address;
      if (data.treatment_interest) existing.treatment_interest = data.treatment_interest;
      if (data.language) existing.language = data.language;

      this.logActivity(
        'lead_new',
        'Patient Profile Verified / Updated',
        `${existing.name} (${existing.phone}) profile updated. National ID: ${existing.national_id || 'N/A'}, Address: ${existing.address || 'N/A'}`,
        existing.id
      );

      return { is_new: false, patient: existing };
    }

    // Create brand new patient
    const newLead: Lead = {
      id: 'lead-' + Math.random().toString(36).substring(2, 9),
      name: data.name,
      phone: cleanPhone,
      national_id: data.national_id || undefined,
      email: data.email ? data.email.trim().toLowerCase() : undefined,
      address: data.address || undefined,
      language: data.language || 'en',
      channel_first: data.channel || 'whatsapp',
      source: data.source || 'Admin Direct Registration',
      treatment_interest: data.treatment_interest || undefined,
      status: 'new',
      consent_at: nowIso,
      opted_out: false,
      after_hours: this.isAfterHours(nowIso),
      first_response_seconds: 15,
      created_at: nowIso,
    };

    this.leads.unshift(newLead);

    // Create linked conversation
    const newConv: Conversation = {
      id: 'conv-' + Math.random().toString(36).substring(2, 9),
      lead_id: newLead.id,
      channel: newLead.channel_first,
      mode: 'ai',
      last_message_at: nowIso,
      unread_count: 0,
    };
    this.conversations.unshift(newConv);

    this.logActivity(
      'lead_new',
      'New Patient Added',
      `${newLead.name} (${newLead.phone}) registered. Emirates ID: ${newLead.national_id || 'N/A'}, Address: ${newLead.address || 'N/A'}`,
      newLead.id
    );

    // Automated Welcome Email (via SMTP + HTML Template)
    if (data.send_welcome_email !== false && newLead.email) {
      const welcomeHtml = buildWelcomeEmailHtml({
        patientName: newLead.name,
        clinicName: this.settings.name,
        phone: newLead.phone,
        address: newLead.address,
        emiratesId: newLead.national_id,
      });

      dispatchEmail(this.smtp, {
        to: newLead.email,
        subject: `Welcome to ${this.settings.name} (Registration Confirmed)`,
        html: welcomeHtml,
        type: 'welcome',
        lead_id: newLead.id,
      }).then((res) => {
        this.logActivity(
          'message_sent',
          res.simulated ? 'Automated Welcome Email Dispatched (Simulated)' : 'Automated Welcome Email Dispatched (SMTP)',
          `Sent to ${newLead.email} - "Welcome to ${this.settings.name}"`,
          newLead.id,
          { to: newLead.email, type: 'welcome_email', simulated: res.simulated }
        );
      });
    }

    // Automated Welcome WhatsApp Message
    if (data.send_welcome_whatsapp !== false && newLead.phone) {
      this.logActivity(
        'message_sent',
        `Automated Welcome WhatsApp Dispatched`,
        `Sent to ${newLead.phone} - "Hello ${newLead.name}, welcome to Demo Clinic Dubai Marina concierge. We are delighted to assist you."`,
        newLead.id,
        { to: newLead.phone, type: 'welcome_whatsapp' }
      );
    }

    // Emit event to n8n webhook (async)
    this.emitN8nPatientWelcome(newLead);

    return { is_new: true, patient: newLead };
  }

  emitN8nPatientWelcome(lead: Lead) {
    const n8nBase = process.env.N8N_BASE_URL || 'https://n8n.wovextech.internal';
    const n8nApiKey = process.env.N8N_API_KEY || 'n8n_sec_key_67890';
    const url = `${n8nBase.replace(/\/$/, '')}/webhook/crm-patient-welcome`;

    const payload = {
      event: 'patient_registered',
      patient: lead,
      clinic: this.settings.name,
      emitted_at: new Date().toISOString(),
    };

    (async () => {
      try {
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': n8nApiKey },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(3000),
        });
      } catch {}
    })();
  }

  // Helper: check working hours for a given ISO date string
  isAfterHours(dateIsoString?: string): boolean {
    const d = dateIsoString ? new Date(dateIsoString) : new Date();
    // Get Dubai time (UTC+4)
    const dubaiDate = new Date(d.toLocaleString('en-US', { timeZone: this.settings.timezone || 'Asia/Dubai' }));
    
    // Check holiday
    const dateFormatted = dubaiDate.toISOString().slice(0, 10);
    if (this.settings.holidays.includes(dateFormatted)) {
      return true;
    }

    const dayIndex = dubaiDate.getDay();
    const days: (keyof ClinicSettings['working_hours'])[] = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const dayKey = days[dayIndex];
    const daySchedule = this.settings.working_hours[dayKey];
    if (!daySchedule || daySchedule.closed) {
      return true;
    }

    const currentMinutes = dubaiDate.getHours() * 60 + dubaiDate.getMinutes();
    const [openH, openM] = daySchedule.open.split(':').map(Number);
    const [closeH, closeM] = daySchedule.close.split(':').map(Number);
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    return currentMinutes < openMinutes || currentMinutes >= closeMinutes;
  }

  logActivity(
    type: ActivityEvent['type'],
    title: string,
    description: string,
    lead_id?: string,
    meta?: Record<string, any>
  ) {
    const act: ActivityEvent = {
      id: 'act-' + Math.random().toString(36).substring(2, 9),
      type,
      title,
      description,
      timestamp: new Date().toISOString(),
      lead_id,
      meta,
    };
    this.activities.unshift(act);
    if (this.activities.length > 80) {
      this.activities = this.activities.slice(0, 80);
    }
    return act;
  }

  // --- AUTOMATIC TRIGGERS ---
  onAppointmentCreated(appt: Appointment, lead: Lead) {
    const startMs = new Date(appt.start_at).getTime();
    const endMs = new Date(appt.end_at).getTime();
    const nowMs = Date.now();

    // 1. reminder_24h
    const reminder24Due = new Date(startMs - 24 * 60 * 60 * 1000).toISOString();
    this.followups.push({
      id: 'fol-' + Math.random().toString(36).substring(2, 9),
      lead_id: lead.id,
      appointment_id: appt.id,
      type: 'reminder_24h',
      due_at: reminder24Due > new Date(nowMs).toISOString() ? reminder24Due : new Date(nowMs + 60000).toISOString(),
      status: 'pending',
      template_name: 'appointment_reminder_24h',
      params: { patient_name: lead.name, start_at: appt.start_at },
      created_at: new Date().toISOString(),
    });

    // 2. reminder_2h
    const reminder2Due = new Date(startMs - 2 * 60 * 60 * 1000).toISOString();
    this.followups.push({
      id: 'fol-' + Math.random().toString(36).substring(2, 9),
      lead_id: lead.id,
      appointment_id: appt.id,
      type: 'reminder_2h',
      due_at: reminder2Due > new Date(nowMs).toISOString() ? reminder2Due : new Date(nowMs + 120000).toISOString(),
      status: 'pending',
      template_name: 'appointment_reminder_2h',
      params: { patient_name: lead.name, start_at: appt.start_at },
      created_at: new Date().toISOString(),
    });

    // 3. post_visit at end_at + 3h
    const postVisitDue = new Date(endMs + 3 * 60 * 60 * 1000).toISOString();
    this.followups.push({
      id: 'fol-' + Math.random().toString(36).substring(2, 9),
      lead_id: lead.id,
      appointment_id: appt.id,
      type: 'post_visit',
      due_at: postVisitDue,
      status: 'pending',
      template_name: 'post_treatment_checkin',
      params: { patient_name: lead.name },
      created_at: new Date().toISOString(),
    });

    // Update lead status to 'booked' if not visited
    if (lead.status !== 'visited') {
      lead.status = 'booked';
    }

    this.logActivity(
      'appointment_created',
      'Appointment Confirmed',
      `${lead.name} booked for ${new Date(appt.start_at).toLocaleDateString()} (${appt.created_by.toUpperCase()})`,
      lead.id
    );

    // Automated Booking Confirmation Email (via SMTP + HTML Template)
    if (lead.email) {
      const treatmentName = this.treatments.find((t) => t.id === appt.treatment_id)?.name || 'Consultation';
      const durationMin = this.treatments.find((t) => t.id === appt.treatment_id)?.duration_min || 45;
      const confirmHtml = buildBookingConfirmationEmailHtml({
        patientName: lead.name,
        treatmentName,
        startAtIso: appt.start_at,
        durationMin,
        clinicName: this.settings.name,
        address: 'Marina Promenade, Al Emreef St, Dubai Marina',
      });

      dispatchEmail(this.smtp, {
        to: lead.email,
        subject: `Appointment Confirmed: ${treatmentName} at ${this.settings.name}`,
        html: confirmHtml,
        type: 'booking_confirmation',
        lead_id: lead.id,
      }).then((res) => {
        this.logActivity(
          'message_sent',
          res.simulated ? 'Booking Confirmation Email Sent (Simulated)' : 'Booking Confirmation Email Sent (SMTP)',
          `Sent to ${lead.email} - "${treatmentName} on ${new Date(appt.start_at).toLocaleDateString()}"`,
          lead.id,
          { to: lead.email, type: 'appointment_confirmation_email', appointment_id: appt.id, simulated: res.simulated }
        );
      });
    }

    // Automated Booking Confirmation WhatsApp
    this.logActivity(
      'message_sent',
      `WhatsApp Booking Confirmation Sent`,
      `Sent to ${lead.phone} - "Hello ${lead.name}, your appointment at Demo Dental & Aesthetic Clinic is confirmed for ${new Date(appt.start_at).toLocaleDateString()}."`,
      lead.id,
      { to: lead.phone, type: 'appointment_confirmation_whatsapp', appointment_id: appt.id }
    );

    // Emit event to n8n webhook (async)
    this.emitN8nAppointmentEvent('created', appt, lead, appt.created_by);
  }

  onAppointmentCancelled(apptId: string) {
    const appt = this.appointments.find((a) => a.id === apptId);
    if (!appt) return;
    appt.status = 'cancelled';

    // Mark pending followups for this appointment as skipped
    for (const fol of this.followups) {
      if (fol.appointment_id === apptId && fol.status === 'pending') {
        fol.status = 'skipped';
      }
    }

    const lead = this.leads.find((l) => l.id === appt.lead_id);
    if (lead) {
      this.logActivity(
        'appointment_status',
        'Appointment Cancelled',
        `Booking for ${lead.name} was cancelled`,
        lead.id
      );
      this.emitN8nAppointmentEvent('cancelled', appt, lead, 'staff');
    }
  }

  onAppointmentRescheduled(apptId: string, newStartIso: string) {
    const appt = this.appointments.find((a) => a.id === apptId);
    if (!appt) return false;
    const trt = this.treatments.find((t) => t.id === appt.treatment_id);
    const duration = trt ? trt.duration_min : 45;

    const startMs = new Date(newStartIso).getTime();
    const endMs = startMs + duration * 60 * 1000;
    appt.start_at = newStartIso;
    appt.end_at = new Date(endMs).toISOString();
    appt.status = 'confirmed';

    // Recompute due dates for pending followups
    for (const fol of this.followups) {
      if (fol.appointment_id === apptId && fol.status === 'pending') {
        if (fol.type === 'reminder_24h') {
          fol.due_at = new Date(startMs - 24 * 60 * 60 * 1000).toISOString();
        } else if (fol.type === 'reminder_2h') {
          fol.due_at = new Date(startMs - 2 * 60 * 60 * 1000).toISOString();
        } else if (fol.type === 'post_visit') {
          fol.due_at = new Date(endMs + 3 * 60 * 60 * 1000).toISOString();
        }
      }
    }

    const lead = this.leads.find((l) => l.id === appt.lead_id);
    if (lead) {
      this.logActivity(
        'appointment_status',
        'Appointment Rescheduled',
        `${lead.name} rescheduled to ${new Date(appt.start_at).toLocaleDateString()}`,
        lead.id
      );
      this.emitN8nAppointmentEvent('rescheduled', appt, lead, 'staff');
    }
    return true;
  }

  onAppointmentStatusChange(apptId: string, newStatus: AppointmentStatus) {
    const appt = this.appointments.find((a) => a.id === apptId);
    if (!appt) return false;
    appt.status = newStatus;
    const lead = this.leads.find((l) => l.id === appt.lead_id);

    if (newStatus === 'completed' && lead) {
      lead.status = 'visited';
    } else if (newStatus === 'no_show' && lead) {
      lead.status = 'no_show';
      // Create noshow_reschedule followup
      this.followups.push({
        id: 'fol-' + Math.random().toString(36).substring(2, 9),
        lead_id: lead.id,
        appointment_id: appt.id,
        type: 'noshow_reschedule',
        due_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        status: 'pending',
        template_name: 'noshow_reschedule_offer',
        params: { patient_name: lead.name },
        created_at: new Date().toISOString(),
      });
    }

    if (lead) {
      this.logActivity(
        'appointment_status',
        `Appointment Marked ${newStatus.replace('_', ' ').toUpperCase()}`,
        `${lead.name} appointment updated to ${newStatus}`,
        lead.id
      );
      this.emitN8nAppointmentEvent(newStatus, appt, lead, 'staff');
    }
    return true;
  }

  // Periodic or on-message check:
  // When a lead has no appointment 24h after the last patient message: create no_booking_1.
  // 72h later: no_booking_2. Max 2, never for opted_out leads.
  checkNoBookingFollowups() {
    const now = Date.now();
    for (const lead of this.leads) {
      if (lead.opted_out) continue;
      const hasActiveAppt = this.appointments.some(
        (a) => a.lead_id === lead.id && (a.status === 'confirmed' || a.status === 'completed')
      );
      if (hasActiveAppt) continue;

      const conv = this.conversations.find((c) => c.lead_id === lead.id);
      if (!conv || !conv.last_patient_message_at) continue;

      const lastPatMs = new Date(conv.last_patient_message_at).getTime();
      const elapsedHours = (now - lastPatMs) / (1000 * 60 * 60);

      const existingF1 = this.followups.find((f) => f.lead_id === lead.id && f.type === 'no_booking_1');
      const existingF2 = this.followups.find((f) => f.lead_id === lead.id && f.type === 'no_booking_2');

      if (elapsedHours >= 24 && !existingF1) {
        this.followups.push({
          id: 'fol-' + Math.random().toString(36).substring(2, 9),
          lead_id: lead.id,
          type: 'no_booking_1',
          due_at: new Date().toISOString(),
          status: 'pending',
          template_name: 'no_booking_nudge_1',
          params: { patient_name: lead.name, treatment_interest: lead.treatment_interest || 'Consultation' },
          created_at: new Date().toISOString(),
        });
      }

      if (elapsedHours >= 96 && existingF1 && !existingF2) {
        this.followups.push({
          id: 'fol-' + Math.random().toString(36).substring(2, 9),
          lead_id: lead.id,
          type: 'no_booking_2',
          due_at: new Date().toISOString(),
          status: 'pending',
          template_name: 'no_booking_nudge_2',
          params: { patient_name: lead.name },
          created_at: new Date().toISOString(),
        });
      }
    }
  }

  // Message retention cleanup
  cleanupOldMessages() {
    const days = this.settings.retention_days || 90;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    this.messages = this.messages.filter((m) => new Date(m.created_at).getTime() >= cutoff);
  }

  // Dispatch appointment event to n8n webhook with 2 retries
  async emitN8nAppointmentEvent(
    event: 'created' | 'rescheduled' | 'cancelled' | 'completed' | 'no_show' | 'confirmed',
    appointment: Appointment,
    lead: Lead,
    createdBy: 'ai' | 'staff'
  ) {
    const n8nBase = process.env.N8N_BASE_URL || 'https://n8n.wovextech.internal';
    const n8nApiKey = process.env.N8N_API_KEY || 'n8n_sec_key_67890';
    const url = `${n8nBase.replace(/\/$/, '')}/webhook/crm-appointment-event`;

    const payload = {
      event,
      appointment,
      lead,
      created_by: createdBy,
      emitted_at: new Date().toISOString(),
    };

    let attempts = 0;
    const maxRetries = 2;

    const trySend = async (): Promise<boolean> => {
      try {
        attempts++;
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': n8nApiKey,
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(4000),
        });
        if (res.ok) return true;
      } catch (err) {
        // network or timeout
      }
      return false;
    };

    // Fire and retry up to 2 times
    (async () => {
      let success = await trySend();
      while (!success && attempts <= maxRetries) {
        await new Promise((r) => setTimeout(r, 1000 * attempts));
        success = await trySend();
      }
      // Log internal audit
      if (!success) {
        // N8n webhook may not have an active receiver in test/demo mode, which is expected
      }
    })();
  }

  // --- SLOT AVAILABILITY CHECK ---
  getAvailableSlots(fromDateStr: string, toDateStr: string, treatmentNameOrId?: string): { start: string; end: string }[] {
    const trt =
      this.treatments.find((t) => t.id === treatmentNameOrId || t.name.toLowerCase() === (treatmentNameOrId || '').toLowerCase()) ||
      this.treatments[0];
    const duration = trt ? trt.duration_min : 45;
    const capacity = this.settings.slot_capacity || 1;

    const slots: { start: string; end: string }[] = [];
    const fromDate = fromDateStr ? new Date(fromDateStr) : new Date();
    const toDate = toDateStr ? new Date(toDateStr) : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

    // Iterate through days
    const curDate = new Date(fromDate);
    curDate.setMinutes(0, 0, 0);

    // Look ahead up to 14 days maximum
    let daysChecked = 0;
    while (curDate <= toDate && slots.length < 12 && daysChecked < 14) {
      daysChecked++;
      const dateFormatted = curDate.toISOString().slice(0, 10);
      const isHoliday = this.settings.holidays.includes(dateFormatted);

      const daysOfWeek: (keyof ClinicSettings['working_hours'])[] = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
      ];
      const dayKey = daysOfWeek[curDate.getDay()];
      const daySchedule = this.settings.working_hours[dayKey];

      if (!isHoliday && daySchedule && !daySchedule.closed) {
        const [openH, openM] = daySchedule.open.split(':').map(Number);
        const [closeH, closeM] = daySchedule.close.split(':').map(Number);

        // Generate hourly slots
        for (let h = openH; h < closeH; h++) {
          const slotStart = new Date(curDate);
          slotStart.setHours(h, 0, 0, 0);

          // If in the past, skip
          if (slotStart.getTime() <= Date.now() + 30 * 60 * 1000) continue;

          const slotEnd = new Date(slotStart.getTime() + duration * 60 * 1000);
          if (slotEnd.getHours() > closeH || (slotEnd.getHours() === closeH && slotEnd.getMinutes() > closeM)) {
            continue;
          }

          // Check capacity against active confirmed appointments
          const overlapping = this.appointments.filter((a) => {
            if (a.status !== 'confirmed') return false;
            const aStart = new Date(a.start_at).getTime();
            const aEnd = new Date(a.end_at).getTime();
            return slotStart.getTime() < aEnd && slotEnd.getTime() > aStart;
          });

          if (overlapping.length < capacity) {
            slots.push({
              start: slotStart.toISOString(),
              end: slotEnd.toISOString(),
            });
            if (slots.length >= 12) break;
          }
        }
      }

      curDate.setDate(curDate.getDate() + 1);
      curDate.setHours(9, 0, 0, 0);
    }

    return slots;
  }

  // --- SEED DEMO DATA ---
  seedDemoData() {
    this.leads = [];
    this.conversations = [];
    this.messages = [];
    this.appointments = [];
    this.followups = [];
    this.activities = [];
    this.staff_users = JSON.parse(JSON.stringify(defaultStaffUsers));

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const hourMs = 60 * 60 * 1000;

    // 12 Realistic Fictional Leads
    const sampleLeads: Partial<Lead>[] = [
      {
        id: 'lead-1',
        name: 'Nour Al-Sabah',
        phone: '+971501234567',
        email: 'nour.alsabah@example.ae',
        language: 'en',
        channel_first: 'whatsapp',
        source: 'Instagram Ad',
        treatment_interest: 'Teeth Whitening (Zoom In-Office)',
        status: 'booked',
        consent_at: new Date(now - 3 * dayMs).toISOString(),
        opted_out: false,
        after_hours: false,
        first_response_seconds: 45,
        created_at: new Date(now - 3 * dayMs).toISOString(),
      },
      {
        id: 'lead-2',
        name: 'Tariq Mansoor',
        phone: '+971529876543',
        email: 'tariq.mansoor@example.com',
        language: 'en',
        channel_first: 'whatsapp',
        source: 'Google Search',
        treatment_interest: 'Invisalign Clear Aligners Consultation',
        status: 'engaged',
        consent_at: new Date(now - 2 * dayMs - 4 * hourMs).toISOString(),
        opted_out: false,
        after_hours: true,
        first_response_seconds: 68,
        created_at: new Date(now - 2 * dayMs - 4 * hourMs).toISOString(),
      },
      {
        id: 'lead-3',
        name: 'Reem Al-Hashimi',
        phone: '+971543322110',
        email: 'reem.hashimi@example.ae',
        language: 'ar',
        channel_first: 'whatsapp',
        source: 'Referral',
        treatment_interest: 'Dermal Lip & Cheek Fillers',
        status: 'booked',
        consent_at: new Date(now - 4 * dayMs).toISOString(),
        opted_out: false,
        after_hours: false,
        first_response_seconds: 92,
        created_at: new Date(now - 4 * dayMs).toISOString(),
      },
      {
        id: 'lead-4',
        name: 'Elena Rostova',
        phone: '+971556677889',
        email: 'elena.rostova@example.com',
        language: 'en',
        channel_first: 'web',
        source: 'Website Chat Widget',
        treatment_interest: 'HydraFacial Elite MD',
        status: 'new',
        consent_at: new Date(now - 45 * 60 * 1000).toISOString(),
        opted_out: false,
        after_hours: false,
        first_response_seconds: 12,
        created_at: new Date(now - 45 * 60 * 1000).toISOString(),
      },
      {
        id: 'lead-5',
        name: 'Dr. Zaid Khoury',
        phone: '+971509988776',
        email: 'zaid.khoury@example.com',
        language: 'en',
        channel_first: 'whatsapp',
        source: 'Google Ads',
        treatment_interest: 'Dental Implant Assessment',
        status: 'visited',
        consent_at: new Date(now - 7 * dayMs).toISOString(),
        opted_out: false,
        after_hours: false,
        first_response_seconds: 110,
        created_at: new Date(now - 7 * dayMs).toISOString(),
      },
      {
        id: 'lead-6',
        name: 'Fatima Al-Marzouqi',
        phone: '+971561122334',
        email: 'fatima.m@example.ae',
        language: 'ar',
        channel_first: 'instagram',
        source: 'Instagram DM',
        treatment_interest: 'Botox Anti-Wrinkle Injections',
        status: 'engaged',
        consent_at: new Date(now - 18 * hourMs).toISOString(),
        opted_out: false,
        after_hours: true,
        first_response_seconds: 52,
        created_at: new Date(now - 18 * hourMs).toISOString(),
      },
      {
        id: 'lead-7',
        name: 'Marcus Vance',
        phone: '+971582233445',
        email: 'marcus.vance@example.co.uk',
        language: 'en',
        channel_first: 'web',
        source: 'Website Chat Widget',
        treatment_interest: 'Routine Dental Hygiene & Polish',
        status: 'booked',
        consent_at: new Date(now - 1 * dayMs).toISOString(),
        opted_out: false,
        after_hours: false,
        first_response_seconds: 88,
        created_at: new Date(now - 1 * dayMs).toISOString(),
      },
      {
        id: 'lead-8',
        name: 'Hessa Al-Falasi',
        phone: '+971508877665',
        email: 'hessa.falasi@example.ae',
        language: 'ar',
        channel_first: 'whatsapp',
        source: 'WhatsApp Organic',
        treatment_interest: 'Laser Skin Rejuvenation',
        status: 'no_show',
        consent_at: new Date(now - 5 * dayMs).toISOString(),
        opted_out: false,
        after_hours: false,
        first_response_seconds: 140,
        created_at: new Date(now - 5 * dayMs).toISOString(),
      },
      {
        id: 'lead-9',
        name: 'Alexander Lind',
        phone: '+971557766554',
        email: 'alex.lind@example.com',
        language: 'en',
        channel_first: 'whatsapp',
        source: 'Google Search',
        treatment_interest: 'Teeth Whitening (Zoom In-Office)',
        status: 'new',
        consent_at: new Date(now - 2 * hourMs).toISOString(),
        opted_out: false,
        after_hours: false,
        first_response_seconds: 40,
        created_at: new Date(now - 2 * hourMs).toISOString(),
      },
      {
        id: 'lead-10',
        name: 'Mona Al-Suwaidi',
        phone: '+971569911223',
        email: 'mona.suwaidi@example.ae',
        language: 'ar',
        channel_first: 'whatsapp',
        source: 'Referral',
        treatment_interest: 'Botox Anti-Wrinkle Injections',
        status: 'booked',
        consent_at: new Date(now - 6 * dayMs).toISOString(),
        opted_out: false,
        after_hours: true,
        first_response_seconds: 75,
        created_at: new Date(now - 6 * dayMs).toISOString(),
      },
      {
        id: 'lead-11',
        name: 'David Miller',
        phone: '+971524455667',
        email: 'd.miller@example.com',
        language: 'en',
        channel_first: 'whatsapp',
        source: 'Instagram Ad',
        treatment_interest: 'Dental Implant Assessment',
        status: 'engaged',
        consent_at: new Date(now - 12 * hourMs).toISOString(),
        opted_out: false,
        after_hours: false,
        first_response_seconds: 90,
        created_at: new Date(now - 12 * hourMs).toISOString(),
      },
      {
        id: 'lead-12',
        name: 'Sarah Jenkins',
        phone: '+971503344556',
        email: 'sarah.j@example.com',
        language: 'en',
        channel_first: 'web',
        source: 'Website Chat Widget',
        treatment_interest: 'HydraFacial Elite MD',
        status: 'lost',
        consent_at: new Date(now - 10 * dayMs).toISOString(),
        opted_out: true,
        after_hours: false,
        first_response_seconds: 120,
        created_at: new Date(now - 10 * dayMs).toISOString(),
      },
    ];

    this.leads = sampleLeads as Lead[];

    // Build Conversations & Messages for each
    const conv1: Conversation = {
      id: 'conv-1',
      lead_id: 'lead-1',
      channel: 'whatsapp',
      mode: 'ai',
      last_message_at: new Date(now - 2 * hourMs).toISOString(),
      last_patient_message_at: new Date(now - 3 * hourMs).toISOString(),
      unread_count: 0,
    };

    const conv2: Conversation = {
      id: 'conv-2',
      lead_id: 'lead-2',
      channel: 'whatsapp',
      mode: 'human',
      handover_reason: 'Complex clinical question about aligners with previous veneer work',
      last_message_at: new Date(now - 15 * 60 * 1000).toISOString(),
      last_patient_message_at: new Date(now - 25 * 60 * 1000).toISOString(),
      unread_count: 1,
    };

    const conv3: Conversation = {
      id: 'conv-3',
      lead_id: 'lead-3',
      channel: 'whatsapp',
      mode: 'ai',
      last_message_at: new Date(now - 1 * dayMs).toISOString(),
      last_patient_message_at: new Date(now - 1 * dayMs - hourMs).toISOString(),
      unread_count: 0,
    };

    const conv4: Conversation = {
      id: 'conv-4',
      lead_id: 'lead-4',
      channel: 'web',
      mode: 'ai',
      last_message_at: new Date(now - 10 * 60 * 1000).toISOString(),
      last_patient_message_at: new Date(now - 15 * 60 * 1000).toISOString(),
      unread_count: 1,
    };

    const conv6: Conversation = {
      id: 'conv-6',
      lead_id: 'lead-6',
      channel: 'instagram',
      mode: 'ai',
      last_message_at: new Date(now - 5 * hourMs).toISOString(),
      last_patient_message_at: new Date(now - 6 * hourMs).toISOString(),
      unread_count: 0,
    };

    this.conversations = [conv1, conv2, conv3, conv4, conv6];

    // Seed Messages
    this.messages = [
      // Lead 1: Nour
      {
        id: 'msg-1',
        conversation_id: 'conv-1',
        direction: 'in',
        sender: 'patient',
        text: 'Hi! I want to know about Philips Zoom teeth whitening. Is it painful and how much is it?',
        wa_message_id: 'wa-mid-001',
        created_at: new Date(now - 3 * dayMs).toISOString(),
      },
      {
        id: 'msg-2',
        conversation_id: 'conv-1',
        direction: 'out',
        sender: 'ai',
        text: 'Hello Nour! Welcome to Demo Dental & Aesthetic Clinic. Our in-office Philips Zoom Whitening is AED 850 (includes full shade guide check and desensitizing serum). Most patients experience zero to mild transient sensitivity.',
        created_at: new Date(now - 3 * dayMs + 45000).toISOString(),
      },
      {
        id: 'msg-3',
        conversation_id: 'conv-1',
        direction: 'in',
        sender: 'patient',
        text: 'That sounds great! Can I book for this Thursday afternoon?',
        wa_message_id: 'wa-mid-002',
        created_at: new Date(now - 3 * hourMs).toISOString(),
      },
      {
        id: 'msg-4',
        conversation_id: 'conv-1',
        direction: 'out',
        sender: 'ai',
        text: 'Certainly! I have reserved Thursday at 3:00 PM for you with Dr. Sarah. We will send you a calendar reminder 24 hours prior.',
        created_at: new Date(now - 2 * hourMs).toISOString(),
      },
      // Lead 2: Tariq (Human handover)
      {
        id: 'msg-5',
        conversation_id: 'conv-2',
        direction: 'in',
        sender: 'patient',
        text: 'Good evening. I have 4 porcelain veneers on my upper front teeth from 2021. Can I still do Invisalign without damaging the veneers?',
        wa_message_id: 'wa-mid-003',
        created_at: new Date(now - 2 * dayMs - 4 * hourMs).toISOString(),
      },
      {
        id: 'msg-6',
        conversation_id: 'conv-2',
        direction: 'out',
        sender: 'ai',
        text: 'Good evening Tariq! Yes, Invisalign is frequently performed with existing veneers. However, to evaluate your attachment positions safely, let me connect you directly with our senior clinical coordinator.',
        created_at: new Date(now - 2 * dayMs - 4 * hourMs + 68000).toISOString(),
      },
      {
        id: 'msg-7',
        conversation_id: 'conv-2',
        direction: 'in',
        sender: 'patient',
        text: 'Thank you. Can someone review my bite photo if I send it over?',
        wa_message_id: 'wa-mid-004',
        created_at: new Date(now - 25 * 60 * 1000).toISOString(),
      },
      // Lead 3: Reem (Arabic)
      {
        id: 'msg-8',
        conversation_id: 'conv-3',
        direction: 'in',
        sender: 'patient',
        text: 'مرحبا، حابة أستفسر عن فيلر الشفايف الروسي، كم السعر ومين الدكتورة المسؤولة؟',
        wa_message_id: 'wa-mid-005',
        created_at: new Date(now - 4 * dayMs).toISOString(),
      },
      {
        id: 'msg-9',
        conversation_id: 'conv-3',
        direction: 'out',
        sender: 'ai',
        text: 'أهلاً وسهلاً بكِ ريم في عيادة ديمو للأسنان والجلدية والتجميل. يبدأ فيلر الشفايف لدينا من 1,200 درهم لإبرة جوفيديرم / ريستيلين الأصلية، وتجريه د. سارة استشارية الجلدية والتجميل. هل ترغبين في حجز موعد استشارة؟',
        created_at: new Date(now - 4 * dayMs + 92000).toISOString(),
      },
      // Lead 4: Elena (Web widget)
      {
        id: 'msg-10',
        conversation_id: 'conv-4',
        direction: 'in',
        sender: 'patient',
        text: 'Hello, what does the HydraFacial Elite include and do you have parking?',
        created_at: new Date(now - 15 * 60 * 1000).toISOString(),
      },
      {
        id: 'msg-11',
        conversation_id: 'conv-4',
        direction: 'out',
        sender: 'ai',
        text: 'Hi Elena! The HydraFacial Elite (AED 650) includes 6-stage deep vortex suction, gentle salicylic peel, painless extraction, targeted booster serum, and red light therapy. Yes, we provide complimentary valet parking at Dubai Marina Walk.',
        created_at: new Date(now - 10 * 60 * 1000).toISOString(),
      },
    ];

    // 8 Appointments
    const tomorrow10 = new Date(now + 1 * dayMs);
    tomorrow10.setHours(10, 0, 0, 0);

    const tomorrow14 = new Date(now + 1 * dayMs);
    tomorrow14.setHours(14, 0, 0, 0);

    const dayAfter11 = new Date(now + 2 * dayMs);
    dayAfter11.setHours(11, 0, 0, 0);

    const dayAfter16 = new Date(now + 2 * dayMs);
    dayAfter16.setHours(16, 0, 0, 0);

    const past3Days = new Date(now - 3 * dayMs);
    past3Days.setHours(12, 0, 0, 0);

    const past5Days = new Date(now - 5 * dayMs);
    past5Days.setHours(15, 0, 0, 0);

    const sampleAppointments: Appointment[] = [
      {
        id: 'apt-1',
        lead_id: 'lead-1',
        treatment_id: 'trt-1',
        start_at: tomorrow10.toISOString(),
        end_at: new Date(tomorrow10.getTime() + 60 * 60 * 1000).toISOString(),
        status: 'confirmed',
        created_by: 'ai',
        channel: 'whatsapp',
        notes: 'Patient noted slight enamel sensitivity during cold drinks.',
      },
      {
        id: 'apt-2',
        lead_id: 'lead-3',
        treatment_id: 'trt-6',
        start_at: tomorrow14.toISOString(),
        end_at: new Date(tomorrow14.getTime() + 45 * 60 * 1000).toISOString(),
        status: 'confirmed',
        created_by: 'ai',
        channel: 'whatsapp',
        notes: 'Russian lips aesthetic preference, Juvederm Volbella 1ml.',
      },
      {
        id: 'apt-3',
        lead_id: 'lead-7',
        treatment_id: 'trt-4',
        start_at: dayAfter11.toISOString(),
        end_at: new Date(dayAfter11.getTime() + 45 * 60 * 1000).toISOString(),
        status: 'confirmed',
        created_by: 'staff',
        channel: 'web',
        notes: 'Routine 6-month hygiene recall.',
      },
      {
        id: 'apt-4',
        lead_id: 'lead-10',
        treatment_id: 'trt-5',
        start_at: dayAfter16.toISOString(),
        end_at: new Date(dayAfter16.getTime() + 30 * 60 * 1000).toISOString(),
        status: 'confirmed',
        created_by: 'ai',
        channel: 'whatsapp',
        notes: 'Forehead and crow feet assessment.',
      },
      {
        id: 'apt-5',
        lead_id: 'lead-5',
        treatment_id: 'trt-3',
        start_at: past3Days.toISOString(),
        end_at: new Date(past3Days.getTime() + 45 * 60 * 1000).toISOString(),
        status: 'completed',
        created_by: 'staff',
        channel: 'whatsapp',
        notes: 'CBCT 3D Scan completed, molar implant scheduled.',
      },
      {
        id: 'apt-6',
        lead_id: 'lead-8',
        treatment_id: 'trt-8',
        start_at: past5Days.toISOString(),
        end_at: new Date(past5Days.getTime() + 45 * 60 * 1000).toISOString(),
        status: 'no_show',
        created_by: 'staff',
        channel: 'whatsapp',
        notes: 'Patient did not answer confirmation call at 2pm.',
      },
      {
        id: 'apt-7',
        lead_id: 'lead-2',
        treatment_id: 'trt-2',
        start_at: new Date(now + 4 * dayMs).toISOString(),
        end_at: new Date(now + 4 * dayMs + 45 * 60 * 1000).toISOString(),
        status: 'confirmed',
        created_by: 'staff',
        channel: 'whatsapp',
        notes: 'Veneers case review with Dr. Sarah Al-Mansoori.',
      },
      {
        id: 'apt-8',
        lead_id: 'lead-9',
        treatment_id: 'trt-1',
        start_at: new Date(now + 5 * dayMs).toISOString(),
        end_at: new Date(now + 5 * dayMs + 60 * 60 * 1000).toISOString(),
        status: 'confirmed',
        created_by: 'ai',
        channel: 'whatsapp',
        notes: 'Pre-wedding teeth whitening package.',
      },
    ];

    this.appointments = sampleAppointments;

    // Followups
    this.followups = [
      {
        id: 'fol-1',
        lead_id: 'lead-1',
        appointment_id: 'apt-1',
        type: 'reminder_24h',
        due_at: new Date(tomorrow10.getTime() - 24 * hourMs).toISOString(),
        status: 'sent',
        template_name: 'appointment_reminder_24h',
        params: { patient_name: 'Nour Al-Sabah', time: '10:00 AM' },
        created_at: new Date(now - 2 * dayMs).toISOString(),
      },
      {
        id: 'fol-2',
        lead_id: 'lead-1',
        appointment_id: 'apt-1',
        type: 'reminder_2h',
        due_at: new Date(tomorrow10.getTime() - 2 * hourMs).toISOString(),
        status: 'pending',
        template_name: 'appointment_reminder_2h',
        params: { patient_name: 'Nour Al-Sabah', time: '10:00 AM' },
        created_at: new Date(now - 2 * dayMs).toISOString(),
      },
      {
        id: 'fol-3',
        lead_id: 'lead-3',
        appointment_id: 'apt-2',
        type: 'reminder_24h',
        due_at: new Date(tomorrow14.getTime() - 24 * hourMs).toISOString(),
        status: 'pending',
        template_name: 'appointment_reminder_24h_ar',
        params: { patient_name: 'ريم الهاشمي', time: '02:00 PM' },
        created_at: new Date(now - 1 * dayMs).toISOString(),
      },
      {
        id: 'fol-4',
        lead_id: 'lead-8',
        appointment_id: 'apt-6',
        type: 'noshow_reschedule',
        due_at: new Date(now - 4 * dayMs).toISOString(),
        status: 'sent',
        template_name: 'noshow_reschedule_offer',
        params: { patient_name: 'Hessa Al-Falasi' },
        created_at: new Date(now - 5 * dayMs).toISOString(),
      },
      {
        id: 'fol-5',
        lead_id: 'lead-11',
        appointment_id: null,
        type: 'no_booking_1',
        due_at: new Date(now + 12 * hourMs).toISOString(),
        status: 'pending',
        template_name: 'no_booking_nudge_1',
        params: { patient_name: 'David Miller', treatment: 'Dental Implant Assessment' },
        created_at: new Date(now - 12 * hourMs).toISOString(),
      },
    ];

    // Seed Activity Events
    this.activities = [
      {
        id: 'act-1',
        type: 'message_received',
        title: 'New Web Enquiry',
        description: 'Elena Rostova enquired about HydraFacial Elite via website chat widget',
        timestamp: new Date(now - 15 * 60 * 1000).toISOString(),
        lead_id: 'lead-4',
      },
      {
        id: 'act-2',
        type: 'handover',
        title: 'Human Handover Requested',
        description: 'Tariq Mansoor conversation switched to Human mode (Clinical veneer inquiry)',
        timestamp: new Date(now - 25 * 60 * 1000).toISOString(),
        lead_id: 'lead-2',
      },
      {
        id: 'act-3',
        type: 'appointment_created',
        title: 'Zoom Whitening Booked',
        description: 'Alexander Lind booked in-office whitening for upcoming Monday (AI Booked)',
        timestamp: new Date(now - 1 * hourMs).toISOString(),
        lead_id: 'lead-9',
      },
      {
        id: 'act-4',
        type: 'followup_sent',
        title: '24h Reminder Dispatched',
        description: 'WhatsApp 24h reminder sent to Nour Al-Sabah (+971501234567)',
        timestamp: new Date(now - 2 * hourMs).toISOString(),
        lead_id: 'lead-1',
      },
      {
        id: 'act-5',
        type: 'lead_new',
        title: 'After-Hours Lead Captured',
        description: 'Fatima Al-Marzouqi enquired at 11:20 PM via Instagram DM',
        timestamp: new Date(now - 18 * hourMs).toISOString(),
        lead_id: 'lead-6',
      },
    ];
  }
}

export const db = new ClinicDatabase();
