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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2 sm:col-span-2">
          <Label className="font-semibold">Empresa</Label>
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
          <Label htmlFor="valor_total" className="font-semibold">Valor Total (R$)</Label>
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
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="data_faturamento" className="font-semibold">Data de Faturamento</Label>
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
          <Label htmlFor="qtd_parcelas" className="font-semibold">Parcelas</Label>
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
          <Label htmlFor="prazo_dias" className="font-semibold">Prazo entre parcelas (dias)</Label>
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

      {/* Preview de duplicatas */}
      {preview.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Preview dos Recebimentos</h3>
            {comissao > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-primary">
                Comissão: {formatCurrency(comissao)}
              </span>
            )}
          </div>
          <div className="rounded-xl border bg-slate-50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parcela</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Pagamento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.map((d) => (
                  <TableRow key={d.numero_parcela}>
                    <TableCell>{d.numero_parcela}/{preview.length}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(d.valor)}
                    </TableCell>
                    <TableCell>{formatDate(d.data_vencimento)}</TableCell>
                    <TableCell>{formatDate(d.data_real_pagamento)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading || preview.length === 0}>
          {loading ? "Salvando..." : "Confirmar Pedido"}
        </Button>
      </div>
    </form>
  );
}
