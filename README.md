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
| Deploy | Vercel *(em breve)* |

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
- [ ] Deploy na Vercel

---

## Aprendizados aplicados

Este projeto foi construído como laboratório prático. Algumas coisas que explorei aqui:

- **Next.js App Router** com Server Components, Server Actions e Client Components
- **Supabase Auth** com cookies via `@supabase/ssr` e proteção de rotas no middleware
- **Prisma 6** com tipos gerados em diretório customizado (`src/generated/prisma`)
- **Decimal.js** para cálculos financeiros sem erros de ponto flutuante
- **shadcn/ui** como base de componentes com Tailwind CSS
- **GitHub Actions** para CI automatizado

---

*Projeto em desenvolvimento ativo.*
