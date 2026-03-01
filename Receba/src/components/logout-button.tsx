"use client";

import { logout } from "@/app/(auth)/login/actions";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <button
      onClick={() => logout()}
      className="inline-flex items-center justify-center gap-2 h-8 px-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
    >
      <LogOut className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Sair</span>
    </button>
  );
}
