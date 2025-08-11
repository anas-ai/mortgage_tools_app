import { create } from 'zustand';
import {
  getToken,
  removeToken,
  saveToken,
  saveToStorage,
} from '../utils/MmkvStorageHelper';

interface AuthStateProps {
  userToken: string | null;
  loading: boolean;
  SaveLoginToken: (token: string) => void;
  logout: () => void;
  checkLoginState: () => void;
}

export const useAuthStore = create<AuthStateProps>(set => ({
  userToken: null,
  loading: true,

  SaveLoginToken: token => {
    saveToken('token', token);
    set({ userToken: token });
  },

  logout: () => {
    removeToken('token');
    set({ userToken: null });
  },

  checkLoginState: () => {
    set({ loading: true });

    
    setTimeout(() => {
      const token = getToken('token');
      console.log('Token found:', token);
      set({
        userToken: token ?? null,
        loading: false,
      });
    }, 500); 
  },
}));
