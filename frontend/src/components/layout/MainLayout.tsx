"use client";

import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useUIStore } from "@/store/useUIStore";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setSearchOpen]);

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar />

        <main className="relative flex flex-1 flex-col overflow-hidden">
          <header className="flex h-14 items-center justify-between px-4 shrink-0 bg-background/50 backdrop-blur-md z-20">
            <div className="flex items-center gap-3">
              <SidebarTrigger />

              <div className="ml-2 flex items-center gap-2">
                <span className="text-sm font-medium text-zinc-500">
                  GPT-5.2
                </span>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold dark:bg-zinc-800">
                  PRO
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </header>

          <section className="flex-1 flex flex-col min-h-0">
            {children}
          </section>
        </main>
      </div>
    </SidebarProvider>
  );
}
