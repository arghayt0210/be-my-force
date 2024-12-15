// store/useAuthStore.js
import { create } from "zustand";
import { axiosJSON } from "@/lib/axios";

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  checkAuth: async () => {
    try {
      const response = await axiosJSON.get("/api/auth/me");
      set({
        user: response.data,
        isAuthenticated: true,
        loading: false,
      });
      return response.data;
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await axiosJSON.get("/api/auth/logout");
      set({
        user: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  },

  setUser: (user) => set({ user }),
  setIsAuthenticated: (value) => set({ isAuthenticated: value }),
  setLoading: (value) => set({ loading: value }),
}));

export default useAuthStore;
