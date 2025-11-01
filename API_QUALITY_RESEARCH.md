# Pesquisa sobre Parâmetros de Qualidade da API MyArchitectAI

## Fonte
- URL: https://www.myarchitectai.com/api
- Data: 30/10/2025

## Resumo Executivo

✅ **Parâmetro confirmado**: `quality`
✅ **Valores**: `"standard"` (15s) ou `"detailed"` (30s)
✅ **Endpoint**: `/accurate` (POST)
✅ **Documentação oficial**: RapidAPI

## Informações Encontradas

### Diferença de Qualidade e Tempo

A documentação oficial do MyArchitectAI menciona explicitamente:

> "Just pass your users' design URL and prompt (optional), and get a rendered image URL back in **10 seconds (standard quality)**, or **30 seconds (detailed quality)**."

### Parâmetros Identificados

Existem **dois níveis de qualidade** disponíveis na API:

1. **Standard Quality** (Qualidade Padrão)
   - Tempo de processamento: ~10 segundos
   - Adequado para visualizações rápidas

2. **Detailed Quality** (Qualidade Detalhada)
   - Tempo de processamento: ~30 segundos
   - Maior resolução e detalhamento
   - Requer mais processamento

### Implementação Proposta

Com base nesta pesquisa, a estratégia de diferenciação de qualidade será:

**Plano Basic (R$99,90/mês - 100 renders)**
- Usar **standard quality** (10 segundos)
- Aplicar compressão adicional na imagem final
- Limitar resolução máxima para HD (1920x1080)
- Ocultar botão de download em alta resolução

**Plano Pro (R$149,90/mês - 170 renders)**
- Usar **detailed quality** (30 segundos)
- Sem compressão adicional (qualidade máxima)
- Resolução completa preservada
- Botão de download em alta resolução visível

### Documentação RapidAPI - Parâmetro Confirmado

**Fonte**: https://rapidapi.com/myarchitectai-team-myarchitectai-team-default/api/architecture-rendering-api

#### Parâmetro `quality` (Endpoint /accurate)

| Campo | Tipo | Descrição |
|---------|--------|-------------|
| `quality` | string | `"standard"` (~15s) ou `"detailed"` (~30s) qualidade de renderização (opcional) |

**Valores possíveis:**
- `"standard"`: Renderização rápida (~15 segundos)
- `"detailed"`: Renderização detalhada (~30 segundos, maior qualidade)

#### Exemplo de Requisição

```json
{
  "outputFormat": "jpg",
  "image": "https://example.com/design.webp",
  "prompt": "modern interior apartment",
  "negativePrompt": "low quality, blur, noise",
  "quality": "detailed"
}
```

### Estratégia de Implementação Confirmada

**Plano Basic (R$99,90/mês - 100 renders)**
- Parâmetro API: `quality: "standard"` (15 segundos)
- Aplicar compressão adicional no backend (reduzir para HD 1920x1080)
- Ocultar botão "Download em Alta Resolução"

**Plano Pro (R$149,90/mês - 170 renders)**
- Parâmetro API: `quality: "detailed"` (30 segundos)
- Sem compressão adicional (preservar qualidade máxima)
- Mostrar botão "Download em Alta Resolução"

### Próximos Passos

1. ✅ **CONFIRMADO**: Parâmetro é `quality` com valores `"standard"` ou `"detailed"`
2. Atualizar função `callArchitectureRenderingAPI` para aceitar parâmetro de plano
3. Implementar lógica para passar `quality: "standard"` para Basic e `quality: "detailed"` para Pro
4. Implementar compressão de imagem usando Sharp para plano Basic
5. Atualizar frontend (RenderCard) para mostrar/ocultar botão de download HD baseado no plano
6. Adicionar campo `quality` ao schema de renders para rastreamento

