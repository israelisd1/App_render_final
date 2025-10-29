# Arqrender - Renderização Arquitetônica com Renderização Avançada

> Transforme seus desenhos 2D em renderizações fotorrealistas de alta qualidade em segundos.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.x-blue.svg)](https://www.typescriptlang.org/)

## 📖 Índice

- [Sobre](#sobre)
- [Funcionalidades](#funcionalidades)
- [Stack Tecnológico](#stack-tecnológico)
- [Instalação](#instalação)
- [Documentação](#documentação)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Deploy](#deploy)
- [Licença](#licença)

## 🎯 Sobre

**Arqrender** é uma plataforma SaaS completa que utiliza inteligência artificial para transformar desenhos arquitetônicos 2D em renderizações fotorrealistas 3D de alta qualidade. Perfeito para arquitetos, designers de interiores e profissionais da construção.

### Principais Diferenciais

- ⚡ **Renderizações em 10-30 segundos** - Sem espera, sem complicação
- 🎨 **Algoritmos avançados de Renderização Avançada** - Preservam geometria e adicionam iluminação realista
- 💼 **Sistema de créditos flexível** - Pague apenas pelo que usar
- 🌍 **Bilíngue** - Interface completa em Português (BR) e Inglês
- 📱 **Responsivo** - Funciona perfeitamente em desktop, tablet e mobile

## ✨ Funcionalidades

### Renderização Principal
- **Upload de imagens 2D** (plantas baixas, esboços, renders básicos)
- **Renderização com Renderização Avançada** em 10-30 segundos
- **Tipos de cena**: Interior e Exterior
- **Formatos de saída**: JPG e PNG
- **Prompts personalizados** para controle criativo

### Sistema de Ajustes Visuais
- **4 controles de ajuste** com sliders interativos:
  - 🎨 Saturação (Cor): -50% a +50%
  - 🔆 Brilho: -50% a +50%
  - ⚖️ Contraste: -50% a +50%
  - 💡 Iluminação: -30% a +30%
- **Preview em tempo real** com CSS filters
- **Valores numéricos visíveis** ao lado de cada slider
- **Botões de controle**: Cancelar, Resetar, Aplicar Ajustes

### Sistema de Tokens
- **Sistema de créditos**: 1 token = 1 renderização
- **Pacotes de tokens** com descontos progressivos
- **Pagamento via Stripe** (cartão de crédito e Pix)
- **Sistema de cupons** de desconto
- **3 tokens gratuitos** no cadastro

### Histórico e Gerenciamento
- **Histórico completo** de renderizações
- **Status em tempo real**: Processando, Concluído, Falhou
- **Download de imagens** em alta resolução
- **Ajustes pós-renderização** com preview

### Painel Administrativo
- **Dashboard de estatísticas**
- **Gerenciamento de usuários**
- **Controle de tokens**
- **Histórico de transações**
- **Análise de receita**

### Internacionalização
- **Suporte completo** a Português (PT-BR) e Inglês (EN)
- **Troca de idioma** em tempo real
- **Todas as interfaces traduzidas**

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** com TypeScript
- **Vite** para build otimizado
- **TailwindCSS** para estilização
- **shadcn/ui** para componentes
- **Wouter** para roteamento
- **tRPC** para comunicação type-safe com backend

### Backend
- **Node.js** com Express
- **tRPC** para API type-safe
- **Drizzle ORM** para banco de dados
- **PostgreSQL** como banco de dados
- **JWT** para autenticação

### Integrações
- **RapidAPI** - Renderização com Renderização Avançada
- **Stripe** - Pagamentos e webhooks
- **DigitalOcean Spaces** - Armazenamento S3
- **NextAuth.js** - Autenticação (Google OAuth + Email/Senha)
- **Nodemailer** - Envio de emails

### DevOps
- **PM2** - Gerenciador de processos
- **Nginx** - Proxy reverso e SSL
- **GitHub** - Controle de versão
- **DigitalOcean App Platform** - Deploy automatizado

## 📦 Instalação

### Pré-requisitos

- **Node.js** ≥ 22.0.0
- **pnpm** ≥ 10.0.0
- **PostgreSQL** ≥ 14
- **Git**

### Instalação Local (Desenvolvimento)

```bash
# 1. Clonar repositório
git clone https://github.com/israelisd1/arch-render-app.git
cd arch-render-app

# 2. Instalar dependências
pnpm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# 4. Aplicar migrations do banco
pnpm db:push

# 5. Iniciar servidor de desenvolvimento
pnpm dev
```

A aplicação estará disponível em `http://localhost:3000`

### Variáveis de Ambiente Essenciais

```env
# Banco de Dados
DATABASE_URL=postgresql://user:password@localhost:5432/arqrender

# NextAuth
NEXTAUTH_SECRET=sua-chave-secreta-aqui
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=seu-client-id
GOOGLE_CLIENT_SECRET=seu-client-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# RapidAPI
RAPIDAPI_KEY=sua-chave-rapidapi

# DigitalOcean Spaces (S3)
SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
SPACES_BUCKET=arqrender-images
SPACES_ACCESS_KEY=sua-access-key
SPACES_SECRET_KEY=sua-secret-key
SPACES_CDN_ENDPOINT=https://arqrender-images.nyc3.cdn.digitaloceanspaces.com
```

## 📚 Documentação

### Guias de Instalação

1. **[GUIA_INSTALACAO_COMPLETO.md](./GUIA_INSTALACAO_COMPLETO.md)** ⭐ **RECOMENDADO**
   - Guia único e sequencial completo
   - Deploy usando DigitalOcean App Platform (PaaS)
   - Configuração de todos os serviços
   - Tempo estimado: 1h30-2h
   - Custo mensal: ~R$164

2. **[DIGITALOCEAN_SETUP.md](./DIGITALOCEAN_SETUP.md)**
   - Deploy tradicional em VPS (Droplet)
   - Configuração manual de servidor
   - Tempo estimado: 2-3h
   - Custo mensal: ~R$88-118

3. **[DEPLOY.md](./DEPLOY.md)**
   - Deploy genérico para qualquer VPS
   - Suporta Contabo, Vultr, AWS, etc.
   - Comparação de provedores
   - Scripts de instalação automatizados

4. **[QUICKSTART.md](./QUICKSTART.md)**
   - Instalação rápida em 3 comandos
   - Ideal para testes
   - Resumo de custos

### Guias Técnicos

- **[AUTH_SETUP.md](./AUTH_SETUP.md)** - Configuração de autenticação (Google OAuth, Email/Senha)
- **[NEXTAUTH_IMPLEMENTATION.md](./NEXTAUTH_IMPLEMENTATION.md)** - Implementação detalhada do NextAuth
- **[DEPLOY_SCRIPTS.md](./DEPLOY_SCRIPTS.md)** - Scripts de deploy automatizado
- **[DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md)** - Checklist de verificação

### Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev              # Inicia servidor de desenvolvimento
pnpm build            # Compila para produção
pnpm start            # Inicia servidor de produção

# Banco de Dados
pnpm db:push          # Aplica mudanças do schema
pnpm db:studio        # Abre Drizzle Studio (GUI)

# Deploy (DigitalOcean App Platform)
./scripts/deploy-app-platform.sh create    # Criar app
./scripts/deploy-app-platform.sh deploy    # Fazer deploy
./scripts/deploy-app-platform.sh logs      # Ver logs
./scripts/deploy-app-platform.sh info      # Ver informações
```

## 🚀 Deploy

### Opção 1: DigitalOcean App Platform (Recomendado)

O método mais simples e rápido:

```bash
# 1. Fazer fork do repositório no GitHub
# 2. Conectar GitHub ao DigitalOcean
# 3. Criar App Platform a partir do repositório
# 4. Configurar variáveis de ambiente
# 5. Deploy automático!
```

Veja [GUIA_INSTALACAO_COMPLETO.md](./GUIA_INSTALACAO_COMPLETO.md) para instruções detalhadas.

### Opção 2: VPS Tradicional

Para mais controle e economia:

```bash
# 1. Criar Droplet/VPS
ssh root@seu-servidor-ip

# 2. Clonar repositório
git clone https://github.com/israelisd1/arch-render-app.git
cd arch-render-app

# 3. Executar script de instalação
sudo ./install.sh

# 4. Configurar variáveis de ambiente
nano .env

# 5. Iniciar aplicação
pm2 start ecosystem.config.js
```

Veja [DIGITALOCEAN_SETUP.md](./DIGITALOCEAN_SETUP.md) ou [DEPLOY.md](./DEPLOY.md) para mais detalhes.

## 💰 Custos Estimados

### DigitalOcean App Platform (PaaS)
| Serviço | Custo/mês |
|---------|------------|
| App (Basic) | $12 (~R$60) |
| PostgreSQL (Basic) | $15 (~R$75) |
| Spaces (250GB) | $5 (~R$25) |
| Domínio .com.br | ~R$3 |
| **TOTAL** | **~R$163/mês** |

### VPS Tradicional
| Serviço | Custo/mês |
|---------|------------|
| Droplet (2GB RAM) | $12 (~R$60) |
| Spaces (250GB) | $5 (~R$25) |
| Domínio .com.br | ~R$3 |
| **TOTAL** | **~R$88/mês** |

*Custos adicionais: RapidAPI (uso), Stripe (2.9% + R$0.39 por transação)*

## 🔐 Segurança

- ✅ HTTPS obrigatório (Let's Encrypt)
- ✅ Headers de segurança (Helmet.js)
- ✅ Validação de entrada (Zod)
- ✅ Proteção CSRF
- ✅ Rate limiting
- ✅ Senhas com bcrypt
- ✅ Tokens JWT seguros
- ✅ Variáveis de ambiente criptografadas

## 📁 Estrutura do Projeto

```
arch-render-app/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── contexts/      # Contextos (Language, Auth)
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── lib/           # Utilitários e configurações
│   │   └── _core/         # Core hooks e componentes
│   └── index.html
├── server/                # Backend Node.js
│   ├── routers.ts        # Rotas tRPC
│   ├── index.ts          # Servidor Express
│   └── middleware/       # Middlewares
├── drizzle/              # Schema do banco de dados
│   └── schema.ts
└── shared/               # Código compartilhado
    └── const.ts
```

## 🎨 Capturas de Tela

### Página Principal
Interface limpa e intuitiva com call-to-action destacado.

### Sistema de Ajustes
Modal com controles visuais para ajuste fino das renderizações.

### Histórico
Visualização de todas as renderizações com status em tempo real.

### Painel Admin
Dashboard completo com estatísticas e gerenciamento.

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 👤 Autor

**Israel Dias**
- GitHub: [@israelisd1](https://github.com/israelisd1)
- Email: israelisd@gmail.com

## 🙏 Agradecimentos

- [RapidAPI](https://rapidapi.com/) - API de renderização com Renderização Avançada
- [Stripe](https://stripe.com/) - Processamento de pagamentos
- [DigitalOcean](https://www.digitalocean.com/) - Infraestrutura cloud
- [Shadcn/ui](https://ui.shadcn.com/) - Componentes UI

---

**Desenvolvido com ❤️ por Israel Dias**
