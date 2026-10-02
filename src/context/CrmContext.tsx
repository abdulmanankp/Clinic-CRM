import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  StaffUser,
  UserRole,
  LeadStatus,
  AppointmentStatus,
  SmtpSettings,
  EmailLog,
} from '../types/crm.ts';

interface CrmContextType {
  settings: ClinicSettings | null;
  treatments: Treatment[];
  kbEntries: KBEntry[];
  leads: Lead[];
  conversations: Conversation[];
  messages: Message[];
  appointments: Appointment[];
  followups: Followup[];
  activities: ActivityEvent[];
  smtpSettings: SmtpSettings | null;
  emailLogs: EmailLog[];
  updateSmtpConfig: (config: Partial<SmtpSettings>) => Promise<boolean>;
  verifySmtp: (config?: Partial<SmtpSettings>) => Promise<{ ok: boolean; message: string; error?: string }>;
  sendTestEmail: (to?: string) => Promise<{ ok: boolean; message?: string }>;
  refreshEmailLogs: () => Promise<void>;
  currentUser: StaffUser;
  setCurrentUser: (user: StaffUser) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  staffUsers: StaffUser[];
  createStaffUser: (userData: { name: string; email: string; role: UserRole; password?: string }) => void;
  updateStaffUserRole: (id: string, role: UserRole) => void;
  deleteStaffUser: (id: string) => void;
  activeTab: 'dashboard' | 'inbox' | 'leads' | 'appointments' | 'followups' | 'settings' | 'users' | 'widget-preview';
  setActiveTab: (tab: 'dashboard' | 'inbox' | 'leads' | 'appointments' | 'followups' | 'settings' | 'users' | 'widget-preview') => void;
  selectedLeadId: string | null;
  setSelectedLeadId: (id: string | null) => void;
  selectedConversationId: string | null;
  setSelectedConversationId: (id: string | null) => void;
  loading: boolean;
  refreshData: () => Promise<void>;
  simulateEnquiry: (scenarioId: number) => Promise<{ ok: boolean; scenario?: string; error?: string }>;
  resetDemoData: () => Promise<void>;
  sendStaffMessage: (
    conversationId: string,
    text: string,
    isTemplate?: boolean,
    templateName?: string
  ) => Promise<{ ok: boolean; error?: string }>;
  toggleConversationMode: (conversationId: string, mode: 'ai' | 'human', reason?: string) => Promise<void>;
  updateLead: (leadId: string, updates: Partial<Lead>) => Promise<void>;
  createAppointment: (data: {
    lead_id: string;
    start: string;
    treatment: string;
    channel: string;
    notes?: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  checkPatient: (query: {
    phone?: string;
    national_id?: string;
    email?: string;
    search?: string;
  }) => Promise<{ found: boolean; patient?: Lead; recentAppointments?: Appointment[] }>;
  registerPatient: (data: {
    name: string;
    phone: string;
    national_id?: string;
    email?: string;
    address?: string;
    language?: 'en' | 'ar';
    treatment_interest?: string;
    send_welcome_email?: boolean;
    send_welcome_whatsapp?: boolean;
  }) => Promise<{ ok: boolean; patient?: Lead; is_new?: boolean; error?: string }>;
  updateAppointment: (
    apptId: string,
    status?: AppointmentStatus,
    newStart?: string
  ) => Promise<{ ok: boolean; error?: string }>;
  triggerFollowup: (followupId: string, status: 'sent' | 'skipped' | 'failed') => Promise<void>;
  upsertTreatment: (treatment: Partial<Treatment>) => Promise<void>;
  upsertKB: (kb: Partial<KBEntry>) => Promise<void>;
  deleteKB: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<ClinicSettings>) => Promise<void>;
  toastMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

const defaultStaffUsersList: StaffUser[] = [
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

const CrmContext = createContext<CrmContextType | undefined>(undefined);

export const CrmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [kbEntries, setKbEntries] = useState<KBEntry[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);

  // Load staff users from localStorage if available, or use defaults
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>(() => {
    try {
      const stored = localStorage.getItem('clinicflow_staff_users');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure Abdul Manan is always in the list as Super Admin
        const hasAbdul = parsed.some((u: StaffUser) => u.email === 'abdulmanankp0@gmail.com');
        if (!hasAbdul) {
          return [defaultStaffUsersList[0], ...parsed];
        }
        return parsed;
      }
    } catch {}
    return defaultStaffUsersList;
  });

  // Auth session management: check localStorage on init
  const [currentUser, setCurrentUser] = useState<StaffUser>(() => {
    try {
      const stored = localStorage.getItem('clinicflow_auth_user');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return defaultStaffUsersList[0];
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('clinicflow_is_authenticated') === 'true';
    } catch {}
    return false;
  });

  const [activeTab, setActiveTab] = useState<CrmContextType['activeTab']>('dashboard');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [smtpSettings, setSmtpSettings] = useState<SmtpSettings | null>(null);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  const refreshSmtp = useCallback(async () => {
    try {
      const res = await fetch('/api/smtp/config');
      if (res.ok) {
        const data = await res.json();
        setSmtpSettings(data.smtp);
      }
      const logsRes = await fetch('/api/smtp/logs');
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setEmailLogs(logsData.logs || []);
      }
    } catch {}
  }, []);

