import {
  ORGANIZE_SYSTEM_PROMPT,
  buildCompactPayload,
  normalizeModelResult,
  parseModelJson,
  type OrganizePayload,
  type OrganizeResult,
} from "./organize";

/* App 内 AI 直连配置：OpenAI 兼容接口（xAI / DeepSeek / GLM / Kimi 等）。
 * Key 只存在本机 localStorage，不会上传。 */

export type AiConfig = {
  baseUrl: string;
  apiKey: string;
  model: string;
};

const STORAGE_KEY = "lilu-ai-config-v1";

export function getAiConfig(): AiConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Record<string, unknown>;
    if (
      typeof c.apiKey === "string" &&
      c.apiKey.trim() &&
      typeof c.baseUrl === "string" &&
      c.baseUrl.trim() &&
      typeof c.model === "string" &&
      c.model.trim()
    ) {
      return { baseUrl: c.baseUrl.trim(), apiKey: c.apiKey.trim(), model: c.model.trim() };
    }
  } catch {
    // 忽略损坏的配置
  }
  return null;
}

export function saveAiConfig(config: AiConfig): void {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      baseUrl: config.baseUrl.trim(),
      apiKey: config.apiKey.trim(),
      model: config.model.trim(),
    }),
  );
}

export function clearAiConfig(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}

export async function organizeWithAi(
  data: OrganizePayload,
  config: AiConfig,
): Promise<OrganizeResult> {
  const url = config.baseUrl.replace(/\/+$/, "") + "/chat/completions";
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.2,
        max_tokens: 2200,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: ORGANIZE_SYSTEM_PROMPT },
          { role: "user", content: JSON.stringify(buildCompactPayload(data)) },
        ],
      }),
    });
  } catch {
    return { ok: false, error: "network" };
  }

  if (!res.ok) {
    return { ok: false, error: `api ${res.status}` };
  }

  const body = (await res.json().catch(() => null)) as {
    choices?: { message?: { content?: string } }[];
  } | null;
  const raw = body?.choices?.[0]?.message?.content ?? "";
  const parsed = parseModelJson(raw);
  if (!parsed) return { ok: false, error: "bad json" };
  return normalizeModelResult(parsed, data);
}
