-- =========================================================================
-- CLINIC FLOW CRM - COMPLETE DATABASE SCHEMA (POSTGRESQL & SUPABASE)
-- FULL CLEAN REPLACE SCRIPT (Drops mismatched old tables cleanly & recreates)
-- Includes Super Admin: abdulmanankp0@gmail.com (Password: Manana!@1234)
-- =========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean drop of existing tables to resolve type conflicts (UUID vs TEXT)
DROP TABLE IF EXISTS public.activity_events CASCADE;
DROP TABLE IF EXISTS public.followups CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.kb_entries CASCADE;
DROP TABLE IF EXISTS public.treatments CASCADE;
DROP TABLE IF EXISTS public.clinic_settings CASCADE;
DROP TABLE IF EXISTS public.staff_users CASCADE;

-- 1. STAFF USERS TABLE
CREATE TABLE public.staff_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('super_admin', 'admin', 'staff')),
    avatar TEXT,
    phone TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. CLINIC SETTINGS TABLE
CREATE TABLE public.clinic_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
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
    holidays TEXT[] DEFAULT ARRAY['2026-12-02', '2026-12-03', '2026-01-01'],
    slot_capacity INT DEFAULT 1,
    languages TEXT[] DEFAULT ARRAY['English', 'Arabic'],
    emergency_text TEXT DEFAULT 'For severe bleeding, acute facial swelling affecting breathing, or critical dental trauma, please visit the emergency hospital immediately or dial 999 (Dubai Police / Ambulance).',
    consent_text TEXT DEFAULT 'By messaging Demo Dental & Aesthetic Clinic, you agree to receive appointment reminders and care updates via WhatsApp and SMS. Reply STOP anytime to unsubscribe.',
    retention_days INT DEFAULT 90,
    first_response_target_seconds INT DEFAULT 180,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TREATMENTS & PROCEDURES TABLE
CREATE TABLE public.treatments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('dental', 'aesthetic')),
    duration_min INT NOT NULL DEFAULT 45,
    active BOOLEAN DEFAULT true,
    price_note TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. KNOWLEDGE BASE ENTRIES TABLE
CREATE TABLE public.kb_entries (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    topic TEXT NOT NULL,
    answer TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. LEADS TABLE (UUID Primary Key)
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    language TEXT DEFAULT 'en',
    channel TEXT DEFAULT 'whatsapp',
    source TEXT DEFAULT 'whatsapp',
    treatment_interest TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'engaged', 'booked', 'visited', 'lost', 'opt_out')),
    after_hours BOOLEAN DEFAULT false,
    first_response_seconds INT,
    consent_received BOOLEAN DEFAULT false,
    opted_out BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    last_active_at TIMESTAMPTZ DEFAULT now()
);

-- 6. CONVERSATIONS TABLE (UUID Foreign Key to leads)
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    channel TEXT NOT NULL DEFAULT 'whatsapp',
    mode TEXT NOT NULL DEFAULT 'ai' CHECK (mode IN ('ai', 'human')),
    unread_count INT DEFAULT 0,
    handover_reason TEXT,
    handover_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. MESSAGES TABLE (UUID Foreign Key to conversations)
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('patient', 'ai', 'staff', 'system')),
    text TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT now(),
    is_template BOOLEAN DEFAULT false,
    template_name TEXT
);

-- 8. APPOINTMENTS TABLE (UUID Foreign Key to leads)
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    treatment_id TEXT NOT NULL REFERENCES public.treatments(id) ON DELETE RESTRICT,
    channel TEXT DEFAULT 'whatsapp',
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. AUTOMATED FOLLOW-UPS QUEUE (UUID Foreign Keys)
CREATE TABLE public.followups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    due_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'skipped', 'failed')),
    channel TEXT DEFAULT 'whatsapp',
    template_name TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. ACTIVITY AUDIT STREAM (UUID Foreign Key to leads)
CREATE TABLE public.activity_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- SPEED INDEXES
CREATE INDEX idx_leads_phone ON public.leads(phone);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_conversations_lead ON public.conversations(lead_id);
CREATE INDEX idx_messages_conv ON public.messages(conversation_id);
CREATE INDEX idx_appointments_start ON public.appointments(start_time);
CREATE INDEX idx_followups_due ON public.followups(due_at, status);

