import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useSession } from "@/lib/auth-client";
import { Compass } from "lucide-react";

// Components
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import {
  Features,
  HowItWorks,
  Pricing,
  FAQSection,
  CTA,
} from "@/components/landing/Sections";
import { SignInCard } from "@/components/auth/SignInCard";
import { Workspace } from "@/components/app/Workspace";
import { Dashboard } from "@/components/app/Dashboard";

// Page wrappers for protection
function ProtectedRoute({ children }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center text-ink-dim bg-bg">
        <Compass className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/signin" replace />;
  }

  // Pass user info to workspace/dashboard (session.user is guaranteed here)
  return <>{React.cloneElement(children, { user: session?.user })}</>;
}

function AnonymousOnlyRoute({ children }) {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center text-ink-dim bg-bg">
        <Compass className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (status === "authenticated") {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}

// Landing Page Layout
function HomePage() {
  return (
    <div className="relative">
      <AuroraBackground />
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <FAQSection />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

// SignIn Page Layout
function SignInPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-5">
      <AuroraBackground />
      <SignInCard />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Home */}
          <Route path="/" element={<HomePage />} />
          
          {/* Sign In (Anonymous only) */}
          <Route
            path="/signin"
            element={
              <AnonymousOnlyRoute>
                <SignInPage />
              </AnonymousOnlyRoute>
            }
          />
          
          {/* Workspace App (Protected) */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <Workspace />
              </ProtectedRoute>
            }
          />
          
          {/* Dashboard (Protected) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
