import Providers from "@/components/layout/providers";
import { Toaster } from "@/components/ui/toaster";
import { fontVariables } from "@/lib/font";
import ThemeProvider from "@/components/layout/ThemeToggle/theme-provider";
import { cn } from "@/lib/utils";
import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import NextTopLoader from "nextjs-toploader";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";
import "./theme.css";
import { Geist } from "next/font/google";

const META_THEME_COLORS = {
  light: "#ffffff",
  dark: "#09090b",
};

export const metadata: Metadata = {
  title: {
    default: "GladiatorrX - Data Breach Intelligence Platform",
    template: "%s | GladiatorrX",
  },
  description:
    "Advanced data breach intelligence and monitoring platform. Search leaked databases, track compromised credentials, and protect your organization from cyber threats with real-time breach detection.",
  keywords: [
    "data breach",
    "breach intelligence",
    "leaked database",
    "credential monitoring",
    "cybersecurity",
    "threat intelligence",
    "OSINT",
    "dark web monitoring",
    "compromised data",
    "security monitoring",
  ],
  authors: [{ name: "GladiatorrX" }],
  creator: "GladiatorrX",
  publisher: "GladiatorrX",
  metadataBase: new URL("https://gladiatorrx.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://gladiatorrx.com",
    title: "GladiatorrX - Data Breach Intelligence Platform",
    description:
      "Advanced data breach intelligence and monitoring platform. Search leaked databases, track compromised credentials, and protect your organization from cyber threats.",
    siteName: "GladiatorrX",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "GladiatorrX - Data Breach Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GladiatorrX - Data Breach Intelligence Platform",
    description:
      "Advanced data breach intelligence and monitoring platform. Search leaked databases and protect your organization from cyber threats.",
    images: ["/logo.png"],
    creator: "@gladiatorrx",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
      { url: "/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: META_THEME_COLORS.light,
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const activeThemeValue = cookieStore.get("active_theme")?.value;
  const isScaled = activeThemeValue?.endsWith("-scaled");

  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]').setAttribute('content', '${META_THEME_COLORS.dark}')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body
        className={cn(
          "bg-background overscroll-none font-sans antialiased",
          activeThemeValue ? `theme-${activeThemeValue}` : "",
          isScaled ? "theme-scaled" : "",
          fontVariables
        )}
      >
        <NextTopLoader color="var(--primary)" showSpinner={false} />
        <NuqsAdapter>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            enableColorScheme
          >
            <Providers activeThemeValue={activeThemeValue as string}>
              <Toaster />
              {children}
            </Providers>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
