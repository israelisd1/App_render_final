# Guia do Usuário - Sistema de Assinaturas Arqrender

**Versão**: 1.0  
**Data**: 02/11/2025  
**Autor**: Manus AI

---

## Introdução

Bem-vindo ao sistema de assinaturas do **Arqrender**, a plataforma de renderização arquitetônica avançada que transforma seus desenhos 2D em imagens fotorrealistas em segundos. Este guia explica como funcionam os planos de assinatura, suas diferenças e como gerenciar sua conta.

---

## Visão Geral dos Planos

O Arqrender oferece dois planos de assinatura mensal, cada um projetado para atender diferentes necessidades profissionais.

### Comparação de Planos

| Característica | Plano Basic | Plano Pro |
|----------------|-------------|-----------|
| **Preço** | R$ 99,90/mês | R$ 149,90/mês |
| **Renderizações/mês** | 100 | 170 |
| **Qualidade** | HD (1920x1080) | Ultra HD (resolução máxima) |
| **Tempo de processamento** | ~15 segundos | ~30 segundos |
| **Download alta resolução** | ❌ | ✅ |
| **Formatos** | JPG, PNG, WebP, AVIF | JPG, PNG, WebP, AVIF |
| **Suporte** | Email | Prioritário |

---

## Plano Basic

O **Plano Basic** é ideal para freelancers, pequenos escritórios e profissionais que precisam de renderizações de qualidade para apresentações e portfólios digitais.

### Características Principais

**Quota Mensal**: Você recebe 100 renderizações por mês, que são renovadas automaticamente no início de cada ciclo de cobrança.

**Qualidade HD**: Todas as renderizações são processadas em qualidade HD (1920x1080 pixels), perfeita para apresentações em tela, redes sociais e documentos digitais. A qualidade é otimizada para equilibrar detalhes visuais e tamanho de arquivo, resultando em imagens de aproximadamente 200-300 KB.

**Processamento Rápido**: Utilizamos o modo "standard" da API de renderização, que processa suas imagens em aproximadamente 15 segundos. Este tempo rápido permite iterações ágeis durante o processo criativo.

**Formatos Disponíveis**: Escolha entre JPG (melhor compatibilidade), PNG (transparência), WebP (compressão moderna) ou AVIF (máxima eficiência).

### Quando Escolher o Plano Basic

O Plano Basic é recomendado se você:
- Trabalha principalmente com apresentações digitais
- Precisa de renderizações para redes sociais e marketing online
- Cria até 100 visualizações por mês
- Busca o melhor custo-benefício

---

## Plano Pro

O **Plano Pro** foi desenvolvido para profissionais que exigem a máxima qualidade e precisam de maior volume de renderizações mensais.

### Características Principais

**Quota Mensal Ampliada**: Receba 170 renderizações por mês, 70% a mais que o Plano Basic, ideal para escritórios com múltiplos projetos simultâneos.

**Qualidade Ultra HD**: As renderizações são processadas no modo "detailed" da API, sem nenhuma compressão posterior. Isso resulta em imagens com resolução máxima (geralmente acima de 2000x2000 pixels) e tamanhos de arquivo superiores a 1 MB, preservando todos os detalhes arquitetônicos.

**Download em Alta Resolução**: Exclusivo do Plano Pro, você tem acesso a um botão adicional "📥 Download Alta Resolução (Pro)" no histórico de renderizações. Este botão baixa a imagem original da API, sem qualquer processamento ou compressão, ideal para impressões de grande formato e apresentações profissionais.

**Processamento Detalhado**: O modo "detailed" leva aproximadamente 30 segundos por renderização, mas entrega qualidade fotorrealista superior, com melhor tratamento de iluminação, texturas e sombras.

**Suporte Prioritário**: Suas dúvidas e solicitações são atendidas com prioridade pela equipe de suporte.

### Quando Escolher o Plano Pro

O Plano Pro é recomendado se você:
- Precisa de imagens para impressão em grande formato
- Trabalha com apresentações para clientes exigentes
- Cria mais de 100 visualizações por mês
- Necessita da máxima qualidade fotorrealista
- Valoriza suporte prioritário

---

## Como Assinar

### Passo 1: Acessar a Página de Planos

Faça login na plataforma e acesse a página `/pricing` clicando em "Planos" no menu ou no badge do seu plano atual no header.

### Passo 2: Escolher seu Plano

Compare as características dos planos Basic e Pro e clique no botão "Assinar [Nome do Plano]" do plano desejado.

### Passo 3: Checkout Seguro

Você será redirecionado para o **Stripe Checkout**, uma plataforma de pagamento segura e certificada PCI DSS. Preencha:
- Dados do cartão de crédito
- Informações de cobrança
- Email para recibos

### Passo 4: Confirmação

Após o pagamento bem-sucedido, você retornará automaticamente para o Arqrender com seu plano ativo. Um badge visual aparecerá no header indicando seu plano atual.

---

