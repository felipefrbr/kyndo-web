# Kyndo Web (kyndo-web)

Frontend da plataforma Kyndo — conecta criadores de conteúdo com divulgadores/clipadores.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 8** (build tool)
- **Tailwind CSS 4** (estilização)
- **React Router 7** (routing)
- **Axios** com interceptors JWT (HTTP client)
- **TanStack Query v5** (server state)
- **Lucide React** (ícones)

## Pré-requisitos

- Node.js 18+
- Backend rodando ([kyndo-svc](https://github.com/felipefrbr/kyndo-svc))

## Setup

```bash
# 1. Clonar
git clone https://github.com/felipefrbr/kyndo-web.git
cd kyndo-web

# 2. Instalar dependências
npm install

# 3. Iniciar dev server
npm run dev
```

A aplicação inicia em `http://localhost:5173`.

## Variáveis de Ambiente

Criar um arquivo `.env.local` na raiz:

```env
VITE_API_URL=http://localhost:8081/api/v1
```

Se omitido, usa `http://localhost:8081/api/v1` como padrão.

## Scripts

```bash
npm run dev       # Dev server com HMR
npm run build     # Build de produção
npm run preview   # Preview do build
```

## Estrutura do Projeto

```
src/
  api/                      # Axios client + módulos por domínio
    client.ts               # Instância Axios com interceptors JWT
    auth.api.ts
    campaigns.api.ts
    marketplace.api.ts
    wallet.api.ts
    admin.api.ts
    dashboard.api.ts
  auth/                     # Autenticação
    AuthProvider.tsx         # Context com user, login, logout
    useAuth.ts              # Hook de acesso
    ProtectedRoute.tsx      # Redireciona se não autenticado
    RoleGuard.tsx            # Restringe por role
  components/
    layout/
      AppShell.tsx           # Sidebar + header + outlet
    shared/
      StatusBadge.tsx        # Badge colorido por status
  features/
    auth/                   # Login, Signup
    creator/                # Dashboard, campanhas (CRUD)
    promoter/               # Dashboard, marketplace, posts, wallet
    admin/                  # Dashboard, campanhas, posts, users, saques
  lib/
    formatters.ts           # formatCurrency, formatDate
  routes/
    RoleRedirect.tsx        # Redireciona / para dashboard por role
  types/                    # TypeScript types
  styles/
    globals.css             # Tailwind + tema
```

## Páginas

### Públicas
- `/login` — Login
- `/signup` — Registro com seletor de tipo (Criador / Divulgador)

### Criador de Conteúdo
- `/creator` — Dashboard com métricas (campanhas, views, investido)
- `/creator/campaigns` — Lista de campanhas com status badges
- `/creator/campaigns/new` — Formulário de criação com preview de pagamentos
- `/creator/campaigns/:id` — Detalhes com barra de progresso e ações por status
- `/creator/campaigns/:id/edit` — Edição (draft/rejected)

### Divulgador / Clipador
- `/promoter` — Dashboard com métricas (saldo, ganhos, views)
- `/promoter/browse` — Marketplace de campanhas ativas com busca
- `/promoter/campaigns/:id` — Conteúdo da campanha + formulário de post
- `/promoter/posts` — Meus posts com progresso de views e auto-refresh
- `/promoter/wallet` — Saldo, extrato e solicitação de saque

### Admin
- `/admin` — Dashboard com totais + alertas de ações pendentes
- `/admin/campaigns` — Gestão: filtro por status, aprovar/rejeitar
- `/admin/posts` — Gestão: aprovar/rejeitar, update manual de views
- `/admin/users` — Lista com filtro por tipo e saldo wallet
- `/admin/withdrawals` — Saques: aprovar/concluir/rejeitar com estorno

## Features

- **Auth:** JWT com auto-refresh em 401, role-based routing
- **Sidebar responsiva:** Desktop sidebar + mobile nav, links por role
- **Campanhas:** Máscara de moeda R$, preview "cobre X pagamentos", validação de divisibilidade
- **Marketplace:** Cards com CPM, busca, botão inscrever, badge "Inscrito"
- **Posts:** Seletor de plataforma (TikTok/YouTube/Instagram), progress bar até 1000 views, auto-refresh 15s
- **Wallet:** Extrato com ícones crédito/débito, modal de saque com PIX
- **Admin:** Tabelas com filtros, modais de confirmação, PIX copiável, alertas de pendências

## Repositórios Relacionados

- [kyndo-svc](https://github.com/felipefrbr/kyndo-svc) — Backend Go
- [kyndo-docs](https://github.com/felipefrbr/kyndo-docs) — Documentação
