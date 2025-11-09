import type { NavItem } from "@/types";

export type Product = {
  photo_url: string;
  name: string;
  description: string;
  created_at: string;
  price: number;
  id: number;
  category: string;
  updated_at: string;
};

//Info: The following data is used for the sidebar navigation and Cmd K bar.
// Student Navigation
export const studentNavItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard/student",
    icon: "dashboard",
    isActive: false,
    shortcut: ["d", "d"],
    items: [],
  },
  {
    title: "Practice Tests",
    url: "/dashboard/test",
    icon: "fileText",
    shortcut: ["t", "t"],
    isActive: false,
    items: [],
  },
  {
    title: "Test History",
    url: "/dashboard/history",
    icon: "clock",
    shortcut: ["h", "h"],
    isActive: false,
    items: [],
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: "barChart",
    shortcut: ["a", "a"],
    isActive: false,
    items: [],
  },
  {
    title: "Subscriptions",
    url: "/dashboard/subscriptions",
    icon: "billing",
    shortcut: ["u", "u"],
    isActive: false,
    items: [],
  },
  {
    title: "Account",
    url: "#",
    icon: "user",
    isActive: true,
    items: [
      {
        title: "Profile",
        url: "/dashboard/profile",
        icon: "userPen",
        shortcut: ["m", "m"],
      },
      {
        title: "Settings",
        shortcut: ["e", "e"],
        url: "/dashboard/settings",
        icon: "settings",
      },
    ],
  },
];

// Organization Navigation
export const organizationNavItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard/organization",
    icon: "dashboard",
    isActive: false,
    shortcut: ["d", "d"],
    items: [],
  },
  {
    title: "Tests",
    url: "/dashboard/test",
    icon: "fileText",
    shortcut: ["t", "t"],
    isActive: false,
    items: [],
  },
  {
    title: "Questions",
    url: "/dashboard/questions",
    icon: "circleDot",
    shortcut: ["q", "q"],
    isActive: false,
    items: [],
  },
  {
    title: "Students",
    url: "/dashboard/students",
    icon: "users",
    shortcut: ["s", "s"],
    isActive: false,
    items: [],
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: "barChart",
    shortcut: ["a", "a"],
    isActive: false,
    items: [],
  },
  {
    title: "Subscriptions",
    url: "/dashboard/subscriptions",
    icon: "billing",
    shortcut: ["u", "u"],
    isActive: false,
    items: [],
  },
  {
    title: "Account",
    url: "#",
    icon: "user",
    isActive: true,
    items: [
      {
        title: "Profile",
        url: "/dashboard/profile",
        icon: "userPen",
        shortcut: ["m", "m"],
      },
      {
        title: "Settings",
        shortcut: ["e", "e"],
        url: "/dashboard/settings",
        icon: "settings",
      },
    ],
  },
];

// Admin/Moderator Navigation
export const adminNavItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard/overview",
    icon: "dashboard",
    isActive: false,
    shortcut: ["d", "d"],
    items: [],
  },
  {
    title: "Tests",
    url: "/dashboard/test",
    icon: "fileText",
    shortcut: ["t", "t"],
    isActive: false,
    items: [],
  },
  {
    title: "Questions",
    url: "/dashboard/questions",
    icon: "circleDot",
    shortcut: ["q", "q"],
    isActive: false,
    items: [],
  },
  {
    title: "Students",
    url: "/dashboard/students",
    icon: "users",
    shortcut: ["s", "s"],
    isActive: false,
    items: [],
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: "barChart",
    shortcut: ["a", "a"],
    isActive: false,
    items: [],
  },
  {
    title: "Subscriptions",
    url: "/dashboard/subscriptions",
    icon: "billing",
    shortcut: ["u", "u"],
    isActive: false,
    items: [],
  },
  {
    title: "Account",
    url: "#",
    icon: "user",
    isActive: true,
    items: [
      {
        title: "Profile",
        url: "/dashboard/profile",
        icon: "userPen",
        shortcut: ["m", "m"],
      },
      {
        title: "Settings",
        shortcut: ["e", "e"],
        url: "/dashboard/settings",
        icon: "settings",
      },
    ],
  },
];

