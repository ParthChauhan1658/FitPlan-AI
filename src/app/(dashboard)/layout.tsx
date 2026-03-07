"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Sparkles,
  Settings,
  Menu,
  X,
  TrendingUp,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { useUserProfile } from "@/hooks/use-user-profile";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatProvider } from "@/context/ChatContext";
import { NutritionistChat } from "@/components/chat/NutritionistChat";

const NAV_ITEMS: { href: string; label: string; icon: LucideIcon; badge?: string }[] = [
  { href: "/dashboard",    label: "Dashboard",  icon: LayoutDashboard },
  { href: "/meal-plans",   label: "Meal Plans", icon: UtensilsCrossed },
  { href: "/meal-plans/new", label: "Generate", icon: Sparkles, badge: "AI" },
  { href: "/progress",     label: "Progress",   icon: TrendingUp },
  { href: "/insights",     label: "Insights",   icon: BarChart3 },
  { href: "/settings",     label: "Settings",   icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { hasProfile, isLoading } = useUserProfile();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !hasProfile) {
      router.push("/onboarding");
    }
  }, [hasProfile, isLoading, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="h-screen flex bg-brand-dark overflow-hidden">
        {/* Sidebar skeleton */}
        <div className="hidden md:flex w-64 flex-col border-r border-brand-border bg-brand-dark p-4 space-y-4">
          <div className="flex items-center gap-2.5 px-1 h-12">
            <Image
              src="/logo/fitplan-icon.png"
              alt="FitPlan AI"
              width={24}
              height={24}
              className="w-6 h-6 object-contain opacity-60"
            />
            <Skeleton className="h-4 w-24 bg-white/5" />
          </div>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-10 w-full bg-white/5 rounded-xl" />
          ))}
        </div>
        {/* Main skeleton with centered stacked logo */}
        <div className="flex-1 flex flex-col items-center justify-center gap-8 p-6">
          <Image
            src="/logo/fitplan-logo-stacked.png"
            alt="FitPlan AI"
            width={96}
            height={112}
            className="object-contain opacity-60 animate-pulse"
            priority
          />
          <div className="w-full max-w-2xl space-y-4">
            <Skeleton className="h-8 w-48 bg-white/5 mx-auto rounded-xl" />
            <Skeleton className="h-40 w-full bg-white/5 rounded-2xl" />
            <Skeleton className="h-24 w-full bg-white/5 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <ChatProvider>
    <div className="h-screen flex bg-transparent overflow-hidden">
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-16 border-b border-brand-border bg-brand-dark/95 backdrop-blur-md md:hidden">
        <Link href="/dashboard" className="flex items-center">
          <Image
            src="/logo/fitplan-logo-full.png"
            alt="FitPlan AI"
            width={120}
            height={30}
            className="h-7 w-auto object-contain"
            priority
          />
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              id="mobile-nav"
              className="fixed top-0 left-0 z-50 h-full w-64 bg-brand-dark border-r border-brand-border flex flex-col md:hidden"
              initial={{ x: -264 }}
              animate={{ x: 0 }}
              exit={{ x: -264 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
            >
              <SidebarContent pathname={pathname} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-brand-border bg-brand-dark flex-shrink-0 relative z-10">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0 min-w-0">
        <motion.div
          key={pathname}
          className="p-6 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
        >
          {children}
        </motion.div>
      </main>

      {/* AI Nutritionist Chat — floating button + panel */}
      <NutritionistChat />
    </div>
    </ChatProvider>
  );
}

function SidebarContent({ pathname }: { pathname: string }) {
  return (
    <>
      {/* Logo */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2.5 px-5 h-16 border-b border-brand-border flex-shrink-0 hover:opacity-90 transition-opacity"
      >
        <Image
          src="/logo/fitplan-icon.png"
          alt=""
          width={28}
          height={28}
          className="w-7 h-7 object-contain flex-shrink-0"
          aria-hidden="true"
        />
        <Image
          src="/logo/fitplan-wordmark.png"
          alt="FitPlan AI"
          width={100}
          height={20}
          className="h-5 w-auto object-contain"
        />
      </Link>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1" role="navigation" aria-label="Dashboard navigation">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href) && item.href !== "/meal-plans/new");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-brand-teal/10 text-brand-teal border border-brand-teal/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon
                className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? "text-brand-teal" : "text-gray-500 group-hover:text-gray-300"}`}
                aria-hidden="true"
              />
              {item.label}
              {item.badge && (
                <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-brand-teal/20 text-brand-teal font-semibold">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-4 py-4 border-t border-brand-border">
        <div className="flex items-center gap-3">
          <UserButton afterSignOutUrl="/" />
          <span className="text-gray-400 text-sm">Account</span>
        </div>
      </div>
    </>
  );
}
