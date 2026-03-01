import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { getDuplicatas, getResumoRecebiveis } from "./recebiveis-actions";
import { RecebiveisFilters } from "./recebiveis-filters";
import { ConfirmarRecebimentoButton } from "./confirmar-recebimento-button";
import { CompanyAvatar } from "@/components/company-avatar";
import { StatusBadge } from "@/components/status-badge";
import { CalendarDays, Clock, CalendarCheck, AlertTriangle, Plus, Receipt } from "lucide-react";

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("pt-BR");
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: {
    empresa_id?: string;
    status?: string;
    data_inicio?: string;
    data_fim?: string;
  };
}) {
  const [duplicatas, resumo, empresas] = await Promise.all([
    getDuplicatas({
      empresa_id: searchParams.empresa_id,
      status: searchParams.status,
      data_inicio: searchParams.data_inicio,
      data_fim: searchParams.data_fim,
    }),
    getResumoRecebiveis(),
    prisma.empresa.findMany({ orderBy: { nome: "asc" } }),
  ]);

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Recebíveis</h2>
          <p className="text-sm text-muted-foreground mt-1">Acompanhe suas duplicatas e comissões</p>
        </div>
        <Link href="/pedidos/novo">
          <Button className="shadow-md shadow-primary/20 font-semibold">
            <Plus className="h-4 w-4" />
            Novo Pedido
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 stagger-children">
        <div className="group rounded-xl border bg-card p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-sky-100 text-sky-600 transition-transform group-hover:scale-105">
              <CalendarDays className="h-5 w-5" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">Esta semana</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold tabular-nums font-mono">{formatCurrency(resumo.semanaAtual.total)}</p>
          <p className="text-xs text-muted-foreground mt-1">{resumo.semanaAtual.count} duplicata(s)</p>
        </div>

        <div className="group rounded-xl border bg-card p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-violet-100 text-violet-600 transition-transform group-hover:scale-105">
              <Clock className="h-5 w-5" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">Próxima semana</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold tabular-nums font-mono">{formatCurrency(resumo.proxSemana.total)}</p>
          <p className="text-xs text-muted-foreground mt-1">{resumo.proxSemana.count} duplicata(s)</p>
        </div>

        <div className="group rounded-xl border bg-card p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 transition-transform group-hover:scale-105">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">Este mês</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold tabular-nums font-mono">{formatCurrency(resumo.mes.total)}</p>
          <p className="text-xs text-muted-foreground mt-1">{resumo.mes.count} duplicata(s)</p>
        </div>

        <div className={`group rounded-xl border p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 ${resumo.atrasados.count > 0 ? "bg-red-50/80 border-red-200" : "bg-card"}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`flex items-center justify-center h-10 w-10 rounded-xl transition-transform group-hover:scale-105 ${resumo.atrasados.count > 0 ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"}`}>
              <AlertTriangle className="h-5 w-5" />
            </div>
            <p className={`text-sm font-medium ${resumo.atrasados.count > 0 ? "text-red-600" : "text-muted-foreground"}`}>Atrasados</p>
          </div>
          <p className={`text-xl sm:text-2xl font-bold tabular-nums font-mono ${resumo.atrasados.count > 0 ? "text-red-600" : ""}`}>{formatCurrency(resumo.atrasados.total)}</p>
          <p className={`text-xs mt-1 ${resumo.atrasados.count > 0 ? "text-red-500" : "text-muted-foreground"}`}>{resumo.atrasados.count} duplicata(s)</p>
        </div>
      </div>

      <RecebiveisFilters
        empresas={empresas.map((e) => ({ id: e.id, nome: e.nome }))}
      />

      {duplicatas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-muted mb-4">
            <Receipt className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">Nenhuma duplicata encontrada.</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Ajuste os filtros ou crie um novo pedido</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold">Empresa</TableHead>
                  <TableHead className="text-right font-semibold">Valor</TableHead>
                  <TableHead className="text-right font-semibold">Comissão</TableHead>
                  <TableHead className="font-semibold">Pagamento</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {duplicatas.map((d) => {
                  const dataReal = new Date(d.data_real_pagamento);
                  const atrasado = d.status === "pendente" && dataReal < hoje;
                  const comissao =
                    (Number(d.valor) *
                      Number(d.pedido.empresa.percentual_comissao)) /
                    100;

                  return (
                    <TableRow
                      key={d.id}
                      className={atrasado ? "bg-red-50/50" : undefined}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <CompanyAvatar name={d.pedido.empresa.nome} size="sm" />
                          <span className="font-medium">{d.pedido.empresa.nome}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-mono text-sm">
                        {formatCurrency(Number(d.valor))}
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-mono text-sm text-primary font-semibold">
                        {formatCurrency(comissao)}
                      </TableCell>
                      <TableCell className="tabular-nums text-sm">{formatDate(d.data_real_pagamento)}</TableCell>
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
                      <TableCell className="text-right">
                        {d.status === "pendente" && (
                          <ConfirmarRecebimentoButton id={d.id} />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
