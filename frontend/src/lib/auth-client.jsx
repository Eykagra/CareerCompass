import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState("loading");

  async function checkSession() {
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setSession({ user: data.user });
          setStatus("authenticated");
          return;
        }
      }
      setSession(null);
      setStatus("unauthenticated");
    } catch {
      setSession(null);
      setStatus("unauthenticated");
    }
  }

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    setSession(null);
    setStatus("unauthenticated");
    window.location.href = "/";
  }

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <AuthContext.Provider value={{ session, status, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useSession() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useSession must be used within an AuthProvider");
  }
  return {
    data: context.session,
    status: context.status,
  };
}

export function useAuthActions() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthActions must be used within an AuthProvider");
  }
  return {
    logout: context.logout,
    login: (callbackUrl) => {
      let url = "/api/auth/login";
      if (callbackUrl) {
        url += `?callback_url=${encodeURIComponent(callbackUrl)}`;
      }
      window.location.href = url;
    }
  };
}
