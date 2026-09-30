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
  ExternalLink,
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
  const [filterTab, setFilterTab] = useState<'all' | 'human' | 'ai' | 'unread'>('all');
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [windowClosedError, setWindowClosedError] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

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
  const isWindowClosed = isWhatsApp && (!lastPatientMs || hoursSinceLastPatient > 24);

  // Pre-approved WhatsApp templates
  const approvedTemplates = [
    {
      id: 'appointment_reminder_24h',
      name: '24h Appointment Reminder',
      text: `Hello {{name}}, this is a friendly reminder for your upcoming consultation at Demo Dental & Aesthetic Clinic tomorrow. Reply 1 to CONFIRM or 2 to RESCHEDULE.`,
    },
    {
      id: 'clinic_directions_parking',
      name: 'Location & Free Valet Parking',
      text: `Demo Dental & Aesthetic Clinic is on Floor 3, Al Razi Healthcare Building, Dubai Marina Walk. Free reserved valet parking is provided. Google Maps: https://maps.app.goo.gl/clinic`,
    },
    {
      id: 'post_treatment_checkin',
      name: 'Post-Treatment Check-in',
      text: `Dear {{name}}, our clinical team hope you are feeling wonderful after your treatment. Please reach out if you have any questions regarding your post-care recovery.`,
    },
  ];

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    const lead = leads.find((l) => l.id === conv.lead_id);
    if (!lead) return false;

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = lead.name.toLowerCase().includes(q);
      const matchPhone = lead.phone.includes(q);
      if (!matchName && !matchPhone) return false;
    }

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

  const getChannelIcon = (ch?: Channel) => {
    switch (ch) {
      case 'whatsapp':
        return <span className="text-emerald-600 font-bold text-xs" title="WhatsApp Business">WA</span>;
      case 'web':
        return (
          <span title="Web Chat Widget">
            <Globe className="w-3.5 h-3.5 text-cyan-600" />
          </span>
        );
      case 'instagram':
        return (
          <span title="Instagram DM">
            <Instagram className="w-3.5 h-3.5 text-pink-600" />
          </span>
        );
      default:
        return <MessageCircle className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden h-[calc(100vh-185px)] min-h-[580px] flex">
      {/* LEFT COLUMN: Conversation List */}
      <div className="w-full sm:w-80 md:w-96 border-r border-slate-200 flex flex-col h-full bg-slate-50/50">
        {/* Search & Tabs */}
        <div className="p-3.5 border-b border-slate-200 bg-white space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search patients or phones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center space-x-1 text-xs">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                filterTab === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterTab('human')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center space-x-1 ${
                filterTab === 'human'
                  ? 'bg-amber-600 text-white'
                  : 'text-amber-700 bg-amber-50 hover:bg-amber-100/80 border border-amber-200'
              }`}
            >
              <span>Human Handover</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            </button>
            <button
              onClick={() => setFilterTab('ai')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                filterTab === 'ai' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              AI Mode
            </button>
            <button
              onClick={() => setFilterTab('unread')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                filterTab === 'unread' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Unread
            </button>
          </div>
        </div>

        {/* Conversation List Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredConversations.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs px-4">
              No conversations found. Use "Simulate Enquiry" to test incoming inquiries.
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
                  className={`p-3.5 cursor-pointer transition-colors flex items-start space-x-3 ${
                    isSelected ? 'bg-white border-l-4 border-l-indigo-600 shadow-xs' : 'hover:bg-slate-100/60'
                  }`}
                >
                  {/* Avatar / Mode Indicator */}
                  <div className="relative">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                        conv.mode === 'human'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}
                    >
                      {lead?.name ? lead.name.slice(0, 2).toUpperCase() : 'PT'}
                    </div>
                    <span
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-white flex items-center justify-center text-[9px] ${
                        conv.mode === 'human' ? 'bg-amber-500 text-white' : 'bg-teal-600 text-white'
                      }`}
                      title={conv.mode === 'human' ? 'Human Staff Handover' : 'AI Active'}
                    >
                      {conv.mode === 'human' ? 'H' : 'AI'}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 truncate">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {lead?.name || 'Prospective Patient'}
                        </span>
                        {getChannelIcon(conv.channel)}
                      </div>
                      <span className="text-[10px] text-slate-400 ml-1 flex-shrink-0">{timeStr}</span>
                    </div>

                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {lastMsg ? lastMsg.text : 'New patient conversation'}
                    </p>

                    <div className="flex items-center space-x-1.5 mt-1.5">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          conv.mode === 'human'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-teal-50 text-teal-700 border border-teal-200'
                        }`}
                      >
                        {conv.mode === 'human' ? 'Handover Active' : 'AI Handling'}
                      </span>

                      {lead?.treatment_interest && (
                        <span className="text-[9px] text-slate-500 truncate max-w-[120px]">
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
      <div className="hidden sm:flex flex-1 flex-col h-full bg-slate-50">
        {activeConv && activeLead ? (
          <>
            {/* Chat Top Header */}
            <div className="px-5 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between shadow-xs">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-700 to-teal-500 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                    {activeLead.name.slice(0, 2).toUpperCase()}
                  </div>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-slate-900">{activeLead.name}</h3>
                    <span className="text-xs text-slate-500 font-medium font-mono">{activeLead.phone}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium capitalize">
                      {activeConv.channel}
                    </span>
                    {activeLead.language === 'ar' && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded">
                        العربية
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Interest: <span className="font-semibold text-slate-700">{activeLead.treatment_interest || 'General Consultation'}</span>
                    {activeLead.after_hours && (
                      <span className="ml-2 px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 rounded">
                        🌙 After-Hours Lead
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Handover & Actions */}
              <div className="flex items-center space-x-2">
                {activeConv.mode === 'ai' ? (
                  <button
                    onClick={() =>
                      toggleConversationMode(
                        activeConv.id,
                        'human',
                        `Staff ${currentUser.name} manually took over`
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-xs"
                    title="Switch mode to human staff reply"
                  >
                    <User className="w-3.5 h-3.5 text-amber-700" />
                    <span>Take Over (Human)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => toggleConversationMode(activeConv.id, 'ai')}
                    className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-xs"
                    title="Return triage to AI agent"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    <span>Return to AI</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedLeadId(activeLead.id)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center space-x-1 border border-slate-200"
                >
                  <span>Lead Drawer</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* WhatsApp 24-Hour Messaging Window Notice */}
            {isWhatsApp && (
              <div
                className={`px-4 py-2 border-b text-xs flex items-center justify-between ${
                  isWindowClosed
                    ? 'bg-amber-500 text-white font-medium'
                    : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>
                    {isWindowClosed
                      ? 'The WhatsApp 24-hour window is closed. Freeform replies are blocked by Meta policy. Send an approved template instead.'
                      : `WhatsApp 24-hour customer service window active (~${Math.max(
                          0,
                          Math.round(24 - hoursSinceLastPatient)
                        )} hours remaining).`}
                  </span>
                </div>

                {isWindowClosed && (
                  <div className="flex items-center space-x-1">
                    <span className="text-[11px] underline">Select template below</span>
                  </div>
                )}
              </div>
            )}

            {/* Window closed error alert if staff tried sending freeform */}
            {windowClosedError && (
              <div className="m-3 p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">The WhatsApp 24-hour window is closed. Send an approved template instead.</p>
                  <p className="text-[11px] mt-0.5">
                    Outside the 24h window, Meta WhatsApp Business API requires a pre-approved template message to re-open the conversation.
                  </p>
                </div>
              </div>
            )}

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
              {convMessages.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No messages yet. Send a greeting or template below.
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
                        {isPatient && <span>{activeLead.name} (Patient)</span>}
                        {isAi && (
                          <span className="flex items-center space-x-1 text-teal-700 font-bold">
                            <Sparkles className="w-3 h-3" />
                            <span>Clinic Flow AI Agent</span>
                          </span>
                        )}
                        {isStaff && (
                          <span className="flex items-center space-x-1 text-indigo-700 font-bold">
                            <User className="w-3 h-3" />
                            <span>Clinic Staff ({currentUser.name})</span>
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
                            ? 'bg-indigo-600 text-white rounded-tr-sm'
                            : 'bg-slate-900 text-white rounded-tr-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>

                      {/* WhatsApp Delivery indicator */}
                      {!isPatient && (
                        <div className="flex items-center space-x-1 text-[10px] text-slate-400 mt-0.5 px-1">
                          <span>Delivered</span>
                          <CheckCheck className="w-3 h-3 text-indigo-600" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Templates Bar */}
            <div className="px-4 py-2 bg-white border-t border-slate-200 flex items-center justify-between gap-2 overflow-x-auto">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
                Pre-Approved Templates:
              </span>
              <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
                {approvedTemplates.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => handleApplyTemplate(tmpl.id)}
                    className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-800 rounded-lg text-slate-700 border border-slate-200 whitespace-nowrap transition-colors"
                  >
                    {tmpl.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Reply Input Box */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-200">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder={
                    isWindowClosed
                      ? 'WhatsApp 24h window closed — choose a template above...'
                      : `Reply as ${currentUser.name} (${currentUser.role})...`
                  }
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-100/90 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />

                <button
                  type="submit"
                  disabled={!replyText.trim() || sending}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition-colors flex items-center space-x-1.5 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>

              <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                <span>Sends live update to n8n webhook /webhook/crm-send-message</span>
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
