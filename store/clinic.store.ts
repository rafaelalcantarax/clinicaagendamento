
import { create } from 'zustand';
import { ClinicConfig } from '../types';

interface ClinicState {
  currentClinic: ClinicConfig | null;
  loading: boolean;
  setClinic: (clinic: ClinicConfig) => void;
  setLoading: (loading: boolean) => void;
}

export const useClinicStore = create<ClinicState>((set) => ({
  currentClinic: null,
  loading: true,
  setClinic: (clinic) => set({ currentClinic: clinic, loading: false }),
  setLoading: (loading) => set({ loading }),
}));
