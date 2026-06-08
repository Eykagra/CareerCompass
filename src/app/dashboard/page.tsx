import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Dashboard } from "@/components/app/Dashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your maps \u2014 CareerCompass",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const user = {
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    image: session.user.image ?? null,
  };

  return <Dashboard user={user} />;
}
