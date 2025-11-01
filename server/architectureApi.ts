/**
 * Serviço de integração com a Arqrender API via RapidAPI
 */

interface RenderRequest {
  sceneType: "interior" | "exterior";
  outputFormat: "webp" | "jpg" | "png" | "avif";
  image: string; // URL ou base64
  prompt?: string;
  base64Response?: boolean;
  quality?: "standard" | "detailed"; // Controla qualidade: standard (~15s) ou detailed (~30s)
}

interface RenderResponse {
  output?: string; // URL da imagem renderizada
  base64?: string;
  error?: string;
  message?: string; // Mensagem de erro da API
}

/**
 * Chama a API de renderização arquitetônica
 * @param request - Parâmetros da renderização
 * @param userPlan - Plano do usuário para controlar qualidade:
 *   - 'free' ou 'basic': quality="standard" (~15s)
 *   - 'pro': quality="detailed" (~30s, alta resolução)
 */
export async function callArchitectureRenderingAPI(
  request: RenderRequest,
  userPlan: 'free' | 'basic' | 'pro' = 'basic'
): Promise<RenderResponse> {
  const apiKey = process.env.RAPIDAPI_KEY;
  
  if (!apiKey) {
    throw new Error("RAPIDAPI_KEY not configured");
  }

  try {
    // Qualidade baseada no plano do usuário:
    // - Basic: quality="standard" (~15s, qualidade padrão)
    // - Pro: quality="detailed" (~30s, qualidade máxima)
    const qualityLevel = userPlan === 'pro' ? 'detailed' : 'standard';
    
    const enhancedRequest = {
      ...request,
      quality: qualityLevel,
    };
    
    console.log(`[ArchitectureAPI] Rendering with quality="${qualityLevel}" for plan="${userPlan}"`);

    const response = await fetch(
      "https://architecture-rendering-api.p.rapidapi.com/render",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-rapidapi-host": "architecture-rendering-api.p.rapidapi.com",
          "x-rapidapi-key": apiKey,
        },
        body: JSON.stringify(enhancedRequest),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[ArchitectureAPI] Error response:", errorText);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[ArchitectureAPI] Request failed:", error);
    throw error;
  }
}

