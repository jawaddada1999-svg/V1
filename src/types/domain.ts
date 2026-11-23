export type Language = 'ar' | 'en' | 'fr';

export type SectionId =
  | 'overview'
  | 'leads'
  | 'pipeline'
  | 'properties'
  | 'owners'
  | 'appointments'
  | 'team'
  | 'conversations'
  | 'notifications'
  | 'ads'
  | 'reports'
  | 'settings';

export type LeadStatus =
  | 'new'
  | 'visit_scheduled'
  | 'visited'
  | 'no_show'
  | 'follow_up'
  | 'closed_won'
  | 'not_interested'
  | 'closed_lost';

export type LeadSource =
  | 'facebook_ads'
  | 'instagram_ads'
  | 'google_ads'
  | 'whatsapp'
  | 'website'
  | 'referral'
  | 'walk_in';

export type ContactMethod = 'whatsapp' | 'phone_call';

export type PaymentMethod = 'cash' | 'credit';

export type DeliveryStatus = 'off_plan' | 'ready';

export type LeadClassification = 'vip' | 'hot' | 'warm' | 'cold';

export type OwnerType = 'individual' | 'investor' | 'developer' | 'company';

export type PropertyType =
  | 'apartment'
  | 'villa'
  | 'house'
  | 'land'
  | 'commercial'
  | 'office'
  | 'other';

export type PropertyTransactionType = 'sale' | 'rent';

export type TransactionType = 'sale' | 'rent' | 'sell' | 'rent_out';

export type PropertyStatus =
  | 'available'
  | 'reserved'
  | 'sold'
  | 'rented'
  | 'unavailable';

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'attended'
  | 'no_show'
  | 'cancelled'
  | 'rescheduled';

export type AppointmentType =
  | 'in_person_visit'
  | 'office_meeting'
  | 'virtual_tour'
  | 'contract_signing';

export type EmployeeRole =
  | 'agency_manager'
  | 'sales_manager'
  | 'real_estate_advisor'
  | 'receptionist'
  | 'custom';

export type ChannelType =
  | 'whatsapp'
  | 'instagram'
  | 'facebook'
  | 'website'
  | 'other';

export type NotificationCategory =
  | 'new_lead'
  | 'new_appointment'
  | 'upcoming_visit'
  | 'appointment_confirmed'
  | 'appointment_cancelled'
  | 'client_no_show'
  | 'property_updated'
  | 'team_activity'
  | 'admin_alert';

export interface NoteEntry {
  id: string;
  author_id: string;
  author_name: string;
  text: string;
  created_at: string;
}

export interface TimelineEntry {
  id: string;
  type: 'status' | 'note' | 'appointment' | 'call' | 'message' | 'created';
  title: string;
  description: string;
  actor: string;
  timestamp: string;
}

export interface PropertyOwner {
  id: string;
  agency_id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  owner_type: OwnerType;
  owner_intent?: 'sell' | 'rent_out' | 'both';
  preferred_contact: ContactMethod;
  commission_rate: number;
  national_id: string;
  notes: string;
  created_at: string;
}

export interface Lead {
  id: string;
  agency_id: string;
  name: string;
  phone: string;
  email: string;
  source: LeadSource;
  contact_method: ContactMethod;
  payment_method: PaymentMethod;
  bedrooms: number;
  delivery_status: DeliveryStatus;
  desired_area: number;
  classification: LeadClassification;
  interested_property_id: string | null;
  budget: number;
  property_type: PropertyType;
  transaction_type: TransactionType;
  city: string;
  district: string;
  assigned_employee_id: string;
  created_at: string;
  last_interaction: string;
  next_followup: string | null;
  closed_date?: string | null;
  deal_value?: number;
  status: LeadStatus;
  preferences: string;
  property_condition?: 'new' | 'excellent' | 'good' | 'needs_renovation' | '';
  mandate_status?: 'exclusive' | 'non_exclusive' | 'not_signed' | '';
  viewing_availability?: string;
  property_address?: string;
  rental_duration?: 'short_term' | 'long_term' | '';
  furnished?: 'furnished' | 'unfurnished' | '';
  move_in_date?: string;
  purchase_timing?: 'immediate' | 'within_3_months' | 'within_6_months' | 'flexible' | '';
  notes: NoteEntry[];
  timeline: TimelineEntry[];
}

