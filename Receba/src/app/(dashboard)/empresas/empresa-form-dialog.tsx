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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createEmpresa, updateEmpresa } from "./actions";

interface EmpresaFormDialogProps {
  empresa?: {
    id: string;
    nome: string;
    percentual_comissao: string | number;
    modo_pagamento: string;
    dia_fixo_pagamento: number | null;
  };
  trigger?: React.ReactNode;
}

export function EmpresaFormDialog({ empresa, trigger }: EmpresaFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [modoPagamento, setModoPagamento] = useState(
    empresa?.modo_pagamento ?? "data_exata"
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isEditing = !!empresa;

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);

    formData.set("modo_pagamento", modoPagamento);
    if (modoPagamento === "data_exata") {
      formData.delete("dia_fixo_pagamento");
    }

    const result = isEditing
      ? await updateEmpresa(empresa.id, formData)
      : await createEmpresa(formData);

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
        {trigger ?? <Button>{isEditing ? "Editar" : "Nova Empresa"}</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Empresa" : "Nova Empresa"}
          </DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              name="nome"
              required
              defaultValue={empresa?.nome}
              placeholder="Nome da empresa"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="percentual_comissao">Comissão (%)</Label>
            <Input
              id="percentual_comissao"
              name="percentual_comissao"
              type="number"
              step="0.01"
              min="0"
              max="100"
              required
              defaultValue={empresa?.percentual_comissao?.toString()}
              placeholder="Ex: 5.00"
            />
          </div>

          <div className="space-y-2">
            <Label>Modo de Pagamento</Label>
            <Select value={modoPagamento} onValueChange={setModoPagamento}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="data_exata">Data Exata</SelectItem>
                <SelectItem value="dia_fixo">Dia Fixo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {modoPagamento === "dia_fixo" && (
            <div className="space-y-2">
              <Label htmlFor="dia_fixo_pagamento">Dia Fixo de Pagamento</Label>
              <Input
                id="dia_fixo_pagamento"
                name="dia_fixo_pagamento"
                type="number"
                min="1"
                max="31"
                required
                defaultValue={empresa?.dia_fixo_pagamento?.toString()}
                placeholder="Ex: 5"
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

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
