import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    id: 'u-1',
    name: 'Rajesh Kumar',
    email: 'admin@aiinteriorplanner.com',
    role: 'ADMIN',
  },
  token: localStorage.getItem('aip_token') || 'demo-token',
  isAuthenticated: true,
  login: (user, token) => {
    localStorage.setItem('aip_token', token);
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('aip_token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
