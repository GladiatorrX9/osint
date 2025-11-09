"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatarProfile } from "@/components/user-avatar-profile";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  IconUser,
  IconCreditCard,
  IconSettings,
  IconUsers,
  IconShield,
  IconDatabase,
  IconLogout,
  IconActivity,
  IconChartBar,
  IconUserPlus,
  IconMail,
  IconSearch,
  IconCrown,
} from "@tabler/icons-react";

export function UserNav() {
  const { data: session } = useSession();
  const router = useRouter();

  if (session && session.user) {
    const isAdmin = session.user.email === "admin@gladiatorrx.com";
    const userRole = isAdmin ? "ADMIN" : "USER";

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <UserAvatarProfile
              user={{
                fullName: session.user.name || "User",
                imageUrl: session.user.image ?? "",
                emailAddresses: [{ emailAddress: session.user.email ?? "" }],
              }}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-64"
          align="end"
          sideOffset={10}
          forceMount
        >
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1.5">
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <IconShield className="h-4 w-4 text-amber-500" />
                ) : (
                  <IconUser className="h-4 w-4 text-blue-500" />
                )}
                <p className="text-sm leading-none font-semibold">
                  {session.user.name || "User"}
                </p>
              </div>
              <p className="text-muted-foreground text-xs leading-none">
                {session.user.email || ""}
              </p>
              <div className="flex items-center justify-between mt-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-muted-foreground">Active</span>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    isAdmin
                      ? "text-amber-600 bg-amber-50 dark:bg-amber-950"
                      : "text-blue-600 bg-blue-50 dark:bg-blue-950"
                  }`}
                >
                  {userRole}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {isAdmin ? (
            // Admin-specific menu items
            <>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                  <IconChartBar className="mr-2 h-4 w-4 text-blue-500" />
                  <span className="font-medium">Admin Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/admin/waitlist")}
                >
                  <IconUserPlus className="mr-2 h-4 w-4 text-purple-500" />
                  <span>Waitlist Management</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/admin/users")}
                >
                  <IconUsers className="mr-2 h-4 w-4 text-green-500" />
                  <span>User Management</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/admin/emails")}
                >
                  <IconMail className="mr-2 h-4 w-4 text-orange-500" />
                  <span>Email Manager</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/admin/analytics")}
                >
                  <IconChartBar className="mr-2 h-4 w-4 text-cyan-500" />
                  <span>Analytics</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => router.push("/admin/waitlist")}
                >
                  <IconDatabase className="mr-2 h-4 w-4 text-indigo-500" />
                  <span>Full Waitlist View</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/admin/users")}>
                  <IconShield className="mr-2 h-4 w-4 text-red-500" />
                  <span>All Users & Orgs</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/admin/emails")}>
                  <IconMail className="mr-2 h-4 w-4 text-pink-500" />
                  <span>Bulk Email Sender</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/profile")}
                >
                  <IconSettings className="mr-2 h-4 w-4" />
                  <span>Account Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/search")}
                >
                  <IconSearch className="mr-2 h-4 w-4" />
                  <span>Database Search</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </>
          ) : (
            // Regular user menu items
            <>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                  <IconChartBar className="mr-2 h-4 w-4 text-blue-500" />
                  <span className="font-medium">Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/search")}
                >
                  <IconSearch className="mr-2 h-4 w-4 text-cyan-500" />
                  <span>Search Database</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/profile")}
                >
                  <IconUser className="mr-2 h-4 w-4 text-purple-500" />
                  <span>My Profile</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/subscription")}
                >
                  <IconCreditCard className="mr-2 h-4 w-4 text-green-500" />
                  <span>Subscription & Billing</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/team")}
                >
                  <IconUsers className="mr-2 h-4 w-4 text-orange-500" />
                  <span>Team Management</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/profile?tab=activity")}
                >
                  <IconActivity className="mr-2 h-4 w-4 text-indigo-500" />
                  <span>Activity Log</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/profile?tab=settings")}
                >
                  <IconSettings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-red-600 focus:text-red-600"
          >
            <IconLogout className="mr-2 h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
}
