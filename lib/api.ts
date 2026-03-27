
import { supabase } from './supabase';
import { Appointment, User, Provider, Service, ClinicConfig, Invitation, ClinicMember, WorkingHours, Subscription, AvailabilityBlock } from '../types';
import { ENV } from '../config/env';

class ApiClient {
  private async request(operation: any) {
    try {
      const { data, error } = await operation;
      if (error) throw error;
      return data;
    } catch (err: any) {
      console.warn('API Warning/Error handled:', err.message);
      throw err;
    }
  }

  // --- AVAILABILITY BLOCKS ---
  async getAvailabilityBlocks(clinicId: string): Promise<AvailabilityBlock[]> {
    const { data, error } = await supabase
      .from('availability_blocks')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('start_at', { ascending: true });
    
    if (error) return [];
    return data || [];
  }

  async addAvailabilityBlock(clinicId: string, start: string, end: string, reason: string, providerId: string | null = null, blockType: 'custom' | 'vacation' | 'maintenance' = 'custom') {
    const { data: { user } } = await supabase.auth.getUser();
    const isAllDay = blockType === 'vacation';
    return this.request(supabase.from('availability_blocks').insert({
      clinic_id: clinicId,
      provider_id: providerId,
      start_at: new Date(start + 'T00:00:00Z').toISOString(),
      end_at: new Date(end + 'T23:59:59Z').toISOString(),
      reason: reason,
      block_type: blockType,
      is_all_day: isAllDay,
      created_by: user?.id
    }));
  }

  async removeAvailabilityBlock(id: string) {
    return this.request(supabase.from('availability_blocks').delete().eq('id', id));
  }

  async getClinicBlockages(clinicId: string): Promise<AvailabilityBlock[]> {
    return this.getAvailabilityBlocks(clinicId);
  }

  async addClinicBlockage(clinicId: string, start: string, end: string, reason: string) {
    return this.addAvailabilityBlock(clinicId, start, end, reason);
  }

  async removeClinicBlockage(id: string) {
    return this.removeAvailabilityBlock(id);
  }

  // --- AUTH & CLINICS ---
  async register(data: any) {
    const { email, password, name, clinicName, services, employeeCount, phone, birthDate, clinicPhone, address, city, document, specialty } = data;
    const { data: authData, error: signUpError } = await supabase.auth.signUp({ email, password, options: { data: { name, phone } } });
    if (signUpError) throw signUpError;
    if (!authData.user) throw new Error("Falha ao criar usuário.");

    await supabase.from('profiles').upsert({ id: authData.user.id, name, email, phone, birth_date: birthDate, role: 'admin' });
    const slug = clinicName.toLowerCase().trim().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 5);
    const { data: clinic, error: cError } = await supabase.from('clinics').insert({ 
      name: clinicName, slug, timezone: 'America/Sao_Paulo', primary_color: '#4f46e5', welcome_text: 'Agende sua consulta de forma rápida e segura.',
      document, specialty, phone: clinicPhone, address, city, employee_count: Number(employeeCount) || 1
    }).select().single();
    if (cError) throw cError;

