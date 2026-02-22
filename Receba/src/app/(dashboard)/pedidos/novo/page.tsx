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
      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
        <Link href="/pedidos" className="hover:text-foreground transition-colors">
          Pedidos
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">Novo Pedido</span>
      </div>

      <h2 className="text-2xl font-bold mb-6">Novo Pedido</h2>

      {empresas.length === 0 ? (
        <p className="text-muted-foreground">
          Cadastre pelo menos uma empresa antes de registrar pedidos.
        </p>
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
