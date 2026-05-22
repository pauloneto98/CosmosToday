<div align="center">

# 🌌 CosmosDaily

### SaaS Interativo de Exploração Espacial — Powered by NASA APIs

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF?logo=clerk&logoColor=white)](https://clerk.com/)
[![Stripe](https://img.shields.io/badge/Payments-Stripe-008CDD?logo=stripe&logoColor=white)](https://stripe.com/)
[![AWS EC2](https://img.shields.io/badge/Cloud-AWS%20EC2-FF9900?logo=amazonaws&logoColor=white)](https://aws.amazon.com/ec2/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**CosmosDaily** é uma plataforma SaaS completa que transforma dados científicos da NASA em uma experiência visual imersiva e interativa, com autenticação, planos de assinatura e infraestrutura cloud segura.

[🚀 Ver Demo ao Vivo](http://34.205.75.41) · [📋 Reportar Bug](https://github.com/pauloneto98/CosmosToday/issues)

</div>

---

## ✨ Funcionalidades Implementadas

### 🛸 Dashboard Espacial Interativo
- **🌠 APOD** — Foto Astronômica do Dia com descrição científica da NASA
- **☄️ Asteroides** — Monitoramento de NEOs (Near Earth Objects) em tempo real
- **☀️ Clima Solar** — Tempestades e eventos geomagnéticos (NOAA / NASA DONKI)
- **🌍 EPIC** — Imagens da Terra vista do espaço pelo satélite DSCOVR
- **🚀 Lançamentos** — Calendário de lançamentos espaciais globais em tempo real
- **🔴 Mars Rover** — Fotos tiradas diretamente pelos rovers em Marte
- **🪐 Exoplanetas** — Banco de dados do NASA Exoplanet Archive
- **📰 Notícias Espaciais** — Feed de notícias da Spaceflight News API
- **🛰️ Satélites** — Mapa 3D de satélites em órbita ao redor da Terra
- **🖼️ Galeria Galáctica** — Acervo de imagens do espaço profundo (NASA APOD Archive)

### 🔐 Infraestrutura SaaS Completa
- **Autenticação:** Clerk com login/cadastro via e-mail, Google e GitHub
- **Banco de Dados:** Drizzle ORM + PostgreSQL (Supabase) com schema tipado
- **Pagamentos:** Stripe Checkout com planos Free, Explorer e Family
- **Webhooks:** Sincronização idempotente de assinaturas via Stripe Webhooks
- **LGPD:** Banner de cookies, Política de Privacidade, Termos de Uso e exclusão de dados

---

## 🛠️ Stack Tecnológico

| Camada | Tecnologia |
|---|---|
| **Frontend** | Next.js 15 (App Router), TypeScript, CSS Vanilla |
| **Autenticação** | Clerk (JWT + OAuth) |
| **Banco de Dados** | PostgreSQL + Drizzle ORM |
| **Pagamentos** | Stripe Checkout + Webhooks |
| **APIs Externas** | NASA APOD, DONKI, EPIC, NeoWs, Mars Rover, Exoplanet Archive |
| **Animações** | Framer Motion |
| **Globo 3D** | Three.js + Globe.gl |
| **Cloud / Infra** | AWS EC2 (t3.micro, Ubuntu 24.04 LTS) |
| **Proxy Reverso** | Nginx (Hardened Security Headers) |
| **Processo** | PM2 (Process Manager 24/7) |
| **Segurança VPS** | UFW Firewall, Fail2Ban, SSH Key-Only, Unattended Upgrades |

---

## 🏗️ Arquitetura do Projeto

```
CosmosToday/
├── src/
│   ├── app/                        # Rotas do Next.js (App Router)
│   │   ├── (dashboard)/            # Layout e rotas protegidas do dashboard
│   │   │   └── dashboard/
│   │   │       ├── page.tsx        # Dashboard principal (todos os widgets)
│   │   │       ├── gallery/        # Galeria de imagens espaciais
│   │   │       ├── satellites/     # Mapa 3D de satélites
│   │   │       └── settings/       # Configurações de conta + LGPD
│   │   ├── api/
│   │   │   ├── stripe/             # Checkout e Webhooks do Stripe
│   │   │   └── user/delete/        # Endpoint LGPD de exclusão de dados
│   │   ├── sign-in/ & sign-up/     # Telas de autenticação custom (Clerk)
│   │   ├── privacy/                # Política de Privacidade (LGPD)
│   │   └── terms/                  # Termos de Uso
│   ├── features/                   # Widgets por domínio (APOD, Mars, etc.)
│   ├── components/                 # Componentes reutilizáveis (UI, Layout)
│   └── lib/
│       ├── db/                     # Schema + Client Drizzle ORM
│       └── stripe.ts               # Cliente e helpers do Stripe
├── scripts/
│   ├── create-vps.js               # Script de provisionamento AWS EC2
│   └── check-status.js             # Script de diagnóstico de status AWS
└── middleware.ts                   # Proteção de rotas via Clerk
```

---

## 🔒 Segurança & Compliance

### VPS Hardened (AWS EC2)
- 🧱 **Firewall UFW** — Apenas portas 22, 80 e 443 abertas
- 🚨 **Fail2Ban** — Bloqueio automático de IPs maliciosos (brute-force)
- 🔑 **SSH Key-Only** — Login por senha completamente desativado
- 🔄 **Unattended Upgrades** — Patches de segurança diários automáticos
- 🕵️ **Nginx Oculto** — `server_tokens off` + Security Headers OWASP

### Aplicação Next.js
- 🔐 **Middleware** de proteção de rotas (Clerk JWT)
- 🛡️ **Headers HTTP** anti-Clickjacking, anti-XSS e CSP
- 🗂️ **Webhooks Idempotentes** (Stripe) para consistência de dados
- ⚖️ **LGPD** — Consentimento de cookies, exclusão atômica de dados

---

## 🚀 Rodando Localmente

```bash
# 1. Clone o repositório
git clone https://github.com/pauloneto98/CosmosToday.git
cd CosmosToday

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas chaves (NASA, Clerk, Stripe, Supabase)

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse: `http://localhost:3000`

---

## 🔑 Variáveis de Ambiente Necessárias

Copie o arquivo `.env.example` para `.env.local` e preencha:

```env
# NASA API (gratuito em api.nasa.gov)
NASA_API_KEY=

# Clerk Authentication (gratuito em clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Stripe Payments (stripe.com)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Supabase / PostgreSQL
DATABASE_URL=
```

---

## 📋 Planos de Assinatura

| Plano | Preço | Recursos |
|---|---|---|
| **Free** | R$0/mês | APOD, ISS Tracker básico, 5 alertas/mês |
| **Explorer** | R$19,90/mês | Todos os widgets, Galeria completa, Alertas ilimitados |
| **Family** | R$34,90/mês | Até 5 contas, acesso prioritário a novos recursos |

---

## 🗺️ Roadmap — Próximos Passos

- [ ] **Domínio customizado** (ex: `cosmosdaily.app`) + Certificado SSL via Let's Encrypt
- [ ] **PostgreSQL em produção** (Supabase) para persistência real de favoritos e histórico
- [ ] **Stripe em produção** — Substituir chaves de teste por chaves de produção reais
- [ ] **Notificações Push** — Alertas de eventos espaciais via e-mail/push browser
- [ ] **App Mobile** — Wrapper React Native para iOS e Android
- [ ] **Modo Colaborativo** — Compartilhamento de descobertas espaciais entre usuários
- [ ] **Internacionalização (i18n)** — Suporte a Inglês e Espanhol

---

## 👨‍💻 Autor

**Paulo Neto** — Desenvolvedor Full Stack

[![GitHub](https://img.shields.io/badge/GitHub-pauloneto98-181717?logo=github&logoColor=white)](https://github.com/pauloneto98)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Paulo%20Neto-0A66C2?logo=linkedin&logoColor=white)](https://linkedin.com/in/pauloneto98)

---

<div align="center">
Feito com ❤️ e ☕ no Brasil 🇧🇷
</div>
