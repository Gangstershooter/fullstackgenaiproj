/**
 * ChatInput.tsx
 * ----------------
 * This component renders the main message input bar for the chat interface.
 * 
 * Responsibilities:
 * - Capture user text input with auto-resizing textarea
 * - Handle Enter-to-send behavior (Shift+Enter for newline)
 * - Support file & image uploads using drag-and-drop
 * - Display file previews before sending
 * - Auto-focus input when a new chat is started
 * - Prevent sending while AI response is streaming
 *
 * UX Goals:
 * - Behave like ChatGPT input experience
 * - Smooth typing, clean layout, and minimal friction
 */

import { useEffect, useMemo, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { SendHorizontal, Paperclip, X } from "lucide-react";
import { useDropzone } from "react-dropzone";

import { Button } from "@/components/ui/button";
import { useChatStore } from "@/store/useChatStore";
import { useUIStore } from "@/store/useUIStore";
import { useNavigate } from "react-router-dom";

export function ChatInput() {
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const activeChatId = useChatStore((s) => s.activeChatId);
  const addMessage = useChatStore((s) => s.addMessage);
  const createNewChat=useChatStore((s)=>s.createNewChat);
  const isStreaming = useUIStore((s) => s.isStreaming);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const navigate =useNavigate();
  


  /**
   * Auto-focus input whenever a new chat is started.
   * This gives ChatGPT-like UX.
   */
  useEffect(() => {
    textareaRef.current?.focus();
  }, [activeChatId]);

  const onDrop = (acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true,
    multiple: true,
  });

  const canSend = useMemo(() => {
    return (
      !isStreaming &&
      (input.trim().length > 0 || files.length > 0)
    );
  }, [input, files.length, isStreaming]);

  const handleSubmit = (e?: React.FormEvent) => {
  e?.preventDefault();
  if (!canSend) return;

  let chatId = activeChatId;

  if (!chatId) {
    chatId = createNewChat();
    navigate(`/c/${chatId}`);
  }

  addMessage(chatId, {
    id: Date.now().toString(),
    role: "user",
    content: input,
    timestamp: new Date(),
  });

  setInput("");
  setFiles([]);
};




  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      {...getRootProps()}
      className="relative mx-auto w-full max-w-3xl px-4 pb-8"
    >
      {/* Hidden dropzone input */}
      <input {...getInputProps()} />

      {/* File preview */}
      {files.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {files.map((file, i) => (
            <div
              key={`${file.name}-${file.size}-${i}`}
              className="flex items-center gap-2 rounded bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-800"
            >
              <span className="max-w-[140px] truncate">
                {file.name}
              </span>
              <button
                type="button"
                onClick={() =>
                  setFiles((prev) =>
                    prev.filter((_, idx) => idx !== i)
                  )
                }
                className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
                aria-label={`Remove ${file.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input container */}
      <div
        className={[
          "relative flex w-full items-end rounded-2xl bg-background p-2 shadow-sm transition-all",
          isDragActive
            ? "border-indigo-500 ring-2 ring-indigo-500/20"
            : "border border-input",
        ].join(" ")}
      >
        {/* Attachment button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-xl text-zinc-500"
          onClick={open}
          aria-label="Attach files"
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        {/* Auto-resizing textarea */}
        <TextareaAutosize
          ref={textareaRef}
          rows={1}
          maxRows={8}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message…"
          className="min-h-[40px] flex-1 resize-none border-none bg-transparent px-3 py-2.5 text-sm focus:outline-none"
        />

        {/* Send button */}
        <Button
          type="button"
          size="icon"
          disabled={!canSend}
          onClick={handleSubmit}
          className="h-10 w-10 shrink-0 rounded-xl bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900"
          aria-label="Send message"
        >
          <SendHorizontal className="h-5 w-5" />
        </Button>
      </div>

      <p className="mt-2 text-center text-[10px] text-zinc-500">
        Models can make mistakes. Check important info.
      </p>
    </div>
  );
}


