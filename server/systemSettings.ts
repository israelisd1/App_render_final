import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { systemSettings } from "../drizzle/schema";

/**
 * Módulo de gerenciamento de configurações do sistema
 * Usado para feature flags e configurações dinâmicas
 */

/**
 * Obter valor de uma configuração
 */
export async function getSystemSetting(key: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.settingKey, key))
      .limit(1);

    return result.length > 0 ? result[0].settingValue : null;
  } catch (error) {
    console.error(`[SystemSettings] Error getting setting ${key}:`, error);
    return null;
  }
}

/**
 * Definir valor de uma configuração
 */
export async function setSystemSetting(
  key: string,
  value: string,
  description?: string,
  updatedBy?: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // Tentar inserir ou atualizar
    await db
      .insert(systemSettings)
      .values({
        settingKey: key,
        settingValue: value,
        description: description || null,
        updatedBy: updatedBy || null,
      })
      .onDuplicateKeyUpdate({
        set: {
          settingValue: value,
          description: description || null,
          updatedBy: updatedBy || null,
        },
      });

    console.log(`[SystemSettings] Setting ${key} updated to: ${value}`);
    return true;
  } catch (error) {
    console.error(`[SystemSettings] Error setting ${key}:`, error);
    return false;
  }
}

/**
 * Obter sistema de autenticação ativo
 * @returns 'manus' ou 'nextauth'
 */
export async function getAuthProvider(): Promise<"manus" | "nextauth"> {
  const value = await getSystemSetting("auth_provider");
  
  // Default: manus (sistema legado ativo por padrão)
  if (!value || (value !== "manus" && value !== "nextauth")) {
    return "manus";
  }
  
  return value as "manus" | "nextauth";
}

/**
 * Definir sistema de autenticação ativo
 */
export async function setAuthProvider(
  provider: "manus" | "nextauth",
  updatedBy?: string
): Promise<boolean> {
  return await setSystemSetting(
    "auth_provider",
    provider,
    `Sistema de autenticação ativo: ${provider}`,
    updatedBy
  );
}

/**
 * Listar todas as configurações
 */
export async function getAllSystemSettings() {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(systemSettings);
  } catch (error) {
    console.error("[SystemSettings] Error getting all settings:", error);
    return [];
  }
}