## Gerenciamento de Assinatura

### Acessar o Painel de Gerenciamento

Clique no badge do seu plano no header ou acesse diretamente `/subscription` para visualizar e gerenciar sua assinatura.

### Informações Disponíveis

**Status da Assinatura**: Veja se sua assinatura está ativa, cancelada ou pendente.

**Estatísticas de Uso**: Três cards informativos mostram:
1. **Quota Mensal**: Total de renderizações incluídas no seu plano
2. **Utilizadas**: Quantas renderizações você já criou neste ciclo, com barra de progresso visual
3. **Disponíveis**: Renderizações restantes (incluindo extras, se houver)

**Próxima Cobrança**: Data exata em que o próximo pagamento será processado e sua quota será renovada.

---

## Upgrade de Plano

### Como Fazer Upgrade

Se você está no Plano Basic e deseja migrar para o Plano Pro:

1. Acesse `/pricing`
2. Clique em "Assinar Pro"
3. O Stripe calculará automaticamente a **proration** (proporcionalidade)
4. Você pagará apenas a diferença proporcional ao tempo restante do ciclo atual
5. Seu plano será atualizado **imediatamente**

### Exemplo de Proration

Se você está no dia 15 de um ciclo de 30 dias:
- Você já pagou R$ 99,90 pelo Basic
- Restam 15 dias (50% do ciclo)
- Diferença entre planos: R$ 149,90 - R$ 99,90 = R$ 50,00
- Você pagará: R$ 50,00 × 50% = **R$ 25,00**
- No próximo ciclo, pagará o valor integral do Pro (R$ 149,90)

---

## Cancelamento de Assinatura

### Como Cancelar

1. Acesse `/subscription`
2. Role até a seção "Ações"
3. Clique em "Cancelar Assinatura"
4. Confirme no dialog de confirmação

### O que Acontece Após o Cancelamento

**Acesso Mantido**: Você continuará com acesso total ao seu plano até o final do período já pago. Por exemplo, se você cancelar no dia 10 e sua próxima cobrança seria no dia 30, você terá acesso até o dia 30.

**Aviso Visual**: Um aviso vermelho aparecerá indicando "Assinatura será cancelada em [data]".

**Sem Reembolso**: Não há reembolso proporcional. Você mantém o acesso pelo período já pago.

**Quota Não Renovada**: Após o fim do período, sua quota mensal não será renovada e você voltará ao plano Free (se disponível).

---

## Reativação de Assinatura

Se você cancelou sua assinatura mas mudou de ideia **antes do fim do período pago**:

1. Acesse `/subscription`
2. Clique em "Reativar Assinatura" (botão verde)
3. Sua assinatura voltará ao status ativo
4. A cobrança automática será retomada no próximo ciclo

**Importante**: Você só pode reativar enquanto ainda tiver acesso. Após o fim do período, será necessário criar uma nova assinatura.

---

## Renderizações Extras

### O que são Renderizações Extras?

Renderizações extras são pacotes adicionais que você pode comprar a qualquer momento para complementar sua quota mensal, sem alterar seu plano.

### Como Funcionam

**Preço**: R$ 49,90 por pacote de 20 renderizações

**Qualidade**: As renderizações extras **respeitam a qualidade do seu plano atual**:
- Se você tem Plano Basic, os extras serão em HD
- Se você tem Plano Pro, os extras serão em Ultra HD

**Validade**: Renderizações extras **não expiram** e não são renovadas mensalmente. Elas ficam disponíveis até serem utilizadas.

**Prioridade de Uso**: O sistema consome primeiro sua quota mensal. Quando a quota mensal acabar, passa a consumir os extras.

### Como Comprar

1. Acesse `/subscription`
2. Na seção "Comprar Renderizações Extras", clique em "Comprar Extras"
3. Complete o pagamento no Stripe (R$ 49,90)
4. As 20 renderizações serão adicionadas imediatamente ao campo "Disponíveis"

---

## Forma de Pagamento

### Atualizar Cartão de Crédito

1. Acesse `/subscription`
2. Na seção "Forma de Pagamento", clique em "Gerenciar"
3. Você será redirecionado para o **Stripe Customer Portal**
4. No portal, você pode:
   - Atualizar dados do cartão
   - Trocar método de pagamento
   - Ver histórico de faturas
   - Baixar recibos em PDF

### Falha no Pagamento

Se um pagamento falhar (cartão expirado, saldo insuficiente, etc.):
- Você receberá um email do Stripe
- Sua assinatura entrará em status "past_due"
- Você terá alguns dias para atualizar o pagamento
- Após o prazo, a assinatura será cancelada automaticamente

---

## Controle de Qualidade por Plano

### Como Funciona

O sistema **automaticamente** ajusta a qualidade da renderização baseado no seu plano atual. Você não precisa escolher manualmente.

### Plano Basic - Qualidade HD

