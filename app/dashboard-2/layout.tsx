"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import {
  IconHome,
  IconSearch,
  IconDatabase,
  IconShield,
  IconLogout,
} from "@tabler/icons-react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-neutral-800 border-t-white rounded-full animate-spin"></div>
          <div className="text-neutral-400 text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <IconHome className="text-neutral-200 h-5 w-5 shrink-0" />,
    },
    {
      label: "Search Leaks",
      href: "/dashboard/search",
      icon: <IconSearch className="text-neutral-200 h-5 w-5 shrink-0" />,
    },
    {
      label: "Databases",
      href: "/dashboard/databases",
      icon: <IconDatabase className="text-neutral-200 h-5 w-5 shrink-0" />,
    },
    {
      label: "Security",
      href: "/dashboard/security",
      icon: <IconShield className="text-neutral-200 h-5 w-5 shrink-0" />,
    },
  ];

  return (
    <div className="min-h-screen bg-black flex w-full overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-950 border-r border-neutral-800 flex flex-col shrink-0">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden p-4">
          {/* Logo */}
          <div className="mb-8">
            <Logo size="md" showText href="/dashboard" className="text-white" />
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            {links.map((link, idx) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={idx}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group",
                    isActive
                      ? "bg-neutral-800 text-white"
                      : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                  )}
                >
                  <div className="shrink-0">{link.icon}</div>
                  <span className="text-sm font-medium whitespace-nowrap">
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Section */}
        <div className="border-t border-neutral-800 p-4">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">
              {session.user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {session.user?.name}
              </p>
              <p className="text-xs text-neutral-500 truncate">
                {(session.user as any)?.role || "USER"}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-400 hover:bg-neutral-900 hover:text-red-400 transition-all w-full group"
          >
            <IconLogout className="h-5 w-5 shrink-0" />
            <span className="text-sm font-medium whitespace-nowrap">
              Sign Out
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-black">
          <div className="w-full max-w-full px-4 py-6 sm:px-6 md:px-8 lg:px-10 xl:px-12">
            <div className="max-w-7xl mx-auto w-full">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
