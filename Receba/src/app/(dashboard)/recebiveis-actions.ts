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

  const [semanaAtual, proxSemana, mes, atrasados] = await Promise.all([
    prisma.duplicata.aggregate({
      _sum: { valor: true },
      _count: true,
      where: {
        status: "pendente",
        data_real_pagamento: { gte: inicioSemana, lte: fimSemana },
      },
    }),
    prisma.duplicata.aggregate({
      _sum: { valor: true },
      _count: true,
      where: {
        status: "pendente",
        data_real_pagamento: { gte: inicioProxSemana, lte: fimProxSemana },
      },
    }),
    prisma.duplicata.aggregate({
      _sum: { valor: true },
      _count: true,
      where: {
        status: "pendente",
        data_real_pagamento: { gte: inicioMes, lte: fimMes },
      },
    }),
    prisma.duplicata.aggregate({
      _sum: { valor: true },
      _count: true,
      where: {
        status: "pendente",
        data_real_pagamento: { lt: hoje },
      },
    }),
  ]);

  return {
    semanaAtual: {
      total: Number(semanaAtual._sum.valor ?? 0),
      count: semanaAtual._count,
    },
    proxSemana: {
      total: Number(proxSemana._sum.valor ?? 0),
      count: proxSemana._count,
    },
    mes: {
      total: Number(mes._sum.valor ?? 0),
      count: mes._count,
    },
    atrasados: {
      total: Number(atrasados._sum.valor ?? 0),
      count: atrasados._count,
    },
  };
}
