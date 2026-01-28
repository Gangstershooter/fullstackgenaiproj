
import { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import { useChatStore } from "../../store/useChatStore";


export function ChatWindow() {
  const { activeChatId, messagesByChatId } = useChatStore();
  const messages = activeChatId
    ? messagesByChatId[activeChatId] || []
    : [];
  const scrollEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
          <h3 className="mb-4 text-4xl font-semibold text-zinc-900 dark:text-zinc-100">
            Start a new conversation
          </h3>
        </div>
      ) : (
        <div className="flex flex-col">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} role={msg.role} content={msg.content} id={msg.id} />
          ))}
          <div ref={scrollEndRef} className="h-32 w-full" />
        </div>
      )}
    </div>
  );
}