export interface Property {
  id: string;
  agency_id: string;
  ref: string;
  title: string;
  type: PropertyType;
  transaction_type: PropertyTransactionType;
  price: number;
  city: string;
  district: string;
  address: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  status: PropertyStatus;
  images: string[];
  description: string;
  owner_id?: string;
  owner_name: string;
  owner_phone: string;
  assigned_employee_id: string;
  views: number;
  created_at: string;
  notes: NoteEntry[];
}

export interface TeamPerformanceOverride {
  employee_id: string;
  leads_registered?: number;
  appointments_total?: number;
  visits_completed?: number;
  successful_deals?: number;
  lost_deals?: number;
  financial_performance?: number;
  updated_at: string;
}

export interface Appointment {
  id: string;
  agency_id: string;
  lead_id: string;
  property_id: string;
  employee_id: string;
  date: string;
  time: string;
  type: AppointmentType;
  status: AppointmentStatus;
  notes: string;
  created_at: string;
}

export interface EmployeePermissions {
  manage_leads: boolean;
  manage_properties: boolean;
  manage_appointments: boolean;
  view_reports: boolean;
  manage_team: boolean;
  manage_settings: boolean;
  export_data: boolean;
}

export interface Employee {
  id: string;
  agency_id: string;
  name: string;
  phone: string;
  email: string;
  job_title: string;
  role: EmployeeRole;
  active: boolean;
  avatar: string;
  joined_at: string;
  permissions: EmployeePermissions;
  recent_activities: {
    id: string;
    action: string;
    target: string;
    timestamp: string;
  }[];
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'agent' | 'system';
  sender_name: string;
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  agency_id: string;
  lead_id: string;
  customer_name: string;
  customer_avatar?: string;
  channel: ChannelType;
  assigned_employee_id: string;
  unread_count: number;
  last_message: string;
  last_message_time: string;
  messages: ChatMessage[];
}

export interface NotificationItem {
  id: string;
  agency_id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: string;
  is_read: boolean;
  related_section: SectionId;
  related_id?: string;
}

export type AdPlatform = 'facebook_ads' | 'instagram_ads' | 'google_ads' | 'other';

export interface AdCampaign {
  id: string;
  agency_id: string;
  name: string;
  platform: AdPlatform;
  budget: number;
  spend: number;
  leads: number;
  qualified_leads: number;
  appointments: number;
  visits: number;
  sales: number;
  status: 'active' | 'paused' | 'completed';
  start_date: string;
  end_date: string;
}

export interface ExcludedPeriod {
  id: string;
  start: string;
  end: string;
  label?: string;
}

export interface WorkingDayConfig {
  day_key: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  enabled: boolean;
  open: string;
  close: string;
  break_start: string;
  break_end: string;
  blocked_slots?: string[];
  excluded_periods?: ExcludedPeriod[];
}

export interface AgencySettings {
  agency_id: string;
  name: string;
  tagline: string;
  logo_url: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  website: string;
  description: string;
  primary_color: string;
  secondary_color: string;
  working_days: WorkingDayConfig[];
  blocked_date_slots?: Record<string, string[]>;
  holidays: string;
  appointment_duration_minutes: number;
  booking_window_start: string;
  booking_window_end: string;
  auto_confirm_appointments: boolean;
  allow_reschedule_hours: number;
  send_visit_reminders: boolean;
  notify_new_lead: boolean;
  notify_appointments: boolean;
  notify_attendance: boolean;
  notify_team_activity: boolean;
  notify_email_digest: boolean;
  default_language: Language;
  timezone: string;
  date_format: 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'MM/DD/YYYY';
  currency: 'MAD';
  two_factor_enabled: boolean;
  active_sessions: {
    id: string;
    device: string;
    location: string;
    last_active: string;
    current: boolean;
  }[];
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  description?: string;
}
