export type TreatmentCategory = 'dental' | 'aesthetic';

export type LeadStatus = 'new' | 'engaged' | 'booked' | 'visited' | 'no_show' | 'lost';

export type Channel = 'whatsapp' | 'web' | 'instagram';

export type ConversationMode = 'ai' | 'human';

export type MessageSender = 'patient' | 'ai' | 'staff';

export type MessageDirection = 'in' | 'out';

export type AppointmentStatus = 'confirmed' | 'cancelled' | 'completed' | 'no_show';

export type FollowupType =
  | 'reminder_24h'
  | 'reminder_2h'
  | 'no_booking_1'
  | 'no_booking_2'
  | 'post_visit'
  | 'noshow_reschedule';

export type FollowupStatus = 'pending' | 'sent' | 'failed' | 'skipped';

export interface WorkingHoursDay {
  open: string; // e.g. "09:00"
  close: string; // e.g. "20:00"
  closed: boolean;
}

export interface ClinicSettings {
  name: string;
  timezone: string; // e.g. "Asia/Dubai"
  working_hours: {
    monday: WorkingHoursDay;
    tuesday: WorkingHoursDay;
    wednesday: WorkingHoursDay;
    thursday: WorkingHoursDay;
    friday: WorkingHoursDay;
    saturday: WorkingHoursDay;
    sunday: WorkingHoursDay;
  };
  holidays: string[]; // ISO 'YYYY-MM-DD'
  slot_capacity: number; // default 1
  languages: string[];
  emergency_text: string;
  consent_text: string;
  retention_days: number;
  first_response_target_seconds: number;
}

export interface Treatment {
  id: string;
  name: string;
  category: TreatmentCategory;
  duration_min: number;
  active: boolean;
  price_note?: string;
}

export interface KBEntry {
  id: string;
  topic: string;
  answer: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  language: 'en' | 'ar';
  channel_first: Channel;
  source?: string;
  treatment_interest?: string;
  status: LeadStatus;
  consent_at?: string;
  opted_out: boolean;
  after_hours: boolean;
  first_response_seconds?: number | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  lead_id: string;
  channel: Channel;
  mode: ConversationMode;
  handover_reason?: string;
  last_message_at: string;
  last_patient_message_at?: string;
  unread_count: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  direction: MessageDirection;
  sender: MessageSender;
  text: string;
  wa_message_id?: string | null;
  created_at: string;
}

export interface Appointment {
  id: string;
  lead_id: string;
  treatment_id: string;
  start_at: string; // ISO UTC
  end_at: string; // ISO UTC
  status: AppointmentStatus;
  created_by: 'ai' | 'staff';
  channel: Channel;
  notes?: string;
}

export interface Followup {
  id: string;
  lead_id: string;
  appointment_id?: string | null;
  type: FollowupType;
  due_at: string;
  status: FollowupStatus;
  template_name: string;
  params: Record<string, any>;
  created_at: string;
}

export type UserRole = 'super_admin' | 'admin' | 'staff';

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  created_at?: string;
}

export interface ActivityEvent {
  id: string;
  type: 'lead_new' | 'message_received' | 'appointment_created' | 'appointment_status' | 'handover' | 'followup_sent';
  title: string;
  description: string;
  timestamp: string;
  lead_id?: string;
  meta?: Record<string, any>;
}
