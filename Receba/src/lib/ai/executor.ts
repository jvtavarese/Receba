import { prisma } from "@/lib/prisma";
import { empresaSchema, pedidoSchema } from "@/lib/schemas";
import { calcularDuplicatas } from "@/lib/duplicatas";

type ToolResult = { data: unknown; revalidate?: string[] };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ToolHandler = (args: any) => Promise<ToolResult>;

const toolHandlers: Record<string, ToolHandler> = {
  async listar_empresas() {
    const empresas = await prisma.empresa.findMany({ orderBy: { nome: "asc" } });
    return {
      data: empresas.map((e) => ({
        id: e.id,
        nome: e.nome,
        percentual_comissao: Number(e.percentual_comissao),
        modo_pagamento: e.modo_pagamento,
        dia_fixo_pagamento: e.dia_fixo_pagamento,
      })),
    };
  },

  async criar_empresa(args: {
    nome: string;
    percentual_comissao: number;
    modo_pagamento: string;
    dia_fixo_pagamento?: number;
  }) {
    const parsed = empresaSchema.safeParse({
      ...args,
      dia_fixo_pagamento: args.dia_fixo_pagamento ?? null,
    });
    if (!parsed.success) {
      return { data: { error: parsed.error.issues[0].message } };
    }

    const empresa = await prisma.empresa.create({
      data: {
        nome: parsed.data.nome,
        percentual_comissao: parsed.data.percentual_comissao,
        modo_pagamento: parsed.data.modo_pagamento,
        dia_fixo_pagamento: parsed.data.dia_fixo_pagamento,
      },
    });
    return {
      data: { success: true, empresa_id: empresa.id, nome: empresa.nome },
      revalidate: ["/empresas"],
    };
  },

  async editar_empresa(args: {
    empresa_id: string;
    nome?: string;
    percentual_comissao?: number;
    modo_pagamento?: string;
    dia_fixo_pagamento?: number;
  }) {
    const existing = await prisma.empresa.findUnique({ where: { id: args.empresa_id } });
    if (!existing) return { data: { error: "Empresa não encontrada" } };

    const merged = {
      nome: args.nome ?? existing.nome,
      percentual_comissao: args.percentual_comissao ?? Number(existing.percentual_comissao),
      modo_pagamento: (args.modo_pagamento ?? existing.modo_pagamento) as "data_exata" | "dia_fixo",
      dia_fixo_pagamento: args.dia_fixo_pagamento ?? existing.dia_fixo_pagamento,
    };

    const parsed = empresaSchema.safeParse(merged);
    if (!parsed.success) {
      return { data: { error: parsed.error.issues[0].message } };
    }

    await prisma.empresa.update({
      where: { id: args.empresa_id },
      data: {
        nome: parsed.data.nome,
        percentual_comissao: parsed.data.percentual_comissao,
        modo_pagamento: parsed.data.modo_pagamento,
        dia_fixo_pagamento: parsed.data.dia_fixo_pagamento,
      },
    });
    return {
      data: { success: true, nome: parsed.data.nome },
      revalidate: ["/empresas"],
    };
  },

  async excluir_empresa(args: { empresa_id: string }) {
    const pedidos = await prisma.pedido.count({ where: { empresa_id: args.empresa_id } });
    if (pedidos > 0) {
      return { data: { error: "Não é possível excluir empresa com pedidos vinculados. Exclua os pedidos primeiro." } };
    }

    await prisma.$transaction([
      prisma.metaMensal.deleteMany({ where: { empresa_id: args.empresa_id } }),
      prisma.empresa.delete({ where: { id: args.empresa_id } }),
    ]);
    return {
      data: { success: true },
      revalidate: ["/empresas"],
    };
  },

  async criar_pedido(args: {
    empresa_id: string;
    valor_total: number;
    data_faturamento: string;
    qtd_parcelas: number;
    prazo_dias: number;
  }) {
    const parsed = pedidoSchema.safeParse(args);
    if (!parsed.success) {
      return { data: { error: parsed.error.issues[0].message } };
    }

    const empresa = await prisma.empresa.findUnique({ where: { id: parsed.data.empresa_id } });
    if (!empresa) return { data: { error: "Empresa não encontrada" } };

    const dataFaturamento = new Date(parsed.data.data_faturamento + "T00:00:00");
    const duplicatasPreview = calcularDuplicatas({
      valor_total: parsed.data.valor_total,
      data_faturamento: dataFaturamento,
      qtd_parcelas: parsed.data.qtd_parcelas,
      prazo_dias: parsed.data.prazo_dias,
      modo_pagamento: empresa.modo_pagamento,
      dia_fixo_pagamento: empresa.dia_fixo_pagamento,
    });

    const pedido = await prisma.$transaction(async (tx) => {
      const p = await tx.pedido.create({
        data: {
          empresa_id: parsed.data.empresa_id,
          valor_total: parsed.data.valor_total,
          data_faturamento: dataFaturamento,
          qtd_parcelas: parsed.data.qtd_parcelas,
          prazo_dias: parsed.data.prazo_dias,
        },
      });

      await tx.duplicata.createMany({
        data: duplicatasPreview.map((d) => ({
          pedido_id: p.id,
          numero_parcela: d.numero_parcela,
          valor: d.valor,
          data_vencimento: d.data_vencimento,
          data_real_pagamento: d.data_real_pagamento,
          status: "pendente" as const,
        })),
      });

      return p;
    });

    return {
      data: {
        success: true,
        pedido_id: pedido.id,
        empresa: empresa.nome,
        valor_total: args.valor_total,
        parcelas: duplicatasPreview.length,
      },
      revalidate: ["/pedidos", "/"],
    };
  },

  async listar_pedidos(args: { empresa_id?: string; data_inicio?: string; data_fim?: string }) {
    const pedidos = await prisma.pedido.findMany({
      where: {
        ...(args.empresa_id && { empresa_id: args.empresa_id }),
        ...(args.data_inicio || args.data_fim
          ? {
              data_faturamento: {
                ...(args.data_inicio && { gte: new Date(args.data_inicio + "T00:00:00") }),
                ...(args.data_fim && { lte: new Date(args.data_fim + "T00:00:00") }),
              },
            }
          : {}),
      },
      include: { empresa: true, duplicatas: { orderBy: { numero_parcela: "asc" } } },
      orderBy: { created_at: "desc" },
      take: 50,
    });

    return {
      data: pedidos.map((p) => ({
        id: p.id,
        empresa: p.empresa.nome,
        valor_total: Number(p.valor_total),
        data_faturamento: p.data_faturamento.toISOString().split("T")[0],
        qtd_parcelas: p.qtd_parcelas,
        prazo_dias: p.prazo_dias,
        duplicatas: p.duplicatas.map((d) => ({
          id: d.id,
          parcela: d.numero_parcela,
          valor: Number(d.valor),
          vencimento: d.data_vencimento.toISOString().split("T")[0],
          pagamento: d.data_real_pagamento.toISOString().split("T")[0],
          status: d.status,
        })),
      })),
    };
  },

  async excluir_pedido(args: { pedido_id: string }) {
    await prisma.pedido.delete({ where: { id: args.pedido_id } });
    return {
      data: { success: true },
      revalidate: ["/pedidos", "/"],
    };
  },

  async definir_meta(args: { empresa_id: string; mes: number; ano: number; valor_meta: number }) {
    if (!args.empresa_id || !args.mes || !args.ano || args.valor_meta <= 0) {
      return { data: { error: "Preencha todos os campos corretamente" } };
    }

    const existing = await prisma.metaMensal.findFirst({
      where: { empresa_id: args.empresa_id, mes: args.mes, ano: args.ano },
    });

    if (existing) {
      await prisma.metaMensal.update({
        where: { id: existing.id },
        data: { valor_meta: args.valor_meta },
      });
    } else {
      await prisma.metaMensal.create({
        data: {
          empresa_id: args.empresa_id,
          mes: args.mes,
          ano: args.ano,
          valor_meta: args.valor_meta,
        },
      });
    }

    return {
      data: { success: true },
      revalidate: ["/metas"],
    };
  },

  async ver_metas(args: { mes: number; ano: number }) {
    const inicioMes = new Date(args.ano, args.mes - 1, 1);
    const fimMes = new Date(args.ano, args.mes, 0, 23, 59, 59);

    const [empresas, vendas] = await Promise.all([
      prisma.empresa.findMany({
        orderBy: { nome: "asc" },
        include: { metas: { where: { mes: args.mes, ano: args.ano }, take: 1 } },
      }),
      prisma.pedido.groupBy({
        by: ["empresa_id"],
        _sum: { valor_total: true },
        where: { data_faturamento: { gte: inicioMes, lte: fimMes } },
      }),
    ]);

    const vendasMap = new Map(vendas.map((v) => [v.empresa_id, Number(v._sum.valor_total ?? 0)]));

    return {
      data: empresas.map((e) => {
        const meta = e.metas[0];
        const vendido = vendasMap.get(e.id) ?? 0;
        const valorMeta = meta ? Number(meta.valor_meta) : 0;
        const progresso = valorMeta > 0 ? Math.round((vendido / valorMeta) * 100) : 0;
        return {
          empresa: e.nome,
          empresa_id: e.id,
          valor_meta: valorMeta,
          vendido,
          progresso,
        };
      }),
    };
  },

  async listar_recebiveis(args: { empresa_id?: string; status?: string; data_inicio?: string; data_fim?: string }) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const duplicatas = await prisma.duplicata.findMany({
      where: {
        ...(args.empresa_id && { pedido: { empresa_id: args.empresa_id } }),
        ...(args.status === "recebido" && { status: "recebido" }),
        ...(args.status === "pendente" && { status: "pendente", data_real_pagamento: { gte: hoje } }),
        ...(args.status === "atrasado" && { status: "pendente", data_real_pagamento: { lt: hoje } }),
        ...(args.data_inicio || args.data_fim
          ? {
              data_real_pagamento: {
                ...(args.data_inicio && { gte: new Date(args.data_inicio + "T00:00:00") }),
                ...(args.data_fim && { lte: new Date(args.data_fim + "T00:00:00") }),
              },
            }
          : {}),
      },
      include: { pedido: { include: { empresa: true } } },
      orderBy: { data_real_pagamento: "asc" },
      take: 100,
    });

    return {
      data: duplicatas.map((d) => {
        const isAtrasado = d.status === "pendente" && d.data_real_pagamento < hoje;
        return {
          id: d.id,
          empresa: d.pedido.empresa.nome,
          parcela: d.numero_parcela,
          valor: Number(d.valor),
          vencimento: d.data_vencimento.toISOString().split("T")[0],
          pagamento: d.data_real_pagamento.toISOString().split("T")[0],
          status: isAtrasado ? "atrasado" : d.status,
        };
      }),
    };
  },

  async confirmar_recebimento(args: { duplicata_id: string }) {
    await prisma.duplicata.update({
      where: { id: args.duplicata_id },
      data: { status: "recebido", data_confirmacao: new Date() },
    });
    return {
      data: { success: true },
      revalidate: ["/"],
    };
  },

  async resumo_dashboard() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - ((hoje.getDay() + 6) % 7));
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 6);

    const inicioProxSemana = new Date(fimSemana);
    inicioProxSemana.setDate(fimSemana.getDate() + 1);
    const fimProxSemana = new Date(inicioProxSemana);
    fimProxSemana.setDate(inicioProxSemana.getDate() + 6);

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
      data: {
        semana_atual: { total: Number(r.semana_total), quantidade: Number(r.semana_count) },
        proxima_semana: { total: Number(r.prox_semana_total), quantidade: Number(r.prox_semana_count) },
        mes: { total: Number(r.mes_total), quantidade: Number(r.mes_count) },
        atrasados: { total: Number(r.atrasados_total), quantidade: Number(r.atrasados_count) },
      },
    };
  },
};

export async function executeTool(
  name: string,
  args: Record<string, unknown>
): Promise<{ result: string; revalidate?: string[] }> {
  const handler = toolHandlers[name];
  if (!handler) {
    return { result: JSON.stringify({ error: `Tool "${name}" não encontrada` }) };
  }

  try {
    const { data, revalidate } = await handler(args);
    return { result: JSON.stringify(data), revalidate };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro desconhecido";
    return { result: JSON.stringify({ error: message }) };
  }
}
