import type { ChatCompletionTool } from "openai/resources/chat/completions";

export const agentTools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "listar_empresas",
      description: "Lista todas as empresas cadastradas com seus dados (nome, comissão, modo de pagamento)",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "criar_empresa",
      description: "Cadastra uma nova empresa",
      parameters: {
        type: "object",
        properties: {
          nome: { type: "string", description: "Nome da empresa" },
          percentual_comissao: { type: "number", description: "Percentual de comissão (0-100)" },
          modo_pagamento: { type: "string", enum: ["data_exata", "dia_fixo"], description: "Modo de pagamento das duplicatas" },
          dia_fixo_pagamento: { type: "number", description: "Dia fixo para pagamento (1-31). Obrigatório se modo_pagamento = dia_fixo" },
        },
        required: ["nome", "percentual_comissao", "modo_pagamento"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "editar_empresa",
      description: "Atualiza dados de uma empresa existente",
      parameters: {
        type: "object",
        properties: {
          empresa_id: { type: "string", description: "ID da empresa" },
          nome: { type: "string", description: "Novo nome" },
          percentual_comissao: { type: "number", description: "Novo percentual de comissão" },
          modo_pagamento: { type: "string", enum: ["data_exata", "dia_fixo"] },
          dia_fixo_pagamento: { type: "number", description: "Novo dia fixo (1-31)" },
        },
        required: ["empresa_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "excluir_empresa",
      description: "Remove uma empresa (não pode ter pedidos vinculados)",
      parameters: {
        type: "object",
        properties: {
          empresa_id: { type: "string", description: "ID da empresa a excluir" },
        },
        required: ["empresa_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "criar_pedido",
      description: "Cria um novo pedido com duplicatas geradas automaticamente",
      parameters: {
        type: "object",
        properties: {
          empresa_id: { type: "string", description: "ID da empresa" },
          valor_total: { type: "number", description: "Valor total do pedido em reais" },
          data_faturamento: { type: "string", description: "Data de faturamento no formato YYYY-MM-DD" },
          qtd_parcelas: { type: "integer", description: "Quantidade de parcelas" },
          prazo_dias: { type: "integer", description: "Prazo em dias entre parcelas" },
        },
        required: ["empresa_id", "valor_total", "data_faturamento", "qtd_parcelas", "prazo_dias"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "listar_pedidos",
      description: "Lista pedidos com filtros opcionais por empresa e período",
      parameters: {
        type: "object",
        properties: {
          empresa_id: { type: "string", description: "Filtrar por empresa" },
          data_inicio: { type: "string", description: "Data início (YYYY-MM-DD)" },
          data_fim: { type: "string", description: "Data fim (YYYY-MM-DD)" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "excluir_pedido",
      description: "Remove um pedido e todas as suas duplicatas",
      parameters: {
        type: "object",
        properties: {
          pedido_id: { type: "string", description: "ID do pedido a excluir" },
        },
        required: ["pedido_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "definir_meta",
      description: "Define ou atualiza a meta mensal de faturamento de uma empresa",
      parameters: {
        type: "object",
        properties: {
          empresa_id: { type: "string", description: "ID da empresa" },
          mes: { type: "integer", description: "Mês (1-12)" },
          ano: { type: "integer", description: "Ano (ex: 2026)" },
          valor_meta: { type: "number", description: "Valor da meta em reais" },
        },
        required: ["empresa_id", "mes", "ano", "valor_meta"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "ver_metas",
      description: "Mostra o progresso das metas mensais de todas as empresas",
      parameters: {
        type: "object",
        properties: {
          mes: { type: "integer", description: "Mês (1-12)" },
          ano: { type: "integer", description: "Ano (ex: 2026)" },
        },
        required: ["mes", "ano"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "listar_recebiveis",
      description: "Lista duplicatas (recebíveis) com filtros por empresa, status e período",
      parameters: {
        type: "object",
        properties: {
          empresa_id: { type: "string", description: "Filtrar por empresa" },
          status: { type: "string", enum: ["pendente", "atrasado", "recebido"], description: "Filtrar por status" },
          data_inicio: { type: "string", description: "Data início (YYYY-MM-DD)" },
          data_fim: { type: "string", description: "Data fim (YYYY-MM-DD)" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "confirmar_recebimento",
      description: "Marca uma duplicata como recebida",
      parameters: {
        type: "object",
        properties: {
          duplicata_id: { type: "string", description: "ID da duplicata a confirmar" },
        },
        required: ["duplicata_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "resumo_dashboard",
      description: "Retorna o resumo dos recebíveis: esta semana, próxima semana, mês e atrasados",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
];
