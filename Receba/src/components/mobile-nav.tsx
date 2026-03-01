"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X, Receipt, ShoppingBag, Target, Building2 } from "lucide-react";

const links = [
  { href: "/", label: "Recebíveis", icon: Receipt },
  { href: "/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/metas", label: "Metas", icon: Target },
  { href: "/empresas", label: "Empresas", icon: Building2 },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        aria-label="Menu"
        className="h-9 w-9 p-0"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-16 left-0 right-0 bg-card border-b shadow-lg z-50 p-3 animate-fade-in-up">
            <nav className="flex flex-col gap-0.5">
              {links.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);

                const Icon = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "text-primary bg-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
