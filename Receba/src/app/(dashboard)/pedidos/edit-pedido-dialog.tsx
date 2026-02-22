"use client";

import { useState } from "react";
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
import { updatePedido } from "./actions";
import { Pencil } from "lucide-react";

interface EditPedidoDialogProps {
  pedido: {
    id: string;
    empresa_id: string;
    valor_total: string | number;
    data_faturamento: string | Date;
    qtd_parcelas: number;
    prazo_dias: number;
    empresa: { nome: string };
  };
}

export function EditPedidoDialog({ pedido }: EditPedidoDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const dataFat = new Date(pedido.data_faturamento)
    .toISOString()
    .split("T")[0];

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);

    formData.set("empresa_id", pedido.empresa_id);

    const result = await updatePedido(pedido.id, formData);
    setLoading(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Pedido — {pedido.empresa.nome}</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground mb-2">
          Duplicatas já recebidas serão preservadas. As pendentes serão recalculadas.
        </p>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="valor_total">Valor Total (R$)</Label>
            <Input
              id="valor_total"
              name="valor_total"
              type="number"
              step="0.01"
              min="0.01"
              required
              defaultValue={Number(pedido.valor_total)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_faturamento">Data de Faturamento</Label>
            <Input
              id="data_faturamento"
              name="data_faturamento"
              type="date"
              required
              defaultValue={dataFat}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qtd_parcelas">Parcelas</Label>
              <Input
                id="qtd_parcelas"
                name="qtd_parcelas"
                type="number"
                min="1"
                required
                defaultValue={pedido.qtd_parcelas}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prazo_dias">Prazo (dias)</Label>
              <Input
                id="prazo_dias"
                name="prazo_dias"
                type="number"
                min="1"
                required
                defaultValue={pedido.prazo_dias}
              />
            </div>
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
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
