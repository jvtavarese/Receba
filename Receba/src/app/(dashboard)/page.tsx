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
import { CalendarDays, Clock, CalendarCheck, AlertTriangle, Plus } from "lucide-react";

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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Recebíveis</h2>
          <p className="text-sm text-muted-foreground">Acompanhe suas duplicatas e comissões</p>
        </div>
        <Link href="/pedidos/novo">
          <Button>
            <Plus className="h-4 w-4" />
            Novo Pedido
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-blue-100 text-blue-600">
              <CalendarDays className="h-4 w-4" />
            </div>
            <p className="text-sm text-muted-foreground">Esta semana</p>
          </div>
          <p className="text-xl font-bold">{formatCurrency(resumo.semanaAtual.total)}</p>
          <p className="text-xs text-muted-foreground">{resumo.semanaAtual.count} duplicata(s)</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-violet-100 text-violet-600">
              <Clock className="h-4 w-4" />
            </div>
            <p className="text-sm text-muted-foreground">Próxima semana</p>
          </div>
          <p className="text-xl font-bold">{formatCurrency(resumo.proxSemana.total)}</p>
          <p className="text-xs text-muted-foreground">{resumo.proxSemana.count} duplicata(s)</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-emerald-100 text-emerald-600">
              <CalendarCheck className="h-4 w-4" />
            </div>
            <p className="text-sm text-muted-foreground">Este mês</p>
          </div>
          <p className="text-xl font-bold">{formatCurrency(resumo.mes.total)}</p>
          <p className="text-xs text-muted-foreground">{resumo.mes.count} duplicata(s)</p>
        </div>
        <div className={`rounded-xl border p-4 shadow-sm ${resumo.atrasados.count > 0 ? "bg-red-50 border-red-200" : "bg-card"}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`flex items-center justify-center h-9 w-9 rounded-lg ${resumo.atrasados.count > 0 ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"}`}>
              <AlertTriangle className="h-4 w-4" />
            </div>
            <p className={`text-sm ${resumo.atrasados.count > 0 ? "text-red-600" : "text-muted-foreground"}`}>Atrasados</p>
          </div>
          <p className={`text-xl font-bold ${resumo.atrasados.count > 0 ? "text-red-600" : ""}`}>{formatCurrency(resumo.atrasados.total)}</p>
          <p className={`text-xs ${resumo.atrasados.count > 0 ? "text-red-500" : "text-muted-foreground"}`}>{resumo.atrasados.count} duplicata(s)</p>
        </div>
      </div>

      <RecebiveisFilters
        empresas={empresas.map((e) => ({ id: e.id, nome: e.nome }))}
      />

      {duplicatas.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          Nenhuma duplicata encontrada.
        </p>
      ) : (
        <div className="rounded-xl border bg-card overflow-x-auto shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Comissão</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ação</TableHead>
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
                    className={atrasado ? "bg-red-50" : undefined}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CompanyAvatar name={d.pedido.empresa.nome} size="sm" />
                        <span className="font-medium">{d.pedido.empresa.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(d.valor))}
                    </TableCell>
                    <TableCell className="text-right text-primary font-medium">
                      {formatCurrency(comissao)}
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
      )}
    </div>
  );
}
