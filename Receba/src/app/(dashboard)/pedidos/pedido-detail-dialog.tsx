"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { Eye } from "lucide-react";

interface Duplicata {
  id: string;
  numero_parcela: number;
  valor: string | number;
  data_vencimento: string | Date;
  data_real_pagamento: string | Date;
  status: string;
  data_confirmacao: string | Date | null;
}

interface PedidoDetailDialogProps {
  pedido: {
    id: string;
    valor_total: string | number;
    data_faturamento: string | Date;
    qtd_parcelas: number;
    prazo_dias: number;
    empresa: { nome: string; percentual_comissao: string | number };
    duplicatas: Duplicata[];
  };
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("pt-BR");
}

function formatCurrency(value: string | number): string {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function PedidoDetailDialog({ pedido }: PedidoDetailDialogProps) {
  const comissao =
    (Number(pedido.valor_total) * Number(pedido.empresa.percentual_comissao)) /
    100;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Pedido — {pedido.empresa.nome}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
          <div>
            <span className="text-muted-foreground">Valor Total:</span>{" "}
            {formatCurrency(pedido.valor_total)}
          </div>
          <div>
            <span className="text-muted-foreground">Comissão:</span>{" "}
            <span className="text-primary font-medium">{formatCurrency(comissao)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Faturamento:</span>{" "}
            {formatDate(pedido.data_faturamento)}
          </div>
          <div>
            <span className="text-muted-foreground">Parcelas:</span>{" "}
            {pedido.qtd_parcelas}x / {pedido.prazo_dias} dias
          </div>
        </div>

        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parcela</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedido.duplicatas.map((d) => {
                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);
                const dataReal = new Date(d.data_real_pagamento);
                const atrasado = d.status === "pendente" && dataReal < hoje;

                return (
                  <TableRow key={d.id}>
                    <TableCell>
                      {d.numero_parcela}/{pedido.qtd_parcelas}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(d.valor)}
                    </TableCell>
                    <TableCell>{formatDate(d.data_real_pagamento)}</TableCell>
                    <TableCell>
                      <StatusBadge
                        status={
                          d.status === "recebido"
                            ? "recebido"
                            : atrasado
                            ? "atrasado"
                            : "pendente"
                        }
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
