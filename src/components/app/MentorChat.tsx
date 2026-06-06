"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ChatMessage, RoadmapGraph, UserProfile } from "@/lib/schema";
import { loadChat, saveChat } from "@/lib/storage";

const SUGGESTIONS = [
  "What should I focus on first?",
  "I only have 5 hours a week — adjust my plan.",
  "Which step matters most for interviews?",
];

function welcomeMessage(goal: string): ChatMessage {
  return {
    role: "assistant",
    content: `Hi! I’m your mentor for “${goal}”. Ask me why any step matters, what to skip, or how to adapt the plan to your schedule.`,
  };
}

export function MentorChat({
  profile,
  roadmap,
}: {
  profile: UserProfile;
  roadmap: RoadmapGraph;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [restored, setRestored] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Restore the saved conversation so the chat persists across reloads and
  // panel switches, not just while the component is mounted.
  useEffect(() => {
    const saved = loadChat();
    setMessages(saved && saved.length ? saved : [welcomeMessage(profile.goal)]);
    setRestored(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist on every change once the initial restore has run.
  useEffect(() => {
    if (restored) saveChat(messages);
  }, [messages, restored]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 999999, behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || loading) return;
    const history = messages;
    setMessages((m) => [...m, { role: "user", content: question }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, roadmap, history, question }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            data.reply ||
            data.error ||
            "Sorry, I couldn’t generate a response just now. Please try again.",
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "Network hiccup — please try that again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-white/8 px-5 py-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-600">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </span>
        <div>
          <p className="text-sm font-semibold leading-none">AI Mentor</p>
          <p className="mt-1 text-[11px] text-ink-dim">Knows your roadmap</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
              m.role === "user"
                ? "ml-auto rounded-br-sm bg-brand-600/30 text-ink"
                : "rounded-bl-sm border border-white/8 bg-white/[0.03] text-ink-soft",
            )}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="flex max-w-[88%] items-center gap-1.5 rounded-2xl rounded-bl-sm border border-white/8 bg-white/[0.03] px-3.5 py-3">
            <Dot /> <Dot /> <Dot />
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 px-5 pb-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-ink-soft transition-colors hover:border-brand-400/40 hover:text-ink"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-white/8 p-4"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your mentor…"
          className="flex-1 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-ink outline-none placeholder:text-ink-dim focus:border-brand-400/50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-brand-500 to-brand-600 text-white transition-opacity disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

function Dot() {
  return (
    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-dim [animation-duration:1s]" />
  );
}
