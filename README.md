# Receba

[![CI](https://github.com/jvtavarese/Receba/actions/workflows/ci.yml/badge.svg)](https://github.com/jvtavarese/Receba/actions/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)

> **Projeto experimental** — aqui eu coloco em prática o que venho aprendendo sobre desenvolvimento web moderno: Next.js App Router, Supabase, Prisma, autenticação, CI/CD e deploy na Vercel.

App web responsivo para representante comercial controlar **comissões**, **recebíveis** e **metas de vendas** de múltiplas empresas.

---

## Contexto

Representantes comerciais costumam gerenciar tudo de cabeça ou em planilhas bagunçadas. O **Receba** resolve dois problemas centrais:

- **Recebíveis**: quanto tem a receber, de quem, e quando vai cair na conta.
- **Metas**: quanto foi vendido por empresa no mês versus a meta definida.

O app é privado (dois usuários com acesso compartilhado) e funciona bem em celular e desktop.

---

## Funcionalidades

- **Dashboard de recebíveis** — visão geral com filtros por empresa, status e período
- **Gestão de pedidos** — cadastro, edição e exclusão com geração automática de duplicatas
- **Duplicatas inteligentes** — cálculo de vencimento e data real de pagamento por regra da empresa (data exata ou dia fixo)
- **Metas mensais** — acompanhamento de faturamento vs meta por empresa
- **API para automações** — endpoints autenticados para integração com n8n
- **CI/CD** — pipeline automático de lint, validação e build via GitHub Actions

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| Banco de dados | Supabase (PostgreSQL) |
| ORM | Prisma 6 |
| UI | Tailwind CSS + shadcn/ui |
| Auth | Supabase Auth (`@supabase/ssr`) |
| CI/CD | GitHub Actions |
| Deploy | Vercel |
| Monitoramento | Vercel Speed Insights |

---

## Rodando localmente

**Pré-requisitos:** Node.js 20+, conta no Supabase.

```bash
# 1. Clonar o repositório
git clone https://github.com/jvtavarese/Receba.git
cd Receba

# 2. Instalar dependências (também roda prisma generate)
npm install

# 3. Configurar variáveis de ambiente
cp .env.ci .env
# Edite o .env com suas credenciais reais do Supabase

# 4. Subir o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### Scripts úteis

```bash
npm run lint        # ESLint
npm run build       # Build de produção
npm run db:studio   # Prisma Studio (visualizar banco)
npm run db:push     # Sincronizar schema com o banco
```

---

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima pública do Supabase |
| `DATABASE_URL` | Connection string (Transaction Pooler, porta 6543) |
| `DIRECT_URL` | Connection string direta (Session mode, porta 5432) |
| `API_KEY` | Chave para autenticação das API routes (n8n) |

---

## Status do projeto

- [x] Auth (login/logout com Supabase)
- [x] CRUD de empresas
- [x] CRUD de pedidos + geração automática de duplicatas
- [x] Dashboard de recebíveis com confirmação de pagamento
- [x] Dashboard de metas com progresso por empresa
- [x] API routes para integração com n8n
- [x] Responsividade (mobile + desktop)
- [x] CI com GitHub Actions
- [x] Deploy na Vercel
- [x] Otimização de performance (indexes, queries, auth, imagens, Suspense, acessibilidade)

---

## Aprendizados aplicados

Este projeto foi construído como laboratório prático. Algumas coisas que explorei aqui:

- **Next.js App Router** com Server Components, Server Actions e Client Components
- **Supabase Auth** com cookies via `@supabase/ssr` e proteção de rotas no middleware
- **Prisma 6** com tipos gerados em diretório customizado (`src/generated/prisma`)
- **Decimal.js** para cálculos financeiros sem erros de ponto flutuante
- **shadcn/ui** como base de componentes com Tailwind CSS
- **GitHub Actions** para CI automatizado
- **Otimização de performance** — pesquisa, diagnóstico e implementação documentados abaixo

---

## Otimizações de performance

Após o MVP funcional, fiz uma auditoria de performance no app inteiro. Identifiquei 10 problemas e implementei as correções em 6 etapas, priorizando por impacto.

### 1. Indexes no banco de dados

**Problema:** O Prisma cria as tabelas mas não adiciona indexes automaticamente para colunas que não são PK. Toda query filtrada (por status, data, empresa) fazia full table scan.

**Solução:** Adicionei 6 indexes nas tabelas `duplicatas`, `pedidos` e `metas_mensais` — nos campos usados em `WHERE`, `JOIN` e `ORDER BY`. A migration foi aplicada via Supabase MCP e o schema Prisma atualizado com `@@index`.

**Por que importa:** Indexes permitem que o PostgreSQL encontre registros sem varrer a tabela inteira. Com o crescimento de dados, a diferença entre O(n) e O(log n) é enorme.

### 2. Eliminação do double auth

**Problema:** Cada navegação de página fazia 2 chamadas `supabase.auth.getUser()` — uma no middleware (para proteger a rota) e outra no layout (para mostrar o email do usuário). Cada chamada é um roundtrip HTTP ao Supabase (~100-300ms).

**Solução:** O middleware já valida a sessão, então passei a propagar o email do usuário via header interno (`x-user-email`). O layout agora lê `headers().get("x-user-email")` em vez de fazer uma segunda chamada auth.

**Por que importa:** Eliminar 1 roundtrip por navegação economiza 100-300ms em cada clique. O header é setado server-side pelo middleware, então não há risco de segurança (clientes não conseguem forjar esse header).

### 3. Otimização de queries

Quatro melhorias no acesso ao banco:

- **Dashboard resumo (4 aggregates → 1 raw SQL):** O dashboard fazia 4 queries `aggregate()` separadas na tabela de duplicatas (semana atual, próxima semana, mês, atrasados). Consolidei em uma única query SQL usando `FILTER (WHERE ...)` do PostgreSQL, que faz um só scan na tabela.

- **Metas (JS reduce → DB groupBy):** A página de metas carregava TODOS os pedidos de todas as empresas para a memória e somava com `.reduce()` em JavaScript. Substituí por `prisma.pedido.groupBy()` com `_sum`, que faz a soma no banco e retorna apenas o total por empresa.

- **Empresas no dashboard (select mínimo):** A query de empresas para o filtro carregava todas as colunas. Adicionei `select: { id: true, nome: true }` para trazer só o necessário.

- **Update de pedido (lookup dentro da transaction):** O fetch da empresa era feito antes da transaction, adicionando um roundtrip sequencial. Movi para dentro do `$transaction`, reduzindo a latência total.

**Por que importa:** Menos queries = menos roundtrips ao banco. Agregação no banco em vez de JS = menos dados trafegados e processados. Com o composite index `(status, data_real_pagamento)` do Step 1, a query consolidada do dashboard é especialmente rápida.

### 4. Next.js config + otimização de imagens

**Problema:** O `next.config.mjs` estava vazio (sem `reactStrictMode`, sem `poweredByHeader: false`), e o logo usava `<img>` raw em vez do componente `<Image>` do Next.js.

**Solução:** Configurei `reactStrictMode: true` e `poweredByHeader: false`. Substituí todas as `<img>` por `<Image>` com import estático e `priority` para above-the-fold. Instalei `sharp` para otimização de imagens em produção.

**Por que importa:** `next/image` gera automaticamente `srcset` com múltiplos tamanhos, converte para WebP/AVIF, e faz lazy loading. `sharp` é o engine recomendado para produção (mais rápido que o fallback `squoosh`). `reactStrictMode` ajuda a detectar bugs durante desenvolvimento.

### 5. Suspense boundaries + revalidação específica

**Problema:** O layout do dashboard não tinha `<Suspense>`, então qualquer data fetch lento bloqueava a página inteira sem loading indicator. Além disso, Server Actions chamavam `revalidatePath("/")` que invalidava o cache do app todo.

**Solução:** Adicionei `<Suspense>` com spinner no layout. Troquei `revalidatePath("/")` por `revalidatePath("/", "page")` e `revalidatePath("/pedidos", "page")` para invalidar apenas as páginas afetadas.

**Por que importa:** `<Suspense>` permite streaming — o header/nav renderiza imediato enquanto o conteúdo da página carrega com um spinner. `revalidatePath` com `"page"` evita invalidar o cache do layout e de páginas não relacionadas.

### 6. Acessibilidade de animações + correção de CLS

**Problema:** As animações `stagger-children` setavam `opacity: 0` inicialmente, causando Cumulative Layout Shift (CLS) — os cards "piscam" de invisível para visível. Além disso, não havia respeito a `prefers-reduced-motion`.

**Solução:** Reestruturei o CSS: elementos começam com `opacity: 1` por padrão, e as animações só são aplicadas dentro de `@media (prefers-reduced-motion: no-preference)`. Adicionei fallback `prefers-reduced-motion: reduce` para desabilitar animações.

**Por que importa:** CLS é uma métrica de Core Web Vitals que afeta a experiência do usuário (elementos "pulando" na tela). Respeitar `prefers-reduced-motion` é importante para acessibilidade — pessoas com vestibular disorders podem sentir desconforto com animações.

### Bonus: Vercel Speed Insights

Adicionei o pacote `@vercel/speed-insights` para monitorar métricas reais de performance (LCP, FID, CLS) dos usuários em produção.

---

*Projeto em desenvolvimento ativo.*
