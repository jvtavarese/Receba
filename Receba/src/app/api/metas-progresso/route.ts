import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "../middleware";

export async function GET(request: NextRequest) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  const hoje = new Date();
  const mes = hoje.getMonth() + 1;
  const ano = hoje.getFullYear();

  const inicioMes = new Date(ano, mes - 1, 1);
  const fimMes = new Date(ano, mes, 0, 23, 59, 59);

  const empresas = await prisma.empresa.findMany({
    orderBy: { nome: "asc" },
    include: {
      metas: { where: { mes, ano }, take: 1 },
      pedidos: {
        where: { data_faturamento: { gte: inicioMes, lte: fimMes } },
      },
    },
  });

  const progresso = empresas.map((e) => {
    const meta = e.metas[0];
    const vendido = e.pedidos.reduce((sum, p) => sum + Number(p.valor_total), 0);
    const valorMeta = meta ? Number(meta.valor_meta) : 0;

    return {
      empresa: e.nome,
      vendido,
      meta: valorMeta,
      progresso_pct: valorMeta > 0 ? (vendido / valorMeta) * 100 : null,
    };
  });

  return NextResponse.json({
    mes,
    ano,
    empresas: progresso,
    total_vendido: progresso.reduce((sum, p) => sum + p.vendido, 0),
    total_meta: progresso.reduce((sum, p) => sum + p.meta, 0),
  });
}
