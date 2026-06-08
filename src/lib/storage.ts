"use client";

import type { ChatMessage, RoadmapGraph, UserProfile } from "@/lib/schema";

export type SavedSession = {
  id: string;
  /** The DB id of the saved map this session mirrors, if any. */
  mapId: string | null;
  profile: UserProfile;
  roadmap: RoadmapGraph;
  completed: string[];
  createdAt: number;
};

const KEY = "careercompass.session.v1";

export function loadSession(): SavedSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedSession) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: SavedSession): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    /* quota or disabled storage — non-fatal */
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

/* ----------------------------- Mentor chat ----------------------------- */
// The mentor conversation is persisted separately so it survives page
// reloads and panel switches (it used to live only in component state).
const CHAT_KEY = "careercompass.chat.v1";

export function loadChat(): ChatMessage[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CHAT_KEY);
    return raw ? (JSON.parse(raw) as ChatMessage[]) : null;
  } catch {
    return null;
  }
}

export function saveChat(messages: ChatMessage[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHAT_KEY, JSON.stringify(messages));
  } catch {
    /* quota or disabled storage — non-fatal */
  }
}

export function clearChat(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CHAT_KEY);
}
