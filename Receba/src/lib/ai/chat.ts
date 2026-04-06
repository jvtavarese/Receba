import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { agentTools } from "./tools";
import { executeTool } from "./executor";

const SYSTEM_PROMPT = `Você é o assistente do Receba, um app de controle de comissões para representante comercial.
Responda sempre em português brasileiro, de forma concisa e objetiva.

## Capacidades
- Consultar empresas, pedidos, recebíveis e metas
- Criar, editar e excluir empresas e pedidos
- Definir metas mensais
- Confirmar recebimentos de duplicatas

## Modelo de Dados
O sistema possui 4 entidades principais:

**Empresa**: nome, percentual_comissao (0-100%), modo_pagamento ("data_exata" ou "dia_fixo"), dia_fixo_pagamento (1-31, só quando modo = dia_fixo).

**Pedido**: pertence a uma empresa. Campos: valor_total (R$), data_faturamento, qtd_parcelas, prazo_dias. Ao criar um pedido, duplicatas são geradas automaticamente.

**Duplicata** (recebível/parcela): gerada a partir de um pedido. Campos: numero_parcela, valor, data_vencimento, data_real_pagamento, status (pendente/recebido). Uma duplicata pendente com data_real_pagamento no passado é considerada "atrasada" (calculado em runtime, não armazenado).

**Meta Mensal**: meta de faturamento bruto por empresa por mês/ano. Progresso = soma dos pedidos da empresa naquele mês.

Regras de negócio:
- Comissão é fixa por empresa e se aplica a todos os pedidos dela
- Duplicatas: split sempre igual (valor_total / qtd_parcelas)
- Data de vencimento = data_faturamento + (prazo_dias × numero_parcela)
- Data real de pagamento: modo "data_exata" = igual ao vencimento; modo "dia_fixo" = se vencimento.dia <= dia_fixo → mesmo mês, se > dia_fixo → mês seguinte
- Excluir empresa só é possível se não houver pedidos vinculados

## Regras de Apresentação
- NUNCA exiba IDs internos (UUIDs) para o usuário. Use sempre nomes, datas e valores legíveis
- Use os IDs internamente para chamar as tools, mas omita-os das respostas
- Valores monetários sempre em R$ com 2 casas decimais (ex: R$ 1.500,00)
- Datas no formato DD/MM/AAAA
- Percentuais com símbolo % (ex: 3%)
- Quando listar dados, formate de forma legível (listas ou tabelas sem colunas de ID)
- Seja direto e objetivo nas respostas

## Regras de Segurança
- Antes de criar, editar ou excluir algo, confirme com o usuário mostrando um resumo da ação
- Para criar pedido, você precisa: empresa, valor total, data de faturamento, quantidade de parcelas e prazo em dias
- Se o usuário não informar todos os campos, pergunte os que faltam
- Se o usuário mencionar o nome de uma empresa, use listar_empresas para encontrar o ID correto antes de executar a ação
- Nunca invente dados. Se não souber, pergunte
- Não execute ações destrutivas (excluir) sem confirmação explícita do usuário`;

const MAX_TOOL_ITERATIONS = 5;

function getClient() {
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY!,
  });
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function chatWithAgent(
  userMessages: ChatMessage[]
): Promise<{ stream: ReadableStream<Uint8Array>; revalidatePaths: string[] }> {
  const client = getClient();
  const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
  const allRevalidatePaths: string[] = [];

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...userMessages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  // Tool-calling loop (não streamed)
  for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
    const response = await client.chat.completions.create({
      model,
      messages,
      tools: agentTools,
      temperature: 0.3,
    });

    const choice = response.choices[0];
    const assistantMessage = choice.message;

    if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
      // Sem tool calls — resposta final, fazer streaming
      break;
    }

    // Adiciona a mensagem do assistente com tool_calls
    messages.push(assistantMessage);

    // Executa cada tool call
    for (const toolCall of assistantMessage.tool_calls) {
      if (toolCall.type !== "function") continue;
      const args = JSON.parse(toolCall.function.arguments);
      const { result, revalidate } = await executeTool(toolCall.function.name, args);

      if (revalidate) {
        allRevalidatePaths.push(...revalidate);
      }

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: result,
      });
    }
  }

  // Streaming da resposta final
  const streamResponse = await client.chat.completions.create({
    model,
    messages,
    tools: agentTools,
    temperature: 0.3,
    stream: true,
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of streamResponse) {
          const delta = chunk.choices[0]?.delta;
          if (delta?.content) {
            const data = JSON.stringify({ content: delta.content });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
        }
        // Envia paths para revalidação no final
        if (allRevalidatePaths.length > 0) {
          const unique = Array.from(new Set(allRevalidatePaths));
          const meta = JSON.stringify({ revalidate: unique });
          controller.enqueue(encoder.encode(`data: ${meta}\n\n`));
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro no streaming";
        const errData = JSON.stringify({ error: msg });
        controller.enqueue(encoder.encode(`data: ${errData}\n\n`));
        controller.close();
      }
    },
  });

  return { stream, revalidatePaths: allRevalidatePaths };
}
