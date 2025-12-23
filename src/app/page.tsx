"use client";

import * as React from "react";
import { Shell } from "@/components/Shell";
import { Auth } from "@/components/Auth";
import { FileBrowser } from "@/components/FileBrowser";
import { EarnView } from "@/components/EarnView";
import { DashboardView } from "@/components/DashboardView";
import { useAppState } from "@/lib/hooks/use-app-state";
import { Loader2 } from "lucide-react";

export default function RootPage() {
  const { user, profile, loading } = useAppState();
  const [activeTab, setActiveTab] = React.useState("files");
  const [view, setView] = React.useState<"app" | "dashboard">("app");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <Shell 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      onDashboardClick={() => setView("dashboard")}
      user={user}
      profile={profile}
    >
      {view === "dashboard" ? (
        <DashboardView profile={profile} onBack={() => setView("app")} />
      ) : activeTab === "files" ? (
        <FileBrowser user={user} profile={profile} />
      ) : (
        <EarnView user={user} profile={profile} />
      )}
    </Shell>
  );
}