-- =========================================================================
-- SEED INITIAL DATA & SUPER ADMIN USER
-- =========================================================================

-- INSERT SUPER ADMIN (abdulmanankp0@gmail.com / Manana!@1234)
INSERT INTO public.staff_users (
    id,
    name,
    email,
    password_hash,
    role,
    avatar,
    active
)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Abdul Manan',
    'abdulmanankp0@gmail.com',
    crypt('Manana!@1234', gen_salt('bf')),
    'super_admin',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    true
)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    password_hash = crypt('Manana!@1234', gen_salt('bf')),
    role = 'super_admin',
    active = true,
    updated_at = now();

-- INSERT DEFAULT CLINIC SETTINGS
INSERT INTO public.clinic_settings (id, name, timezone, slot_capacity)
VALUES ('default', 'Demo Dental & Aesthetic Clinic', 'Asia/Dubai', 1)
ON CONFLICT (id) DO NOTHING;

-- INSERT INITIAL TREATMENTS
INSERT INTO public.treatments (id, name, category, duration_min, price_note, active) VALUES
('trt-1', 'Teeth Whitening (Zoom In-Office)', 'dental', 60, 'From AED 850 (includes enamel check & shade guide)', true),
('trt-2', 'Invisalign Clear Aligners Consultation', 'dental', 45, 'Complimentary 3D iTero digital scan', true),
('trt-3', 'Dental Implant Assessment', 'dental', 45, 'From AED 3,500 per premium Swiss implant', true),
('trt-4', 'Routine Dental Hygiene & Polish', 'dental', 45, 'AED 350 with ultrasonic scaling', true),
('trt-5', 'Botox Anti-Wrinkle Injections', 'aesthetic', 30, 'From AED 950 per area (Allergan FDA-approved)', true),
('trt-6', 'Dermal Lip & Cheek Fillers', 'aesthetic', 45, 'From AED 1,200 per 1ml Juvederm / Restylane', true),
('trt-7', 'HydraFacial Elite MD', 'aesthetic', 60, 'AED 650 with lymphatic detox therapy', true),
('trt-8', 'Laser Skin Rejuvenation', 'aesthetic', 45, 'From AED 750 (Fotona Nd:YAG laser)', true)
ON CONFLICT (id) DO NOTHING;

-- INSERT INITIAL KNOWLEDGE BASE ENTRIES
INSERT INTO public.kb_entries (id, category, topic, answer, active) VALUES
('kb-1', 'pricing', 'Teeth Whitening Pricing', 'Zoom in-office whitening is AED 850. Take-home kit is AED 550. Package for both is AED 1,200.', true),
('kb-2', 'pricing', 'Botox Pricing', 'Allergan FDA-approved Botox starts at AED 950 for 1 area (forehead or crow''s feet), AED 1,600 for 2 areas, AED 2,200 for full upper face.', true),
('kb-3', 'insurance', 'Insurance Direct Billing', 'We accept direct billing with NextCare, AXA / GIG, MetLife, MedNet, Daman, and Sukoon. Aesthetic treatments are generally self-pay unless medically indicated.', true),
('kb-4', 'parking', 'Location & Parking', 'Located at Dubai Marina Walk, Building 4, Promenade Level. Free underground valet parking is available for patients with clinic stamp.', true),
('kb-5', 'after_hours', 'Emergency Protocol', 'For acute facial trauma, severe bleeding, or swelling restricting airway, patients are advised to visit the nearest emergency department or call 999 immediately.', true)
ON CONFLICT (id) DO NOTHING;

-- SUPABASE AUTH INTEGRATION (IF USING Supabase auth.users)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at
    )
    VALUES (
        '00000000-0000-0000-0000-000000000000',
        'a0000000-0000-0000-0000-000000000001',
        'authenticated',
        'authenticated',
        'abdulmanankp0@gmail.com',
        crypt('Manana!@1234', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"name":"Abdul Manan","role":"super_admin"}'::jsonb,
        now(),
        now()
    )
    ON CONFLICT (id) DO UPDATE SET
        encrypted_password = crypt('Manana!@1234', gen_salt('bf')),
        email_confirmed_at = now(),
        updated_at = now();
  END IF;
END $$;