    await supabase.from('clinic_members').insert({ clinic_id: clinic.id, user_id: authData.user.id, role: 'admin', status: 'active' });
    if (services?.length > 0) {
      const servicesToInsert = services.map((s: any) => ({ clinic_id: clinic.id, name: s.name, duration: Number(s.duration) || 30, price: Number(s.price) || 0 }));
      await supabase.from('services').insert(servicesToInsert);
    }
    return { user: authData.user, clinic };
  }

  async registerCollaborator(data: any) {
    const { email, password, name, phone, birthDate } = data;
    const { data: authData, error: signUpError } = await supabase.auth.signUp({ email, password, options: { data: { name, phone } } });
    if (signUpError) throw signUpError;
    const { error: profileError } = await supabase.from('profiles').upsert({ id: authData.user!.id, name, email, phone, birth_date: birthDate, role: 'collaborator' });
    if (profileError) throw profileError;
    return authData.user;
  }

  async login(email: string, password?: string) {
    const { data: { user }, error } = await supabase.auth.signInWithPassword({ email, password: password || '' });
    if (error) throw error;
    return this.refreshUserSession(user!.id);
  }

  async logout() { 
    await supabase.auth.signOut();
    localStorage.removeItem('user'); 
  }

  async refreshUserSession(userId: string): Promise<User | null> {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    const clinics = await this.getUserClinics(userId);
    const primary = clinics[0] || null;
    const userData: User = { 
      id: userId, name: profile?.name || 'Usuário', email: profile?.email || '', 
      role: (primary?.role || 'collaborator') as any, clinicId: primary?.clinic_id || null,
      photo_url: profile?.photo_url, birth_date: profile?.birth_date, phone: profile?.phone
    };
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  }

  getCurrentUser(): User | null {
    const data = localStorage.getItem('user');
    return data ? JSON.parse(data) : null;
  }

  async getUserClinics(userId: string): Promise<any[]> {
    const { data: members } = await supabase.from('clinic_members').select('clinic_id, role').eq('user_id', userId).eq('status', 'active');
    if (!members?.length) return [];
    const clinicIds = members.map(m => m.clinic_id);
    const { data: clinics } = await supabase.from('clinics').select('id, name, slug').in('id', clinicIds);
    return members.map(m => {
      const clinic = clinics?.find(c => c.id === m.clinic_id);
      return { clinic_id: m.clinic_id, role: m.role, name: clinic?.name || 'Unidade', slug: clinic?.slug || '' };
    });
  }

  async getClinicBySlug(slug: string): Promise<ClinicConfig | null> {
    const { data, error } = await supabase.from('clinics').select('*').eq('slug', slug).maybeSingle();
    return data;
  }

  async updateClinicGeneral(id: string, data: Partial<ClinicConfig>) {
    return this.request(supabase.from('clinics').update(data).eq('id', id));
  }

  async updateClinicAvailability(id: string, hours: WorkingHours[]) {
    return this.request(supabase.from('clinics').update({ working_hours: hours }).eq('id', id));
  }

  // --- APPOINTMENTS & NOTIFICATIONS ---
  async createAppointment(clinicId: string, data: any) {
    // 1. Verificar conflito
    const { data: conflict } = await supabase.from('appointments').select('id').eq('provider_id', data.providerId).eq('start_time', data.date).neq('status', 'CANCELLED').maybeSingle();
    if (conflict) throw new Error("Este horário acabou de ser ocupado.");

    // 2. Buscar duração do serviço e dados da clínica/profissional
    const [svc, cln, prv] = await Promise.all([
      supabase.from('services').select('name, duration').eq('id', data.serviceId).single(),
      supabase.from('clinics').select('name, address').eq('id', clinicId).single(),
      supabase.from('providers').select('name, user_id').eq('id', data.providerId).single()
    ]);

    const duration = svc.data?.duration || 30;
    const start = new Date(data.date);
    const end = new Date(start.getTime() + duration * 60000);
    
    const cleanPhone = data.patientPhone.replace(/\D/g, '');
    const patientPhone = cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone;

    // 3. Criar agendamento com novos campos
    const { data: appointment, error } = await supabase.from('appointments').insert({
      clinic_id: clinicId,
      patient_name: data.patientName,
      patient_phone: patientPhone,
      patient_email: data.patientEmail || null,
      patient_cpf: data.patientCpf || null,
      patient_birth_date: data.patientBirthDate || null,
      patient_address: data.patientAddress || null,
      service_id: data.serviceId,
      provider_id: data.providerId,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      status: 'SCHEDULED',
      notes: data.notes
    }).select().single();

    if (error) throw error;

    // 4. Disparar Notificações via WhatsApp
    const formattedDate = start.toLocaleDateString('pt-BR');
    const formattedTime = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // A: Para o Paciente
    const patientMsg = `Olá *${data.patientName}*! 👋\n\nSeu agendamento na *${cln.data?.name}* foi confirmado!\n\n📅 *Data:* ${formattedDate}\n⏰ *Horário:* ${formattedTime}\n👨‍⚕️ *Profissional:* ${prv.data?.name}\n📝 *Serviço:* ${svc.data?.name}\n📍 *Endereço:* ${cln.data?.address || 'Ver no portal'}\n\nEsperamos por você! ✨`;
    this.sendWhatsAppNotification(patientPhone, patientMsg);

    // B: Para o Profissional (Buscando telefone do perfil do profissional)
    if (prv.data?.user_id) {
      const { data: profProfile } = await supabase.from('profiles').select('phone').eq('id', prv.data.user_id).single();
      if (profProfile?.phone) {
        const profPhone = profProfile.phone.replace(/\D/g, '');
        const profMsg = `📢 *Novo Agendamento na Agenda!*\n\nOlá Dr(a). *${prv.data?.name}*, você tem um novo compromisso:\n\n👤 *Paciente:* ${data.patientName}\n📅 *Data:* ${formattedDate}\n⏰ *Horário:* ${formattedTime}\n📝 *Serviço:* ${svc.data?.name}\n📞 *Contato:* ${data.patientPhone}`;
        this.sendWhatsAppNotification(profPhone.startsWith('55') ? profPhone : '55' + profPhone, profMsg);
      }
    }

    return appointment;
  }

  // Fix for error in BookingLanding.tsx: Property 'getBookedSlots' does not exist on type 'ApiClient'
  async getBookedSlots(providerId: string, date: string): Promise<string[]> {
    const { data } = await supabase
      .from('appointments')
      .select('start_time')
      .eq('provider_id', providerId)
      .neq('status', 'CANCELLED')
      .gte('start_time', `${date}T00:00:00`)
      .lte('start_time', `${date}T23:59:59`);
    
    if (!data) return [];
    return data.map(a => {
      const d = new Date(a.start_time);
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
    });
  }

  // Fix for error in BookingFlow.tsx: Property 'createPatient' does not exist on type 'ApiClient'
  async createPatient(clinicId: string, data: any) {
    // Current architecture stores patient info directly in appointments table.
    // This is a placeholder for future extensions or CRM modules.
    return { success: true };
  }

  async sendWhatsAppNotification(to: string, message: string) {
    try {
      await fetch(`${ENV.UAZAPI_URL}/send/text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'token': ENV.UAZAPI_TOKEN },
        body: JSON.stringify({ number: to, text: message })
      });
    } catch (e) { console.warn("Erro ao enviar WA:", e); }
  }

  async getAppointments(clinicId: string): Promise<Appointment[]> {
    const { data } = await supabase.from('appointments').select('*, services(name), providers(name)').eq('clinic_id', clinicId).neq('status', 'CANCELLED').order('start_time', { ascending: true });
    return (data || []).map(a => ({
      id: a.id, patientName: a.patient_name, patientPhone: a.patient_phone, patientEmail: a.patient_email,
      patientCpf: a.patient_cpf, patientBirthDate: a.patient_birth_date, patientAddress: a.patient_address,
      status: a.status.toLowerCase(), date: a.start_time, service: (a.services as any)?.name, provider: (a.providers as any)?.name,
      provider_id: a.provider_id, service_id: a.service_id
    }));
  }

  async getAppointmentById(id: string): Promise<Appointment | null> {
    const { data: a } = await supabase.from('appointments').select('*, services(name), providers(name)').eq('id', id).single();
    if (!a) return null;
    return {
      id: a.id, patientName: a.patient_name, patientPhone: a.patient_phone, patientEmail: a.patient_email,
      patientCpf: a.patient_cpf, patientBirthDate: a.patient_birth_date, patientAddress: a.patient_address,
      status: a.status.toLowerCase(), date: a.start_time, service: (a.services as any)?.name, provider: (a.providers as any)?.name,
      notes: a.notes, provider_id: a.provider_id, service_id: a.service_id
    };
  }

  async cancelAppointment(id: string) { return this.request(supabase.from('appointments').update({ status: 'CANCELLED' }).eq('id', id)); }
  async updateAppointment(id: string, updates: any) { return this.request(supabase.from('appointments').update(updates).eq('id', id)); }
  async resetPassword(email: string) { return supabase.auth.resetPasswordForEmail(email); }

  async getProviders(clinicId: string): Promise<Provider[]> {
    const { data: providers } = await supabase.from('providers').select('*, services').eq('clinic_id', clinicId);
    if (!providers?.length) return [];
    const userIds = providers.map(p => p.user_id).filter(Boolean);
    const { data: profiles } = await supabase.from('profiles').select('id, photo_url, phone').in('id', userIds);
    return providers.map(p => ({
      ...p,
      photo_url: profiles?.find(prof => prof.id === p.user_id)?.photo_url,
      phone: profiles?.find(prof => prof.id === p.user_id)?.phone,
      service_ids: Array.isArray(p.services) ? p.services : []
    }));
  }

  async createProviderFromMember(clinicId: string, member: ClinicMember, specialty: string, serviceIds?: string[]) {
    return this.request(supabase.from('providers').insert({ clinic_id: clinicId, name: member.name, email: member.email, specialty: specialty, user_id: member.id, services: serviceIds || [] }).select().single());
  }

  async updateProvider(providerId: string, specialty: string, serviceIds: string[]) {
    return this.request(supabase.from('providers').update({ specialty, services: serviceIds }).eq('id', providerId));
  }

  async getServices(clinicId: string): Promise<Service[]> {
    const { data } = await supabase.from('services').select('*').eq('clinic_id', clinicId);
    return data || [];
  }

  async createService(clinicId: string, data: any) {
    return this.request(supabase.from('services').insert({ clinic_id: clinicId, name: data.name, duration: Number(data.duration) || 30, price: Number(data.price) || 0 }).select().single());
  }

  async getClinicMembers(clinicId: string): Promise<ClinicMember[]> {
    const { data: members } = await supabase.from('clinic_members').select('*').eq('clinic_id', clinicId);
    const { data: invites } = await supabase.from('clinic_invites').select('*').eq('clinic_id', clinicId).eq('status', 'pending');
    const userIds = members?.map(m => m.user_id).filter(Boolean) || [];
    const { data: profiles } = await supabase.from('profiles').select('id, name, email, photo_url').in('id', userIds);
    const activeList = (members || []).map(m => {
      const profile = profiles?.find(p => p.id === m.user_id);
      return { id: m.user_id, member_id: m.id, name: profile?.name || profile?.email?.split('@')[0] || 'Membro', email: profile?.email || '', role: m.role, status: 'active', photo_url: profile?.photo_url };
    });
    const pendingList = (invites || []).map(i => ({ id: undefined, member_id: i.id, name: i.invited_email.split('@')[0], email: i.invited_email, role: i.role, status: 'pending' }));
    return [...activeList, ...pendingList];
  }

  async inviteMember(clinicId: string, email: string, role: string) {
    const { data: { user } } = await supabase.auth.getUser();
    return this.request(supabase.from('clinic_invites').insert({ clinic_id: clinicId, invited_email: email.toLowerCase().trim(), role: role.toLowerCase(), invited_by: user?.id, status: 'pending', token: crypto.randomUUID() }));
  }

  async removeMember(id: string, isInvite: boolean = false) {
    if (isInvite) return this.request(supabase.from('clinic_invites').delete().eq('id', id));
    return this.request(supabase.from('clinic_members').delete().eq('id', id));
  }

  async getInvitations(userId: string): Promise<Invitation[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return [];
    const { data: invites } = await supabase.from('clinic_invites').select('*, clinics(name)').eq('invited_email', user.email.toLowerCase()).eq('status', 'pending');
    return (invites || []).map(i => ({ id: i.id, clinic_id: i.clinic_id, clinic_name: (i.clinics as any)?.name || 'Clínica', role: i.role, status: i.status, created_at: i.created_at }));
  }

  async respondToInvitation(invitationId: string, accept: boolean) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!accept) return this.request(supabase.from('clinic_invites').update({ status: 'rejected' }).eq('id', invitationId));
    const { data: invite } = await supabase.from('clinic_invites').select('*').eq('id', invitationId).single();
    await supabase.from('clinic_members').insert({ clinic_id: invite.clinic_id, user_id: user?.id, role: invite.role, status: 'active' });
    return this.request(supabase.from('clinic_invites').update({ status: 'accepted', accepted_at: new Date().toISOString() }).eq('id', invitationId));
  }

  async getPlans() {
    const { data } = await supabase.from('plans').select('*').eq('is_active', true).order('price_cents', { ascending: true });
    return data || [];
  }

  async getSubscriptionDetails(clinicId: string): Promise<Subscription | null> {
    const { data } = await supabase.from('subscriptions').select('*, plans(*)').eq('clinic_id', clinicId).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (!data) return null;
    return { id: data.id, status: data.status, plan_id: data.plan_id, plan_name: data.plans?.name || 'Plano Customizado', expires_at: data.expires_at, price_cents: data.plans?.price_cents || 0, max_professionals: data.plans?.max_professionals || 1, max_clinics: data.plans?.max_clinics || 1 };
  }

  async checkSubscription(clinicId: string): Promise<boolean> {
    const sub = await this.getSubscriptionDetails(clinicId);
    if (!sub) return false;
    return sub.status === 'active' && new Date(sub.expires_at) > new Date();
  }

  async createClinic(clinicName: string): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    const slug = clinicName.toLowerCase().trim().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 5);
    const { data: clinic } = await supabase.from('clinics').insert({ name: clinicName, slug, timezone: 'America/Sao_Paulo', primary_color: '#4f46e5', welcome_text: 'Agende sua consulta de forma rápida e segura.' }).select().single();
    await supabase.from('clinic_members').insert({ clinic_id: clinic.id, user_id: user?.id, role: 'admin', status: 'active' });
    return clinic;
  }

  async switchClinic(clinicId: string, role: string) {
    const user = this.getCurrentUser();
    if (user) {
      user.clinicId = clinicId; user.role = role.toLowerCase() as any;
      localStorage.setItem('user', JSON.stringify(user));
      window.location.hash = '/dashboard'; window.location.reload(); 
    }
  }

  async updateProfile(userId: string, data: Partial<User>) {
    await supabase.from('profiles').update({ name: data.name, phone: data.phone, photo_url: data.photo_url, birth_date: data.birth_date }).eq('id', userId);
    return this.refreshUserSession(userId);
  }

  async uploadProfilePhoto(file: File, userId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}.${fileExt}`;
    await supabase.storage.from('photoscolabores').upload(fileName, file, { cacheControl: '3600', upsert: true });
    const { data: { publicUrl } } = supabase.storage.from('photoscolabores').getPublicUrl(fileName);
    return `${publicUrl}?t=${Date.now()}`;
  }

  async getMembersForProvider(clinicId: string): Promise<ClinicMember[]> {
    const members = await this.getClinicMembers(clinicId);
    const providers = await this.getProviders(clinicId);
    const existingIds = providers.map(p => p.user_id).filter(Boolean);
    return members.filter(m => m.status === 'active' && m.id && !existingIds.includes(m.id));
  }
}

export const api = new ApiClient();
