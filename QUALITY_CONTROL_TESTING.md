# Guia de Teste - Controle de Qualidade por Plano

## Resumo da Implementação

Sistema de diferenciação de qualidade entre planos Basic e Pro implementado com sucesso.

### Mudanças Implementadas

#### 1. Backend - API de Renderização
- **Arquivo**: `server/architectureApi.ts`
- **Parâmetro**: `quality` com valores `"standard"` ou `"detailed"`
- **Lógica**: 
  - Plano Basic/Free → `quality: "standard"` (~15s)
  - Plano Pro → `quality: "detailed"` (~30s, alta resolução)

#### 2. Backend - Compressão de Imagens
- **Arquivo**: `server/imageCompression.ts`
- **Biblioteca**: Sharp (instalada)
- **Funcionalidade**:
  - Comprime imagens para HD (1920x1080) mantendo proporção
  - Qualidade: 85% para JPG/PNG/WebP, 80% para AVIF
  - Apenas para planos Basic/Free
  - Plano Pro recebe imagem original sem compressão

#### 3. Backend - Fluxo de Renderização
- **Arquivo**: `server/routers.ts`
- **Lógica**:
  1. Determina qualidade baseada no plano do usuário
  2. Salva qualidade no registro do banco de dados
  3. Chama API com parâmetro correto
  4. Após API retornar:
     - **Basic/Free**: Baixa imagem, comprime para HD, faz upload da versão comprimida
     - **Pro**: Usa imagem original da API (sem compressão)

#### 4. Banco de Dados
- **Tabela**: `renders`
- **Novo campo**: `quality` ENUM('standard', 'detailed')
- **Migração**: Aplicada com sucesso

#### 5. Frontend - Botão de Download HD
- **Arquivo**: `client/src/pages/HistoryPage.tsx`
- **Funcionalidade**:
  - Botão "📥 Download Alta Resolução (Pro)" visível apenas para usuários Pro
  - Estilo destacado com gradiente laranja
  - Traduções PT-BR e EN adicionadas

---

## Plano de Testes

### Teste 1: Renderização com Plano Basic

**Pré-requisitos:**
- Usuário logado com plano "basic" ou "free"

**Passos:**
1. Acessar página de renderização (`/render`)
2. Fazer upload de uma imagem 2D
3. Selecionar tipo de cena (Interior/Exterior)
4. Adicionar prompt opcional
5. Clicar em "Iniciar Renderização"

**Resultados Esperados:**
- ✅ Console do servidor deve mostrar: `quality="standard"` e `plan="basic"`
- ✅ Tempo de renderização: ~15 segundos
- ✅ Console deve mostrar: "Plano Basic/Free detectado - comprimindo imagem para HD..."
- ✅ Imagem final deve ter resolução máxima de 1920x1080
- ✅ Na página de histórico, **não** deve aparecer botão "Download Alta Resolução"

**Logs Esperados:**
```
[Render] User plan: basic, quality: standard
[ArchitectureAPI] Rendering with quality="standard" for plan="basic"
[Render 123] Plano Basic/Free detectado - comprimindo imagem para HD...
[ImageCompression] Original size: 2560x1440
[ImageCompression] Compressing to: 1920x1080
[ImageCompression] Size reduced by 45.2% (1234567 → 676543 bytes)
```

---

### Teste 2: Renderização com Plano Pro

**Pré-requisitos:**
- Usuário logado com plano "pro"
- Para testar, atualizar plano do usuário no banco:
  ```sql
  UPDATE users SET plan = 'pro' WHERE id = [SEU_USER_ID];
  ```

**Passos:**
1. Acessar página de renderização (`/render`)
2. Fazer upload de uma imagem 2D
3. Selecionar tipo de cena (Interior/Exterior)
4. Adicionar prompt opcional
5. Clicar em "Iniciar Renderização"

**Resultados Esperados:**
- ✅ Console do servidor deve mostrar: `quality="detailed"` e `plan="pro"`
- ✅ Tempo de renderização: ~30 segundos
- ✅ Console deve mostrar: "Plano Pro - usando qualidade máxima (sem compressão)"
- ✅ Imagem final mantém resolução original da API (sem limite)
- ✅ Na página de histórico, **deve aparecer** botão "📥 Download Alta Resolução (Pro)"

