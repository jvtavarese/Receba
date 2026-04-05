"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { upsertMeta } from "./actions";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

interface MetaFormDialogProps {
  empresa_id: string;
  empresa_nome: string;
  mes: number;
  ano: number;
  valorAtual: number;
}

export function MetaFormDialog({
  empresa_id,
  empresa_nome,
  mes,
  ano,
  valorAtual,
}: MetaFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);

    formData.set("empresa_id", empresa_id);
    formData.set("mes", String(mes));
    formData.set("ano", String(ano));

    startTransition(async () => {
      const result = await upsertMeta(formData);

      if (result?.error) {
        setError(result.error);
        toast.error("Erro ao salvar meta");
        return;
      }

      toast.success("Meta salva com sucesso");
      setOpen(false);
    });
  }

  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Editar meta de ${empresa_nome}`}>
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Meta — {empresa_nome} ({meses[mes - 1]} {ano})
          </DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="valor_meta">Valor da Meta (R$)</Label>
            <Input
              id="valor_meta"
              name="valor_meta"
              type="number"
              step="0.01"
              min="0.01"
              required
              defaultValue={valorAtual > 0 ? valorAtual : undefined}
              placeholder="Ex: 50000.00"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending} className={isPending ? "cursor-wait" : ""}>
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
