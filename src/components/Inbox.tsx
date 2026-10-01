import React, { useState, useEffect, useRef } from 'react';
import { useCrm } from '../context/CrmContext.tsx';
import {
  Search,
  Bot,
  User,
  Send,
  Sparkles,
  AlertCircle,
  Clock,
  Phone,
  Calendar,
  Check,
  CheckCheck,
  ChevronDown,
  Globe,
  Instagram,
  MessageCircle,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  BellRing,
  HelpCircle,
  FileText,
  DollarSign,
  MapPin,
  HeartPulse,
} from 'lucide-react';
import { Channel } from '../types/crm.ts';

export const Inbox: React.FC = () => {
  const {
    conversations,
    leads,
    messages,
    selectedConversationId,
    setSelectedConversationId,
    setSelectedLeadId,
    sendStaffMessage,
    toggleConversationMode,
    currentUser,
    setActiveTab,
  } = useCrm();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'whatsapp' | 'web' | 'human' | 'ai' | 'unread'>('all');
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [windowClosedError, setWindowClosedError] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templateCategory, setTemplateCategory] = useState<'all' | 'booking' | 'pricing' | 'info' | 'care'>('all');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active conversation & lead
  const activeConv = conversations.find((c) => c.id === selectedConversationId) || conversations[0];
  const activeLead = activeConv ? leads.find((l) => l.id === activeConv.lead_id) : null;

  // Messages for active conversation
  const convMessages = activeConv
    ? messages
        .filter((m) => m.conversation_id === activeConv.id)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    : [];

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [convMessages.length, selectedConversationId]);

  // Reset error when switching conversation
  useEffect(() => {
    setWindowClosedError(false);
    setSelectedTemplate('');
  }, [selectedConversationId]);

  // Check WhatsApp 24-hour window status
  const now = Date.now();
  const lastPatientMs = activeConv?.last_patient_message_at
    ? new Date(activeConv.last_patient_message_at).getTime()
    : 0;
  const hoursSinceLastPatient = lastPatientMs ? (now - lastPatientMs) / (1000 * 60 * 60) : 999;
  const isWhatsApp = activeConv?.channel === 'whatsapp';
  const isWebChat = activeConv?.channel === 'web';
  const isWindowClosed = isWhatsApp && (!lastPatientMs || hoursSinceLastPatient > 24);

  // Pre-approved Clinical & Patient Templates (for WhatsApp & Web Chat)
  const approvedTemplates = [
    {
      id: 'appointment_reminder_24h',
      category: 'booking',
      name: '24h Appointment Reminder',
      text: `Hello {{name}}, this is a friendly reminder for your upcoming consultation at Demo Dental & Aesthetic Clinic tomorrow. Reply 1 to CONFIRM or 2 to RESCHEDULE.`,
    },
    {
      id: 'clinic_directions_parking',
      category: 'info',
      name: 'Location & Free Valet Parking',
      text: `Demo Dental & Aesthetic Clinic is on Promenade Level, Building 4, Dubai Marina Walk. Free reserved valet parking is provided. Google Maps: https://maps.app.goo.gl/clinic`,
    },
    {
      id: 'pricing_rate_card',
      category: 'pricing',
      name: 'Consultation & Procedure Fees',
      text: `Dear {{name}}, our initial specialist consultation fee is AED 250 (waived if treatment is completed on the same day). Zoom Teeth Whitening is AED 850, Routine Hygiene is AED 350, and Botox begins at AED 950/area.`,
    },
    {
      id: 'post_treatment_checkin',
      category: 'care',
      name: 'Post-Treatment Recovery Check-in',
      text: `Dear {{name}}, our clinical coordinator hopes you are feeling wonderful after your treatment today. Please avoid hot/colored liquids for 24 hours. Reply here if you have any questions!`,
    },
    {
      id: 'doctor_human_handoff',
      category: 'care',
      name: 'Staff Personal Greeting',
      text: `Hello {{name}}, this is ${currentUser.name} from the clinical reception desk at Demo Clinic. I have personally reviewed your message and would be happy to assist you directly.`,
    },
  ];

  // Counts for tabs
  const countWhatsApp = conversations.filter((c) => c.channel === 'whatsapp').length;
  const countWeb = conversations.filter((c) => c.channel === 'web').length;
  const countHuman = conversations.filter((c) => c.mode === 'human').length;
  const countUnread = conversations.filter((c) => (c.unread_count || 0) > 0).length;

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    const lead = leads.find((l) => l.id === conv.lead_id);
    if (!lead) return false;

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = lead.name.toLowerCase().includes(q);
      const matchPhone = lead.phone.includes(q);
      const matchText = messages
        .filter((m) => m.conversation_id === conv.id)
        .some((m) => m.text.toLowerCase().includes(q));
      if (!matchName && !matchPhone && !matchText) return false;
    }

    if (filterTab === 'whatsapp') return conv.channel === 'whatsapp';
    if (filterTab === 'web') return conv.channel === 'web';
    if (filterTab === 'human') return conv.mode === 'human';
    if (filterTab === 'ai') return conv.mode === 'ai';
    if (filterTab === 'unread') return (conv.unread_count || 0) > 0;
    return true;
  });

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeConv || !replyText.trim() || sending) return;

    setSending(true);
    setWindowClosedError(false);

    const isTemplate = Boolean(selectedTemplate);
    const res = await sendStaffMessage(activeConv.id, replyText.trim(), isTemplate, selectedTemplate || undefined);

    if (!res.ok) {
      if (res.error?.includes('24-hour window') || res.error?.includes('window_closed')) {
        setWindowClosedError(true);
      }
    } else {
      setReplyText('');
      setSelectedTemplate('');
    }
    setSending(false);
  };

  const handleApplyTemplate = (tmplId: string) => {
    const tmpl = approvedTemplates.find((t) => t.id === tmplId);
    if (tmpl && activeLead) {
      const formatted = tmpl.text.replace('{{name}}', activeLead.name);
      setReplyText(formatted);
      setSelectedTemplate(tmpl.id);
      setWindowClosedError(false);
    }
  };

  const renderChannelBadge = (ch?: Channel, compact = false) => {
    if (ch === 'whatsapp') {
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-md ${
            compact
              ? 'px-1.5 py-0.5 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'px-2 py-0.5 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
          title="Official WhatsApp Cloud API Channel"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>WhatsApp System</span>
        </span>
      );
    }
    if (ch === 'web') {
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-md ${
            compact
              ? 'px-1.5 py-0.5 text-[10px] bg-cyan-50 text-cyan-700 border border-cyan-200'
              : 'px-2 py-0.5 text-xs bg-cyan-50 text-cyan-800 border border-cyan-200'
          }`}
          title="Live Website Widget Chat"
        >
          <Globe className="w-3 h-3 text-cyan-600" />
          <span>Website Live Chat</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded-md">
        <MessageCircle className="w-3 h-3 text-slate-500" />
        <span className="capitalize">{ch || 'Chat'}</span>
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden h-full flex flex-col md:flex-row min-h-0 w-full">
      {/* LEFT COLUMN: Conversation List */}
      <div
        className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col h-full bg-slate-50/50 flex-shrink-0 min-w-0 ${
          selectedConversationId ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Search & Channel Tabs */}
        <div className="p-3 border-b border-slate-200 bg-white space-y-2 flex-shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search patient, phone, or chat text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
            />
          </div>

          {/* Quick Filter Tabs with Live Badges */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 text-xs">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex-shrink-0 transition-all ${
                filterTab === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All ({conversations.length})
            </button>

            <button
              onClick={() => setFilterTab('whatsapp')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex-shrink-0 transition-all flex items-center gap-1 ${
                filterTab === 'whatsapp'
                  ? 'bg-emerald-600 text-white'
                  : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <span>WhatsApp</span>
              <span className="text-[10px] px-1 bg-emerald-200/60 rounded-full font-bold">{countWhatsApp}</span>
            </button>

            <button
              onClick={() => setFilterTab('web')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex-shrink-0 transition-all flex items-center gap-1 ${
                filterTab === 'web'
                  ? 'bg-cyan-600 text-white'
                  : 'text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200'
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>Web Chat</span>
              <span className="text-[10px] px-1 bg-cyan-200/60 rounded-full font-bold">{countWeb}</span>
            </button>

            <button
              onClick={() => setFilterTab('human')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex-shrink-0 transition-all flex items-center gap-1 ${
                filterTab === 'human'
                  ? 'bg-amber-600 text-white'
                  : 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300'
              }`}
            >
              <BellRing className="w-3 h-3 text-amber-500 animate-bounce" />
              <span>Handoff</span>
              {countHuman > 0 && (
                <span className="text-[10px] px-1 bg-amber-500 text-white rounded-full font-bold">
                  {countHuman}
                </span>
              )}
            </button>

            <button
              onClick={() => setFilterTab('unread')}
              className={`px-2 py-1 rounded-lg font-semibold flex-shrink-0 transition-all flex items-center gap-1 ${
                filterTab === 'unread' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>Unread</span>
              {countUnread > 0 && (
                <span className="text-[10px] px-1 bg-teal-600 text-white rounded-full font-bold">
                  {countUnread}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Conversation List Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredConversations.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs px-4">
              No conversations found under this channel filter.
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const lead = leads.find((l) => l.id === conv.lead_id);
              const isSelected = conv.id === activeConv?.id;
              const lastMsg = messages
                .filter((m) => m.conversation_id === conv.id)
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

              const timeStr = lastMsg
                ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '';

              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversationId(conv.id)}
                  className={`p-3.5 cursor-pointer transition-all flex items-start space-x-3 ${
                    isSelected
                      ? 'bg-white border-l-4 border-l-teal-600 shadow-xs ring-1 ring-slate-200/50'
                      : 'hover:bg-slate-100/70'
                  }`}
                >
                  {/* Avatar / Mode Indicator */}
                  <div className="relative flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${
                        conv.mode === 'human'
                          ? 'bg-amber-100 text-amber-900 border-2 border-amber-400 shadow-xs'
                          : conv.channel === 'whatsapp'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                      }`}
                    >
                      {lead?.name ? lead.name.slice(0, 2).toUpperCase() : 'PT'}
                    </div>
                    <span
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-white flex items-center justify-center text-[9px] font-bold ${
                        conv.mode === 'human'
                          ? 'bg-amber-500 text-white animate-pulse'
                          : 'bg-teal-600 text-white'
                      }`}
                      title={conv.mode === 'human' ? 'Staff Handoff Active' : 'AI Active'}
                    >
                      {conv.mode === 'human' ? 'H' : 'AI'}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {lead?.name || 'Prospective Patient'}
                      </span>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">{timeStr}</span>
                    </div>

                    {/* Channel Label Badge */}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {renderChannelBadge(conv.channel, true)}
                      <span className="text-[10px] font-mono text-slate-400 truncate">{lead?.phone}</span>
                    </div>

                    <p className="text-[11px] text-slate-600 truncate mt-1">
                      {lastMsg ? lastMsg.text : 'New patient conversation'}
                    </p>

                    <div className="flex items-center space-x-1.5 mt-2">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          conv.mode === 'human'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                            : 'bg-teal-50 text-teal-800 border border-teal-200'
                        }`}
                      >
                        {conv.mode === 'human' ? '⚠️ Handover Active' : '🤖 AI Handling'}
                      </span>

                      {lead?.treatment_interest && (
                        <span className="text-[9px] text-slate-500 truncate max-w-[110px]">
                          • {lead.treatment_interest}
                        </span>
                      )}

                      {(conv.unread_count || 0) > 0 && (
                        <span className="ml-auto px-1.5 py-0.2 bg-teal-600 text-white rounded-full text-[10px] font-bold">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Active Chat Thread */}
      <div
        className={`flex-1 flex flex-col h-full bg-slate-50 min-w-0 overflow-hidden ${
          !selectedConversationId ? 'hidden md:flex' : 'flex'
        }`}
      >
        {activeConv && activeLead ? (
          <>
            {/* Chat Top Header */}
            <div className="px-3.5 sm:px-5 py-2.5 sm:py-3.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shadow-xs flex-shrink-0">
              <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setSelectedConversationId(null)}
                  className="md:hidden p-1.5 -ml-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex-shrink-0"
                  title="Back to conversation list"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-teal-700 to-teal-500 text-white font-bold flex items-center justify-center text-xs sm:text-sm shadow-xs flex-shrink-0">
                  {activeLead.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-1.5 sm:space-x-2 flex-wrap">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{activeLead.name}</h3>
                    <span className="text-[11px] sm:text-xs text-slate-500 font-mono font-medium truncate">{activeLead.phone}</span>
                    {renderChannelBadge(activeConv.channel)}
                    {activeLead.language === 'ar' && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded">
                        العربية
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">
                    Interest: <span className="font-semibold text-slate-700">{activeLead.treatment_interest || 'General Consultation'}</span>
                    {activeLead.after_hours && (
                      <span className="ml-2 px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 rounded">
                        🌙 After-Hours Inquiry
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Mode Toggle & Lead Drawer Action */}
              <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
                {activeConv.mode === 'ai' ? (
                  <button
                    onClick={() =>
                      toggleConversationMode(
                        activeConv.id,
                        'human',
                        `Staff ${currentUser.name} manually took over triage`
                      )
                    }
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-colors flex items-center space-x-1 shadow-xs"
                    title="Switch mode to human staff reply"
                  >
                    <User className="w-3.5 h-3.5 text-amber-700" />
                    <span className="hidden sm:inline">Take Over (Staff)</span>
                    <span className="sm:hidden">Staff</span>
                  </button>
                ) : (
                  <button
                    onClick={() => toggleConversationMode(activeConv.id, 'ai')}
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 text-xs font-bold transition-colors flex items-center space-x-1 shadow-xs"
                    title="Return triage to AI agent"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    <span className="hidden sm:inline">Return to AI</span>
                    <span className="sm:hidden">AI</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedLeadId(activeLead.id)}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center space-x-1 border border-slate-200"
                >
                  <span className="hidden sm:inline">Lead Drawer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* HIGH-PRIORITY HUMAN HANDOFF NOTIFICATION BANNER */}
            {activeConv.mode === 'human' && (
              <div className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-amber-50 border-b border-amber-300 text-amber-950 text-xs flex items-center justify-between flex-shrink-0">
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold flex-shrink-0 text-xs animate-pulse">
                    🚨
                  </div>
                  <div className="truncate">
                    <span className="font-bold">HUMAN STAFF HANDOFF:</span>{' '}
                    <span className="text-amber-900">
                      {activeConv.handover_reason || 'Patient query escalated for clinical coordinator or doctor response.'}
                    </span>
                  </div>
                </div>
                <div className="text-[10px] sm:text-[11px] font-semibold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded flex-shrink-0 ml-2">
                  Assigned: {currentUser.name}
                </div>
              </div>
            )}

            {/* CHANNEL NOTICE: WhatsApp 24h Window OR Website Chat Real-Time */}
            {isWhatsApp ? (
              <div
                className={`px-3.5 sm:px-4 py-1.5 sm:py-2 border-b text-xs flex items-center justify-between flex-shrink-0 ${
                  isWindowClosed
                    ? 'bg-amber-500 text-white font-medium'
                    : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">
                    {isWindowClosed
                      ? 'WhatsApp 24h window closed. Send approved template below.'
                      : `WhatsApp service window active (~${Math.max(
                          0,
                          Math.round(24 - hoursSinceLastPatient)
                        )}h remaining).`}
                  </span>
                </div>
                {isWindowClosed && (
                  <span className="text-[11px] underline font-bold flex-shrink-0 ml-2">Pick Template Below</span>
                )}
              </div>
            ) : (
              <div className="px-3.5 sm:px-4 py-1.5 border-b bg-cyan-50/80 text-cyan-900 border-cyan-200 text-xs flex items-center justify-between flex-shrink-0">
                <div className="flex items-center space-x-2 truncate">
                  <Globe className="w-3.5 h-3.5 text-cyan-600 flex-shrink-0" />
                  <span className="truncate">
                    Website Live Chat Widget connected. Replies delivered directly to browser.
                  </span>
                </div>
                <span className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider flex-shrink-0 ml-2">Real-Time</span>
              </div>
            )}

            {/* Messages Stream */}
            <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5 space-y-3">
              {convMessages.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No messages recorded in this conversation yet. Send a greeting or template below.
                </div>
              ) : (
                convMessages.map((msg) => {
                  const isPatient = msg.sender === 'patient';
                  const isAi = msg.sender === 'ai';
                  const isStaff = msg.sender === 'staff';

                  const timeStr = new Date(msg.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isPatient ? 'items-start' : 'items-end'}`}
                    >
                      {/* Sender label */}
                      <span className="text-[10px] text-slate-400 mb-1 px-1 flex items-center space-x-1">
                        {isPatient && <span className="font-semibold text-slate-600">{activeLead.name} (Patient)</span>}
                        {isAi && (
                          <span className="flex items-center space-x-1 text-teal-700 font-bold">
                            <Sparkles className="w-3 h-3 text-teal-600" />
                            <span>ClinicFlow AI Responder</span>
                          </span>
                        )}
                        {isStaff && (
                          <span className="flex items-center space-x-1 text-indigo-700 font-bold">
                            <User className="w-3 h-3 text-indigo-600" />
                            <span>Clinical Staff ({currentUser.name})</span>
                          </span>
                        )}
                        <span>• {timeStr}</span>
                      </span>

                      {/* Message Bubble */}
                      <div
                        className={`max-w-md sm:max-w-lg rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                          isPatient
                            ? 'bg-white text-slate-900 border border-slate-200/90 rounded-tl-sm'
                            : isAi
                            ? 'bg-teal-700 text-white rounded-tr-sm'
                            : 'bg-slate-900 text-white rounded-tr-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>

                      {/* Delivery indicators */}
                      {!isPatient && (
                        <div className="flex items-center space-x-1 text-[10px] text-slate-400 mt-0.5 px-1">
                          <span>Delivered via {activeConv.channel === 'whatsapp' ? 'WhatsApp Cloud' : 'Web Chat'}</span>
                          <CheckCheck className="w-3 h-3 text-teal-600" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Templates Bar (For both WhatsApp & Website Live Chat) */}
            <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white border-t border-slate-200 flex items-center justify-between gap-2 overflow-x-auto flex-shrink-0">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex-shrink-0 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Templates:
              </span>
              <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
                {approvedTemplates.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => handleApplyTemplate(tmpl.id)}
                    className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-teal-50 hover:text-teal-800 rounded-lg text-slate-700 border border-slate-200 whitespace-nowrap transition-colors"
                  >
                    {tmpl.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Reply Input Box */}
            <form onSubmit={handleSend} className="p-3 sm:p-4 bg-white border-t border-slate-200 flex-shrink-0">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder={
                    isWindowClosed
                      ? 'WhatsApp 24h window closed — choose a template above...'
                      : `Reply to ${activeLead.name} via ${activeConv.channel === 'whatsapp' ? 'WhatsApp' : 'Web Chat'}...`
                  }
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-100/90 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                />

                <button
                  type="submit"
                  disabled={!replyText.trim() || sending}
                  className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition-colors flex items-center space-x-1.5 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">{sending ? 'Sending...' : 'Send Reply'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                <span>
                  Dispatches live to {activeConv.channel === 'whatsapp' ? 'patient WhatsApp & CRM' : 'website visitor & CRM'}
                </span>
                <span>Press Enter to send</span>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm">
            <MessageCircle className="w-12 h-12 text-slate-300 mb-2" />
            <p>Select a conversation from the left to view messages</p>
          </div>
        )}
      </div>
    </div>
  );
};
