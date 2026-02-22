"use client";

import { logout } from "@/app/(auth)/login/actions";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <button
      onClick={() => logout()}
      className="inline-flex items-center justify-center gap-2 h-9 px-3 rounded-lg text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">Sair</span>
    </button>
  );
}
