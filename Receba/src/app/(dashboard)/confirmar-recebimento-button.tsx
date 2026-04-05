"use client";

import { useTransition } from "react";
import { confirmarRecebimento } from "./recebiveis-actions";
import { Check } from "lucide-react";
import { toast } from "sonner";

export function ConfirmarRecebimentoButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      try {
        await confirmarRecebimento(id);
        toast.success("Recebimento confirmado");
      } catch {
        toast.error("Erro ao confirmar recebimento");
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 bg-accent hover:bg-accent/80 rounded-lg px-2.5 py-1.5 transition-all disabled:opacity-50 active:scale-95 ${isPending ? "cursor-wait" : ""}`}
    >
      {isPending ? (
        <div className="h-3 w-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      ) : (
        <Check className="h-3 w-3" />
      )}
      {isPending ? "..." : "Confirmar"}
    </button>
  );
}
