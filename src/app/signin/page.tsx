import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { SignInCard } from "@/components/auth/SignInCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in \u2014 CareerCompass",
};

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) redirect("/app");

  return (
    <div className="relative flex min-h-screen items-center justify-center px-5">
      <AuroraBackground />
      <SignInCard />
    </div>
  );
}
