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
import { Plus } from "lucide-react";

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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Pedidos</h2>
          <p className="text-sm text-muted-foreground">Gerencie seus pedidos e parcelas</p>
        </div>
        <Link href="/pedidos/novo">
          <Button>
            <Plus className="h-4 w-4" />
            Novo Pedido
          </Button>
        </Link>
      </div>

      <PedidosFilters
        empresas={empresas.map((e) => ({ id: e.id, nome: e.nome }))}
      />

      {pedidos.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          Nenhum pedido encontrado.
        </p>
      ) : (
        <div className="rounded-xl border bg-card overflow-x-auto shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Faturamento</TableHead>
                <TableHead className="text-center">Parcelas</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidos.map((pedido) => (
                <TableRow key={pedido.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CompanyAvatar name={pedido.empresa.nome} size="sm" />
                      <span className="font-medium">{pedido.empresa.nome}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(Number(pedido.valor_total))}
                  </TableCell>
                  <TableCell>
                    {formatDate(pedido.data_faturamento)}
                  </TableCell>
                  <TableCell className="text-center">
                    {pedido.qtd_parcelas}x / {pedido.prazo_dias}d
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
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
      )}
    </div>
  );
}
