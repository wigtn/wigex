import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AdminRole = "SUPER_ADMIN" | "OPERATOR";

export interface Admin {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

interface AuthState {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => void;
}

// Dummy admin accounts
const dummyAdmins = [
  {
    id: "admin-001",
    email: "admin@travelhelper.com",
    password: "admin123",
    name: "Super Admin",
    role: "SUPER_ADMIN" as AdminRole,
  },
  {
    id: "admin-002",
    email: "operator@travelhelper.com",
    password: "operator123",
    name: "Operator",
    role: "OPERATOR" as AdminRole,
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      admin: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email: string, password: string) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const admin = dummyAdmins.find(
          a => a.email === email && a.password === password
        );

        if (admin) {
          const { password: _, ...adminData } = admin;
          set({ admin: adminData, isAuthenticated: true, isLoading: false });
          return true;
        }

        return false;
      },

      logout: () => {
        set({ admin: null, isAuthenticated: false, isLoading: false });
      },

      checkAuth: () => {
        const state = get();
        set({ isLoading: false, isAuthenticated: !!state.admin });
      },
    }),
    {
      name: "admin-auth",
      partialize: (state) => ({ admin: state.admin }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoading = false;
          state.isAuthenticated = !!state.admin;
        }
      },
    }
  )
);
