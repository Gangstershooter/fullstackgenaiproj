/**
 * useAuthStore.ts
 * ----------------
 * Global authentication state manager.
 *
 * Responsibilities:
 * - Manage user authentication session
 * - Store user profile info
 * - Handle login/logout flows
 * - Clear application state on logout
 *
 * Security:
 * - Clears all local data on logout
 * - Removes auth tokens
 * - Resets Zustand stores
 */

import { create } from "zustand";
import { useChatStore } from "./useChatStore";
import { useChatListStore } from "./useChatListStore";

interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;

  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,

  setAuth: (user, token) => {
    localStorage.setItem("auth_token", token);
    set({ user, token });
  },

  logout: () => {
  // Clear tokens
  localStorage.removeItem("auth_token");

  // Reset all app state
  useChatStore.getState().clearAllChats();
  useChatListStore.getState().clearAll?.();

  // Reset auth state
  set({ user: null, token: null });

  // Redirect to login
  window.location.href = "/login";
    },

}));
