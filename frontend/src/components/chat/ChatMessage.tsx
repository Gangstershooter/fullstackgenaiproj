/**
 * ChatMessage.tsx
 * ----------------
 * This component renders a **single chat message bubble** inside the chat window.
 * It supports rich Markdown rendering, syntax highlighted code blocks, message editing,
 * and copy-to-clipboard functionality.
 *
 * Responsibilities:
 * - Render user and assistant messages with proper styling
 * - Render Markdown + GitHub-flavored markdown (tables, lists, code, etc.)
 * - Provide syntax-highlighted code blocks with copy support
 * - Allow editing of user messages and resubmission
 * - Display avatars and sender labels
 *
 * UX Goals:
 * - ChatGPT-like conversation display
 * - Clean, readable Markdown output
 * - Easy code copying
 * - Inline message editing and regeneration
 *
 * Architecture Role:
 * - UI layer only — state updates are delegated to `useChatStore`
 * - Editing logic integrates with backend regeneration pipeline (future)
 *
 * Future Enhancements:
 * - Token streaming animation
 * - Message-level feedback (thumbs up/down)
 * - Inline regeneration of assistant responses
 * - Message context actions (pin, bookmark, copy link)
 */

import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, Pencil } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChatStore } from "@/store/useChatStore";

type Role = "user" | "assistant";

interface ChatMessageProps {
  id: string;
  role: Role;
  content: string;

  /**
   * Optional: call this after user edits + saves a message.
   * Use it to re-run your API and regenerate assistant responses.
   */
  onResubmit?: (newPrompt: string, messageId: string) => void;

  /**
   * Optional: override avatar images if you want
   */
  userAvatarSrc?: string;
  assistantAvatarSrc?: string;

  /**
   * Optional: override display names
   */
  userLabel?: string;
  assistantLabel?: string;
}

/**
 * Custom code renderer for react-markdown:
 * - Inline code => simple <code>
 * - Fenced code blocks => syntax highlighting + copy button
 */
function CodeBlock({
  inline,
  className,
  children,
  ...props
}: {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  const code = useMemo(
    () => String(children ?? "").replace(/\n$/, ""),
    [children]
  );

  const match = /language-(\w+)/.exec(className || "");
  const language = match?.[1] ?? "text";

  // Inline code (single backticks) OR fenced code without language
  if (inline || !match) {
    return (
      <code
        className={cn(
          "rounded bg-zinc-200 px-1 py-0.5 text-[0.95em] dark:bg-zinc-800",
          className
        )}
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <div className="group relative my-4 overflow-hidden rounded-md border border-zinc-700/60">
      {/* Top bar */}
      <div className="flex items-center justify-between bg-zinc-800 px-3 py-1.5 text-xs text-zinc-200">
        <span className="font-mono">{language}</span>

        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            } catch {
              // Clipboard might be blocked by browser policy.
              // You can optionally show a toast here.
            }
          }}
          className="flex items-center gap-1 rounded px-2 py-1 text-zinc-200 hover:text-white"
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {/* Code body */}
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          background: "#1e1e1e",
        }}
        {...props}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

export function ChatMessage({
  id,
  role,
  content,
  onResubmit,
  userAvatarSrc = "/user-avatar.png",
  assistantAvatarSrc = "/assistant-avatar.png",
  userLabel = "You",
  assistantLabel = "Assistant",
}: ChatMessageProps) {
  const isAssistant = role === "assistant";

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(content);
  const [copied, setCopied] = useState(false);


  const updateMessage = useChatStore((s) => s.updateMessage);

  // Keep editValue synced if content updates (e.g. store update/streaming)
  useEffect(() => {
    if (!isEditing) setEditValue(content);
  }, [content, isEditing]);

  const handleCancel = () => {
    setEditValue(content);
    setIsEditing(false);
  };

  const handleSave = () => {
    const next = editValue.trim();
    if (!next) return;

    const activeChatId = useChatStore.getState().activeChatId;
    if (!activeChatId) return;
    updateMessage(activeChatId, id, next);

    setIsEditing(false);

    // Optional: trigger regeneration based on edited prompt
    onResubmit?.(next, id);
  };

  return (
    <div
      className={cn(
        "group relative w-full py-8",
        isAssistant ? "bg-zinc-50 dark:bg-zinc-900/50" : "bg-transparent"
      )}
    >
      <div className="mx-auto flex w-full max-w-3xl gap-4 px-4">
        {/* Avatar */}
        <Avatar className="h-8 w-8 border">
          <AvatarImage src="/user-avatar.png" onError={(e) => {
            e.currentTarget.src = "/default-avatar.png";}}
          />
          <AvatarFallback>{isAssistant ? "AI" : "U"}</AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="min-w-0 flex-1 overflow-hidden">
          <p className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {isAssistant ? assistantLabel : userLabel}
          </p>

          {isEditing ? (
            <div className="flex flex-col gap-2">
              <Textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="min-h-[100px] bg-background"
              />

              <div className="mt-2 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  Save &amp; Submit
                </Button>
              </div>
            </div>
          ) : (
            <div className="prose max-w-none break-words dark:prose-invert">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code: CodeBlock as any, // typing workaround
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Edit button: only show for USER messages and only when not editing */}
        {/* Message actions */}
        <div
        className="mb-2 flex gap-1 text-zinc-500
                    opacity-100 md:opacity-0 md:group-hover:opacity-100
                    transition-opacity"
        >
        {!isAssistant && !isEditing && (
            <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsEditing(true)}
            >
            <Pencil className="h-4 w-4" />
            </Button>
        )}

        <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => {
            navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
            }}
        >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
        </div>
      </div>
    </div>
  );
}