  const updateSmtpConfig = async (config: Partial<SmtpSettings>): Promise<boolean> => {
    try {
      const res = await fetch('/api/smtp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (res.ok) {
        setSmtpSettings(data.smtp);
        showToast('SMTP Mail Server settings updated', 'success');
        return true;
      }
      showToast('Failed to update SMTP settings', 'error');
      return false;
    } catch {
      showToast('Error updating SMTP settings', 'error');
      return false;
    }
  };

  const verifySmtp = async (config?: Partial<SmtpSettings>): Promise<{ ok: boolean; message: string; error?: string }> => {
    try {
      const res = await fetch('/api/smtp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config || smtpSettings || {}),
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      return { ok: false, message: err.message || 'Verification failed' };
    }
  };

  const sendTestEmail = async (to?: string): Promise<{ ok: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/smtp/test-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to }),
      });
      const data = await res.json();
      await refreshEmailLogs();
      if (data.ok) {
        showToast(`Test email dispatched to ${data.recipient}`, 'success');
        return { ok: true, message: `Dispatched to ${data.recipient}` };
      }
      showToast(`Test email failed: ${data.result?.error || 'Error'}`, 'error');
      return { ok: false, message: data.result?.error };
    } catch (err: any) {
      return { ok: false, message: err.message };
    }
  };

  const refreshEmailLogs = async () => {
    try {
      const res = await fetch('/api/smtp/logs');
      if (res.ok) {
        const data = await res.json();
        setEmailLogs(data.logs || []);
      }
    } catch {}
  };

  const login = async (email: string, pass: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: pass }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        return {
          ok: false,
          error: data.error || 'Database Authentication Failed: Please check your credentials.',
        };
      }

      // Authenticated directly via backend database
      const verifiedUser: StaffUser = data.user;
      setCurrentUser(verifiedUser);
      setIsAuthenticated(true);
      try {
        localStorage.setItem('clinicflow_auth_user', JSON.stringify(verifiedUser));
        localStorage.setItem('clinicflow_is_authenticated', 'true');
      } catch {}

      showToast(`Welcome back, ${verifiedUser.name}! (Authenticated via Database)`, 'success');
      return { ok: true };
    } catch (err: any) {
      return {
        ok: false,
        error: 'Database server unreachable: ' + (err.message || 'Network error'),
      };
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('clinicflow_is_authenticated');
    } catch {}
    setIsAuthenticated(false);
    showToast('You have been logged out securely.', 'info');
  };

  const refreshData = useCallback(async () => {
    try {
      const res = await fetch('/api/staff/bundle');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        setTreatments(data.treatments);
        setKbEntries(data.kb_entries);
        setLeads(data.leads);
        setConversations(data.conversations);
        setMessages(data.messages);
        setAppointments(data.appointments);
        setFollowups(data.followups);
        setActivities(data.activities);
        if (data.staff_users) {
          setStaffUsers(data.staff_users);
        }
      }
    } catch (err) {
      console.error('Error refreshing CRM bundle:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load and periodic refresh (every 4 seconds for live updates)
  useEffect(() => {
    refreshData();
    refreshSmtp();
    const interval = setInterval(refreshData, 4000);
    return () => clearInterval(interval);
  }, [refreshData, refreshSmtp]);

  // Keep selected conversation valid
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  const simulateEnquiry = async (scenarioId: number) => {
    try {
      const res = await fetch('/api/demo/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario_id: scenarioId }),
      });
      const data = await res.json();
      if (res.ok) {
        await refreshData();
        if (data.conversation?.id) {
          setSelectedConversationId(data.conversation.id);
        }
        showToast(`Simulated Enquiry: ${data.scenario}`, 'success');
        return { ok: true, scenario: data.scenario };
      }
      return { ok: false, error: data.error || 'Failed to simulate' };
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  };

  const resetDemoData = async () => {
    try {
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      if (res.ok) {
        await refreshData();
        showToast('Demo data reset: 12 leads, 8 appointments, fresh activity', 'info');
      }
    } catch (err) {
      showToast('Failed to reset demo data', 'error');
    }
  };

  const sendStaffMessage = async (
    conversationId: string,
    text: string,
    isTemplate?: boolean,
    templateName?: string
  ): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/staff-send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId,
          text,
          is_template: isTemplate,
          template_name: templateName,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || 'Failed to send message' };
      }
      await refreshData();
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  };

  const toggleConversationMode = async (conversationId: string, mode: 'ai' | 'human', reason?: string) => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}/mode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, reason }),
      });
      if (res.ok) {
        await refreshData();
        showToast(
          mode === 'human' ? 'Staff takeover activated (Mode: Human)' : 'Conversation returned to AI Agent',
          'info'
        );
      }
    } catch {
      showToast('Could not change conversation mode', 'error');
    }
  };

  const updateLead = async (leadId: string, updates: Partial<Lead>) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        await refreshData();
        showToast('Lead updated', 'success');
      }
    } catch {
      showToast('Could not update lead', 'error');
    }
  };

  const createAppointment = async (data: {
    lead_id: string;
    start: string;
    treatment: string;
    channel: string;
    notes?: string;
  }): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch('/create-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, created_by: 'staff' }),
      });
      const result = await res.json();
      if (!res.ok) {
        return { ok: false, error: result.error || 'Slot unavailable' };
      }
      await refreshData();
      showToast('Appointment booked & followups scheduled!', 'success');
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  };

  const checkPatient = async (query: {
    phone?: string;
    national_id?: string;
    email?: string;
    search?: string;
  }) => {
    try {
      const res = await fetch('/api/patients/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query),
      });
      if (res.ok) {
        return await res.json();
      }
      return { found: false };
    } catch {
      return { found: false };
    }
  };

  const registerPatient = async (data: {
    name: string;
    phone: string;
    national_id?: string;
    email?: string;
    address?: string;
    language?: 'en' | 'ar';
    treatment_interest?: string;
    send_welcome_email?: boolean;
    send_welcome_whatsapp?: boolean;
  }) => {
    try {
      const res = await fetch('/api/patients/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        return { ok: false, error: result.error || 'Failed to register patient' };
      }
      await refreshData();
      showToast(
        result.is_new
          ? `New patient ${result.patient.name} registered (Welcome email & WhatsApp queued)`
          : `Patient ${result.patient.name} verified & updated`,
        'success'
      );
      return { ok: true, patient: result.patient, is_new: result.is_new };
    } catch (err: any) {
      return { ok: false, error: err.message || 'Network error' };
    }
  };

  const updateAppointment = async (
    apptId: string,
    status?: AppointmentStatus,
    newStart?: string
  ): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch('/update-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointment_id: apptId, status, new_start: newStart }),
      });
      const result = await res.json();
      if (!res.ok) {
        return { ok: false, error: result.error || 'Failed to update appointment' };
      }
      await refreshData();
      showToast(status ? `Appointment marked as ${status}` : 'Appointment rescheduled', 'success');
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  };

  const triggerFollowup = async (followupId: string, status: 'sent' | 'skipped' | 'failed') => {
    try {
      const res = await fetch('/followup-sent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'crm_live_secret_key_12345',
        },
        body: JSON.stringify({ followup_id: followupId, status }),
      });
      if (res.ok) {
        await refreshData();
        showToast(`Followup updated to ${status}`, 'success');
      }
    } catch {
      showToast('Failed to update followup', 'error');
    }
  };

  const upsertTreatment = async (treatment: Partial<Treatment>) => {
    try {
      const res = await fetch('/api/treatments/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(treatment),
      });
      if (res.ok) {
        await refreshData();
        showToast('Treatment catalog updated', 'success');
      }
    } catch {
      showToast('Failed to save treatment', 'error');
    }
  };

  const upsertKB = async (kb: Partial<KBEntry>) => {
    try {
      const res = await fetch('/api/kb/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kb),
      });
      if (res.ok) {
        await refreshData();
        showToast('Knowledge Base approved answer saved', 'success');
      }
    } catch {
      showToast('Failed to save KB entry', 'error');
    }
  };

  const deleteKB = async (id: string) => {
    try {
      const res = await fetch(`/api/kb/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await refreshData();
        showToast('KB entry removed', 'info');
      }
    } catch {
      showToast('Failed to delete KB entry', 'error');
    }
  };

  const updateSettings = async (updates: Partial<ClinicSettings>) => {
    try {
      const res = await fetch('/api/settings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        await refreshData();
        showToast('Clinic settings saved', 'success');
      }
    } catch {
      showToast('Failed to update settings', 'error');
    }
  };

  const createStaffUser = async (userData: {
    name: string;
    email: string;
    role: UserRole;
    password?: string;
  }) => {
    try {
      const res = await fetch('/api/staff-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (res.ok) {
        await refreshData();
        showToast(`Staff member ${userData.name} created in database`, 'success');
      } else {
        showToast('Failed to create staff member in database', 'error');
      }
    } catch {
      showToast('Error connecting to database', 'error');
    }
  };

  const updateStaffUserRole = async (id: string, role: UserRole) => {
    try {
      const res = await fetch(`/api/staff-users/${id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        await refreshData();
        if (currentUser.id === id) {
          setCurrentUser((prev) => ({ ...prev, role }));
        }
        showToast('User role updated in database', 'success');
      }
    } catch {
      showToast('Failed to update role in database', 'error');
    }
  };

  const deleteStaffUser = async (id: string) => {
    if (currentUser.id === id) {
      showToast('Cannot delete currently active user', 'error');
      return;
    }
    try {
      const res = await fetch(`/api/staff-users/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await refreshData();
        showToast('Staff user deleted from database', 'info');
      }
    } catch {
      showToast('Failed to delete user from database', 'error');
    }
  };

  return (
    <CrmContext.Provider
      value={{
        settings,
        treatments,
        kbEntries,
        leads,
        conversations,
        messages,
        appointments,
        followups,
        activities,
        currentUser,
        setCurrentUser,
        isAuthenticated,
        login,
        logout,
        staffUsers,
        createStaffUser,
        updateStaffUserRole,
        deleteStaffUser,
        activeTab,
        setActiveTab,
        selectedLeadId,
        setSelectedLeadId,
        selectedConversationId,
        setSelectedConversationId,
        loading,
        refreshData,
        simulateEnquiry,
        resetDemoData,
        sendStaffMessage,
        toggleConversationMode,
        updateLead,
        createAppointment,
        checkPatient,
        registerPatient,
        updateAppointment,
        triggerFollowup,
        upsertTreatment,
        upsertKB,
        deleteKB,
        updateSettings,
        smtpSettings,
        emailLogs,
        updateSmtpConfig,
        verifySmtp,
        sendTestEmail,
        refreshEmailLogs,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </CrmContext.Provider>
  );
};

export const useCrm = () => {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error('useCrm must be used within a CrmProvider');
  }
  return context;
};
