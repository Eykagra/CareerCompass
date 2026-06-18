const KEY = "careercompass.session.v1";

export function loadSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(session) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    /* quota or disabled storage — non-fatal */
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

/* ----------------------------- Mentor chat ----------------------------- */
const CHAT_KEY = "careercompass.chat.v1";

export function loadChat() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CHAT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveChat(messages) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHAT_KEY, JSON.stringify(messages));
  } catch {
    /* quota or disabled storage — non-fatal */
  }
}

export function clearChat() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CHAT_KEY);
}
