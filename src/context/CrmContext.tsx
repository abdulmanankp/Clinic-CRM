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
  currentUser: StaffUser;
  setCurrentUser: (user: StaffUser) => void;
  staffUsers: StaffUser[];
  createStaffUser: (userData: { name: string; email: string; role: UserRole }) => void;
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
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-01-01',
  },
  {
    id: 'user-super-admin',
    name: 'Dr. Tariq Mansoor',
    email: 'tariq.mansoor@democlinic.ae',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-01-01',
  },
  {
    id: 'user-admin',
    name: 'Dr. Sarah Al-Mansoori',
    email: 'sarah.mansoori@democlinic.ae',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-01-15',
  },
  {
    id: 'user-staff',
    name: 'Layla Al-Amiri',
    email: 'layla.amiri@democlinic.ae',
    role: 'staff',
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

  const [staffUsers, setStaffUsers] = useState<StaffUser[]>(defaultStaffUsersList);
  const [currentUser, setCurrentUser] = useState<StaffUser>(defaultStaffUsersList[0]);
  const [activeTab, setActiveTab] = useState<CrmContextType['activeTab']>('dashboard');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

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
    const interval = setInterval(refreshData, 4000);
    return () => clearInterval(interval);
  }, [refreshData]);

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

  const createStaffUser = (userData: { name: string; email: string; role: UserRole }) => {
    const newUser: StaffUser = {
      id: 'user-' + Math.random().toString(36).substring(2, 9),
      name: userData.name,
      email: userData.email,
      role: userData.role,
      avatar:
        userData.role === 'staff'
          ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString().slice(0, 10),
    };
    setStaffUsers((prev) => [...prev, newUser]);
    showToast(`User ${newUser.name} created as ${newUser.role}`, 'success');
  };

  const updateStaffUserRole = (id: string, role: UserRole) => {
    setStaffUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    if (currentUser.id === id) {
      setCurrentUser((prev) => ({ ...prev, role }));
    }
    showToast('Role updated', 'success');
  };

  const deleteStaffUser = (id: string) => {
    if (currentUser.id === id) {
      showToast('Cannot delete currently active user', 'error');
      return;
    }
    setStaffUsers((prev) => prev.filter((u) => u.id !== id));
    showToast('User deleted', 'info');
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
        updateAppointment,
        triggerFollowup,
        upsertTreatment,
        upsertKB,
        deleteKB,
        updateSettings,
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
