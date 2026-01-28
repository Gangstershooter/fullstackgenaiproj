import { ChatWindow } from "@/components/chat/ChatWindow";
import { ChatInput } from "@/components/chat/ChatInput";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useChatStore } from "@/store/useChatStore";

export function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const { activeChatId, messagesByChatId } = useChatStore();

  const messages = activeChatId
    ? messagesByChatId[activeChatId] || []
    : [];
  const isEmpty = messages.length === 0;

  const setActiveChat = useChatStore((s) => s.setActiveChat);

  useEffect(() => {
    if (chatId) {
      console.log("Loading chat:", chatId);
      setActiveChat(chatId);
    }
  }, [chatId, setActiveChat]);


  return (
    <div className="flex h-full w-full flex-col bg-background">
      {isEmpty ? (
        /* ---------- EMPTY STATE ---------- */
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="mb-8 text-center">
            <h2 className="text-4xl font-semibold text-zinc-900 dark:text-zinc-100">
              Start a new conversation
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Ask anything. Upload images. Get help instantly.
            </p>
          </div>

          {/* Input sits just below intro */}
          <div className="w-full">
            <ChatInput />
          </div>
        </div>
      ) : (
        /* ---------- ACTIVE CHAT ---------- */
        <>
          {/* Message Area */}
          <div className="flex-1 overflow-hidden">
            <ChatWindow />
          </div>

          {/* Bottom Input Bar */}
          <div className="w-full bg-background/80 backdrop-blur-md py-4 md:py-6">
            <ChatInput />
          </div>
        </>
      )}
    </div>
  );
}
