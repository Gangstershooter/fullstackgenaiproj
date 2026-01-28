/**
 * useChatListStore.ts
 * -------------------
 * Global state store responsible for managing the **list of chat sessions**
 * displayed in the application sidebar.
 *
 * Responsibilities:
 * - Maintain a list of all chat sessions
 * - Add newly created chats to the sidebar
 * - Rename chats dynamically based on user input
 * - Delete chats when requested by the user
 *
 * Architecture Role:
 * - This store manages ONLY chat session metadata.
 * - Message content for the active chat is handled separately
 *   by `useChatStore`.
 * - This separation prevents unnecessary UI re-renders during
 *   message streaming and keeps sidebar performance optimal.
 *
 * UX Features Enabled:
 * - Instant appearance of new chats in sidebar
 * - Automatic chat renaming based on first user message
 * - Chat deletion and management
 * - Real-time sidebar updates without page refresh
 *
 * Data Model:
 * - id: Unique chat session identifier
 * - title: Display name of the chat
 * - createdAt: Timestamp for ordering and sorting
 *
 * Future Extensions:
 * - Backend synchronization
 * - Chat pinning / favorites
 * - Folder / category grouping
 * - Search & filtering
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
}

interface ChatListState {
  chats: ChatSession[];
  addChat: (chat: ChatSession) => void;
  renameChat: (id: string, title: string) => void;
  deleteChat: (id: string) => void;
  clearAll: () => void;
}

export const useChatListStore = create<ChatListState>()(
  persist(
    (set) => ({
      chats: [],

      addChat: (chat) =>
        set((state) => ({
          chats: [chat, ...state.chats],
        })),

      renameChat: (id, title) =>
        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === id ? { ...c, title } : c
          ),
        })),
        clearAll: () => set({ chats: [] }),

      deleteChat: (id) =>
        set((state) => ({
          chats: state.chats.filter((c) => c.id !== id),
        })),
    }),
    
    {
      name: "chat-list-store", // localStorage key
    }
  )
);
