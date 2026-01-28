/**
 * useChatStore.ts
 * ----------------
 * Global state store responsible for managing the **active chat session**
 * and its associated messages.
 *
 * Responsibilities:
 * - Track the currently active chat session (activeChatId)
 * - Store and manage all messages for the active chat
 * - Handle creation of new chats
 * - Reset messages when switching chats
 * - Append, update, and clear chat messages
 * - Automatically rename new chats based on the first user message
 *
 * Architecture Role:
 * - This store controls ONLY the currently active conversation.
 * - Sidebar chat history is managed separately via `useChatListStore`.
 * - This separation prevents unnecessary UI re-renders and ensures
 *   smooth streaming performance.
 *
 * UX Features Enabled:
 * - ChatGPT-style "New Chat" creation
 * - Automatic sidebar title update after first user message
 * - Seamless chat switching using URL routing
 * - Clean message lifecycle management
 *
 * Future Extensions:
 * - Streaming token updates
 * - Backend persistence synchronization
 * - Message-level metadata (tokens, latency, feedback, etc.)
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Message } from "../types/chat";
import { useChatListStore } from "./useChatListStore";

interface ChatState {
  activeChatId: string | null;
  messagesByChatId: Record<string, Message[]>;

  createNewChat: () => string;
  setActiveChat: (id: string) => void;

  addMessage: (chatId: string | null, message: Message) => void;
  updateMessage: (chatId: string | null, id: string, content: string) => void;
  clearChat: (chatId: string) => void;
  clearAllChats: () => void;
}
export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      activeChatId: null,
      messagesByChatId: {},

      createNewChat: () => {
        const id = crypto.randomUUID();

        useChatListStore.getState().addChat({
          id,
          title: "New Chat",
          createdAt: Date.now(),
        });

        set((state) => ({
          activeChatId: id,
          messagesByChatId: {
            ...state.messagesByChatId,
            [id]: [],
          },
        }));

        return id;
      },

      setActiveChat: (id) =>
        set((state) => ({
          activeChatId: id,
          messagesByChatId: {
            ...state.messagesByChatId,
            [id]: state.messagesByChatId[id] || [],
          },
        })),

      addMessage: (chatId, message) =>
        set((state) => {
          let id = chatId;

          // 🧠 Auto-create chat if none exists
          if (!id) {
            id = crypto.randomUUID();

            useChatListStore.getState().addChat({
              id,
              title: "New Chat",
              createdAt: Date.now(),
            });
          }

          const messages = state.messagesByChatId[id] || [];

          // Auto rename on first user message
          if (message.role === "user" && messages.length === 0) {
            useChatListStore
              .getState()
              .renameChat(id, message.content.slice(0, 40));
          }

          return {
            activeChatId: id,
            messagesByChatId: {
              ...state.messagesByChatId,
              [id]: [...messages, message],
            },
          };
        }),

      updateMessage: (chatId, id, content) =>
        set((state) => {
          if (!chatId) return state;

          return {
            messagesByChatId: {
              ...state.messagesByChatId,
              [chatId]: state.messagesByChatId[chatId].map((msg) =>
                msg.id === id ? { ...msg, content } : msg
              ),
            },
          };
        }),

      clearChat: (chatId) =>
        set((state) => {
          const copy = { ...state.messagesByChatId };
          delete copy[chatId];

          return {
            activeChatId: null,
            messagesByChatId: copy,
          };
        }),
        clearAllChats: () =>
          set({
            activeChatId: null,
            messagesByChatId: {},
          }),
    }),
    
    {
      name: "chat-message-store",
    }
  )
);
