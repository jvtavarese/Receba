import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "../middleware";

export async function GET(request: NextRequest) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const duplicatas = await prisma.duplicata.findMany({
    where: {
      status: "pendente",
      data_real_pagamento: { lt: hoje },
    },
    include: {
      pedido: { include: { empresa: { select: { nome: true } } } },
    },
    orderBy: { data_real_pagamento: "asc" },
  });

  return NextResponse.json({
    duplicatas: duplicatas.map((d) => ({
      empresa: d.pedido.empresa.nome,
      valor: Number(d.valor),
      data_pagamento: new Date(d.data_real_pagamento).toISOString().split("T")[0],
      dias_atraso: Math.floor(
        (hoje.getTime() - new Date(d.data_real_pagamento).getTime()) /
          (1000 * 60 * 60 * 24)
      ),
      parcela: d.numero_parcela,
    })),
    total: duplicatas.reduce((sum, d) => sum + Number(d.valor), 0),
    quantidade: duplicatas.length,
  });
}
