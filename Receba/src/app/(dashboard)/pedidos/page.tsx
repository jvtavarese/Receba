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
import { getPedidos } from "./actions";
import { PedidosFilters } from "./pedidos-filters";
import { PedidoDetailDialog } from "./pedido-detail-dialog";
import { EditPedidoDialog } from "./edit-pedido-dialog";
import { DeletePedidoButton } from "./delete-pedido-button";
import { CompanyAvatar } from "@/components/company-avatar";
import { Plus, ShoppingBag } from "lucide-react";

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("pt-BR");
}

function formatCurrency(value: string | number): string {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: { empresa_id?: string; data_inicio?: string; data_fim?: string };
}) {
  const [pedidos, empresas] = await Promise.all([
    getPedidos({
      empresa_id: searchParams.empresa_id,
      data_inicio: searchParams.data_inicio,
      data_fim: searchParams.data_fim,
    }),
    prisma.empresa.findMany({ orderBy: { nome: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pedidos</h2>
          <p className="text-sm text-muted-foreground mt-1">Gerencie seus pedidos e parcelas</p>
        </div>
        <Link href="/pedidos/novo">
          <Button className="shadow-md shadow-primary/20 font-semibold">
            <Plus className="h-4 w-4" />
            Novo Pedido
          </Button>
        </Link>
      </div>

      <PedidosFilters
        empresas={empresas.map((e) => ({ id: e.id, nome: e.nome }))}
      />

      {pedidos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-muted mb-4">
            <ShoppingBag className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">Nenhum pedido encontrado.</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Crie um novo pedido para começar</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold">Empresa</TableHead>
                  <TableHead className="text-right font-semibold">Valor</TableHead>
                  <TableHead className="font-semibold">Faturamento</TableHead>
                  <TableHead className="text-center font-semibold">Parcelas</TableHead>
                  <TableHead className="text-right font-semibold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidos.map((pedido) => (
                  <TableRow key={pedido.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <CompanyAvatar name={pedido.empresa.nome} size="sm" />
                        <span className="font-medium">{pedido.empresa.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-mono text-sm">
                      {formatCurrency(Number(pedido.valor_total))}
                    </TableCell>
                    <TableCell className="tabular-nums text-sm">
                      {formatDate(pedido.data_faturamento)}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium tabular-nums">
                        {pedido.qtd_parcelas}x / {pedido.prazo_dias}d
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-0.5">
                        <PedidoDetailDialog
                          pedido={{
                            ...pedido,
                            valor_total: Number(pedido.valor_total),
                            empresa: {
                              nome: pedido.empresa.nome,
                              percentual_comissao: Number(
                                pedido.empresa.percentual_comissao
                              ),
                            },
                            duplicatas: pedido.duplicatas.map((d) => ({
                              ...d,
                              valor: Number(d.valor),
                            })),
                          }}
                        />
                        <EditPedidoDialog
                          pedido={{
                            ...pedido,
                            valor_total: Number(pedido.valor_total),
                            empresa: { nome: pedido.empresa.nome },
                          }}
                        />
                        <DeletePedidoButton
                          id={pedido.id}
                          empresaNome={pedido.empresa.nome}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
