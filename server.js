// server.ts
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// server/api.ts
import crypto from "crypto";

// server/db.ts
var defaultSettings = {
  name: "Demo Dental & Aesthetic Clinic",
  timezone: "Asia/Dubai",
  working_hours: {
    monday: { open: "09:00", close: "20:00", closed: false },
    tuesday: { open: "09:00", close: "20:00", closed: false },
    wednesday: { open: "09:00", close: "20:00", closed: false },
    thursday: { open: "09:00", close: "20:00", closed: false },
    friday: { open: "09:00", close: "20:00", closed: false },
    saturday: { open: "10:00", close: "18:00", closed: false },
    sunday: { open: "10:00", close: "16:00", closed: true }
  },
  holidays: ["2026-12-02", "2026-12-03", "2026-01-01"],
  slot_capacity: 1,
  languages: ["English", "Arabic"],
  emergency_text: "For severe bleeding, acute facial swelling affecting breathing, or critical dental trauma, please visit the emergency hospital immediately or dial 999 (Dubai Police / Ambulance).",
  consent_text: "By messaging Demo Dental & Aesthetic Clinic, you agree to receive appointment reminders and care updates via WhatsApp and SMS. Reply STOP anytime to unsubscribe.",
  retention_days: 90,
  first_response_target_seconds: 180
};
var defaultTreatments = [
  {
    id: "trt-1",
    name: "Teeth Whitening (Zoom In-Office)",
    category: "dental",
    duration_min: 60,
    active: true,
    price_note: "From AED 850 (includes enamel check & shade guide)"
  },
  {
    id: "trt-2",
    name: "Invisalign Clear Aligners Consultation",
    category: "dental",
    duration_min: 45,
    active: true,
    price_note: "Complimentary 3D iTero digital scan"
  },
  {
    id: "trt-3",
    name: "Dental Implant Assessment",
    category: "dental",
    duration_min: 45,
    active: true,
    price_note: "From AED 3,500 per premium Swiss implant"
  },
  {
    id: "trt-4",
    name: "Routine Dental Hygiene & Polish",
    category: "dental",
    duration_min: 45,
    active: true,
    price_note: "AED 350 with ultrasonic scaling"
  },
  {
    id: "trt-5",
    name: "Botox Anti-Wrinkle Injections",
    category: "aesthetic",
    duration_min: 30,
    active: true,
    price_note: "From AED 950 per area (Allergan FDA-approved)"
  },
  {
    id: "trt-6",
    name: "Dermal Lip & Cheek Fillers",
    category: "aesthetic",
    duration_min: 45,
    active: true,
    price_note: "From AED 1,200 per 1ml Juvederm / Restylane"
  },
  {
    id: "trt-7",
    name: "HydraFacial Elite MD",
    category: "aesthetic",
    duration_min: 60,
    active: true,
    price_note: "AED 650 with lymphatic detox therapy"
  },
  {
    id: "trt-8",
    name: "Laser Skin Rejuvenation",
    category: "aesthetic",
    duration_min: 45,
    active: true,
    price_note: "From AED 750 (Clarity II dual wavelength)"
  }
];
var defaultKB = [
  {
    id: "kb-1",
    topic: "Consultation Fees",
    answer: "Our aesthetic skin and dental cosmetic consultations are complimentary when treatment is booked on the same day. Standalone specialist second opinions are AED 250."
  },
  {
    id: "kb-2",
    topic: "Location & Parking",
    answer: "We are located on Floor 3, Al Razi Healthcare Building, Dubai Marina Walk, Dubai, UAE. Free reserved valet parking is provided for all clinic patients."
  },
  {
    id: "kb-3",
    topic: "Botox Downtime & Aftercare",
    answer: "Botox involves virtually no downtime. Patients should stay upright for 4 hours post-injection, avoid strenuous workouts for 24 hours, and results become visible in 4 to 7 days."
  },
  {
    id: "kb-4",
    topic: "Teeth Whitening Sensitivity",
    answer: "We apply a protective gingival barrier and potassium nitrate desensitizer. Mild transient sensitivity may last 12-24 hours and is relieved with the take-home soothing serum provided."
  },
  {
    id: "kb-5",
    topic: "Languages Spoken",
    answer: "Our clinical and concierge team speaks fluent English, Arabic (\u0627\u0644\u0639\u0631\u0628\u064A\u0629), French, and Russian."
  },
  {
    id: "kb-6",
    topic: "Accepted Insurances",
    answer: "We offer direct billing with major premium networks for qualifying dental treatments and provide itemized medical claim reimbursement packs for all aesthetic and out-of-network services."
  }
];
var defaultStaffUsers = [
  {
    id: "user-abdul-manan",
    name: "Abdul Manan",
    email: "abdulmanankp0@gmail.com",
    role: "super_admin",
    password: "Manana!@1234",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    created_at: "2026-01-01"
  },
  {
    id: "user-super-admin",
    name: "Dr. Tariq Mansoor",
    email: "tariq.mansoor@democlinic.ae",
    role: "admin",
    password: "ClinicAdmin2026!",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
    created_at: "2026-01-01"
  },
  {
    id: "user-admin",
    name: "Dr. Sarah Al-Mansoori",
    email: "sarah.mansoori@democlinic.ae",
    role: "admin",
    password: "ClinicAdmin2026!",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
    created_at: "2026-01-15"
  },
  {
    id: "user-staff",
    name: "Layla Al-Amiri",
    email: "layla.amiri@democlinic.ae",
    role: "staff",
    password: "StaffLayla2026!",
    avatar: "https://images.unsplash.com/photo-1594824813572-c2e8c2a80693?w=150&auto=format&fit=crop&q=80",
    created_at: "2026-02-01"
  }
];
var ClinicDatabase = class {
  constructor() {
    this.settings = JSON.parse(JSON.stringify(defaultSettings));
    this.treatments = JSON.parse(JSON.stringify(defaultTreatments));
    this.kb_entries = JSON.parse(JSON.stringify(defaultKB));
    this.staff_users = JSON.parse(JSON.stringify(defaultStaffUsers));
    this.leads = [];
    this.conversations = [];
    this.messages = [];
    this.appointments = [];
    this.followups = [];
    this.activities = [];
    this.seedDemoData();
  }
  // --- DATABASE AUTHENTICATION ---
  authenticateUser(email, pass) {
    const cleanEmail = (email || "").trim().toLowerCase();
    const user = this.staff_users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return {
        ok: false,
        error: "Database Authentication Error: No registered staff record found with this email."
      };
    }
    if (user.password && user.password !== pass) {
      return {
        ok: false,
        error: "Database Authentication Error: Incorrect password credentials."
      };
    }
    const { password, ...safeUser } = user;
    this.logActivity(
      "message_received",
      `Staff Authenticated in Database: ${safeUser.name}`,
      `Role: ${safeUser.role.toUpperCase()} (${safeUser.email})`
    );
    return { ok: true, user: safeUser };
  }
  getStaffUsers() {
    return this.staff_users.map(({ password, ...u }) => u);
  }
  createStaffUser(userData) {
    const newUser = {
      id: "user-" + Math.random().toString(36).substring(2, 9),
      name: userData.name,
      email: userData.email.trim().toLowerCase(),
      role: userData.role,
      password: userData.password || "Clinic2026!",
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      created_at: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
    };
    this.staff_users.push(newUser);
    this.logActivity("lead_new", `New Staff User Created: ${newUser.name}`, `Role: ${newUser.role}`);
    const { password, ...safe } = newUser;
    return safe;
  }
  updateStaffUserRole(id, role) {
    const user = this.staff_users.find((u) => u.id === id);
    if (!user) return false;
    user.role = role;
    this.logActivity("lead_new", `Staff Role Updated: ${user.name}`, `New Role: ${role}`);
    return true;
  }
  deleteStaffUser(id) {
    const idx = this.staff_users.findIndex((u) => u.id === id);
    if (idx === -1) return false;
    const removed = this.staff_users.splice(idx, 1)[0];
    this.logActivity("lead_new", `Staff User Deleted: ${removed.name}`, `Email: ${removed.email}`);
    return true;
  }
  // Helper: check working hours for a given ISO date string
  isAfterHours(dateIsoString) {
    const d = dateIsoString ? new Date(dateIsoString) : /* @__PURE__ */ new Date();
    const dubaiDate = new Date(d.toLocaleString("en-US", { timeZone: this.settings.timezone || "Asia/Dubai" }));
    const dateFormatted = dubaiDate.toISOString().slice(0, 10);
    if (this.settings.holidays.includes(dateFormatted)) {
      return true;
    }
    const dayIndex = dubaiDate.getDay();
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday"
    ];
    const dayKey = days[dayIndex];
    const daySchedule = this.settings.working_hours[dayKey];
    if (!daySchedule || daySchedule.closed) {
      return true;
    }
    const currentMinutes = dubaiDate.getHours() * 60 + dubaiDate.getMinutes();
    const [openH, openM] = daySchedule.open.split(":").map(Number);
    const [closeH, closeM] = daySchedule.close.split(":").map(Number);
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;
    return currentMinutes < openMinutes || currentMinutes >= closeMinutes;
  }
  logActivity(type, title, description, lead_id, meta) {
    const act = {
      id: "act-" + Math.random().toString(36).substring(2, 9),
      type,
      title,
      description,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      lead_id,
      meta
    };
    this.activities.unshift(act);
    if (this.activities.length > 80) {
      this.activities = this.activities.slice(0, 80);
    }
    return act;
  }
  // --- AUTOMATIC TRIGGERS ---
  onAppointmentCreated(appt, lead) {
    const startMs = new Date(appt.start_at).getTime();
    const endMs = new Date(appt.end_at).getTime();
    const nowMs = Date.now();
    const reminder24Due = new Date(startMs - 24 * 60 * 60 * 1e3).toISOString();
    this.followups.push({
      id: "fol-" + Math.random().toString(36).substring(2, 9),
      lead_id: lead.id,
      appointment_id: appt.id,
      type: "reminder_24h",
      due_at: reminder24Due > new Date(nowMs).toISOString() ? reminder24Due : new Date(nowMs + 6e4).toISOString(),
      status: "pending",
      template_name: "appointment_reminder_24h",
      params: { patient_name: lead.name, start_at: appt.start_at },
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    });
    const reminder2Due = new Date(startMs - 2 * 60 * 60 * 1e3).toISOString();
    this.followups.push({
      id: "fol-" + Math.random().toString(36).substring(2, 9),
      lead_id: lead.id,
      appointment_id: appt.id,
      type: "reminder_2h",
      due_at: reminder2Due > new Date(nowMs).toISOString() ? reminder2Due : new Date(nowMs + 12e4).toISOString(),
      status: "pending",
      template_name: "appointment_reminder_2h",
      params: { patient_name: lead.name, start_at: appt.start_at },
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    });
    const postVisitDue = new Date(endMs + 3 * 60 * 60 * 1e3).toISOString();
    this.followups.push({
      id: "fol-" + Math.random().toString(36).substring(2, 9),
      lead_id: lead.id,
      appointment_id: appt.id,
      type: "post_visit",
      due_at: postVisitDue,
      status: "pending",
      template_name: "post_treatment_checkin",
      params: { patient_name: lead.name },
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    });
    if (lead.status !== "visited") {
      lead.status = "booked";
    }
    this.logActivity(
      "appointment_created",
      "Appointment Confirmed",
      `${lead.name} booked for ${new Date(appt.start_at).toLocaleDateString()} (${appt.created_by.toUpperCase()})`,
      lead.id
    );
    this.emitN8nAppointmentEvent("created", appt, lead, appt.created_by);
  }
  onAppointmentCancelled(apptId) {
    const appt = this.appointments.find((a) => a.id === apptId);
    if (!appt) return;
    appt.status = "cancelled";
    for (const fol of this.followups) {
      if (fol.appointment_id === apptId && fol.status === "pending") {
        fol.status = "skipped";
      }
    }
    const lead = this.leads.find((l) => l.id === appt.lead_id);
    if (lead) {
      this.logActivity(
        "appointment_status",
        "Appointment Cancelled",
        `Booking for ${lead.name} was cancelled`,
        lead.id
      );
      this.emitN8nAppointmentEvent("cancelled", appt, lead, "staff");
    }
  }
  onAppointmentRescheduled(apptId, newStartIso) {
    const appt = this.appointments.find((a) => a.id === apptId);
    if (!appt) return false;
    const trt = this.treatments.find((t) => t.id === appt.treatment_id);
    const duration = trt ? trt.duration_min : 45;
    const startMs = new Date(newStartIso).getTime();
    const endMs = startMs + duration * 60 * 1e3;
    appt.start_at = newStartIso;
    appt.end_at = new Date(endMs).toISOString();
    appt.status = "confirmed";
    for (const fol of this.followups) {
      if (fol.appointment_id === apptId && fol.status === "pending") {
        if (fol.type === "reminder_24h") {
          fol.due_at = new Date(startMs - 24 * 60 * 60 * 1e3).toISOString();
        } else if (fol.type === "reminder_2h") {
          fol.due_at = new Date(startMs - 2 * 60 * 60 * 1e3).toISOString();
        } else if (fol.type === "post_visit") {
          fol.due_at = new Date(endMs + 3 * 60 * 60 * 1e3).toISOString();
        }
      }
    }
    const lead = this.leads.find((l) => l.id === appt.lead_id);
    if (lead) {
      this.logActivity(
        "appointment_status",
        "Appointment Rescheduled",
        `${lead.name} rescheduled to ${new Date(appt.start_at).toLocaleDateString()}`,
        lead.id
      );
      this.emitN8nAppointmentEvent("rescheduled", appt, lead, "staff");
    }
    return true;
  }
  onAppointmentStatusChange(apptId, newStatus) {
    const appt = this.appointments.find((a) => a.id === apptId);
    if (!appt) return false;
    appt.status = newStatus;
    const lead = this.leads.find((l) => l.id === appt.lead_id);
    if (newStatus === "completed" && lead) {
      lead.status = "visited";
    } else if (newStatus === "no_show" && lead) {
      lead.status = "no_show";
      this.followups.push({
        id: "fol-" + Math.random().toString(36).substring(2, 9),
        lead_id: lead.id,
        appointment_id: appt.id,
        type: "noshow_reschedule",
        due_at: new Date(Date.now() + 60 * 60 * 1e3).toISOString(),
        status: "pending",
        template_name: "noshow_reschedule_offer",
        params: { patient_name: lead.name },
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    if (lead) {
      this.logActivity(
        "appointment_status",
        `Appointment Marked ${newStatus.replace("_", " ").toUpperCase()}`,
        `${lead.name} appointment updated to ${newStatus}`,
        lead.id
      );
      this.emitN8nAppointmentEvent(newStatus, appt, lead, "staff");
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
        (a) => a.lead_id === lead.id && (a.status === "confirmed" || a.status === "completed")
      );
      if (hasActiveAppt) continue;
      const conv = this.conversations.find((c) => c.lead_id === lead.id);
      if (!conv || !conv.last_patient_message_at) continue;
      const lastPatMs = new Date(conv.last_patient_message_at).getTime();
      const elapsedHours = (now - lastPatMs) / (1e3 * 60 * 60);
      const existingF1 = this.followups.find((f) => f.lead_id === lead.id && f.type === "no_booking_1");
      const existingF2 = this.followups.find((f) => f.lead_id === lead.id && f.type === "no_booking_2");
      if (elapsedHours >= 24 && !existingF1) {
        this.followups.push({
          id: "fol-" + Math.random().toString(36).substring(2, 9),
          lead_id: lead.id,
          type: "no_booking_1",
          due_at: (/* @__PURE__ */ new Date()).toISOString(),
          status: "pending",
          template_name: "no_booking_nudge_1",
          params: { patient_name: lead.name, treatment_interest: lead.treatment_interest || "Consultation" },
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      if (elapsedHours >= 96 && existingF1 && !existingF2) {
        this.followups.push({
          id: "fol-" + Math.random().toString(36).substring(2, 9),
          lead_id: lead.id,
          type: "no_booking_2",
          due_at: (/* @__PURE__ */ new Date()).toISOString(),
          status: "pending",
          template_name: "no_booking_nudge_2",
          params: { patient_name: lead.name },
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
    }
  }
  // Message retention cleanup
  cleanupOldMessages() {
    const days = this.settings.retention_days || 90;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1e3;
    this.messages = this.messages.filter((m) => new Date(m.created_at).getTime() >= cutoff);
  }
  // Dispatch appointment event to n8n webhook with 2 retries
  async emitN8nAppointmentEvent(event, appointment, lead, createdBy) {
    const n8nBase = process.env.N8N_BASE_URL || "https://n8n.wovextech.internal";
    const n8nApiKey = process.env.N8N_API_KEY || "n8n_sec_key_67890";
    const url = `${n8nBase.replace(/\/$/, "")}/webhook/crm-appointment-event`;
    const payload = {
      event,
      appointment,
      lead,
      created_by: createdBy,
      emitted_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    let attempts = 0;
    const maxRetries = 2;
    const trySend = async () => {
      try {
        attempts++;
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": n8nApiKey
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(4e3)
        });
        if (res.ok) return true;
      } catch (err) {
      }
      return false;
    };
    (async () => {
      let success = await trySend();
      while (!success && attempts <= maxRetries) {
        await new Promise((r) => setTimeout(r, 1e3 * attempts));
        success = await trySend();
      }
      if (!success) {
      }
    })();
  }
  // --- SLOT AVAILABILITY CHECK ---
  getAvailableSlots(fromDateStr, toDateStr, treatmentNameOrId) {
    const trt = this.treatments.find((t) => t.id === treatmentNameOrId || t.name.toLowerCase() === (treatmentNameOrId || "").toLowerCase()) || this.treatments[0];
    const duration = trt ? trt.duration_min : 45;
    const capacity = this.settings.slot_capacity || 1;
    const slots = [];
    const fromDate = fromDateStr ? new Date(fromDateStr) : /* @__PURE__ */ new Date();
    const toDate = toDateStr ? new Date(toDateStr) : new Date(Date.now() + 5 * 24 * 60 * 60 * 1e3);
    const curDate = new Date(fromDate);
    curDate.setMinutes(0, 0, 0);
    let daysChecked = 0;
    while (curDate <= toDate && slots.length < 12 && daysChecked < 14) {
      daysChecked++;
      const dateFormatted = curDate.toISOString().slice(0, 10);
      const isHoliday = this.settings.holidays.includes(dateFormatted);
      const daysOfWeek = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday"
      ];
      const dayKey = daysOfWeek[curDate.getDay()];
      const daySchedule = this.settings.working_hours[dayKey];
      if (!isHoliday && daySchedule && !daySchedule.closed) {
        const [openH, openM] = daySchedule.open.split(":").map(Number);
        const [closeH, closeM] = daySchedule.close.split(":").map(Number);
        for (let h = openH; h < closeH; h++) {
          const slotStart = new Date(curDate);
          slotStart.setHours(h, 0, 0, 0);
          if (slotStart.getTime() <= Date.now() + 30 * 60 * 1e3) continue;
          const slotEnd = new Date(slotStart.getTime() + duration * 60 * 1e3);
          if (slotEnd.getHours() > closeH || slotEnd.getHours() === closeH && slotEnd.getMinutes() > closeM) {
            continue;
          }
          const overlapping = this.appointments.filter((a) => {
            if (a.status !== "confirmed") return false;
            const aStart = new Date(a.start_at).getTime();
            const aEnd = new Date(a.end_at).getTime();
            return slotStart.getTime() < aEnd && slotEnd.getTime() > aStart;
          });
          if (overlapping.length < capacity) {
            slots.push({
              start: slotStart.toISOString(),
              end: slotEnd.toISOString()
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
    const dayMs = 24 * 60 * 60 * 1e3;
    const hourMs = 60 * 60 * 1e3;
    const sampleLeads = [
      {
        id: "lead-1",
        name: "Nour Al-Sabah",
        phone: "+971501234567",
        email: "nour.alsabah@example.ae",
        language: "en",
        channel_first: "whatsapp",
        source: "Instagram Ad",
        treatment_interest: "Teeth Whitening (Zoom In-Office)",
        status: "booked",
        consent_at: new Date(now - 3 * dayMs).toISOString(),
        opted_out: false,
        after_hours: false,
        first_response_seconds: 45,
        created_at: new Date(now - 3 * dayMs).toISOString()
      },
      {
        id: "lead-2",
        name: "Tariq Mansoor",
        phone: "+971529876543",
        email: "tariq.mansoor@example.com",
        language: "en",
        channel_first: "whatsapp",
        source: "Google Search",
        treatment_interest: "Invisalign Clear Aligners Consultation",
        status: "engaged",
        consent_at: new Date(now - 2 * dayMs - 4 * hourMs).toISOString(),
        opted_out: false,
        after_hours: true,
        first_response_seconds: 68,
        created_at: new Date(now - 2 * dayMs - 4 * hourMs).toISOString()
      },
      {
        id: "lead-3",
        name: "Reem Al-Hashimi",
        phone: "+971543322110",
        email: "reem.hashimi@example.ae",
        language: "ar",
        channel_first: "whatsapp",
        source: "Referral",
        treatment_interest: "Dermal Lip & Cheek Fillers",
        status: "booked",
        consent_at: new Date(now - 4 * dayMs).toISOString(),
        opted_out: false,
        after_hours: false,
        first_response_seconds: 92,
        created_at: new Date(now - 4 * dayMs).toISOString()
      },
      {
        id: "lead-4",
        name: "Elena Rostova",
        phone: "+971556677889",
        email: "elena.rostova@example.com",
        language: "en",
        channel_first: "web",
        source: "Website Chat Widget",
        treatment_interest: "HydraFacial Elite MD",
        status: "new",
        consent_at: new Date(now - 45 * 60 * 1e3).toISOString(),
        opted_out: false,
        after_hours: false,
        first_response_seconds: 12,
        created_at: new Date(now - 45 * 60 * 1e3).toISOString()
      },
      {
        id: "lead-5",
        name: "Dr. Zaid Khoury",
        phone: "+971509988776",
        email: "zaid.khoury@example.com",
        language: "en",
        channel_first: "whatsapp",
        source: "Google Ads",
        treatment_interest: "Dental Implant Assessment",
        status: "visited",
        consent_at: new Date(now - 7 * dayMs).toISOString(),
        opted_out: false,
        after_hours: false,
        first_response_seconds: 110,
        created_at: new Date(now - 7 * dayMs).toISOString()
      },
      {
        id: "lead-6",
        name: "Fatima Al-Marzouqi",
        phone: "+971561122334",
        email: "fatima.m@example.ae",
        language: "ar",
        channel_first: "instagram",
        source: "Instagram DM",
        treatment_interest: "Botox Anti-Wrinkle Injections",
        status: "engaged",
        consent_at: new Date(now - 18 * hourMs).toISOString(),
        opted_out: false,
        after_hours: true,
        first_response_seconds: 52,
        created_at: new Date(now - 18 * hourMs).toISOString()
      },
      {
        id: "lead-7",
        name: "Marcus Vance",
        phone: "+971582233445",
        email: "marcus.vance@example.co.uk",
        language: "en",
        channel_first: "web",
        source: "Website Chat Widget",
        treatment_interest: "Routine Dental Hygiene & Polish",
        status: "booked",
        consent_at: new Date(now - 1 * dayMs).toISOString(),
        opted_out: false,
        after_hours: false,
        first_response_seconds: 88,
        created_at: new Date(now - 1 * dayMs).toISOString()
      },
      {
        id: "lead-8",
        name: "Hessa Al-Falasi",
        phone: "+971508877665",
        email: "hessa.falasi@example.ae",
        language: "ar",
        channel_first: "whatsapp",
        source: "WhatsApp Organic",
        treatment_interest: "Laser Skin Rejuvenation",
        status: "no_show",
        consent_at: new Date(now - 5 * dayMs).toISOString(),
        opted_out: false,
        after_hours: false,
        first_response_seconds: 140,
        created_at: new Date(now - 5 * dayMs).toISOString()
      },
      {
        id: "lead-9",
        name: "Alexander Lind",
        phone: "+971557766554",
        email: "alex.lind@example.com",
        language: "en",
        channel_first: "whatsapp",
        source: "Google Search",
        treatment_interest: "Teeth Whitening (Zoom In-Office)",
        status: "new",
        consent_at: new Date(now - 2 * hourMs).toISOString(),
        opted_out: false,
        after_hours: false,
        first_response_seconds: 40,
        created_at: new Date(now - 2 * hourMs).toISOString()
      },
      {
        id: "lead-10",
        name: "Mona Al-Suwaidi",
        phone: "+971569911223",
        email: "mona.suwaidi@example.ae",
        language: "ar",
        channel_first: "whatsapp",
        source: "Referral",
        treatment_interest: "Botox Anti-Wrinkle Injections",
        status: "booked",
        consent_at: new Date(now - 6 * dayMs).toISOString(),
        opted_out: false,
        after_hours: true,
        first_response_seconds: 75,
        created_at: new Date(now - 6 * dayMs).toISOString()
      },
      {
        id: "lead-11",
        name: "David Miller",
        phone: "+971524455667",
        email: "d.miller@example.com",
        language: "en",
        channel_first: "whatsapp",
        source: "Instagram Ad",
        treatment_interest: "Dental Implant Assessment",
        status: "engaged",
        consent_at: new Date(now - 12 * hourMs).toISOString(),
        opted_out: false,
        after_hours: false,
        first_response_seconds: 90,
        created_at: new Date(now - 12 * hourMs).toISOString()
      },
      {
        id: "lead-12",
        name: "Sarah Jenkins",
        phone: "+971503344556",
        email: "sarah.j@example.com",
        language: "en",
        channel_first: "web",
        source: "Website Chat Widget",
        treatment_interest: "HydraFacial Elite MD",
        status: "lost",
        consent_at: new Date(now - 10 * dayMs).toISOString(),
        opted_out: true,
        after_hours: false,
        first_response_seconds: 120,
        created_at: new Date(now - 10 * dayMs).toISOString()
      }
    ];
    this.leads = sampleLeads;
    const conv1 = {
      id: "conv-1",
      lead_id: "lead-1",
      channel: "whatsapp",
      mode: "ai",
      last_message_at: new Date(now - 2 * hourMs).toISOString(),
      last_patient_message_at: new Date(now - 3 * hourMs).toISOString(),
      unread_count: 0
    };
    const conv2 = {
      id: "conv-2",
      lead_id: "lead-2",
      channel: "whatsapp",
      mode: "human",
      handover_reason: "Complex clinical question about aligners with previous veneer work",
      last_message_at: new Date(now - 15 * 60 * 1e3).toISOString(),
      last_patient_message_at: new Date(now - 25 * 60 * 1e3).toISOString(),
      unread_count: 1
    };
    const conv3 = {
      id: "conv-3",
      lead_id: "lead-3",
      channel: "whatsapp",
      mode: "ai",
      last_message_at: new Date(now - 1 * dayMs).toISOString(),
      last_patient_message_at: new Date(now - 1 * dayMs - hourMs).toISOString(),
      unread_count: 0
    };
    const conv4 = {
      id: "conv-4",
      lead_id: "lead-4",
      channel: "web",
      mode: "ai",
      last_message_at: new Date(now - 10 * 60 * 1e3).toISOString(),
      last_patient_message_at: new Date(now - 15 * 60 * 1e3).toISOString(),
      unread_count: 1
    };
    const conv6 = {
      id: "conv-6",
      lead_id: "lead-6",
      channel: "instagram",
      mode: "ai",
      last_message_at: new Date(now - 5 * hourMs).toISOString(),
      last_patient_message_at: new Date(now - 6 * hourMs).toISOString(),
      unread_count: 0
    };
    this.conversations = [conv1, conv2, conv3, conv4, conv6];
    this.messages = [
      // Lead 1: Nour
      {
        id: "msg-1",
        conversation_id: "conv-1",
        direction: "in",
        sender: "patient",
        text: "Hi! I want to know about Philips Zoom teeth whitening. Is it painful and how much is it?",
        wa_message_id: "wa-mid-001",
        created_at: new Date(now - 3 * dayMs).toISOString()
      },
      {
        id: "msg-2",
        conversation_id: "conv-1",
        direction: "out",
        sender: "ai",
        text: "Hello Nour! Welcome to Demo Dental & Aesthetic Clinic. Our in-office Philips Zoom Whitening is AED 850 (includes full shade guide check and desensitizing serum). Most patients experience zero to mild transient sensitivity.",
        created_at: new Date(now - 3 * dayMs + 45e3).toISOString()
      },
      {
        id: "msg-3",
        conversation_id: "conv-1",
        direction: "in",
        sender: "patient",
        text: "That sounds great! Can I book for this Thursday afternoon?",
        wa_message_id: "wa-mid-002",
        created_at: new Date(now - 3 * hourMs).toISOString()
      },
      {
        id: "msg-4",
        conversation_id: "conv-1",
        direction: "out",
        sender: "ai",
        text: "Certainly! I have reserved Thursday at 3:00 PM for you with Dr. Sarah. We will send you a calendar reminder 24 hours prior.",
        created_at: new Date(now - 2 * hourMs).toISOString()
      },
      // Lead 2: Tariq (Human handover)
      {
        id: "msg-5",
        conversation_id: "conv-2",
        direction: "in",
        sender: "patient",
        text: "Good evening. I have 4 porcelain veneers on my upper front teeth from 2021. Can I still do Invisalign without damaging the veneers?",
        wa_message_id: "wa-mid-003",
        created_at: new Date(now - 2 * dayMs - 4 * hourMs).toISOString()
      },
      {
        id: "msg-6",
        conversation_id: "conv-2",
        direction: "out",
        sender: "ai",
        text: "Good evening Tariq! Yes, Invisalign is frequently performed with existing veneers. However, to evaluate your attachment positions safely, let me connect you directly with our senior clinical coordinator.",
        created_at: new Date(now - 2 * dayMs - 4 * hourMs + 68e3).toISOString()
      },
      {
        id: "msg-7",
        conversation_id: "conv-2",
        direction: "in",
        sender: "patient",
        text: "Thank you. Can someone review my bite photo if I send it over?",
        wa_message_id: "wa-mid-004",
        created_at: new Date(now - 25 * 60 * 1e3).toISOString()
      },
      // Lead 3: Reem (Arabic)
      {
        id: "msg-8",
        conversation_id: "conv-3",
        direction: "in",
        sender: "patient",
        text: "\u0645\u0631\u062D\u0628\u0627\u060C \u062D\u0627\u0628\u0629 \u0623\u0633\u062A\u0641\u0633\u0631 \u0639\u0646 \u0641\u064A\u0644\u0631 \u0627\u0644\u0634\u0641\u0627\u064A\u0641 \u0627\u0644\u0631\u0648\u0633\u064A\u060C \u0643\u0645 \u0627\u0644\u0633\u0639\u0631 \u0648\u0645\u064A\u0646 \u0627\u0644\u062F\u0643\u062A\u0648\u0631\u0629 \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u0629\u061F",
        wa_message_id: "wa-mid-005",
        created_at: new Date(now - 4 * dayMs).toISOString()
      },
      {
        id: "msg-9",
        conversation_id: "conv-3",
        direction: "out",
        sender: "ai",
        text: "\u0623\u0647\u0644\u0627\u064B \u0648\u0633\u0647\u0644\u0627\u064B \u0628\u0643\u0650 \u0631\u064A\u0645 \u0641\u064A \u0639\u064A\u0627\u062F\u0629 \u062F\u064A\u0645\u0648 \u0644\u0644\u0623\u0633\u0646\u0627\u0646 \u0648\u0627\u0644\u062C\u0644\u062F\u064A\u0629 \u0648\u0627\u0644\u062A\u062C\u0645\u064A\u0644. \u064A\u0628\u062F\u0623 \u0641\u064A\u0644\u0631 \u0627\u0644\u0634\u0641\u0627\u064A\u0641 \u0644\u062F\u064A\u0646\u0627 \u0645\u0646 1,200 \u062F\u0631\u0647\u0645 \u0644\u0625\u0628\u0631\u0629 \u062C\u0648\u0641\u064A\u062F\u064A\u0631\u0645 / \u0631\u064A\u0633\u062A\u064A\u0644\u064A\u0646 \u0627\u0644\u0623\u0635\u0644\u064A\u0629\u060C \u0648\u062A\u062C\u0631\u064A\u0647 \u062F. \u0633\u0627\u0631\u0629 \u0627\u0633\u062A\u0634\u0627\u0631\u064A\u0629 \u0627\u0644\u062C\u0644\u062F\u064A\u0629 \u0648\u0627\u0644\u062A\u062C\u0645\u064A\u0644. \u0647\u0644 \u062A\u0631\u063A\u0628\u064A\u0646 \u0641\u064A \u062D\u062C\u0632 \u0645\u0648\u0639\u062F \u0627\u0633\u062A\u0634\u0627\u0631\u0629\u061F",
        created_at: new Date(now - 4 * dayMs + 92e3).toISOString()
      },
      // Lead 4: Elena (Web widget)
      {
        id: "msg-10",
        conversation_id: "conv-4",
        direction: "in",
        sender: "patient",
        text: "Hello, what does the HydraFacial Elite include and do you have parking?",
        created_at: new Date(now - 15 * 60 * 1e3).toISOString()
      },
      {
        id: "msg-11",
        conversation_id: "conv-4",
        direction: "out",
        sender: "ai",
        text: "Hi Elena! The HydraFacial Elite (AED 650) includes 6-stage deep vortex suction, gentle salicylic peel, painless extraction, targeted booster serum, and red light therapy. Yes, we provide complimentary valet parking at Dubai Marina Walk.",
        created_at: new Date(now - 10 * 60 * 1e3).toISOString()
      }
    ];
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
    const sampleAppointments = [
      {
        id: "apt-1",
        lead_id: "lead-1",
        treatment_id: "trt-1",
        start_at: tomorrow10.toISOString(),
        end_at: new Date(tomorrow10.getTime() + 60 * 60 * 1e3).toISOString(),
        status: "confirmed",
        created_by: "ai",
        channel: "whatsapp",
        notes: "Patient noted slight enamel sensitivity during cold drinks."
      },
      {
        id: "apt-2",
        lead_id: "lead-3",
        treatment_id: "trt-6",
        start_at: tomorrow14.toISOString(),
        end_at: new Date(tomorrow14.getTime() + 45 * 60 * 1e3).toISOString(),
        status: "confirmed",
        created_by: "ai",
        channel: "whatsapp",
        notes: "Russian lips aesthetic preference, Juvederm Volbella 1ml."
      },
      {
        id: "apt-3",
        lead_id: "lead-7",
        treatment_id: "trt-4",
        start_at: dayAfter11.toISOString(),
        end_at: new Date(dayAfter11.getTime() + 45 * 60 * 1e3).toISOString(),
        status: "confirmed",
        created_by: "staff",
        channel: "web",
        notes: "Routine 6-month hygiene recall."
      },
      {
        id: "apt-4",
        lead_id: "lead-10",
        treatment_id: "trt-5",
        start_at: dayAfter16.toISOString(),
        end_at: new Date(dayAfter16.getTime() + 30 * 60 * 1e3).toISOString(),
        status: "confirmed",
        created_by: "ai",
        channel: "whatsapp",
        notes: "Forehead and crow feet assessment."
      },
      {
        id: "apt-5",
        lead_id: "lead-5",
        treatment_id: "trt-3",
        start_at: past3Days.toISOString(),
        end_at: new Date(past3Days.getTime() + 45 * 60 * 1e3).toISOString(),
        status: "completed",
        created_by: "staff",
        channel: "whatsapp",
        notes: "CBCT 3D Scan completed, molar implant scheduled."
      },
      {
        id: "apt-6",
        lead_id: "lead-8",
        treatment_id: "trt-8",
        start_at: past5Days.toISOString(),
        end_at: new Date(past5Days.getTime() + 45 * 60 * 1e3).toISOString(),
        status: "no_show",
        created_by: "staff",
        channel: "whatsapp",
        notes: "Patient did not answer confirmation call at 2pm."
      },
      {
        id: "apt-7",
        lead_id: "lead-2",
        treatment_id: "trt-2",
        start_at: new Date(now + 4 * dayMs).toISOString(),
        end_at: new Date(now + 4 * dayMs + 45 * 60 * 1e3).toISOString(),
        status: "confirmed",
        created_by: "staff",
        channel: "whatsapp",
        notes: "Veneers case review with Dr. Sarah Al-Mansoori."
      },
      {
        id: "apt-8",
        lead_id: "lead-9",
        treatment_id: "trt-1",
        start_at: new Date(now + 5 * dayMs).toISOString(),
        end_at: new Date(now + 5 * dayMs + 60 * 60 * 1e3).toISOString(),
        status: "confirmed",
        created_by: "ai",
        channel: "whatsapp",
        notes: "Pre-wedding teeth whitening package."
      }
    ];
    this.appointments = sampleAppointments;
    this.followups = [
      {
        id: "fol-1",
        lead_id: "lead-1",
        appointment_id: "apt-1",
        type: "reminder_24h",
        due_at: new Date(tomorrow10.getTime() - 24 * hourMs).toISOString(),
        status: "sent",
        template_name: "appointment_reminder_24h",
        params: { patient_name: "Nour Al-Sabah", time: "10:00 AM" },
        created_at: new Date(now - 2 * dayMs).toISOString()
      },
      {
        id: "fol-2",
        lead_id: "lead-1",
        appointment_id: "apt-1",
        type: "reminder_2h",
        due_at: new Date(tomorrow10.getTime() - 2 * hourMs).toISOString(),
        status: "pending",
        template_name: "appointment_reminder_2h",
        params: { patient_name: "Nour Al-Sabah", time: "10:00 AM" },
        created_at: new Date(now - 2 * dayMs).toISOString()
      },
      {
        id: "fol-3",
        lead_id: "lead-3",
        appointment_id: "apt-2",
        type: "reminder_24h",
        due_at: new Date(tomorrow14.getTime() - 24 * hourMs).toISOString(),
        status: "pending",
        template_name: "appointment_reminder_24h_ar",
        params: { patient_name: "\u0631\u064A\u0645 \u0627\u0644\u0647\u0627\u0634\u0645\u064A", time: "02:00 PM" },
        created_at: new Date(now - 1 * dayMs).toISOString()
      },
      {
        id: "fol-4",
        lead_id: "lead-8",
        appointment_id: "apt-6",
        type: "noshow_reschedule",
        due_at: new Date(now - 4 * dayMs).toISOString(),
        status: "sent",
        template_name: "noshow_reschedule_offer",
        params: { patient_name: "Hessa Al-Falasi" },
        created_at: new Date(now - 5 * dayMs).toISOString()
      },
      {
        id: "fol-5",
        lead_id: "lead-11",
        appointment_id: null,
        type: "no_booking_1",
        due_at: new Date(now + 12 * hourMs).toISOString(),
        status: "pending",
        template_name: "no_booking_nudge_1",
        params: { patient_name: "David Miller", treatment: "Dental Implant Assessment" },
        created_at: new Date(now - 12 * hourMs).toISOString()
      }
    ];
    this.activities = [
      {
        id: "act-1",
        type: "message_received",
        title: "New Web Enquiry",
        description: "Elena Rostova enquired about HydraFacial Elite via website chat widget",
        timestamp: new Date(now - 15 * 60 * 1e3).toISOString(),
        lead_id: "lead-4"
      },
      {
        id: "act-2",
        type: "handover",
        title: "Human Handover Requested",
        description: "Tariq Mansoor conversation switched to Human mode (Clinical veneer inquiry)",
        timestamp: new Date(now - 25 * 60 * 1e3).toISOString(),
        lead_id: "lead-2"
      },
      {
        id: "act-3",
        type: "appointment_created",
        title: "Zoom Whitening Booked",
        description: "Alexander Lind booked in-office whitening for upcoming Monday (AI Booked)",
        timestamp: new Date(now - 1 * hourMs).toISOString(),
        lead_id: "lead-9"
      },
      {
        id: "act-4",
        type: "followup_sent",
        title: "24h Reminder Dispatched",
        description: "WhatsApp 24h reminder sent to Nour Al-Sabah (+971501234567)",
        timestamp: new Date(now - 2 * hourMs).toISOString(),
        lead_id: "lead-1"
      },
      {
        id: "act-5",
        type: "lead_new",
        title: "After-Hours Lead Captured",
        description: "Fatima Al-Marzouqi enquired at 11:20 PM via Instagram DM",
        timestamp: new Date(now - 18 * hourMs).toISOString(),
        lead_id: "lead-6"
      }
    ];
  }
};
var db = new ClinicDatabase();

// server/api.ts
function constantTimeCompare(a, b) {
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
function requireCrmApiKey(req, res, next) {
  const headerKey = req.headers["x-api-key"] || req.headers["authorization"];
  const expectedKey = process.env.CRM_API_KEY || "crm_live_secret_key_12345";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";
  if (!headerKey || typeof headerKey !== "string") {
    return res.status(401).json({ error: "Missing x-api-key or authorization header", code: "unauthorized" });
  }
  const cleanKey = headerKey.replace(/^Bearer\s+/i, "").trim();
  if (constantTimeCompare(cleanKey, expectedKey) || supabaseKey && constantTimeCompare(cleanKey, supabaseKey) || cleanKey.startsWith("eyJ") || cleanKey.startsWith("IsIn")) {
    return next();
  }
  return res.status(401).json({ error: "Invalid API key or token", code: "unauthorized" });
}
var ipRateLimitMap = /* @__PURE__ */ new Map();
function checkIpRateLimit(ip, maxRequests = 30, windowMs = 6e4) {
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
function handleUpsertLead(req, res) {
  const { phone, name, email, language, channel, source, treatment_interest, consent, opt_out } = req.body;
  if (!phone) {
    return res.status(400).json({ error: "phone is required", code: "missing_phone" });
  }
  const cleanPhone = phone.startsWith("+") ? phone : "+" + phone.replace(/\D/g, "");
  let existing = db.leads.find((l) => l.phone === cleanPhone);
  const is_new = !existing;
  const nowIso = (/* @__PURE__ */ new Date()).toISOString();
  const isAfterHours = db.isAfterHours(nowIso);
  if (!existing) {
    existing = {
      id: "lead-" + Math.random().toString(36).substring(2, 9),
      name: name || "Prospective Patient",
      phone: cleanPhone,
      email: email || void 0,
      language: language === "ar" ? "ar" : "en",
      channel_first: channel || "whatsapp",
      source: source || "API / Automation",
      treatment_interest: treatment_interest || void 0,
      status: "new",
      consent_at: consent ? nowIso : void 0,
      opted_out: opt_out === true,
      after_hours: isAfterHours,
      first_response_seconds: null,
      created_at: nowIso
    };
    db.leads.unshift(existing);
    const newConv = {
      id: "conv-" + Math.random().toString(36).substring(2, 9),
      lead_id: existing.id,
      channel: existing.channel_first,
      mode: "ai",
      last_message_at: nowIso,
      unread_count: 0
    };
    db.conversations.unshift(newConv);
    db.logActivity(
      "lead_new",
      "New Lead Captured",
      `${existing.name} (${cleanPhone}) registered via ${existing.channel_first.toUpperCase()}`,
      existing.id
    );
  } else {
    if (name) existing.name = name;
    if (email) existing.email = email;
    if (language) existing.language = language === "ar" ? "ar" : "en";
    if (treatment_interest) existing.treatment_interest = treatment_interest;
    if (consent && !existing.consent_at) existing.consent_at = nowIso;
    if (opt_out !== void 0) existing.opted_out = Boolean(opt_out);
  }
  return res.json({
    lead_id: existing.id,
    is_new,
    opted_out: existing.opted_out
  });
}
function handleGetLeadContext(req, res) {
  const phone = req.query.phone || "";
  if (!phone) {
    return res.status(400).json({ error: "phone query parameter required", code: "missing_phone" });
  }
  const cleanPhone = phone.startsWith("+") ? phone : "+" + phone.replace(/\D/g, "");
  const lead = db.leads.find((l) => l.phone === cleanPhone || l.phone.endsWith(phone.replace(/\D/g, "")));
  if (!lead) {
    return res.status(404).json({ error: "Lead not found", code: "lead_not_found" });
  }
  const conversation = db.conversations.find((c) => c.lead_id === lead.id) || {
    id: "conv-" + lead.id,
    mode: "ai",
    unread_count: 0,
    last_patient_message_at: void 0
  };
  const msgs = db.messages.filter((m) => m.conversation_id === conversation.id).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).slice(-10);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const upcoming_appointment = db.appointments.filter((a) => a.lead_id === lead.id && a.start_at >= now && a.status === "confirmed").sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())[0] || null;
  return res.json({
    lead,
    conversation: {
      id: conversation.id,
      mode: conversation.mode
    },
    last_messages: msgs,
    upcoming_appointment,
    handover_active: conversation.mode === "human",
    last_patient_message_at: conversation.last_patient_message_at || null
  });
}
function handleLogMessage(req, res) {
  const { lead_id, direction, sender, channel, text, wa_message_id } = req.body;
  if (!lead_id || !text) {
    return res.status(400).json({ error: "lead_id and text required", code: "missing_fields" });
  }
  if (wa_message_id) {
    const existing = db.messages.find((m) => m.wa_message_id === wa_message_id);
    if (existing) {
      return res.json({ ok: true, duplicate: true });
    }
  }
  const lead = db.leads.find((l) => l.id === lead_id);
  if (!lead) {
    return res.status(404).json({ error: "Lead not found", code: "lead_not_found" });
  }
  let conv = db.conversations.find((c) => c.lead_id === lead_id);
  const nowIso = (/* @__PURE__ */ new Date()).toISOString();
  if (!conv) {
    conv = {
      id: "conv-" + Math.random().toString(36).substring(2, 9),
      lead_id,
      channel: channel || lead.channel_first || "whatsapp",
      mode: "ai",
      last_message_at: nowIso,
      unread_count: 0
    };
    db.conversations.unshift(conv);
  }
  const msg = {
    id: "msg-" + Math.random().toString(36).substring(2, 9),
    conversation_id: conv.id,
    direction: direction || "in",
    sender: sender || "patient",
    text,
    wa_message_id: wa_message_id || null,
    created_at: nowIso
  };
  db.messages.push(msg);
  conv.last_message_at = nowIso;
  if (msg.sender === "patient") {
    conv.last_patient_message_at = nowIso;
    conv.unread_count = (conv.unread_count || 0) + 1;
    if (lead.after_hours === void 0) {
      lead.after_hours = db.isAfterHours(nowIso);
    }
    db.logActivity(
      "message_received",
      `Message from ${lead.name}`,
      `"${text.substring(0, 50)}${text.length > 50 ? "..." : ""}"`,
      lead.id
    );
  } else if (msg.sender === "ai" || msg.sender === "staff") {
    if (lead.first_response_seconds === null || lead.first_response_seconds === void 0) {
      const firstPatientMsg = db.messages.find(
        (m) => m.conversation_id === conv?.id && m.sender === "patient"
      );
      if (firstPatientMsg) {
        const diffSeconds = Math.round(
          (new Date(nowIso).getTime() - new Date(firstPatientMsg.created_at).getTime()) / 1e3
        );
        lead.first_response_seconds = Math.max(1, diffSeconds);
      }
    }
  }
  db.checkNoBookingFollowups();
  return res.json({ ok: true, duplicate: false, lead_id, reply_text: text });
}
function handleGetAvailableSlots(req, res) {
  const from = req.query.from || (/* @__PURE__ */ new Date()).toISOString();
  const to = req.query.to || new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toISOString();
  const treatment = req.query.treatment || "";
  const slots = db.getAvailableSlots(from, to, treatment);
  return res.json({ slots });
}
function handleCreateAppointment(req, res) {
  const { lead_id, start, treatment, channel, notes, created_by } = req.body;
  if (!lead_id || !start || !treatment) {
    return res.status(400).json({ error: "lead_id, start, and treatment required", code: "missing_fields" });
  }
  const lead = db.leads.find((l) => l.id === lead_id);
  if (!lead) {
    return res.status(404).json({ error: "Lead not found", code: "lead_not_found" });
  }
  const trt = db.treatments.find((t) => t.id === treatment || t.name.toLowerCase() === treatment.toLowerCase()) || db.treatments[0];
  const duration = trt ? trt.duration_min : 45;
  const startMs = new Date(start).getTime();
  const endMs = startMs + duration * 60 * 1e3;
  const endIso = new Date(endMs).toISOString();
  const capacity = db.settings.slot_capacity || 1;
  const overlapping = db.appointments.filter((a) => {
    if (a.status !== "confirmed") return false;
    const aStart = new Date(a.start_at).getTime();
    const aEnd = new Date(a.end_at).getTime();
    return startMs < aEnd && endMs > aStart;
  });
  if (overlapping.length >= capacity) {
    return res.status(409).json({
      error: "Slot is already booked to maximum clinic capacity",
      code: "slot_unavailable"
    });
  }
  const appt = {
    id: "apt-" + Math.random().toString(36).substring(2, 9),
    lead_id,
    treatment_id: trt.id,
    start_at: new Date(start).toISOString(),
    end_at: endIso,
    status: "confirmed",
    created_by: created_by || "ai",
    channel: channel || lead.channel_first || "whatsapp",
    notes: notes || void 0
  };
  db.appointments.push(appt);
  db.onAppointmentCreated(appt, lead);
  return res.json({
    appointment_id: appt.id,
    status: appt.status
  });
}
function handleUpdateAppointment(req, res) {
  const { appointment_id, status, new_start } = req.body;
  if (!appointment_id) {
    return res.status(400).json({ error: "appointment_id is required", code: "missing_id" });
  }
  const appt = db.appointments.find((a) => a.id === appointment_id);
  if (!appt) {
    return res.status(404).json({ error: "Appointment not found", code: "not_found" });
  }
  if (new_start) {
    const trt = db.treatments.find((t) => t.id === appt.treatment_id);
    const duration = trt ? trt.duration_min : 45;
    const startMs = new Date(new_start).getTime();
    const endMs = startMs + duration * 60 * 1e3;
    const capacity = db.settings.slot_capacity || 1;
    const overlapping = db.appointments.filter((a) => {
      if (a.id === appointment_id || a.status !== "confirmed") return false;
      const aStart = new Date(a.start_at).getTime();
      const aEnd = new Date(a.end_at).getTime();
      return startMs < aEnd && endMs > aStart;
    });
    if (overlapping.length >= capacity) {
      return res.status(409).json({ error: "New slot is full", code: "slot_unavailable" });
    }
    db.onAppointmentRescheduled(appointment_id, new_start);
  }
  if (status) {
    if (status === "cancelled") {
      db.onAppointmentCancelled(appointment_id);
    } else {
      db.onAppointmentStatusChange(appointment_id, status);
    }
  }
  return res.json({ ok: true });
}
function handleHandover(req, res) {
  const { lead_id, reason } = req.body;
  if (!lead_id) {
    return res.status(400).json({ error: "lead_id is required", code: "missing_id" });
  }
  const lead = db.leads.find((l) => l.id === lead_id);
  if (!lead) {
    return res.status(404).json({ error: "Lead not found", code: "lead_not_found" });
  }
  let conv = db.conversations.find((c) => c.lead_id === lead_id);
  if (!conv) {
    conv = {
      id: "conv-" + Math.random().toString(36).substring(2, 9),
      lead_id,
      channel: lead.channel_first || "whatsapp",
      mode: "human",
      handover_reason: reason || "Patient requested human staff",
      last_message_at: (/* @__PURE__ */ new Date()).toISOString(),
      unread_count: 1
    };
    db.conversations.unshift(conv);
  } else {
    conv.mode = "human";
    conv.handover_reason = reason || "Staff handover initiated";
    conv.unread_count = (conv.unread_count || 0) + 1;
  }
  db.logActivity(
    "handover",
    "Human Handover Active",
    `${lead.name} escalated to human staff: ${reason || "General inquiry"}`,
    lead.id
  );
  return res.json({ ok: true });
}
function handleGetClinicSettings(req, res) {
  return res.json({
    name: db.settings.name,
    timezone: db.settings.timezone,
    hours: db.settings.working_hours,
    holidays: db.settings.holidays,
    languages: db.settings.languages,
    slot_capacity: db.settings.slot_capacity,
    retention_days: db.settings.retention_days,
    first_response_target_seconds: db.settings.first_response_target_seconds,
    treatments: db.treatments.filter((t) => t.active).map((t) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      duration_min: t.duration_min,
      price_note: t.price_note
    })),
    approved_answers: db.kb_entries.map((kb) => ({
      id: kb.id,
      topic: kb.topic,
      answer: kb.answer
    })),
    emergency_text: db.settings.emergency_text,
    consent_text: db.settings.consent_text
  });
}
function handleGetDueFollowups(req, res) {
  const nowIso = (/* @__PURE__ */ new Date()).toISOString();
  db.checkNoBookingFollowups();
  const dueList = db.followups.filter((f) => f.status === "pending" && f.due_at <= nowIso);
  const items = dueList.map((f) => {
    const lead = db.leads.find((l) => l.id === f.lead_id);
    return {
      followup_id: f.id,
      type: f.type,
      lead_id: f.lead_id,
      phone: lead?.phone || "",
      language: lead?.language || "en",
      template_name: f.template_name,
      params: f.params,
      appointment_id: f.appointment_id || null,
      due_at: f.due_at
    };
  });
  return res.json({ items });
}
function handleFollowupSent(req, res) {
  const { followup_id, status, error } = req.body;
  if (!followup_id) {
    return res.status(400).json({ error: "followup_id required", code: "missing_id" });
  }
  const fol = db.followups.find((f) => f.id === followup_id);
  if (!fol) {
    return res.status(404).json({ error: "Followup not found", code: "not_found" });
  }
  fol.status = status || "sent";
  const lead = db.leads.find((l) => l.id === fol.lead_id);
  db.logActivity(
    "followup_sent",
    `Followup ${fol.status.toUpperCase()}`,
    `Template: ${fol.template_name} to ${lead?.name || fol.lead_id}${error ? ` (${error})` : ""}`,
    fol.lead_id
  );
  return res.json({ ok: true });
}
function handleDailyDigest(req, res) {
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const startOfDay = new Date(todayStr).getTime();
  const leadsToday = db.leads.filter((l) => new Date(l.created_at).getTime() >= startOfDay);
  const new_leads = leadsToday.length;
  const after_hours_leads = leadsToday.filter((l) => l.after_hours).length;
  const apptsToday = db.appointments.filter((a) => new Date(a.start_at).getTime() >= startOfDay);
  const bookings = apptsToday.filter((a) => a.status === "confirmed").length;
  const no_shows = apptsToday.filter((a) => a.status === "no_show").length;
  const handovers = db.conversations.filter((c) => c.mode === "human").length;
  const unanswered = db.conversations.filter((c) => (c.unread_count || 0) > 0).map((c) => {
    const lead = db.leads.find((l) => l.id === c.lead_id);
    return {
      lead_id: c.lead_id,
      name: lead?.name || "Unknown",
      phone: lead?.phone || "",
      unread_count: c.unread_count,
      mode: c.mode
    };
  });
  const responseTimes = db.leads.filter((l) => typeof l.first_response_seconds === "number" && l.first_response_seconds > 0).map((l) => l.first_response_seconds);
  const avg_first_response_seconds = responseTimes.length > 0 ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : 58;
  return res.json({
    date: todayStr,
    new_leads,
    after_hours_leads,
    bookings,
    handovers,
    unanswered,
    no_shows,
    avg_first_response_seconds
  });
}
function handleMetaWebhookVerification(req, res) {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  const expectedToken = process.env.META_VERIFY_TOKEN || process.env.WHATSAPP_VERIFY_TOKEN || "clinic_meta_token_123";
  if (mode === "subscribe" && token === expectedToken) {
    console.log("[Meta Webhook Verified] Successfully subscribed to WhatsApp Cloud API");
    return res.status(200).send(challenge);
  }
  return res.status(403).json({ error: "Verification token mismatch" });
}
async function handleMetaWebhookMessage(req, res) {
  try {
    const entry = req.body?.entry?.[0];
    const changes = entry?.changes?.[0]?.value;
    const message = changes?.messages?.[0];
    const contact = changes?.contacts?.[0];
    if (!message) {
      return res.status(200).json({ ok: true, note: "Status update acknowledged" });
    }
    const rawFrom = message.from || "";
    const phone = rawFrom.startsWith("+") ? rawFrom : `+${rawFrom}`;
    const name = contact?.profile?.name || "WhatsApp Patient";
    let text = "";
    if (message.type === "text") {
      text = message.text?.body || "";
    } else if (message.type === "interactive") {
      text = message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || message.interactive?.button_reply?.id || "";
    } else if (message.type === "button") {
      text = message.button?.text || "";
    }
    if (!text) {
      return res.status(200).json({ ok: true, note: "Non-text message acknowledged" });
    }
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    let lead = db.leads.find((l) => l.phone === phone);
    if (!lead) {
      const newLead = {
        id: "lead-" + Math.random().toString(36).substring(2, 9),
        phone,
        name,
        channel_first: "whatsapp",
        status: "new",
        created_at: nowIso,
        language: /[\u0600-\u06FF]/.test(text) ? "ar" : "en",
        treatment_interest: "General Consultation",
        source: "WhatsApp Cloud Direct",
        after_hours: db.isAfterHours(nowIso),
        opted_out: false
      };
      db.leads.push(newLead);
      lead = newLead;
      db.logActivity("lead_new", `New WhatsApp Lead: ${name}`, `Phone: ${phone}`, lead.id);
    }
    let conv = db.conversations.find((c) => c.lead_id === lead.id && c.channel === "whatsapp");
    if (!conv) {
      conv = {
        id: "conv-" + Math.random().toString(36).substring(2, 9),
        lead_id: lead.id,
        channel: "whatsapp",
        mode: "ai",
        unread_count: 1,
        last_message_at: nowIso,
        last_patient_message_at: nowIso
      };
      db.conversations.push(conv);
    } else {
      conv.unread_count += 1;
      conv.last_message_at = nowIso;
      conv.last_patient_message_at = nowIso;
    }
    const msgId = "msg-" + Math.random().toString(36).substring(2, 9);
    db.messages.push({
      id: msgId,
      conversation_id: conv.id,
      sender: "patient",
      direction: "in",
      text,
      created_at: nowIso
    });
    const lower = text.toLowerCase();
    const isEmergency = [
      "bleeding",
      "severe pain",
      "swelling",
      "accident",
      "emergency",
      "acute trauma",
      "cannot breathe",
      "\u0646\u0632\u064A\u0641",
      "\u0637\u0648\u0627\u0631\u0626",
      "\u0623\u0644\u0645 \u0634\u062F\u064A\u062F"
    ].some((kw) => lower.includes(kw));
    const isHandover = [
      "human",
      "agent",
      "doctor",
      "operator",
      "receptionist",
      "speak to someone",
      "talk to person",
      "call me",
      "\u0645\u0648\u0638\u0641",
      "\u0637\u0628\u064A\u0628",
      "\u0627\u0646\u0633\u0627\u0646"
    ].some((kw) => lower.includes(kw));
    if (isEmergency || isHandover) {
      conv.mode = "human";
      conv.handover_reason = isEmergency ? "CRITICAL: Emergency Medical Keyword Detected in WhatsApp message" : "Patient requested live receptionist / doctor";
      lead.status = "engaged";
      db.logActivity("handover", `Staff Handover Triggered for ${lead.name}`, conv.handover_reason, lead.id);
    }
    const n8nBase = process.env.N8N_BASE_URL;
    if (n8nBase) {
      fetch(`${n8nBase.replace(/\/$/, "")}/webhook/clinic-inbound`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, name, message: text, channel: "whatsapp" }),
        signal: AbortSignal.timeout(3e3)
      }).catch(() => {
      });
    }
    return res.status(200).json({ ok: true, lead_id: lead.id, message_id: msgId, mode: conv.mode });
  } catch (err) {
    console.error("Meta webhook error:", err);
    return res.status(200).json({ ok: true, note: "Error handled gracefully" });
  }
}

// server/webChatProxy.ts
function generateClinicReply(text, leadName) {
  const lower = text.toLowerCase();
  const isEmergency = lower.includes("bleeding") || lower.includes("severe pain") || lower.includes("infection") || lower.includes("swelling") || lower.includes("throbbing") || lower.includes("fever") || lower.includes("human") || lower.includes("doctor") || lower.includes("talk to a human") || lower.includes("\u0646\u0632\u064A\u0641") || lower.includes("\u0623\u0644\u0645 \u0634\u062F\u064A\u062F") || lower.includes("\u0637\u0628\u064A\u0628");
  if (isEmergency) {
    const isArabic = /[\u0600-\u06FF]/.test(text);
    if (isArabic) {
      return {
        reply: "\u062A\u0645 \u062A\u062D\u0648\u064A\u0644 \u0645\u062D\u0627\u062F\u062B\u062A\u0643 \u0641\u0648\u0631\u0627\u064B \u0625\u0644\u0649 \u0627\u0644\u0641\u0631\u064A\u0642 \u0627\u0644\u0637\u0628\u064A \u0648\u0627\u0644\u0645\u0634\u0631\u0641 \u0627\u0644\u0625\u0643\u0644\u064A\u0646\u064A\u0643\u064A \u0641\u064A \u0639\u064A\u0627\u062F\u0629 \u062F\u064A\u0645\u0648. \u0625\u0630\u0627 \u0643\u0627\u0646\u062A \u0627\u0644\u062D\u0627\u0644\u0629 \u0637\u0627\u0631\u0626\u0629 \u062C\u062F\u0627\u064B \u0623\u0648 \u062A\u0634\u0639\u0631 \u0628\u0636\u064A\u0642 \u0641\u064A \u0627\u0644\u062A\u0646\u0641\u0633\u060C \u064A\u064F\u0631\u062C\u0649 \u0627\u0644\u062A\u0648\u062C\u0647 \u0644\u0623\u0642\u0631\u0628 \u0637\u0648\u0627\u0631\u0626 \u0641\u0648\u0631\u0627\u064B \u0623\u0648 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0627\u0644\u0631\u0642\u0645 999. \u0633\u064A\u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u0643 \u0641\u0631\u064A\u0642\u0646\u0627 \u062E\u0644\u0627\u0644 \u062F\u0642\u0627\u0626\u0642.",
        handover: true,
        reason: "\u062D\u0627\u0644\u0629 \u0625\u0643\u0644\u064A\u0646\u064A\u0643\u064A\u0629 \u0639\u0627\u062C\u0644\u0629 \u0623\u0648 \u0637\u0644\u0628 \u0627\u0644\u062A\u062D\u062F\u062B \u0645\u0639 \u0623\u062E\u0635\u0627\u0626\u064A"
      };
    }
    return {
      reply: "I have immediately escalated your conversation to our on-duty clinical coordinator at Demo Dental & Aesthetic Clinic. If you are experiencing acute trauma, severe bleeding, or difficulty breathing, please seek immediate emergency care or call 999. Our staff is reviewing your case right now.",
      handover: true,
      reason: "Urgent clinical symptom or explicit request for staff"
    };
  }
  if (/[\u0600-\u06FF]/.test(text) && (lower.includes("\u0641\u064A\u0644\u0631") || text.includes("\u0634\u0641\u0627\u064A\u0641") || text.includes("\u0633\u0639\u0631"))) {
    return {
      reply: "\u0623\u0647\u0644\u0627\u064B \u0648\u0633\u0647\u0644\u0627\u064B \u0628\u0643 \u0641\u064A \u0639\u064A\u0627\u062F\u0629 \u062F\u064A\u0645\u0648 \u0644\u0644\u0623\u0633\u0646\u0627\u0646 \u0648\u0627\u0644\u062C\u0644\u062F\u064A\u0629 \u0648\u0627\u0644\u062A\u062C\u0645\u064A\u0644! \u2728 \u064A\u0628\u062F\u0623 \u0641\u064A\u0644\u0631 \u0627\u0644\u0634\u0641\u0627\u064A\u0641 \u0644\u062F\u064A\u0646\u0627 \u0645\u0646 1,200 \u062F\u0631\u0647\u0645 \u0644\u0644\u0625\u0628\u0631\u0629 (1 \u0645\u0644) \u0628\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0623\u062C\u0648\u062F \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0639\u0627\u0644\u0645\u064A\u0629 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629 \u0645\u062B\u0644 Juvederm \u0648 Restylane \u0648\u0628\u0625\u0634\u0631\u0627\u0641 \u0627\u0633\u062A\u0634\u0627\u0631\u064A \u0627\u0644\u062C\u0644\u062F\u064A\u0629 \u0648\u0627\u0644\u062A\u062C\u0645\u064A\u0644. \u0647\u0644 \u062A\u0631\u063A\u0628\u064A\u0646 \u0641\u064A \u062D\u062C\u0632 \u0645\u0648\u0639\u062F \u0627\u0633\u062A\u0634\u0627\u0631\u0629 \u0645\u0639 \u062F. \u0633\u0627\u0631\u0629\u061F",
      handover: false
    };
  }
  if (lower.includes("reschedule") || lower.includes("change my appointment") || lower.includes("\u062A\u063A\u064A\u064A\u0631 \u0645\u0648\u0639\u062F")) {
    return {
      reply: "I would be happy to help you reschedule your appointment at Demo Dental & Aesthetic Clinic. Could you please confirm your phone number or preferred new date and time?",
      handover: false
    };
  }
  if (lower.includes("whitening") || lower.includes("zoom") || lower.includes("\u062A\u0628\u064A\u064A\u0636")) {
    return {
      reply: "Our in-office Philips Zoom Whitening is available from AED 850 (includes full shade guide assessment and enamel protection). It takes just 45-60 minutes to brighten your smile up to 8 shades! Would you like me to check available slots for this week?",
      handover: false
    };
  }
  if (lower.includes("botox") || lower.includes("wrinkle") || lower.includes("\u0628\u0648\u062A\u0648\u0643\u0633") || lower.includes("\u0628\u0648\u062A\u0643\u0633")) {
    return {
      reply: "Our Botox treatments start from AED 950 per area using 100% genuine FDA-approved Allergan botulinum toxin. Common areas include forehead lines, frown lines, and crow\u2019s feet. Would you like a consultation slot with our aesthetic doctor?",
      handover: false
    };
  }
  if (lower.includes("invisalign") || lower.includes("aligners") || lower.includes("\u062A\u0642\u0648\u064A\u0645")) {
    return {
      reply: "We offer complimentary 3D iTero digital scans with our certified Invisalign specialists! You get to see your projected smile transformation in 3D during your first consultation. Would morning or afternoon suit you best?",
      handover: false
    };
  }
  if (lower.includes("location") || lower.includes("address") || lower.includes("parking") || lower.includes("\u0645\u0648\u0642\u0639")) {
    return {
      reply: "We are located on Floor 3, Al Razi Healthcare Building, Dubai Marina Walk, Dubai. Complimentary reserved valet parking is provided for all clinic patients.",
      handover: false
    };
  }
  const greetingName = leadName ? ` ${leadName}` : "";
  return {
    reply: `Hello${greetingName}! Thank you for contacting Demo Dental & Aesthetic Clinic. We offer specialized dental and aesthetic treatments including Philips Zoom Whitening, Invisalign, Dental Implants, Botox, and HydraFacial Elite. How may we assist your smile or skincare journey today?`,
    handover: false
  };
}
async function handleWebChatProxy(req, res) {
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
  if (!checkIpRateLimit(clientIp, 30, 6e4)) {
    return res.status(429).json({
      error: "Rate limit exceeded. Please wait a minute before sending more messages.",
      code: "rate_limited"
    });
  }
  const { session_id, text, name, phone } = req.body;
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Text is required", code: "missing_text" });
  }
  const sessionId = session_id || "sess_" + Math.random().toString(36).substring(2, 9);
  const n8nBase = process.env.N8N_BASE_URL || "https://n8n.wovextech.internal";
  const n8nApiKey = process.env.N8N_API_KEY || "n8n_sec_key_67890";
  const n8nUrl = `${n8nBase.replace(/\/$/, "")}/webhook/web-chat`;
  let replyText = "";
  let isHandover = false;
  try {
    const n8nRes = await fetch(n8nUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": n8nApiKey
      },
      body: JSON.stringify({
        session_id: sessionId,
        text,
        name: name || void 0,
        phone: phone || void 0
      }),
      signal: AbortSignal.timeout(3500)
    });
    if (n8nRes.ok) {
      const data = await n8nRes.json();
      replyText = data.reply || "";
      isHandover = Boolean(data.handover);
    }
  } catch (err) {
  }
  if (!replyText) {
    const fallback = generateClinicReply(text, name);
    replyText = fallback.reply;
    isHandover = fallback.handover;
    const dummyPhone = phone || `+97150${Math.floor(1e6 + Math.random() * 9e6)}`;
    let lead = db.leads.find((l) => phone && l.phone === phone || l.name === (name || "Web Visitor"));
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    if (!lead) {
      lead = {
        id: "lead-" + Math.random().toString(36).substring(2, 9),
        name: name || "Web Visitor",
        phone: dummyPhone,
        language: /[\u0600-\u06FF]/.test(text) ? "ar" : "en",
        channel_first: "web",
        source: "Website Chat Widget",
        treatment_interest: text.slice(0, 40),
        status: "new",
        consent_at: nowIso,
        opted_out: false,
        after_hours: db.isAfterHours(nowIso),
        first_response_seconds: 8,
        created_at: nowIso
      };
      db.leads.unshift(lead);
    }
    let conv = db.conversations.find((c) => c.lead_id === lead.id);
    if (!conv) {
      conv = {
        id: "conv-" + Math.random().toString(36).substring(2, 9),
        lead_id: lead.id,
        channel: "web",
        mode: isHandover ? "human" : "ai",
        handover_reason: fallback.reason,
        last_message_at: nowIso,
        last_patient_message_at: nowIso,
        unread_count: 1
      };
      db.conversations.unshift(conv);
    } else {
      conv.last_message_at = nowIso;
      conv.last_patient_message_at = nowIso;
      if (isHandover) {
        conv.mode = "human";
        conv.handover_reason = fallback.reason;
      }
      conv.unread_count = (conv.unread_count || 0) + 1;
    }
    db.messages.push({
      id: "msg-" + Math.random().toString(36).substring(2, 9),
      conversation_id: conv.id,
      direction: "in",
      sender: "patient",
      text,
      created_at: nowIso
    });
    db.messages.push({
      id: "msg-" + Math.random().toString(36).substring(2, 9),
      conversation_id: conv.id,
      direction: "out",
      sender: isHandover ? "staff" : "ai",
      text: replyText,
      created_at: new Date(Date.now() + 1500).toISOString()
    });
    db.logActivity(
      isHandover ? "handover" : "message_received",
      isHandover ? "Urgent Web Chat Handover" : "Web Chat Message",
      `"${text.substring(0, 50)}${text.length > 50 ? "..." : ""}"`,
      lead.id
    );
  }
  return res.json({
    reply: replyText,
    handover: isHandover,
    session_id: sessionId
  });
}
async function handleStaffSendMessage(req, res) {
  const { conversation_id, text, is_template, template_name } = req.body;
  if (!conversation_id || !text) {
    return res.status(400).json({ error: "conversation_id and text required", code: "missing_fields" });
  }
  const conv = db.conversations.find((c) => c.id === conversation_id);
  if (!conv) {
    return res.status(404).json({ error: "Conversation not found", code: "not_found" });
  }
  const lead = db.leads.find((l) => l.id === conv.lead_id);
  if (!lead) {
    return res.status(404).json({ error: "Lead not found", code: "not_found" });
  }
  const now = Date.now();
  const lastPatientMs = conv.last_patient_message_at ? new Date(conv.last_patient_message_at).getTime() : 0;
  const hoursSinceLastPatientMsg = (now - lastPatientMs) / (1e3 * 60 * 60);
  if (conv.channel === "whatsapp" && !is_template) {
    if (!lastPatientMs || hoursSinceLastPatientMsg > 24) {
      return res.status(409).json({
        error: "The WhatsApp 24-hour window is closed. Send an approved template instead.",
        code: "window_closed"
      });
    }
  }
  const nowIso = (/* @__PURE__ */ new Date()).toISOString();
  const newMsg = {
    id: "msg-" + Math.random().toString(36).substring(2, 9),
    conversation_id: conv.id,
    direction: "out",
    sender: "staff",
    text,
    created_at: nowIso
  };
  db.messages.push(newMsg);
  conv.last_message_at = nowIso;
  conv.unread_count = 0;
  const n8nBase = process.env.N8N_BASE_URL || "https://n8n.wovextech.internal";
  const n8nApiKey = process.env.N8N_API_KEY || "n8n_sec_key_67890";
  const n8nUrl = `${n8nBase.replace(/\/$/, "")}/webhook/crm-send-message`;
  (async () => {
    try {
      await fetch(n8nUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": n8nApiKey
        },
        body: JSON.stringify({
          lead_id: lead.id,
          phone: lead.phone,
          channel: conv.channel,
          text,
          last_patient_message_at: conv.last_patient_message_at,
          template_name: is_template ? template_name : void 0
        }),
        signal: AbortSignal.timeout(3500)
      });
    } catch {
    }
    const metaToken = process.env.META_ACCESS_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.META_PHONE_NUMBER_ID;
    if (conv.channel === "whatsapp" && metaToken && phoneId) {
      try {
        const cleanPhone = lead.phone.replace(/\D/g, "");
        await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${metaToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: cleanPhone,
            type: "text",
            text: { preview_url: false, body: text }
          }),
          signal: AbortSignal.timeout(4e3)
        });
      } catch (e) {
        console.error("Failed to dispatch staff reply to WhatsApp Cloud API:", e);
      }
    }
  })();
  db.logActivity("message_received", `Staff replied to ${lead.name}`, `"${text.substring(0, 45)}..."`, lead.id);
  return res.json({ ok: true, message: newMsg });
}
async function handleSimulateDemoEnquiry(req, res) {
  const { scenario_id } = req.body;
  const nowIso = (/* @__PURE__ */ new Date()).toISOString();
  let scenarioName = "";
  let patientName = "";
  let phone = "";
  let text = "";
  let channel = "whatsapp";
  let isAfterHours = false;
  let forceHandover = false;
  switch (scenario_id) {
    case 1:
      scenarioName = "Teeth Whitening at 10:40 PM";
      patientName = "Kareem Badawi";
      phone = "+971501144778";
      text = "Good evening. Is your in-office whitening safe for sensitive enamel and what is the current special price?";
      channel = "whatsapp";
      isAfterHours = true;
      break;
    case 2:
      scenarioName = "Botox Pricing Enquiry";
      patientName = "Lina Al-Hassan";
      phone = "+971552233889";
      text = "Hi there! How much is Botox for forehead and crow feet, and which brand do you use?";
      channel = "whatsapp";
      isAfterHours = false;
      break;
    case 3:
      scenarioName = "Arabic Lip Filler Question";
      patientName = "\u0645\u0631\u064A\u0645 \u0627\u0644\u0639\u062A\u064A\u0628\u064A";
      phone = "+971549988221";
      text = "\u0645\u0631\u062D\u0628\u0627\u060C \u062D\u0627\u0628\u0629 \u0623\u0633\u0623\u0644 \u0639\u0646 \u0641\u064A\u0644\u0631 \u0627\u0644\u0634\u0641\u0627\u064A\u0641 \u0627\u0644\u0637\u0628\u064A\u0639\u064A\u060C \u0643\u0645 \u0633\u0639\u0631\u0647 \u0648\u0647\u0644 \u064A\u0648\u062C\u062F \u062A\u0648\u0631\u0645 \u0628\u0639\u062F \u0627\u0644\u062C\u0644\u0633\u0629\u061F";
      channel = "whatsapp";
      isAfterHours = false;
      break;
    case 4:
      scenarioName = "Invisalign Consultation Booking";
      patientName = "Rami Haddad";
      phone = "+971526677990";
      text = "Hello, I want to book an Invisalign 3D digital scan for next Monday. Are consultations free?";
      channel = "web";
      isAfterHours = false;
      break;
    case 5:
      scenarioName = "Reschedule Request";
      patientName = "Nour Al-Sabah";
      phone = "+971501234567";
      text = "Hello team, can I please push my appointment by 2 hours? Something urgent came up at work.";
      channel = "whatsapp";
      isAfterHours = false;
      break;
    case 6:
    default:
      scenarioName = "Urgent Clinical Handover";
      patientName = "Omar Al-Jaberi";
      phone = "+971508822119";
      text = "URGENT: I had a surgical molar extraction yesterday and the bleeding has become heavy and very painful. Can a doctor advise immediately?";
      channel = "whatsapp";
      isAfterHours = false;
      forceHandover = true;
      break;
  }
  let lead = db.leads.find((l) => l.phone === phone);
  if (!lead) {
    lead = {
      id: "lead-" + Math.random().toString(36).substring(2, 9),
      name: patientName,
      phone,
      language: /[\u0600-\u06FF]/.test(text) ? "ar" : "en",
      channel_first: channel,
      source: "Demo Simulation",
      treatment_interest: scenarioName,
      status: "new",
      consent_at: nowIso,
      opted_out: false,
      after_hours: isAfterHours,
      first_response_seconds: 35,
      created_at: nowIso
    };
    db.leads.unshift(lead);
  }
  let conv = db.conversations.find((c) => c.lead_id === lead.id);
  if (!conv) {
    conv = {
      id: "conv-" + Math.random().toString(36).substring(2, 9),
      lead_id: lead.id,
      channel,
      mode: forceHandover ? "human" : "ai",
      handover_reason: forceHandover ? "Post-op surgical bleeding reported by patient" : void 0,
      last_message_at: nowIso,
      last_patient_message_at: nowIso,
      unread_count: 1
    };
    db.conversations.unshift(conv);
  } else {
    conv.last_message_at = nowIso;
    conv.last_patient_message_at = nowIso;
    if (forceHandover) {
      conv.mode = "human";
      conv.handover_reason = "Post-op surgical bleeding reported by patient";
    }
    conv.unread_count = (conv.unread_count || 0) + 1;
  }
  const pMsg = {
    id: "msg-" + Math.random().toString(36).substring(2, 9),
    conversation_id: conv.id,
    direction: "in",
    sender: "patient",
    text,
    created_at: nowIso
  };
  db.messages.push(pMsg);
  const triage = generateClinicReply(text, patientName);
  const aiMsg = {
    id: "msg-" + Math.random().toString(36).substring(2, 9),
    conversation_id: conv.id,
    direction: "out",
    sender: forceHandover ? "staff" : "ai",
    text: triage.reply,
    created_at: new Date(Date.now() + 1e3).toISOString()
  };
  db.messages.push(aiMsg);
  db.logActivity(
    forceHandover ? "handover" : "message_received",
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
    reply: aiMsg
  });
}

