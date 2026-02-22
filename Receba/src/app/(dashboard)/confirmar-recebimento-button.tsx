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
      className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium transition-colors disabled:opacity-50"
    >
      <Check className="h-3.5 w-3.5" />
      {loading ? "..." : "Confirmar"}
    </button>
  );
}
