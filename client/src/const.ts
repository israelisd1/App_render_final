export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "App";

export const APP_LOGO =
  import.meta.env.VITE_APP_LOGO ||
  "https://placehold.co/128x128/E1E7EF/1F2937?text=App";

// Generate login URL at runtime based on active auth provider
export const getLoginUrl = () => {
  // Para OAuth Manus
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};

// Get login URL based on active auth provider (async version)
export async function getLoginUrlAsync(): Promise<string> {
  try {
    const response = await fetch('/api/trpc/systemConfig.getAuthProvider');
    const data = await response.json();
    const provider = data.result?.data?.json || data.result?.data || 'manus';
    
    if (provider === 'nextauth') {
      return '/login';
    }
  } catch (error) {
    console.error('[getLoginUrlAsync] Failed to detect auth provider:', error);
  }
  
  // Fallback para OAuth Manus
  return getLoginUrl();
}