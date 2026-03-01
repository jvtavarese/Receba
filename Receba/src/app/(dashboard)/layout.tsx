import { createServerSupabaseClient } from "@/lib/supabase-server";
import { LogoutButton } from "@/components/logout-button";
import { NavLinks } from "@/components/nav-links";
import { MobileNav } from "@/components/mobile-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-card/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <MobileNav />
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Receba"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <h1 className="text-lg font-bold tracking-tight">Receba</h1>
            </div>
            <div className="hidden md:block h-5 w-px bg-border" />
            <NavLinks className="hidden md:flex" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline font-mono text-xs">
              {user?.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
