import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PedidoForm } from "./pedido-form";
import { ChevronRight } from "lucide-react";

export default async function NovoPedidoPage() {
  const empresas = await prisma.empresa.findMany({
    orderBy: { nome: "asc" },
  });

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link href="/pedidos" className="hover:text-foreground transition-colors">
          Pedidos
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">Novo Pedido</span>
      </div>

      <h2 className="text-2xl font-bold tracking-tight mb-6">Novo Pedido</h2>

      {empresas.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            Cadastre pelo menos uma empresa antes de registrar pedidos.
          </p>
        </div>
      ) : (
        <PedidoForm
          empresas={empresas.map((e) => ({
            id: e.id,
            nome: e.nome,
            percentual_comissao: Number(e.percentual_comissao),
            modo_pagamento: e.modo_pagamento,
            dia_fixo_pagamento: e.dia_fixo_pagamento,
          }))}
        />
      )}
    </div>
  );
}