Quando você cria uma renderização com o Plano Basic:
1. A API é chamada com parâmetro `quality="standard"`
2. O processamento leva ~15 segundos
3. A imagem retornada é comprimida automaticamente para HD (1920x1080)
4. O arquivo final tem ~200-300 KB
5. Apenas a versão HD é salva no banco de dados

### Plano Pro - Qualidade Ultra HD

Quando você cria uma renderização com o Plano Pro:
1. A API é chamada com parâmetro `quality="detailed"`
2. O processamento leva ~30 segundos
3. A imagem original é salva **sem compressão**
4. Uma versão HD também é gerada para visualização rápida
5. **Ambas as URLs** são salvas no banco de dados

### Download de Imagens

**Plano Basic**:
- Você vê apenas o botão "Baixar Imagem"
- Este botão baixa a versão HD (comprimida)

**Plano Pro**:
- Você vê **dois botões**:
  1. "Baixar Imagem" → versão HD (mesma do Basic)
  2. "📥 Download Alta Resolução (Pro)" → versão original sem compressão (> 1 MB)

---

## Badge de Plano no Header

### Identificação Visual

Após assinar um plano, um badge visual aparece no header da aplicação, ao lado do seu nome de usuário.

**Plano Basic**:
- Gradiente: Amber/Orange
- Ícone: Raio (⚡)
- Texto: "Basic"

**Plano Pro**:
- Gradiente: Orange/Red
- Ícone: Coroa (👑)
- Texto: "Pro"

### Funcionalidade

O badge é **clicável** e redireciona para a página de gerenciamento de assinatura (`/subscription`), facilitando o acesso rápido às suas informações.

---

## Perguntas Frequentes

### Posso mudar de plano a qualquer momento?

Sim. Você pode fazer upgrade de Basic para Pro a qualquer momento. O Stripe calculará automaticamente a proration e você pagará apenas a diferença proporcional.

### E se eu quiser fazer downgrade de Pro para Basic?

Atualmente, o sistema não suporta downgrade automático. Entre em contato com o suporte para solicitar o downgrade manual.

### As renderizações extras expiram?

Não. Renderizações extras não expiram e ficam disponíveis até serem utilizadas, independentemente de renovações mensais.

### Posso cancelar e reativar quantas vezes quiser?

Sim, mas você só pode reativar enquanto ainda tiver acesso (antes do fim do período pago). Após o período expirar, será necessário criar uma nova assinatura.

### Recebo reembolso se cancelar no meio do mês?

Não. Não há reembolso proporcional, mas você mantém acesso total até o final do período já pago.

### Posso usar renderizações extras sem ter um plano ativo?

Não. Renderizações extras só podem ser compradas e utilizadas por usuários com plano ativo (Basic ou Pro).

### A qualidade das renderizações extras é diferente?

Não. As renderizações extras respeitam a qualidade do seu plano atual (HD para Basic, Ultra HD para Pro).

### Como sei quantas renderizações ainda tenho disponíveis?

Acesse `/subscription` e veja o card "Disponíveis", que mostra a soma de renderizações mensais restantes + extras.

### O que acontece com minhas renderizações antigas se eu cancelar?

Todas as renderizações já criadas permanecem acessíveis no histórico (`/history`), mesmo após o cancelamento. Você só perde a capacidade de criar novas renderizações.

### Posso compartilhar minha conta com colegas?

Não recomendamos. Cada assinatura é individual e o compartilhamento pode violar os termos de uso. Para equipes, entre em contato para planos corporativos.

---

## Suporte

### Como Obter Ajuda

**Email**: Entre em contato através do email de suporte (informado no rodapé da aplicação)

**Prioridade**: Usuários do Plano Pro têm suporte prioritário e recebem respostas mais rápidas.

**Stripe Customer Portal**: Para questões de pagamento, acesse o portal do Stripe através do botão "Gerenciar" em `/subscription`.

---

## Segurança e Privacidade

### Processamento de Pagamentos

Todos os pagamentos são processados pelo **Stripe**, uma das plataformas de pagamento mais seguras do mundo, certificada PCI DSS Level 1. Seus dados de cartão de crédito **nunca** são armazenados nos servidores do Arqrender.

### Dados Pessoais

Armazenamos apenas informações essenciais para o funcionamento do serviço:
- Email
- Nome
- ID do cliente Stripe
- Histórico de renderizações

Não compartilhamos seus dados com terceiros, exceto o Stripe para processamento de pagamentos.

---

## Conclusão

O sistema de assinaturas do Arqrender foi projetado para oferecer flexibilidade, transparência e qualidade profissional. Seja você um freelancer buscando custo-benefício ou um escritório que exige máxima qualidade, temos o plano ideal para suas necessidades.

**Comece agora**: Acesse `/pricing` e escolha seu plano!

---

**Versão do Documento**: 1.0  
**Última Atualização**: 02/11/2025  
**Autor**: Manus AI  
**Feedback**: Sugestões e dúvidas são bem-vindas através do email de suporte.

