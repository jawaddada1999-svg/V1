import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  initialAdCampaigns,
  initialAgencySettings,
  initialAppointments,
  initialConversations,
  initialEmployees,
  initialLeads,
  initialNotifications,
  initialOwners,
  initialProperties,
} from '../data/demoData';
import { TranslationDict, translations } from '../i18n/translations';
import {
  AdCampaign,
  AgencySettings,
  Appointment,
  AppointmentStatus,
  Conversation,
  Employee,
  Language,
  Lead,
  LeadStatus,
  NotificationItem,
  Property,
  PropertyOwner,
  PropertyStatus,
  SectionId,
  TeamPerformanceOverride,
  ToastMessage,
} from '../types/domain';
import { getTodayIso } from '../utils/dateUtils';

const STORAGE_KEY = 'ibonda_crm_state_v2';

interface PersistedAgencyState {
  language: Language;
  settings: AgencySettings;
  leads: Lead[];
  properties: Property[];
  owners: PropertyOwner[];
  appointments: Appointment[];
  employees: Employee[];
  conversations: Conversation[];
  notifications: NotificationItem[];
  teamPerformanceOverrides: Record<string, TeamPerformanceOverride>;
}

function loadPersistedState(): Partial<PersistedAgencyState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<PersistedAgencyState>;
  } catch {
    return {};
  }
}