// GladiatorRX Navigation - Data Breach Monitoring Platform (Regular Users)
export const gladiatorRXNavItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: "dashboard",
    isActive: false,
    shortcut: ["d", "d"],
    items: [],
  },
  {
    title: "Search Leaks",
    url: "/dashboard/search",
    icon: "search",
    shortcut: ["s", "s"],
    isActive: false,
    items: [],
  },
  {
    title: "Search Logs",
    url: "/dashboard/search-logs",
    icon: "activity",
    shortcut: ["l", "l"],
    isActive: false,
    items: [],
  },
  {
    title: "Remediation",
    url: "/dashboard/remediation",
    icon: "shield",
    shortcut: ["r", "r"],
    isActive: false,
    items: [],
  },
  {
    title: "Team",
    url: "/dashboard/team",
    icon: "users",
    shortcut: ["t", "t"],
    isActive: false,
    items: [],
  },
  {
    title: "Subscription",
    url: "/dashboard/subscription",
    icon: "billing",
    shortcut: ["b", "b"],
    isActive: false,
    items: [],
  },
  {
    title: "Account",
    url: "#",
    icon: "user",
    isActive: true,
    items: [
      {
        title: "Profile",
        url: "/dashboard/profile",
        icon: "userPen",
        shortcut: ["p", "p"],
      },
    ],
  },
];

// GladiatorRX Admin Navigation - Platform Management
export const gladiatorRXAdminNavItems: NavItem[] = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: "dashboard",
    isActive: false,
    shortcut: ["d", "d"],
    items: [],
  },
  {
    title: "Waitlist",
    url: "/dashboard/admin/waitlist",
    icon: "userPlus",
    shortcut: ["w", "w"],
    isActive: false,
    items: [],
  },
  {
    title: "Users",
    url: "/dashboard/admin/users",
    icon: "users",
    shortcut: ["u", "u"],
    isActive: false,
    items: [],
  },
  {
    title: "Email Manager",
    url: "/dashboard/admin/emails",
    icon: "mail",
    shortcut: ["e", "e"],
    isActive: false,
    items: [],
  },
  {
    title: "Analytics",
    url: "/dashboard/admin/analytics",
    icon: "barChart",
    shortcut: ["a", "a"],
    isActive: false,
    items: [],
  },
  {
    title: "Search Leaks",
    url: "/dashboard/search",
    icon: "search",
    shortcut: ["s", "s"],
    isActive: false,
    items: [],
  },
  {
    title: "Search Logs",
    url: "/dashboard/search-logs",
    icon: "activity",
    shortcut: ["l", "l"],
    isActive: false,
    items: [],
  },
  {
    title: "Remediation",
    url: "/dashboard/remediation",
    icon: "shield",
    shortcut: ["r", "r"],
    isActive: false,
    items: [],
  },
  {
    title: "Account",
    url: "#",
    icon: "user",
    isActive: true,
    items: [
      {
        title: "Profile",
        url: "/dashboard/profile",
        icon: "userPen",
        shortcut: ["p", "p"],
      },
    ],
  },
];

// Helper function to get navigation items based on role and email
export function getNavItemsByRole(
  role: "STUDENT" | "ORGANIZATION" | "ADMIN" | "MODERATOR",
  email?: string
): NavItem[] {
  // Check if user is admin by email
  if (email === "admin@gladiatorrx.com") {
    return gladiatorRXAdminNavItems;
  }
  // For GladiatorRX, regular users get standard navigation
  return gladiatorRXNavItems;
}

// Keep the old navItems for backward compatibility (defaults to GladiatorRX nav)
export const navItems: NavItem[] = gladiatorRXNavItems;

export interface SaleUser {
  id: number;
  name: string;
  email: string;
  amount: string;
  image: string;
  initials: string;
}

export const recentSalesData: SaleUser[] = [
  {
    id: 1,
    name: "Olivia Martin",
    email: "olivia.martin@email.com",
    amount: "+$1,999.00",
    image: "https://api.slingacademy.com/public/sample-users/1.png",
    initials: "OM",
  },
  {
    id: 2,
    name: "Jackson Lee",
    email: "jackson.lee@email.com",
    amount: "+$39.00",
    image: "https://api.slingacademy.com/public/sample-users/2.png",
    initials: "JL",
  },
  {
    id: 3,
    name: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    amount: "+$299.00",
    image: "https://api.slingacademy.com/public/sample-users/3.png",
    initials: "IN",
  },
  {
    id: 4,
    name: "William Kim",
    email: "will@email.com",
    amount: "+$99.00",
    image: "https://api.slingacademy.com/public/sample-users/4.png",
    initials: "WK",
  },
  {
    id: 5,
    name: "Sofia Davis",
    email: "sofia.davis@email.com",
    amount: "+$39.00",
    image: "https://api.slingacademy.com/public/sample-users/5.png",
    initials: "SD",
  },
];
