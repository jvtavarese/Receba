import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "../middleware";

export async function GET(request: NextRequest) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  // Início da semana (segunda)
  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(hoje.getDate() - ((hoje.getDay() + 6) % 7));

  // Fim da semana (domingo)
  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(inicioSemana.getDate() + 6);
  fimSemana.setHours(23, 59, 59);

  const pedidos = await prisma.pedido.findMany({
    where: {
      data_faturamento: { gte: inicioSemana, lte: fimSemana },
    },
    include: { empresa: { select: { nome: true } } },
    orderBy: { data_faturamento: "asc" },
  });

  const porEmpresa = pedidos.reduce(
    (acc, p) => {
      const nome = p.empresa.nome;
      if (!acc[nome]) acc[nome] = { total: 0, pedidos: 0 };
      acc[nome].total += Number(p.valor_total);
      acc[nome].pedidos += 1;
      return acc;
    },
    {} as Record<string, { total: number; pedidos: number }>
  );

  return NextResponse.json({
    periodo: {
      inicio: inicioSemana.toISOString().split("T")[0],
      fim: fimSemana.toISOString().split("T")[0],
    },
    por_empresa: porEmpresa,
    total_geral: Object.values(porEmpresa).reduce((sum, v) => sum + v.total, 0),
  });
}
