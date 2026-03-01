"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Receipt, ShoppingBag, Target, Building2 } from "lucide-react";

const links = [
  { href: "/", label: "Recebíveis", icon: Receipt },
  { href: "/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/metas", label: "Metas", icon: Target },
  { href: "/empresas", label: "Empresas", icon: Building2 },
];

export function NavLinks({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex gap-0.5", className)}>
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
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200",
              isActive
                ? "text-primary bg-accent"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
