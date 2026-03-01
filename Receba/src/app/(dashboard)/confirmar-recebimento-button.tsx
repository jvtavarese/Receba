"use client";

import { useState } from "react";
import { confirmarRecebimento } from "./recebiveis-actions";
import { Check } from "lucide-react";

export function ConfirmarRecebimentoButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await confirmarRecebimento(id);
    setLoading(false);
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 bg-accent hover:bg-accent/80 rounded-lg px-2.5 py-1.5 transition-all disabled:opacity-50 active:scale-95"
    >
      {loading ? (
        <div className="h-3 w-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      ) : (
        <Check className="h-3 w-3" />
      )}
      {loading ? "..." : "Confirmar"}
    </button>
  );
}
