/**
 * useUIStore.ts
 * ----------------
 * Global UI state store for application-wide interface behavior.
 *
 * Responsibilities:
 * - Track whether an AI response is currently streaming
 * - Control UI locking during streaming (disable input, buttons, etc.)
 * - Provide a centralized state for real-time UI feedback
 *
 * Why this store exists:
 * - Keeps streaming state separate from chat data
 * - Prevents unnecessary re-renders of chat messages
 * - Enables consistent UI behavior across components
 *
 * Example usage:
 * - Disable send button while AI is generating response
 * - Show typing indicator / loading animation
 * - Block multiple submissions during streaming
 */
import { create } from "zustand";

interface UIState {
  // Indicates whether AI response streaming is in progress
  isStreaming: boolean;
  setStreaming: (status: boolean) => void;

  // Controls visibility of the global search modal
  isSearchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isStreaming: false,
  setStreaming: (status) => set({ isStreaming: status }),

  isSearchOpen: false,
  setSearchOpen: (open) => set({ isSearchOpen: open }),
}));
