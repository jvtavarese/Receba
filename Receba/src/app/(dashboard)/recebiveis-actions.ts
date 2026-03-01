"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getDuplicatas(filtros?: {
  empresa_id?: string;
  status?: string;
  data_inicio?: string;
  data_fim?: string;
}) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return prisma.duplicata.findMany({
    where: {
      ...(filtros?.empresa_id && {
        pedido: { empresa_id: filtros.empresa_id },
      }),
      ...(filtros?.status === "recebido" && { status: "recebido" }),
      ...(filtros?.status === "pendente" && {
        status: "pendente",
        data_real_pagamento: { gte: hoje },
      }),
      ...(filtros?.status === "atrasado" && {
        status: "pendente",
        data_real_pagamento: { lt: hoje },
      }),
      ...(filtros?.data_inicio || filtros?.data_fim
        ? {
            data_real_pagamento: {
              ...(filtros?.data_inicio && {
                gte: new Date(filtros.data_inicio + "T00:00:00"),
              }),
              ...(filtros?.data_fim && {
                lte: new Date(filtros.data_fim + "T00:00:00"),
              }),
            },
          }
        : {}),
    },
    include: {
      pedido: {
        include: { empresa: true },
      },
    },
    orderBy: { data_real_pagamento: "asc" },
  });
}

export async function confirmarRecebimento(duplicataId: string) {
  try {
    await prisma.duplicata.update({
      where: { id: duplicataId },
      data: {
        status: "recebido",
        data_confirmacao: new Date(),
      },
    });
  } catch {
    return { error: "Erro ao confirmar recebimento" };
  }

  revalidatePath("/");
  return { success: true };
}

export async function getResumoRecebiveis() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  // Início e fim da semana atual (segunda a domingo)
  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(hoje.getDate() - ((hoje.getDay() + 6) % 7));
  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(inicioSemana.getDate() + 6);

  // Próxima semana
  const inicioProxSemana = new Date(fimSemana);
  inicioProxSemana.setDate(fimSemana.getDate() + 1);
  const fimProxSemana = new Date(inicioProxSemana);
  fimProxSemana.setDate(inicioProxSemana.getDate() + 6);

  // Início e fim do mês atual
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

  const result = await prisma.$queryRaw<[{
    semana_count: bigint;
    semana_total: number;
    prox_semana_count: bigint;
    prox_semana_total: number;
    mes_count: bigint;
    mes_total: number;
    atrasados_count: bigint;
    atrasados_total: number;
  }]>`
    SELECT
      COUNT(*) FILTER (WHERE data_real_pagamento >= ${inicioSemana}::date AND data_real_pagamento <= ${fimSemana}::date) AS semana_count,
      COALESCE(SUM(valor) FILTER (WHERE data_real_pagamento >= ${inicioSemana}::date AND data_real_pagamento <= ${fimSemana}::date), 0) AS semana_total,
      COUNT(*) FILTER (WHERE data_real_pagamento >= ${inicioProxSemana}::date AND data_real_pagamento <= ${fimProxSemana}::date) AS prox_semana_count,
      COALESCE(SUM(valor) FILTER (WHERE data_real_pagamento >= ${inicioProxSemana}::date AND data_real_pagamento <= ${fimProxSemana}::date), 0) AS prox_semana_total,
      COUNT(*) FILTER (WHERE data_real_pagamento >= ${inicioMes}::date AND data_real_pagamento <= ${fimMes}::date) AS mes_count,
      COALESCE(SUM(valor) FILTER (WHERE data_real_pagamento >= ${inicioMes}::date AND data_real_pagamento <= ${fimMes}::date), 0) AS mes_total,
      COUNT(*) FILTER (WHERE data_real_pagamento < ${hoje}::date) AS atrasados_count,
      COALESCE(SUM(valor) FILTER (WHERE data_real_pagamento < ${hoje}::date), 0) AS atrasados_total
    FROM duplicatas
    WHERE status = 'pendente'
  `;

  const r = result[0];
  return {
    semanaAtual: { total: Number(r.semana_total), count: Number(r.semana_count) },
    proxSemana: { total: Number(r.prox_semana_total), count: Number(r.prox_semana_count) },
    mes: { total: Number(r.mes_total), count: Number(r.mes_count) },
    atrasados: { total: Number(r.atrasados_total), count: Number(r.atrasados_count) },
  };
}
