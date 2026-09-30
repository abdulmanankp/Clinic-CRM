import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  User,
  Sparkles,
  ShieldCheck,
  Languages,
  RotateCcw,
  AlertCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface WidgetMessage {
  id: string;
  sender: 'patient' | 'ai' | 'staff';
  text: string;
  timestamp: string;
}

export const WidgetView: React.FC = () => {
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [messages, setMessages] = useState<WidgetMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
  const [handoverActive, setHandoverActive] = useState(false);
  const [sessionId, setSessionId] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize session id from localStorage
  useEffect(() => {
    let sid = localStorage.getItem('clinic_flow_widget_session');
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem('clinic_flow_widget_session', sid);
    }
    setSessionId(sid);

    // Initial greeting
    const greetingEn: WidgetMessage = {
      id: 'msg-init-en',
      sender: 'ai',
      text:
        'Hello! Welcome to Demo Dental & Aesthetic Clinic (Dubai Marina). How can we assist with your smile or skincare today? Ask about Zoom Whitening, Invisalign, Botox, or booking a consultation.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const greetingAr: WidgetMessage = {
      id: 'msg-init-ar',
      sender: 'ai',
      text:
        'مرحباً بك في عيادة ديمو لطب الأسنان والجلدية والتجميل بدبي مارينا. كيف يمكننا مساعدتك اليوم؟ يمكنك الاستفسار عن تبييض الزوم، تقويم الإنفيزلاين، حقن البوتوكس، أو حجز موعد استشارة.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([lang === 'ar' ? greetingAr : greetingEn]);
  }, [lang]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || inputText.trim();
    if (!textToSend || isTyping) return;

    // Consent on first message
    if (!hasConsented) {
      setHasConsented(true);
    }

    const patientMsg: WidgetMessage = {
      id: 'msg-p-' + Date.now(),
      sender: 'patient',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, patientMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      // Call public /web-chat-proxy
      const res = await fetch('/web-chat-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          text: textToSend,
          name: patientName.trim() || undefined,
          phone: patientPhone.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (data.handover) {
        setHandoverActive(true);
      }

      const botReply: WidgetMessage = {
        id: 'msg-ai-' + Date.now(),
        sender: data.handover ? 'staff' : 'ai',
        text:
          data.reply ||
          (lang === 'ar'
            ? 'شكراً لتواصلك. تم استلام رسالتك وسيتواصل معك فريق الاستقبال قريباً.'
            : 'Thank you for reaching out. We have received your inquiry and our clinic coordinator is reviewing it.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      const errorMsg: WidgetMessage = {
        id: 'msg-err-' + Date.now(),
        sender: 'ai',
        text:
          lang === 'ar'
            ? 'نعتذر، حدث خطأ مؤقت في الاتصال. يرجى الاتصال بنا هاتفياً.'
            : 'Connection error. Please call our clinic directly at +971 4 123 4567.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleTalkToHuman = () => {
    const text =
      lang === 'ar'
        ? 'أرغب في التحدث مع موظف الاستقبال أو الطبيب مباشرة من فضلكم.'
        : 'I would like to speak directly with human staff or a doctor please.';
    handleSendMessage(undefined, text);
  };

  const isRtl = lang === 'ar';

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="max-w-md mx-auto h-[620px] bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden text-slate-800"
    >
      {/* Widget Header */}
      <div className="bg-gradient-to-r from-teal-800 to-teal-600 p-4 text-white flex items-center justify-between">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-teal-100 border border-white/20">
            CF
          </div>
          <div>
            <h3 className="text-sm font-bold leading-tight">
              {lang === 'ar' ? 'عيادة ديمو للأسنان والجلدية والتجميل' : 'Demo Dental & Aesthetic Clinic'}
            </h3>
            <div className="flex items-center space-x-1.5 space-x-reverse mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] text-teal-100 font-medium">
                {lang === 'ar' ? 'مساعد الحجز الآلي متصل' : 'Intake Assistant Online'}
              </span>
            </div>
          </div>
        </div>

        {/* Language switch button */}
        <button
          onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
          className="px-2.5 py-1 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center space-x-1 space-x-reverse transition-colors border border-white/20"
        >
          <Languages className="w-3.5 h-3.5" />
          <span>{lang === 'en' ? 'عربي' : 'English'}</span>
        </button>
      </div>

      {/* Compliance / Consent Notification */}
      <div className="bg-slate-50 border-b border-slate-200 px-3 py-1.5 text-[10px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center space-x-1 space-x-reverse">
          <ShieldCheck className="w-3 h-3 text-teal-600" />
          <span>
            {lang === 'ar'
              ? 'تفاصيل المواعيد فقط • لا يتم حفظ سجلات طبية'
              : 'Booking details only • No medical diagnoses stored'}
          </span>
        </span>
        <button
          onClick={handleTalkToHuman}
          className="text-teal-700 font-bold hover:underline"
        >
          {lang === 'ar' ? 'التحدث مع موظف' : 'Talk to a human'}
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
        {messages.map((m) => {
          const isPatient = m.sender === 'patient';
          const isStaff = m.sender === 'staff';

          return (
            <div
              key={m.id}
              className={`flex flex-col ${
                isPatient
                  ? isRtl
                    ? 'items-start'
                    : 'items-end'
                  : isRtl
                  ? 'items-end'
                  : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-2xs ${
                  isPatient
                    ? 'bg-teal-600 text-white rounded-tr-sm'
                    : isStaff
                    ? 'bg-amber-50 text-amber-950 border border-amber-300 rounded-tl-sm'
                    : 'bg-white text-slate-900 border border-slate-200/90 rounded-tl-sm'
                }`}
              >
                {isStaff && (
                  <p className="font-bold text-[10px] text-amber-700 mb-1">
                    {lang === 'ar' ? '⚠️ تحويل للمشرف الطبي' : '⚠️ Escalated to Human Staff'}
                  </p>
                )}
                <p className="whitespace-pre-wrap">{m.text}</p>
              </div>
              <span className="text-[9px] text-slate-400 mt-0.5 px-1">{m.timestamp}</span>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center space-x-1.5 space-x-reverse text-slate-400 p-2">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce"></span>
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.4s]"></span>
            <span className="text-[10px] ml-1">
              {lang === 'ar' ? 'جاري الرد...' : 'Clinic Assistant is typing...'}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Inquiries */}
      <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center space-x-1.5 space-x-reverse overflow-x-auto no-scrollbar">
        {[
          { en: 'Zoom Whitening Price?', ar: 'سعر تبييض الزوم؟' },
          { en: 'Botox Areas & Cost', ar: 'أسعار حقن البوتوكس' },
          { en: 'Book Consultation', ar: 'حجز موعد استشارة' },
          { en: 'Clinic Location & Valet', ar: 'موقع العيادة ومواقف السيارات' },
        ].map((item, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(undefined, lang === 'ar' ? item.ar : item.en)}
            className="px-2.5 py-1 text-[10px] font-semibold bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 rounded-full whitespace-nowrap transition-colors border border-slate-200/80"
          >
            {lang === 'ar' ? item.ar : item.en}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => handleSendMessage(e)} className="p-3 bg-white border-t border-slate-200">
        <div className="flex items-center space-x-2 space-x-reverse">
          <input
            type="text"
            placeholder={
              lang === 'ar' ? 'اكتب رسالتك أو استفسارك هنا...' : 'Type your question or booking request...'
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="p-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white transition-colors"
          >
            <Send className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </form>
    </div>
  );
};
