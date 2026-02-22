import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "../middleware";

export async function GET(request: NextRequest) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  // Próxima segunda
  const diasAteSegunda = ((1 - hoje.getDay() + 7) % 7) || 7;
  const inicioProxSemana = new Date(hoje);
  inicioProxSemana.setDate(hoje.getDate() + diasAteSegunda);

  // Próximo domingo
  const fimProxSemana = new Date(inicioProxSemana);
  fimProxSemana.setDate(inicioProxSemana.getDate() + 6);
  fimProxSemana.setHours(23, 59, 59);

  const duplicatas = await prisma.duplicata.findMany({
    where: {
      status: "pendente",
      data_real_pagamento: { gte: inicioProxSemana, lte: fimProxSemana },
    },
    include: {
      pedido: { include: { empresa: { select: { nome: true } } } },
    },
    orderBy: { data_real_pagamento: "asc" },
  });

  return NextResponse.json({
    periodo: {
      inicio: inicioProxSemana.toISOString().split("T")[0],
      fim: fimProxSemana.toISOString().split("T")[0],
    },
    duplicatas: duplicatas.map((d) => ({
      empresa: d.pedido.empresa.nome,
      valor: Number(d.valor),
      data_pagamento: new Date(d.data_real_pagamento).toISOString().split("T")[0],
      parcela: d.numero_parcela,
    })),
    total: duplicatas.reduce((sum, d) => sum + Number(d.valor), 0),
  });
}
