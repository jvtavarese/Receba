"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { calcularDuplicatas, type DuplicataPreview } from "@/lib/duplicatas";
import { createPedido } from "./actions";

interface Empresa {
  id: string;
  nome: string;
  percentual_comissao: string | number;
  modo_pagamento: string;
  dia_fixo_pagamento: number | null;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR");
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function PedidoForm({ empresas }: { empresas: Empresa[] }) {
  const router = useRouter();
  const [empresaId, setEmpresaId] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [dataFaturamento, setDataFaturamento] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [qtdParcelas, setQtdParcelas] = useState("1");
  const [prazoDias, setPrazoDias] = useState("30");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const empresaSelecionada = empresas.find((e) => e.id === empresaId);

  const preview = useMemo<DuplicataPreview[]>(() => {
    const valor = Number(valorTotal);
    const parcelas = Number(qtdParcelas);
    const prazo = Number(prazoDias);

    if (!empresaSelecionada || !valor || !parcelas || !prazo || !dataFaturamento) {
      return [];
    }

    return calcularDuplicatas({
      valor_total: valor,
      data_faturamento: new Date(dataFaturamento + "T00:00:00"),
      qtd_parcelas: parcelas,
      prazo_dias: prazo,
      modo_pagamento: empresaSelecionada.modo_pagamento as "data_exata" | "dia_fixo",
      dia_fixo_pagamento: empresaSelecionada.dia_fixo_pagamento,
    });
  }, [empresaSelecionada, valorTotal, dataFaturamento, qtdParcelas, prazoDias]);

  const comissao = empresaSelecionada
    ? (Number(valorTotal) * Number(empresaSelecionada.percentual_comissao)) / 100
    : 0;

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);

    formData.set("empresa_id", empresaId);

    const result = await createPedido(formData);
    setLoading(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    router.push("/pedidos");
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="rounded-xl border bg-card p-5 shadow-sm space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2 sm:col-span-2">
            <Label className="font-semibold text-sm">Empresa</Label>
            <Select value={empresaId} onValueChange={setEmpresaId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a empresa" />
              </SelectTrigger>
              <SelectContent>
                {empresas.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.nome} ({Number(e.percentual_comissao)}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor_total" className="font-semibold text-sm">Valor Total (R$)</Label>
            <Input
              id="valor_total"
              name="valor_total"
              type="number"
              step="0.01"
              min="0.01"
              required
              value={valorTotal}
              onChange={(e) => setValorTotal(e.target.value)}
              placeholder="0,00"
              className="tabular-nums"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_faturamento" className="font-semibold text-sm">Data de Faturamento</Label>
            <Input
              id="data_faturamento"
              name="data_faturamento"
              type="date"
              required
              value={dataFaturamento}
              onChange={(e) => setDataFaturamento(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="qtd_parcelas" className="font-semibold text-sm">Parcelas</Label>
            <Input
              id="qtd_parcelas"
              name="qtd_parcelas"
              type="number"
              min="1"
              required
              value={qtdParcelas}
              onChange={(e) => setQtdParcelas(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prazo_dias" className="font-semibold text-sm">Prazo entre parcelas (dias)</Label>
            <Input
              id="prazo_dias"
              name="prazo_dias"
              type="number"
              min="1"
              required
              value={prazoDias}
              onChange={(e) => setPrazoDias(e.target.value)}
            />
          </div>
        </div>
      </div>

      {preview.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Preview dos Recebimentos</h3>
            {comissao > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground ring-1 ring-primary/20">
                Comissão: <span className="font-mono">{formatCurrency(comissao)}</span>
              </span>
            )}
          </div>
          <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold">Parcela</TableHead>
                  <TableHead className="text-right font-semibold">Valor</TableHead>
                  <TableHead className="font-semibold">Vencimento</TableHead>
                  <TableHead className="font-semibold">Pagamento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.map((d) => (
                  <TableRow key={d.numero_parcela}>
                    <TableCell>
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium tabular-nums">
                        {d.numero_parcela}/{preview.length}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-mono text-sm">
                      {formatCurrency(d.valor)}
                    </TableCell>
                    <TableCell className="tabular-nums text-sm">{formatDate(d.data_vencimento)}</TableCell>
                    <TableCell className="tabular-nums text-sm">{formatDate(d.data_real_pagamento)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading || preview.length === 0}
          className="shadow-md shadow-primary/20 font-semibold"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Salvando...
            </>
          ) : (
            "Confirmar Pedido"
          )}
        </Button>
      </div>
    </form>
  );
}
