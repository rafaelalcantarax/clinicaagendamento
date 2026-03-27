
import { create } from 'zustand';
import { User } from '../types';
import { api } from '../lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async (email, password) => {
    const user = await api.login(email, password);
    set({ user, isAuthenticated: true });
  },
  logout: () => {
    api.logout(); // Limpa localStorage
    set({ user: null, isAuthenticated: false }); // Limpa estado Zustand
  },
  initialize: () => {
    const user = api.getCurrentUser();
    set({ user, isAuthenticated: !!user, loading: false });
  }
}));
