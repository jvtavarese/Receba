"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MetaFormDialog } from "./meta-form-dialog";
import { CompanyAvatar } from "@/components/company-avatar";
import { TrendingUp } from "lucide-react";

interface MetaProgresso {
  empresa_id: string;
  empresa_nome: string;
  meta_id: string | null;
  valor_meta: number;
  vendido: number;
  progresso: number;
  progressoReal: number;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

const meses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export function MetasContent({
  dados,
  mes,
  ano,
}: {
  dados: MetaProgresso[];
  mes: number;
  ano: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleMes(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("mes", value);
    router.push(`/metas?${params.toString()}`);
  }

  function handleAno(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("ano", value);
    router.push(`/metas?${params.toString()}`);
  }

  const totalVendido = dados.reduce((sum, d) => sum + d.vendido, 0);
  const totalMeta = dados.reduce((sum, d) => sum + d.valor_meta, 0);
  const progressoGeral = totalMeta > 0 ? (totalVendido / totalMeta) * 100 : 0;

  const anoAtual = new Date().getFullYear();
  const anos = [anoAtual - 1, anoAtual, anoAtual + 1];

  return (
    <div className="space-y-6">
      {/* Seletor de mês/ano */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex items-end gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Mês</Label>
            <Select value={String(mes)} onValueChange={handleMes}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {meses.map((nome, i) => (
                  <SelectItem key={i} value={String(i + 1)}>
                    {nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Ano</Label>
            <Select value={String(ano)} onValueChange={handleAno}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {anos.map((a) => (
                  <SelectItem key={a} value={String(a)}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Totalizador geral */}
      {totalMeta > 0 && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 text-primary">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold">Total Geral</span>
            </div>
            <span className="text-sm text-muted-foreground font-mono tabular-nums">
              {formatCurrency(totalVendido)} / {formatCurrency(totalMeta)}
              <span className="ml-2 font-semibold text-foreground">({progressoGeral.toFixed(1)}%)</span>
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-700 ease-out ${
                progressoGeral >= 100 ? "bg-emerald-500" : "bg-primary"
              }`}
              style={{ width: `${Math.min(progressoGeral, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Progresso por empresa */}
      <div className="space-y-3 stagger-children">
        {dados.map((d) => (
          <div key={d.empresa_id} className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <CompanyAvatar name={d.empresa_nome} size="sm" />
                <span className="font-semibold">{d.empresa_nome}</span>
                {d.valor_meta > 0 && (
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${
                      d.progressoReal >= 100
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-500/20"
                        : "bg-accent text-accent-foreground ring-primary/20"
                    }`}
                  >
                    {d.progressoReal >= 100 ? "Atingido" : "Em andamento"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground font-mono tabular-nums">
                  {d.valor_meta > 0
                    ? `${formatCurrency(d.vendido)} / ${formatCurrency(d.valor_meta)} (${d.progressoReal.toFixed(1)}%)`
                    : `${formatCurrency(d.vendido)} — sem meta`}
                </span>
                <MetaFormDialog
                  empresa_id={d.empresa_id}
                  empresa_nome={d.empresa_nome}
                  mes={mes}
                  ano={ano}
                  valorAtual={d.valor_meta}
                />
              </div>
            </div>
            {d.valor_meta > 0 && (
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all duration-700 ease-out ${
                    d.progressoReal >= 100 ? "bg-emerald-500" : "bg-primary"
                  }`}
                  style={{ width: `${d.progresso}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