interface AgencyContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDict;
  activeSection: SectionId;
  setActiveSection: (section: SectionId) => void;
  settings: AgencySettings;
  updateSettings: (patch: Partial<AgencySettings>) => void;
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'agency_id' | 'created_at' | 'last_interaction' | 'notes' | 'timeline'>) => Lead;
  updateLead: (id: string, patch: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  addLeadNote: (leadId: string, text: string) => void;
  properties: Property[];
  addProperty: (prop: Omit<Property, 'id' | 'agency_id' | 'created_at' | 'views' | 'notes'>) => Property;
  updateProperty: (id: string, patch: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  addPropertyNote: (propId: string, text: string) => void;
  owners: PropertyOwner[];
  addOwner: (owner: Omit<PropertyOwner, 'id' | 'agency_id' | 'created_at'>) => PropertyOwner;
  updateOwner: (id: string, patch: Partial<PropertyOwner>) => void;
  deleteOwner: (id: string) => void;
  appointments: Appointment[];
  addAppointment: (apt: Omit<Appointment, 'id' | 'agency_id' | 'created_at'>) => Appointment;
  updateAppointment: (id: string, patch: Partial<Appointment>) => void;
  employees: Employee[];
  addEmployee: (emp: Omit<Employee, 'id' | 'agency_id' | 'joined_at' | 'recent_activities'>) => Employee;
  updateEmployee: (id: string, patch: Partial<Employee>) => void;
  teamPerformanceOverrides: Record<string, TeamPerformanceOverride>;
  updateTeamPerformance: (employeeId: string, patch: TeamPerformanceOverride) => void;
  resetTeamPerformance: (employeeId?: string) => void;
  conversations: Conversation[];
  sendConversationMessage: (convId: string, text: string) => void;
  markConversationRead: (convId: string) => void;
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  adCampaigns: AdCampaign[];
  currentUser: Employee;
  toasts: ToastMessage[];
  pushToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
  selectedLeadId: string | null;
  setSelectedLeadId: (id: string | null) => void;
  selectedPropertyId: string | null;
  setSelectedPropertyId: (id: string | null) => void;
  selectedOwnerId: string | null;
  setSelectedOwnerId: (id: string | null) => void;
  selectedConversationId: string | null;
  setSelectedConversationId: (id: string | null) => void;
  openLeadProfile: (leadId: string) => void;
  openPropertyDetails: (propId: string) => void;
  openLeadConversation: (leadId: string) => void;
  quickModal: 'lead' | 'property' | 'appointment' | 'owner' | null;
  setQuickModal: (modal: 'lead' | 'property' | 'appointment' | 'owner' | null) => void;
  preselectedLeadForApt: string | null;
  setPreselectedLeadForApt: (leadId: string | null) => void;
  resetDemoSession: () => void;
}

const AgencyContext = createContext<AgencyContextValue | null>(null);

export const AgencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [persisted] = useState<Partial<PersistedAgencyState>>(() => loadPersistedState());
  const initialLang: Language =
    persisted.language === 'ar' || persisted.language === 'fr' || persisted.language === 'en'
      ? persisted.language
      : 'ar';
  const [language, setLanguageState] = useState<Language>(initialLang);
  const [activeSection, setActiveSection] = useState<SectionId>('overview');
  const [settings, setSettings] = useState<AgencySettings>(() => {
    const rawSettings: Partial<AgencySettings> =
      persisted.settings && typeof persisted.settings === 'object' ? persisted.settings : {};
    const s: AgencySettings = {
      ...initialAgencySettings,
      ...rawSettings,
      working_days: Array.isArray(rawSettings.working_days)
        ? rawSettings.working_days
        : initialAgencySettings.working_days,
      blocked_date_slots:
        rawSettings.blocked_date_slots && typeof rawSettings.blocked_date_slots === 'object'
          ? rawSettings.blocked_date_slots
          : initialAgencySettings.blocked_date_slots,
      active_sessions: Array.isArray(rawSettings.active_sessions)
        ? rawSettings.active_sessions
        : initialAgencySettings.active_sessions,
    };
    const migratedKey = 'ibonda_emerald_theme_v1';
    const alreadyMigrated =
      typeof window !== 'undefined' && window.localStorage.getItem(migratedKey) === '1';
    const legacyColors = new Set([
      '#0B3B4E',
      '#11423B',
      '#0F766E',
      '#059669',
      '#0D9488',
      '#EA580C',
      '#C2410C',
      '#9A3412',
    ]);
    if (
      !alreadyMigrated ||
      legacyColors.has(s.primary_color) ||
      legacyColors.has(s.secondary_color)
    ) {
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(migratedKey, '1');
        } catch {
          // Ignore storage quota errors
        }
      }
      return { ...s, primary_color: '#16966A', secondary_color: '#10B981' };
    }
    return s;
  });
  const [leads, setLeads] = useState<Lead[]>(
    Array.isArray(persisted.leads) ? persisted.leads : initialLeads
  );
  const [properties, setProperties] = useState<Property[]>(
    Array.isArray(persisted.properties) ? persisted.properties : initialProperties
  );
  const [owners, setOwners] = useState<PropertyOwner[]>(
    Array.isArray(persisted.owners) ? persisted.owners : initialOwners
  );
  const [appointments, setAppointments] = useState<Appointment[]>(
    Array.isArray(persisted.appointments) ? persisted.appointments : initialAppointments
  );
  const [employees, setEmployees] = useState<Employee[]>(
    Array.isArray(persisted.employees) && persisted.employees.length > 0
      ? persisted.employees
      : initialEmployees
  );
  const [conversations, setConversations] = useState<Conversation[]>(
    Array.isArray(persisted.conversations) ? persisted.conversations : initialConversations
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    Array.isArray(persisted.notifications) ? persisted.notifications : initialNotifications
  );
  const [teamPerformanceOverrides, setTeamPerformanceOverrides] = useState<
    Record<string, TeamPerformanceOverride>
  >(
    persisted.teamPerformanceOverrides && typeof persisted.teamPerformanceOverrides === 'object'
      ? persisted.teamPerformanceOverrides
      : {}
  );
  const [adCampaigns] = useState<AdCampaign[]>(initialAdCampaigns);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    (persisted.conversations ?? initialConversations)[0]?.id ?? null
  );
  const [quickModal, setQuickModal] = useState<'lead' | 'property' | 'appointment' | 'owner' | null>(null);
  const [preselectedLeadForApt, setPreselectedLeadForApt] = useState<string | null>(null);

  const t = translations[language];
  const currentUser = employees[0] ?? initialEmployees[0];

  useEffect(() => {
    try {
      const payload: PersistedAgencyState = {
        language,
        settings,
        leads,
        properties,
        owners,
        appointments,
        employees,
        conversations,
        notifications,
        teamPerformanceOverrides,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors
    }
  }, [
    language,
    settings,
    leads,
    properties,
    owners,
    appointments,
    employees,
    conversations,
    notifications,
    teamPerformanceOverrides,
  ]);

  useEffect(() => {
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    document.title = `${settings.name} | ${translations[language].nav[activeSection]}`;
  }, [language, settings.name, activeSection]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--agency-sidebar', '#12352B');
    root.style.setProperty('--agency-header', '#1B4335');
    root.style.setProperty('--agency-primary', settings.primary_color);
    root.style.setProperty('--agency-accent', settings.secondary_color);
    root.style.setProperty('--agency-primary-soft', `${settings.primary_color}1A`);
    root.style.setProperty('--agency-accent-soft', `${settings.secondary_color}1F`);
  }, [settings.primary_color, settings.secondary_color]);

  const pushToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3600);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    setSettings((prev) => ({ ...prev, default_language: lang }));
  }, []);

  const updateSettings = useCallback(
    (patch: Partial<AgencySettings>) => {
      setSettings((prev) => ({ ...prev, ...patch }));
      if (patch.default_language && patch.default_language !== language) {
        setLanguageState(patch.default_language);
      }
      pushToast({ type: 'success', title: translations[language].toasts.saved });
    },
    [language, pushToast]
  );

  const addLead = useCallback(
    (leadData: Omit<Lead, 'id' | 'agency_id' | 'created_at' | 'last_interaction' | 'notes' | 'timeline'>) => {
      const today = getTodayIso();
      const isWon = leadData.status === 'closed_won';
      const newLead: Lead = {
        ...leadData,
        id: `lead_${Date.now()}`,
        agency_id: settings.agency_id,
        created_at: today,
        last_interaction: today,
        closed_date: isWon ? leadData.closed_date ?? today : leadData.closed_date,
        deal_value: isWon ? leadData.deal_value ?? leadData.budget : leadData.deal_value,
        notes: [],
        timeline: [
          {
            id: `lt_${Date.now()}`,
            type: 'created',
            title: translations[language].leads.addLead,
            description: leadData.name,
            actor: currentUser.name,
            timestamp: `${today} ${new Date().toTimeString().slice(0, 5)}`,
          },
        ],
      };
      setLeads((prev) => [newLead, ...prev]);
      setNotifications((prev) => [
        {
          id: `notif_${Date.now()}`,
          agency_id: settings.agency_id,
          category: 'new_lead',
          title: translations[language].notificationCategories.new_lead,
          message: newLead.name,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          is_read: false,
          related_section: 'leads',
          related_id: newLead.id,
        },
        ...prev,
      ]);
      pushToast({ type: 'success', title: translations[language].toasts.leadAdded });
      return newLead;
    },
    [settings.agency_id, language, currentUser.name, pushToast]
  );

  const updateLead = useCallback(
    (id: string, patch: Partial<Lead>) => {
      const today = getTodayIso();
      setLeads((prev) =>
        prev.map((l) => {
          if (l.id !== id) return l;
          const updatedTimeline = [...l.timeline];
          if (patch.status && patch.status !== l.status) {
            updatedTimeline.unshift({
              id: `lt_${Date.now()}`,
              type: 'status',
              title: translations[language].leadStatuses[patch.status as LeadStatus],
              description: `${translations[language].leadStatuses[l.status]} → ${
                translations[language].leadStatuses[patch.status as LeadStatus]
              }`,
              actor: currentUser.name,
              timestamp: `${today} ${new Date().toTimeString().slice(0, 5)}`,
            });
          }
          const nextStatus = patch.status ?? l.status;
          const closedDate =
            nextStatus === 'closed_won'
              ? patch.closed_date ?? l.closed_date ?? today
              : patch.closed_date ?? l.closed_date;
          const dealValue =
            nextStatus === 'closed_won'
              ? patch.deal_value ?? l.deal_value ?? patch.budget ?? l.budget
              : patch.deal_value ?? l.deal_value;

          return {
            ...l,
            ...patch,
            closed_date: closedDate,
            deal_value: dealValue,
            last_interaction: today,
            timeline: updatedTimeline,
          };
        })
      );
      pushToast({ type: 'success', title: translations[language].toasts.leadUpdated });
    },
    [language, currentUser.name, pushToast]
  );

  const deleteLead = useCallback(
    (id: string) => {
      setLeads((prev) => prev.filter((l) => l.id !== id));
      if (selectedLeadId === id) setSelectedLeadId(null);
      pushToast({ type: 'info', title: translations[language].toasts.leadDeleted });
    },
    [selectedLeadId, language, pushToast]
  );

  const addLeadNote = useCallback(
    (leadId: string, text: string) => {
      if (!text.trim()) return;
      const today = getTodayIso();
      const nowStr = `${today} ${new Date().toTimeString().slice(0, 5)}`;
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId
            ? {
                ...l,
                last_interaction: today,
                notes: [
                  {
                    id: `ln_${Date.now()}`,
                    author_id: currentUser.id,
                    author_name: currentUser.name,
                    text: text.trim(),
                    created_at: nowStr,
                  },
                  ...l.notes,
                ],
                timeline: [
                  {
                    id: `lt_${Date.now()}`,
                    type: 'note',
                    title: translations[language].leads.profile.internalNotes,
                    description: text.trim(),
                    actor: currentUser.name,
                    timestamp: nowStr,
                  },
                  ...l.timeline,
                ],
              }
            : l
        )
      );
      pushToast({ type: 'success', title: translations[language].toasts.noteAdded });
    },
    [currentUser.id, currentUser.name, language, pushToast]
  );

  const addProperty = useCallback(
    (propData: Omit<Property, 'id' | 'agency_id' | 'created_at' | 'views' | 'notes'>) => {
      const newProp: Property = {
        ...propData,
        id: `prop_${Date.now()}`,
        agency_id: settings.agency_id,
        created_at: getTodayIso(),
        views: 1,
        notes: [],
      };
      setProperties((prev) => [newProp, ...prev]);
      pushToast({ type: 'success', title: translations[language].toasts.propertyAdded });
      return newProp;
    },
    [settings.agency_id, language, pushToast]
  );

  const updateProperty = useCallback(
    (id: string, patch: Partial<Property>) => {
      setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
      if (patch.status) {
        const prop = properties.find((p) => p.id === id);
        if (prop) {
          setNotifications((prev) => [
            {
              id: `notif_${Date.now()}`,
              agency_id: settings.agency_id,
              category: 'property_updated',
              title: translations[language].notificationCategories.property_updated,
              message: `${prop.title} — ${translations[language].propertyStatuses[patch.status as PropertyStatus]}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              is_read: false,
              related_section: 'properties',
              related_id: id,
            },
            ...prev,
          ]);
        }
      }
      pushToast({ type: 'success', title: translations[language].toasts.propertyUpdated });
    },
    [properties, settings.agency_id, language, pushToast]
  );

  const deleteProperty = useCallback(
    (id: string) => {
      setProperties((prev) => prev.filter((p) => p.id !== id));
      if (selectedPropertyId === id) setSelectedPropertyId(null);
      pushToast({ type: 'info', title: translations[language].toasts.propertyDeleted });
    },
    [selectedPropertyId, language, pushToast]
  );

  const addPropertyNote = useCallback(
    (propId: string, text: string) => {
      if (!text.trim()) return;
      const nowStr = `${getTodayIso()} ${new Date().toTimeString().slice(0, 5)}`;
      setProperties((prev) =>
        prev.map((p) =>
          p.id === propId
            ? {
                ...p,
                notes: [
                  {
                    id: `pn_${Date.now()}`,
                    author_id: currentUser.id,
                    author_name: currentUser.name,
                    text: text.trim(),
                    created_at: nowStr,
                  },
                  ...p.notes,
                ],
              }
            : p
        )
      );
      pushToast({ type: 'success', title: translations[language].toasts.noteAdded });
    },
    [currentUser.id, currentUser.name, language, pushToast]
  );

  const addOwner = useCallback(
    (ownerData: Omit<PropertyOwner, 'id' | 'agency_id' | 'created_at'>) => {
      const newOwner: PropertyOwner = {
        ...ownerData,
        id: `own_${Date.now()}`,
        agency_id: settings.agency_id,
        created_at: getTodayIso(),
      };
      setOwners((prev) => [newOwner, ...prev]);
      pushToast({ type: 'success', title: translations[language].toasts.ownerAdded });
      return newOwner;
    },
    [settings.agency_id, language, pushToast]
  );

  const updateOwner = useCallback(
    (id: string, patch: Partial<PropertyOwner>) => {
      setOwners((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
      pushToast({ type: 'success', title: translations[language].toasts.ownerUpdated });
    },
    [language, pushToast]
  );

  const deleteOwner = useCallback(
    (id: string) => {
      setOwners((prev) => prev.filter((o) => o.id !== id));
      if (selectedOwnerId === id) setSelectedOwnerId(null);
      pushToast({ type: 'info', title: translations[language].toasts.ownerDeleted });
    },
    [selectedOwnerId, language, pushToast]
  );

  const addAppointment = useCallback(
    (aptData: Omit<Appointment, 'id' | 'agency_id' | 'created_at'>) => {
      const newApt: Appointment = {
        ...aptData,
        id: `apt_${Date.now()}`,
        agency_id: settings.agency_id,
        created_at: getTodayIso(),
      };
      setAppointments((prev) => [newApt, ...prev]);
      setLeads((prev) =>
        prev.map((l) =>
          l.id === aptData.lead_id && l.status === 'new'
            ? { ...l, status: 'visit_scheduled' }
            : l
        )
      );
      setNotifications((prev) => [
        {
          id: `notif_${Date.now()}`,
          agency_id: settings.agency_id,
          category: 'new_appointment',
          title: translations[language].notificationCategories.new_appointment,
          message: `${aptData.date} · ${aptData.time}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          is_read: false,
          related_section: 'appointments',
          related_id: newApt.id,
        },
        ...prev,
      ]);
      pushToast({ type: 'success', title: translations[language].toasts.appointmentCreated });
      return newApt;
    },
    [settings.agency_id, language, pushToast]
  );

  const updateAppointment = useCallback(
    (id: string, patch: Partial<Appointment>) => {
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
      const target = appointments.find((a) => a.id === id);
      if (target && patch.status) {
        const statusMap: Partial<Record<AppointmentStatus, LeadStatus>> = {
          attended: 'visited',
          no_show: 'no_show',
          confirmed: 'visit_scheduled',
        };
        const mappedLeadStatus = statusMap[patch.status];
        if (mappedLeadStatus) {
          setLeads((prev) =>
            prev.map((l) => (l.id === target.lead_id ? { ...l, status: mappedLeadStatus } : l))
          );
        }
      }
      pushToast({ type: 'success', title: translations[language].toasts.appointmentUpdated });
    },
    [appointments, language, pushToast]
  );

  const addEmployee = useCallback(
    (empData: Omit<Employee, 'id' | 'agency_id' | 'joined_at' | 'recent_activities'>) => {
      const newEmp: Employee = {
        ...empData,
        id: `emp_${Date.now()}`,
        agency_id: settings.agency_id,
        joined_at: getTodayIso(),
        recent_activities: [],
      };
      setEmployees((prev) => [...prev, newEmp]);
      pushToast({ type: 'success', title: translations[language].toasts.employeeAdded });
      return newEmp;
    },
    [settings.agency_id, language, pushToast]
  );

  const updateEmployee = useCallback(
    (id: string, patch: Partial<Employee>) => {
      setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
      pushToast({ type: 'success', title: translations[language].toasts.employeeUpdated });
    },
    [language, pushToast]
  );

  const updateTeamPerformance = useCallback(
    (employeeId: string, patch: TeamPerformanceOverride) => {
      setTeamPerformanceOverrides((prev) => ({
        ...prev,
        [employeeId]: {
          ...(prev[employeeId] ?? {}),
          ...patch,
        },
      }));
      pushToast({ type: 'success', title: translations[language].toasts.saved });
    },
    [language, pushToast]
  );

  const resetTeamPerformance = useCallback(
    (employeeId?: string) => {
      if (!employeeId) {
        setTeamPerformanceOverrides({});
      } else {
        setTeamPerformanceOverrides((prev) => {
          const next = { ...prev };
          delete next[employeeId];
          return next;
        });
      }
      pushToast({ type: 'info', title: translations[language].toasts.statusUpdated });
    },
    [language, pushToast]
  );

  const sendConversationMessage = useCallback(
    (convId: string, text: string) => {
      if (!text.trim()) return;
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                unread_count: 0,
                last_message: text.trim(),
                last_message_time: nowTime,
                messages: [
                  ...c.messages,
                  {
                    id: `m_${Date.now()}`,
                    sender: 'agent',
                    sender_name: currentUser.name,
                    text: text.trim(),
                    timestamp: nowTime,
                  },
                ],
              }
            : c
        )
      );
      pushToast({ type: 'success', title: translations[language].toasts.messageSent });
    },
    [currentUser.name, language, pushToast]
  );

  const markConversationRead = useCallback((convId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, unread_count: 0 } : c))
    );
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    pushToast({ type: 'success', title: translations[language].toasts.statusUpdated });
  }, [language, pushToast]);

  const openLeadProfile = useCallback((leadId: string) => {
    setActiveSection('leads');
    setSelectedLeadId(leadId);
  }, []);

  const openPropertyDetails = useCallback((propId: string) => {
    setActiveSection('properties');
    setSelectedPropertyId(propId);
  }, []);

  const openLeadConversation = useCallback(
    (leadId: string) => {
      const existing = conversations.find((c) => c.lead_id === leadId);
      if (existing) {
        setSelectedConversationId(existing.id);
      } else {
        const lead = leads.find((l) => l.id === leadId);
        if (lead) {
          const created: Conversation = {
            id: `conv_${Date.now()}`,
            agency_id: settings.agency_id,
            lead_id: lead.id,
            customer_name: lead.name,
            channel: 'whatsapp',
            assigned_employee_id: lead.assigned_employee_id,
            unread_count: 0,
            last_message: '',
            last_message_time: '',
            messages: [],
          };
          setConversations((prev) => [created, ...prev]);
          setSelectedConversationId(created.id);
        }
      }
      setActiveSection('conversations');
    },
    [conversations, leads, settings.agency_id]
  );

  const resetDemoSession = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setSettings(initialAgencySettings);
    setLeads(initialLeads);
    setProperties(initialProperties);
    setOwners(initialOwners);
    setAppointments(initialAppointments);
    setEmployees(initialEmployees);
    setConversations(initialConversations);
    setNotifications(initialNotifications);
    setTeamPerformanceOverrides({});
    setActiveSection('overview');
    setSelectedLeadId(null);
    setSelectedPropertyId(null);
    setSelectedOwnerId(null);
    pushToast({ type: 'info', title: translations[language].app.logoutSuccess });
  }, [language, pushToast]);

  return (
    <AgencyContext.Provider
      value={{
        language,
        setLanguage,
        t,
        activeSection,
        setActiveSection,
        settings,
        updateSettings,
        leads,
        addLead,
        updateLead,
        deleteLead,
        addLeadNote,
        properties,
        addProperty,
        updateProperty,
        deleteProperty,
        addPropertyNote,
        owners,
        addOwner,
        updateOwner,
        deleteOwner,
        appointments,
        addAppointment,
        updateAppointment,
        employees,
        addEmployee,
        updateEmployee,
        teamPerformanceOverrides,
        updateTeamPerformance,
        resetTeamPerformance,
        conversations,
        sendConversationMessage,
        markConversationRead,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        adCampaigns,
        currentUser,
        toasts,
        pushToast,
        dismissToast,
        selectedLeadId,
        setSelectedLeadId,
        selectedPropertyId,
        setSelectedPropertyId,
        selectedOwnerId,
        setSelectedOwnerId,
        selectedConversationId,
        setSelectedConversationId,
        openLeadProfile,
        openPropertyDetails,
        openLeadConversation,
        quickModal,
        setQuickModal,
        preselectedLeadForApt,
        setPreselectedLeadForApt,
        resetDemoSession,
      }}
    >
      {children}
    </AgencyContext.Provider>
  );
};

export function useAgency() {
  const ctx = useContext(AgencyContext);
  if (!ctx) {
    throw new Error('useAgency must be used within AgencyProvider');
  }
  return ctx;
}
