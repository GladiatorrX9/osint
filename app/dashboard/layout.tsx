"use client";

import * as React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/layout/app-sidebar";
import Header from "@/components/layout/header";
import KBarProvider from "@/components/kbar";
import { SessionTimeout } from "@/components/session-timeout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <KBarProvider>
      <SidebarProvider defaultOpen={true}>
        <SessionTimeout timeoutMinutes={2} warningMinutes={0.5} />
        <AppSidebar />
        <SidebarInset className="bg-background">
          <Header />
          <div className="flex flex-1 flex-col">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </KBarProvider>
  );
}
