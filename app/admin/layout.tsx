"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  IconUsers,
  IconUserPlus,
  IconMail,
  IconChartBar,
  IconArrowLeft,
} from "@tabler/icons-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (
      status === "authenticated" &&
      session?.user?.email !== "admin@gladiatorrx.com"
    ) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (session?.user?.email !== "admin@gladiatorrx.com") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <IconArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-xl font-bold flex items-center gap-2">
                Admin Control Panel
              </h1>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <IconChartBar className="h-4 w-4 mr-2" />
                Overview
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="ghost" size="sm">
                <IconUsers className="h-4 w-4 mr-2" />
                All Users
              </Button>
            </Link>
            <Link href="/admin/waitlist">
              <Button variant="ghost" size="sm">
                <IconUserPlus className="h-4 w-4 mr-2" />
                Waitlist
              </Button>
            </Link>
            <Link href="/admin/emails">
              <Button variant="ghost" size="sm">
                <IconMail className="h-4 w-4 mr-2" />
                Send Emails
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <div className="container mx-auto max-w-7xl px-4 py-8">{children}</div>
    </div>
  );
}
