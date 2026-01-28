import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useChatListStore } from "@/store/useChatListStore";
import { useUIStore } from "@/store/useUIStore";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Search } from "lucide-react";

// ----------- Search Algorithm -----------

function normalize(s: string) {
  return s.toLowerCase().trim();
}

function scoreMatch(text: string, tokens: string[]) {
  let score = 0;

  for (const token of tokens) {
    if (text.includes(token)) score += 10;
    if (text.startsWith(token)) score += 15;
  }

  return score;
}

function searchChats(query: string, chats: any[]) {
  if (!query.trim()) return chats;

  const tokens = normalize(query).split(/\s+/);

  return chats
    .map((chat) => ({
      chat,
      score: scoreMatch(normalize(chat.title), tokens),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.chat);
}

// ----------------------------------------

export function SearchModal() {
  const { isSearchOpen, setSearchOpen } = useUIStore();
  const chats = useChatListStore((s) => s.chats);
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const results = useMemo(() => {
    return searchChats(query, chats);
  }, [query, chats]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (id: string) => {
    setSearchOpen(false);
    setQuery("");
    navigate(`/c/${id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    }

    if (e.key === "Enter") {
      const chat = results[selectedIndex];
      if (chat) handleSelect(chat.id);
    }

    if (e.key === "Escape") {
      setSearchOpen(false);
    }
  };

  return (
    <Dialog open={isSearchOpen} onOpenChange={setSearchOpen}>
      <DialogContent className="max-w-xl p-0 overflow-hidden">
        <div className="border-b p-3 flex items-center gap-2">
          <Search className="h-4 w-4 text-zinc-500" />
          <Input
            autoFocus
            placeholder="Search chats..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border-none focus:ring-0"
          />
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {results.length === 0 ? (
            <p className="p-6 text-center text-sm text-zinc-500">
              No matching chats
            </p>
          ) : (
            results.map((chat, i) => (
              <button
                key={chat.id}
                onClick={() => handleSelect(chat.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-2 text-left text-sm
                  ${i === selectedIndex ? "bg-muted" : "hover:bg-muted"}
                `}
              >
                <MessageSquare className="h-4 w-4 shrink-0 text-zinc-500" />
                <span className="truncate">{chat.title}</span>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