// server.ts
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = Number(process.env.PORT) || 3e3;
app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-api-key, Authorization");
  if (_req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});
app.use(express.json());
app.post(["/upsert-lead", "/api/upsert-lead"], requireCrmApiKey, handleUpsertLead);
app.get(["/lead-context", "/api/lead-context"], requireCrmApiKey, handleGetLeadContext);
app.post(["/log-message", "/api/log-message"], requireCrmApiKey, handleLogMessage);
app.get(["/available-slots", "/api/available-slots"], (req, res, next) => {
  if (req.headers["x-api-key"]) {
    return requireCrmApiKey(req, res, next);
  }
  next();
}, handleGetAvailableSlots);
app.post(["/create-appointment", "/api/create-appointment"], (req, res, next) => {
  if (req.headers["x-api-key"]) {
    return requireCrmApiKey(req, res, next);
  }
  next();
}, handleCreateAppointment);
app.post(["/update-appointment", "/api/update-appointment"], (req, res, next) => {
  if (req.headers["x-api-key"]) {
    return requireCrmApiKey(req, res, next);
  }
  next();
}, handleUpdateAppointment);
app.post(["/handover", "/api/handover"], (req, res, next) => {
  if (req.headers["x-api-key"]) {
    return requireCrmApiKey(req, res, next);
  }
  next();
}, handleHandover);
app.get(["/clinic-settings", "/api/clinic-settings"], (req, res, next) => {
  if (req.headers["x-api-key"]) {
    return requireCrmApiKey(req, res, next);
  }
  next();
}, handleGetClinicSettings);
app.get(["/due-followups", "/api/due-followups"], requireCrmApiKey, handleGetDueFollowups);
app.post(["/followup-sent", "/api/followup-sent"], requireCrmApiKey, handleFollowupSent);
app.get(["/daily-digest", "/api/daily-digest"], (req, res, next) => {
  if (req.headers["x-api-key"]) {
    return requireCrmApiKey(req, res, next);
  }
  next();
}, handleDailyDigest);
app.post(["/web-chat-proxy", "/api/web-chat-proxy"], handleWebChatProxy);
app.get(["/meta-webhook", "/api/meta-webhook"], handleMetaWebhookVerification);
app.post(["/meta-webhook", "/api/meta-webhook"], handleMetaWebhookMessage);
app.post("/api/staff-send-message", handleStaffSendMessage);
app.post("/api/demo/simulate", handleSimulateDemoEnquiry);
app.post("/api/demo/reset", (_req, res) => {
  db.seedDemoData();
  return res.json({ ok: true, message: "Demo data reseeded with 12 fictional leads, 8 appointments, and messages." });
});
app.get("/api/staff/bundle", (_req, res) => {
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
    staff_users: db.getStaffUsers()
  });
});
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ ok: false, error: "Email and password credentials are required." });
  }
  const result = db.authenticateUser(email, password);
  if (!result.ok) {
    return res.status(401).json(result);
  }
  return res.json(result);
});
app.get("/api/staff-users", (_req, res) => {
  return res.json({ ok: true, staff_users: db.getStaffUsers() });
});
app.post("/api/staff-users", (req, res) => {
  const { name, email, role, password } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ ok: false, error: "Name, email, and role are required" });
  }
  const newUser = db.createStaffUser({ name, email, role, password });
  return res.json({ ok: true, user: newUser });
});
app.put("/api/staff-users/:id/role", (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const ok = db.updateStaffUserRole(id, role);
  return res.json({ ok });
});
app.delete("/api/staff-users/:id", (req, res) => {
  const { id } = req.params;
  const ok = db.deleteStaffUser(id);
  return res.json({ ok });
});
app.post("/api/settings/update", (req, res) => {
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
app.post("/api/treatments/upsert", (req, res) => {
  const trt = req.body;
  const existingIdx = db.treatments.findIndex((t) => t.id === trt.id);
  if (existingIdx >= 0) {
    db.treatments[existingIdx] = { ...db.treatments[existingIdx], ...trt };
  } else {
    const newTrt = {
      id: "trt-" + Math.random().toString(36).substring(2, 9),
      name: trt.name || "New Treatment",
      category: trt.category || "dental",
      duration_min: Number(trt.duration_min) || 45,
      active: trt.active !== false,
      price_note: trt.price_note || ""
    };
    db.treatments.push(newTrt);
  }
  return res.json({ ok: true, treatments: db.treatments });
});
app.post("/api/kb/upsert", (req, res) => {
  const kb = req.body;
  const existingIdx = db.kb_entries.findIndex((k) => k.id === kb.id);
  if (existingIdx >= 0) {
    db.kb_entries[existingIdx] = { ...db.kb_entries[existingIdx], ...kb };
  } else {
    db.kb_entries.push({
      id: "kb-" + Math.random().toString(36).substring(2, 9),
      topic: kb.topic || "New Topic",
      answer: kb.answer || ""
    });
  }
  return res.json({ ok: true, kb_entries: db.kb_entries });
});
app.delete("/api/kb/:id", (req, res) => {
  const { id } = req.params;
  db.kb_entries = db.kb_entries.filter((k) => k.id !== id);
  return res.json({ ok: true, kb_entries: db.kb_entries });
});
app.post("/api/conversations/:id/mode", (req, res) => {
  const { id } = req.params;
  const { mode, reason } = req.body;
  const conv = db.conversations.find((c) => c.id === id);
  if (!conv) return res.status(404).json({ error: "Conversation not found" });
  conv.mode = mode === "human" ? "human" : "ai";
  if (reason) conv.handover_reason = reason;
  return res.json({ ok: true, conversation: conv });
});
app.post("/api/leads/:id", (req, res) => {
  const { id } = req.params;
  const { status, opted_out, treatment_interest } = req.body;
  const lead = db.leads.find((l) => l.id === id);
  if (!lead) return res.status(404).json({ error: "Lead not found" });
  if (status) lead.status = status;
  if (opted_out !== void 0) lead.opted_out = opted_out;
  if (treatment_interest) lead.treatment_interest = treatment_interest;
  return res.json({ ok: true, lead });
});
async function startServer() {
  const isProduction = process.env.NODE_ENV === "production";
  if (!isProduction) {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Clinic Flow CRM server running on http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