**Logs Esperados:**
```
[Render] User plan: pro, quality: detailed
[ArchitectureAPI] Rendering with quality="detailed" for plan="pro"
[Render 124] Plano Pro - usando qualidade máxima (sem compressão)
[Render 124] Renderização concluída com sucesso
```

---

### Teste 3: Interface do Usuário - Botão HD

**Teste 3.1: Usuário Basic**
- Fazer login como usuário Basic
- Acessar `/history`
- Verificar que renderizações concluídas mostram:
  - ✅ Botão "Baixar Imagem" (outline, amber)
  - ❌ **NÃO** deve mostrar botão "Download Alta Resolução"

**Teste 3.2: Usuário Pro**
- Fazer login como usuário Pro
- Acessar `/history`
- Verificar que renderizações concluídas mostram:
  - ✅ Botão "Baixar Imagem" (outline, amber)
  - ✅ Botão "📥 Download Alta Resolução (Pro)" (gradiente laranja)

---

### Teste 4: Comparação de Qualidade

**Objetivo:** Comparar visualmente a diferença entre renderizações Basic e Pro

**Passos:**
1. Usar a **mesma imagem** para ambos os testes
2. Renderizar com plano Basic
3. Alterar plano para Pro no banco de dados
4. Renderizar a mesma imagem com plano Pro
5. Comparar as duas imagens renderizadas

**Diferenças Esperadas:**
- **Basic**: Resolução limitada a 1920x1080, arquivo menor
- **Pro**: Resolução original da API (geralmente maior), arquivo maior, mais detalhes

---

### Teste 5: Tratamento de Erros

**Teste 5.1: Erro na Compressão (Basic)**
- Simular erro na compressão (ex: imagem corrompida)
- Verificar que sistema usa imagem original da API como fallback
- Log esperado: "Erro ao comprimir imagem" + "Usando imagem original da API"

**Teste 5.2: Erro na API**
- Simular erro na API (ex: chave inválida)
- Verificar que erro é tratado corretamente
- Status da renderização deve ser "failed"

---

## Comandos Úteis para Testes

### Alterar Plano do Usuário
```sql
-- Ver plano atual
SELECT id, email, plan FROM users WHERE email = 'seu@email.com';

-- Alterar para Basic
UPDATE users SET plan = 'basic' WHERE email = 'seu@email.com';

-- Alterar para Pro
UPDATE users SET plan = 'pro' WHERE email = 'seu@email.com';
```

### Ver Logs do Servidor
```bash
# Ver logs em tempo real
cd /home/ubuntu/arch-render-app
pnpm dev
```

### Ver Renderizações no Banco
```sql
SELECT 
  id, 
  userId, 
  quality, 
  status, 
  createdAt,
  completedAt
FROM renders 
ORDER BY createdAt DESC 
LIMIT 10;
```

---

## Checklist de Validação

### Backend
- [x] Parâmetro `quality` implementado na API
- [x] Lógica de determinação de qualidade baseada no plano
- [x] Módulo de compressão de imagens criado
- [x] Sharp instalado e funcionando
- [x] Compressão aplicada apenas para Basic/Free
- [x] Logs detalhados implementados
- [x] Campo `quality` adicionado ao schema
- [x] Migração aplicada no banco de dados

### Frontend
- [x] Botão HD condicional implementado
- [x] Visível apenas para usuários Pro
- [x] Traduções PT-BR e EN adicionadas
- [x] Estilo visual diferenciado (gradiente laranja)

### Testes
- [ ] Teste 1: Renderização Basic executado
- [ ] Teste 2: Renderização Pro executado
- [ ] Teste 3: Interface validada para ambos os planos
- [ ] Teste 4: Comparação visual realizada
- [ ] Teste 5: Tratamento de erros validado

---

## Próximos Passos

1. Executar todos os testes listados acima
2. Documentar resultados e screenshots
3. Ajustar se necessário
4. Atualizar `todo.md` marcando FASE 5 como concluída
5. Criar checkpoint com todas as mudanças
6. Continuar para FASE 6 (Frontend de Assinaturas)

