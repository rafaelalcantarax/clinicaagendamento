
export type UserRole = 'admin' | 'collaborator' | 'patient' | 'colaborador' | 'administrador';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  clinicId?: string | null;
  phone?: string;
  photo_url?: string;
  birth_date?: string;
}

export interface WorkingHours {
  day: number; // 0-6 (domingo-sabado)
  enabled: boolean;
  start: string;
  end: string;
}

export interface AvailabilityBlock {
  id: string;
  clinic_id: string;
  provider_id?: string | null;
  start_at: string;
  end_at: string;
  is_all_day: boolean;
  block_type: 'custom' | 'vacation' | 'maintenance';
  reason?: string;
  created_by?: string;
  created_at?: string;
}

export type ClinicBlockage = AvailabilityBlock;

export interface ClinicConfig {
  id: string;
  name: string;
  slug: string;
  document?: string;
  specialty?: string;
  employee_count?: number;
  address?: string;
  phone?: string;
  city?: string;
  timezone: string;
  logo_url?: string;
  cover_url?: string;
  welcome_text?: string;
  primary_color?: string;
  secondary_color?: string;
  working_hours?: WorkingHours[];
}

export interface Subscription {
  id: string;
  status: 'active' | 'pending' | 'past_due' | 'canceled' | 'expired';
  plan_id: string;
  plan_name: string;
  expires_at: string;
  price_cents: number;
  max_professionals: number;
  max_clinics: number;
}

export interface Provider {
  id: string;
  clinic_id: string;
  name: string;
  specialty: string;
  email?: string;
  user_id?: string;
  avatar?: string;
  photo_url?: string; 
  phone?: string; // Telefone para notificações
  service_ids?: string[];
}

export interface Service {
  id: string;
  clinic_id: string;
  name: string;
  duration: number;
  price: number;
}

export interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  patientCpf?: string;
  patientBirthDate?: string;
  patientAddress?: string;
  service: string;
  provider: string;
  date: string;
  status: string;
  notes?: string;
  service_id?: string;
  provider_id?: string;
}

export interface Invitation {
  id: string;
  clinic_id: string;
  clinic_name: string;
  role: string;
  status: string;
  created_at: string;
}

export interface ClinicMember {
  id?: string; 
  member_id: string; 
  name: string;
  email: string;
  role: string;
  status: string;
  photo_url?: string;
}
