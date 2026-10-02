import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  Shield,
  MessageSquare,
  Mail,
  Video,
  ExternalLink,
  CheckCircle2,
  ArrowRight,
  Server,
  Zap,
  Database,
  Layers,
  ChevronRight,
  Users,
  Building,
  Phone,
  Send,
  Lock,
  Globe,
  Star,
  Check,
  Award,
} from 'lucide-react';

interface LandingPageProps {
  onOpenPortal: () => void;
  isAuthenticated: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenPortal, isAuthenticated }) => {
  // Demo request form state
  const [formData, setFormData] = useState({
    name: '',
    clinic_name: '',
    email: '',
    phone: '',
    speciality: 'Dental & Cosmetic Dentistry',
    implementation: 'Full Turnkey (n8n + Supabase + SMTP)',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Calendly Modal state
  const [showCalendlyModal, setShowCalendlyModal] = useState(false);

  const CALENDLY_URL = 'https://calendly.com/abdulmanankp0/clinic-ai-automation-meeting';

  const handleSubmitDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      setErrorMessage('Please provide your name and email address.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/demo/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setSubmitted(true);
      } else {
        setErrorMessage(data.error || 'Failed to submit demo request. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-100 font-sans selection:bg-teal-500 selection:text-white">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0a0f1d]/85 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-600 via-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/25">
              <span className="text-white font-black text-lg tracking-wider">CF</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg sm:text-xl text-white tracking-tight">Clinic Flow</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase tracking-wider">
                  AI CRM
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Automated Healthcare Concierge</p>
            </div>
          </div>

          {/* Center Links (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-8 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-teal-400 transition-colors">Features</a>
            <a href="#tech-stack" className="hover:text-teal-400 transition-colors">Architecture & n8n</a>
            <a href="#smtp-system" className="hover:text-teal-400 transition-colors">SMTP Mail Engine</a>
            <a href="#demo-form" className="hover:text-teal-400 transition-colors">Request Demo</a>
            <a href="#video-call" className="hover:text-teal-400 transition-colors flex items-center gap-1.5 text-emerald-400">
              <Video className="w-3.5 h-3.5" />
              <span>Book Video Call</span>
            </a>
          </nav>

          {/* Right Action: Dashboard / Portal Button */}
          <div className="flex items-center space-x-3">
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
            >
              <Video className="w-3.5 h-3.5 text-teal-400" />
              <span>Calendly Call</span>
            </a>

            <button
              onClick={onOpenPortal}
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-teal-500/30 flex items-center space-x-2 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <span>{isAuthenticated ? 'Open CRM Dashboard' : 'Dashboard / Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-32">
        {/* Glow ambient background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-teal-500/10 blur-[130px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Top Pill */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-bold text-teal-300 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Next-Gen Clinic Automation · UAE & GCC Ready · Zero Double-Booking</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
              Autonomous AI Receptionist & Clinical CRM for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-300 to-teal-200">
                High-Growth Clinics
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Capture patient inquiries across <strong className="text-white">WhatsApp, Instagram & Web</strong> 24/7. Auto-qualify dental & aesthetic procedures, schedule appointments into live Google Calendar slots, and dispatch <strong className="text-white">direct SMTP booking confirmations</strong> with zero staff overhead.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-extrabold text-sm shadow-xl shadow-teal-500/25 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5"
              >
                <Video className="w-4 h-4" />
                <span>Book 1-on-1 Video Consultation</span>
              </a>

              <a
                href="#demo-form"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 flex items-center justify-center space-x-2 transition-colors"
              >
                <Mail className="w-4 h-4 text-teal-400" />
                <span>Request Live Demo (Via SMTP)</span>
              </a>

              <button
                onClick={onOpenPortal}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-sm border border-white/10 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <span>Launch CRM Portal</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400 font-medium">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>45s Average Response Time</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>Zero Double-Booking Guarantee</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>English & Arabic Medical Triage</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>Automated Direct SMTP & n8n</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ANIMATED OFFICIAL TECH STACK & INTEGRATIONS */}
      <section id="tech-stack" className="py-16 bg-[#070b16] border-y border-slate-800/70 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-teal-400">
              Enterprise Grade Automation Stack
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Engineered with Official Production Integrations
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Every workflow trigger, database lock, and mail dispatch is built on proven healthcare standards.
            </p>
          </div>

          {/* Interactive Stack Grid with Animations */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* 1. n8n */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 transition-all group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-3 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-1">
                <span>n8n</span>
                <span className="text-[10px] text-rose-400 bg-rose-500/10 px-1.5 rounded">Flows</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Visual webhook orchestration & CRM webhooks
              </p>
            </div>

            {/* 2. Supabase */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition-all group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-1">
                <span>Supabase</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 rounded">SQL</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                PostgreSQL with RLS & double-booking triggers
              </p>
            </div>

            {/* 3. Direct SMTP */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 transition-all group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-3 group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-1">
                <span>Direct SMTP</span>
                <span className="text-[10px] text-teal-400 bg-teal-500/10 px-1.5 rounded">Mail</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Internal Nodemailer TLS engine with live verification
              </p>
            </div>

            {/* 4. WhatsApp Business */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-green-500/50 transition-all group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 mb-3 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-1">
                <span>WhatsApp</span>
                <span className="text-[10px] text-green-400 bg-green-500/10 px-1.5 rounded">Meta</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Cloud Webhook, instant replies & reminder dispatch
              </p>
            </div>

            {/* 5. Google Calendar */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 transition-all group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-1">
                <span>Calendar</span>
                <span className="text-[10px] text-blue-400 bg-blue-500/10 px-1.5 rounded">Sync</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Real-time doctor calendar slot locking & capacity checks
              </p>
            </div>

            {/* 6. Calendly Video Call */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 transition-all group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-1">
                <span>Calendly</span>
                <span className="text-[10px] text-purple-400 bg-purple-500/10 px-1.5 rounded">Video</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Direct 1-on-1 meeting scheduler with Abdul Manan
              </p>
            </div>
          </div>

          {/* Workflow Architecture Strip */}
          <div className="mt-8 p-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs font-mono text-slate-400 flex flex-wrap items-center justify-center gap-3">
            <span className="text-teal-400 font-bold">Live Endpoints:</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">POST /webhook/crm-appointment-event</span>
            <span className="text-slate-600">→</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">POST /webhook/crm-patient-welcome</span>
            <span className="text-slate-600">→</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">POST /api/smtp/verify</span>
            <span className="text-slate-600">→</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">POST /api/demo/request</span>
          </div>
        </div>
      </section>

      {/* 4. CORE CLINICAL FEATURES SHOWCASE */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-teal-400">
            Unrivaled Operational Excellence
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
            Built Specifically for High-End Clinics & Hospitals
          </h2>
          <p className="text-sm text-slate-400 mt-3">
            Eliminate missed calls, patient no-shows, and manual receptionist chaos forever.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: WhatsApp & Omnichannel */}
          <div className="p-7 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-5">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Omnichannel Patient Concierge</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Patients chat on WhatsApp, Instagram, or your website. The AI concierge explains procedures (Zoom Teeth Whitening, Veneers, Hydrafacial), quotes price guidelines, and answers clinic FAQs in fluent English or Arabic.
            </p>
          </div>

          {/* Card 2: Slot Locking & Capacity */}
          <div className="p-7 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Zero Double-Booking Guarantee</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Database-level concurrency triggers block overlapping slots beyond your doctor’s <code className="text-teal-300">slot_capacity</code>. AI and human receptionists can never accidentally schedule two patients at the same chair.
            </p>
          </div>

          {/* Card 3: Direct SMTP Email System */}
          <div className="p-7 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-5">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Built-in Direct SMTP Engine</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Super Admin controls your clinic's own mail server (Gmail, SendGrid, Mailgun, Amazon SES). Sends automated HTML welcome emails with valet parking guides, and Google Calendar booking confirmations.
            </p>
          </div>

          {/* Card 4: Automated Retention & Follow-ups */}
          <div className="p-7 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-5">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Automated Retention Loops</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Auto-schedules 24h & 2h WhatsApp reminders to slash no-shows. Dispatches post-treatment follow-up 3 hours after the visit to ensure comfort and collect Google Reviews.
            </p>
          </div>

          {/* Card 5: Staff Handover */}
          <div className="p-7 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-5">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">1-Click Human Handover</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Staff can pause AI for any patient with one click to step in for complex medical queries, discounts, or VIP requests. The AI gracefully steps back until reactivated.
            </p>
          </div>

          {/* Card 6: Super Admin Security */}
          <div className="p-7 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-5">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Super Admin Governance</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Fine-grained Role-Based Access Control (Super Admin, Admin, Staff). Secure database-authenticated sessions, private audit logs, and complete control over clinic operating hours and rules.
            </p>
          </div>
        </div>
      </section>

      {/* 5. 1-ON-1 VIDEO CALL SECTION (CALENDLY INTEGRATION) */}
      <section id="video-call" className="py-20 bg-gradient-to-b from-[#070b16] to-[#0a0f1d] border-t border-slate-800 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-teal-950 via-slate-900 to-slate-900 p-8 sm:p-12 border border-teal-500/30 shadow-2xl relative overflow-hidden">
            {/* Ambient background badge */}
            <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
                  <Video className="w-3.5 h-3.5" />
                  <span>Direct Consultation with Lead Architect</span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                  Book a 1-on-1 Video Strategy Call with Abdul Manan
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Have specific integration requirements for your clinic? Schedule a dedicated 30-minute video session to review your EHR/EMR, n8n workflows, WhatsApp business setup, and Supabase database architecture.
                </p>

                <div className="space-y-2 pt-2 text-xs text-slate-300">
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-teal-400 flex-shrink-0" />
                    <span>Live Architecture Walkthrough (n8n + WhatsApp + SMTP)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-teal-400 flex-shrink-0" />
                    <span>Custom EHR & Calendar Synchronization Strategy</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-teal-400 flex-shrink-0" />
                    <span>Direct Q&A with Lead Architect Abdul Manan</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap items-center gap-3">
                  <a
                    href={CALENDLY_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-extrabold text-sm shadow-xl shadow-teal-500/30 inline-flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Open Calendly Meeting Scheduler</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => setShowCalendlyModal(true)}
                    className="px-4 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
                  >
                    Quick Preview Modal
                  </button>
                </div>
              </div>

              {/* Host Profile Box */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-sm rounded-2xl bg-slate-900/90 border border-slate-800 p-6 text-center space-y-4 shadow-xl">
                  <div className="relative mx-auto w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-teal-500 to-emerald-400">
                    <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-teal-300 font-extrabold text-2xl">
                      AM
                    </div>
                    <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900"></span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-white">Abdul Manan</h3>
                    <p className="text-xs text-teal-400 font-semibold">Lead Healthcare Automation Architect</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-1">abdulmanankp0@gmail.com</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-300 space-y-1 text-left">
                    <p><strong>Duration:</strong> 30 Minutes Video Call</p>
                    <p><strong>Platform:</strong> Google Meet / Zoom</p>
                    <p><strong>Availability:</strong> Monday – Saturday</p>
                  </div>

                  <a
                    href={CALENDLY_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 font-bold text-xs border border-teal-500/30 flex items-center justify-center space-x-1 transition-colors"
                  >
                    <span>Confirm Free Consultation</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE DEMO REQUEST FORM (LINKED TO DIRECT SMTP ENGINE) */}
      <section id="demo-form" className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-8 sm:p-12 shadow-2xl relative">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-teal-400">
              Direct SMTP Connected Intake
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Request an Interactive Clinic Flow AI Demo
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Submit your clinic profile below. Our internal SMTP mail server will instantly dispatch your confirmation email and meeting details.
            </p>
          </div>

          {submitted ? (
            <div className="max-w-md mx-auto p-8 rounded-2xl bg-teal-950/60 border border-teal-500/40 text-center space-y-4 animate-in fade-in-50">
              <div className="w-14 h-14 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto text-2xl">
                ✓
              </div>
              <h3 className="text-xl font-bold text-white">Demo Request Received!</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Thank you, <strong>{formData.name}</strong>. An automated confirmation email has been dispatched via our <strong>CRM SMTP Engine</strong> to <strong>{formData.email}</strong>.
              </p>
              <div className="pt-2">
                <a
                  href={CALENDLY_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold text-xs inline-flex items-center justify-center space-x-2 shadow-lg"
                >
                  <Video className="w-4 h-4" />
                  <span>Book Your Video Call on Calendly Now</span>
                </a>
              </div>
              <button
                onClick={() => setSubmitted(false)}
                className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitDemo} className="max-w-2xl mx-auto space-y-4 text-xs">
              {errorMessage && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Your Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rashid Al-Nuaimi"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Clinic Name */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Clinic / Hospital Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Emirates Dental & Aesthetic Clinic"
                    value={formData.clinic_name}
                    onChange={(e) => setFormData({ ...formData, clinic_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Work Email */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Work Email (SMTP Dispatched) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. doctor@democlinic.ae"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* WhatsApp Phone */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    WhatsApp / Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+971 50 123 4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Speciality */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Clinical Speciality</label>
                  <select
                    value={formData.speciality}
                    onChange={(e) => setFormData({ ...formData, speciality: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Dental & Cosmetic Dentistry">Dental & Cosmetic Dentistry</option>
                    <option value="Aesthetics & Dermatology">Aesthetics & Dermatology</option>
                    <option value="Plastic & Reconstructive Surgery">Plastic & Reconstructive Surgery</option>
                    <option value="Polyclinic & Multi-Speciality">Polyclinic & Multi-Speciality</option>
                    <option value="Physiotherapy & Wellness">Physiotherapy & Wellness</option>
                  </select>
                </div>

                {/* Implementation */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Architecture Preference</label>
                  <select
                    value={formData.implementation}
                    onChange={(e) => setFormData({ ...formData, implementation: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Full Turnkey (n8n + Supabase + SMTP)">Full Turnkey (n8n + Supabase + SMTP)</option>
                    <option value="WhatsApp AI Receptionist Only">WhatsApp AI Receptionist Only</option>
                    <option value="Self-Hosted / Private Cloud">Self-Hosted / Private Cloud</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Questions or Current EMR / Calendar Setup</label>
                <textarea
                  rows={3}
                  placeholder="Tell us about your current patient booking setup or specific workflows you'd like to automate..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-extrabold text-sm shadow-xl shadow-teal-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting & Dispatching SMTP...' : 'Submit Demo Request & Trigger SMTP Email'}</span>
              </button>
            </form>
          )}
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="py-12 bg-[#050811] border-t border-slate-800/80 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white font-extrabold">
              CF
            </div>
            <span className="font-extrabold text-white text-sm">Clinic Flow AI CRM</span>
            <span className="text-slate-600">|</span>
            <span>Healthcare Automation Architecture</span>
          </div>

          <div className="flex items-center space-x-6 text-[11px]">
            <a href={CALENDLY_URL} target="_blank" rel="noreferrer" className="hover:text-teal-400 flex items-center gap-1">
              <Video className="w-3 h-3" />
              <span>Calendly Meeting</span>
            </a>
            <button onClick={onOpenPortal} className="hover:text-teal-400 font-bold text-white cursor-pointer">
              Launch Portal Login
            </button>
          </div>
        </div>
      </footer>

      {/* CALENDLY POPUP MODAL */}
      {showCalendlyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Video className="w-4 h-4 text-teal-400" />
                <span className="font-bold text-white text-xs sm:text-sm">
                  Clinic AI Automation Strategy Meeting (Calendly)
                </span>
              </div>
              <button
                onClick={() => setShowCalendlyModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold px-2 py-1 cursor-pointer"
              >
                ✕ Close
              </button>
            </div>
            <div className="flex-1 min-h-[550px] bg-slate-950">
              <iframe
                src={CALENDLY_URL}
                width="100%"
                height="100%"
                className="w-full h-full min-h-[550px] border-none"
                title="Calendly Meeting Scheduler"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
