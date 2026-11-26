import {
  buildManifestModelProviderConfig,
  readManifestProviderDefaultModelRef,
} from "openclaw/plugin-sdk/provider-catalog-shared";
import type {
  ModelDefinitionConfig,
  ModelProviderConfig,
} from "openclaw/plugin-sdk/provider-model-shared";
import manifest from "../openclaw.plugin.json" with { type: "json" };

export const PROVIDER_ID = "adaption";
export const ADAPTION_API = "openai-completions";

const CATALOG = manifest.modelCatalog.providers.adaption;
const UNKNOWN_CONTEXT_WINDOW = 131_072;
const DEFAULT_MAX_TOKENS = 32_768;

// Adaption also hosts models without tool calling; OpenClaw's agent loop needs tools.
const NO_TOOL_MODEL_IDS = new Set(["gemma-4-31b-it", "qwen3.5-397b"]);

export const ADAPTION_BASE_URL = CATALOG.baseUrl;
export const ADAPTION_DEFAULT_MODEL_REF = readManifestProviderDefaultModelRef(manifest, PROVIDER_ID)!;

export function buildStaticAdaptionModels(): ModelDefinitionConfig[] {
  return buildManifestModelProviderConfig({ providerId: PROVIDER_ID, catalog: CATALOG }).models;
}

export function buildStaticAdaptionProvider(): ModelProviderConfig {
  return { baseUrl: ADAPTION_BASE_URL, api: ADAPTION_API, models: buildStaticAdaptionModels() };
}

type AdaptionModelRow = {
  id?: unknown;
  display_name?: unknown;
  max_input_tokens?: unknown;
};

export function projectAdaptionLiveModels(rows: readonly unknown[]): ModelDefinitionConfig[] {
  const known = new Map(buildStaticAdaptionModels().map((model) => [model.id, model]));
  const seen = new Set<string>();
  const models: ModelDefinitionConfig[] = [];
  for (const row of rows) {
    if (!row || typeof row !== "object" || Array.isArray(row)) continue;
    const { id: rawId, display_name, max_input_tokens } = row as AdaptionModelRow;
    const id = typeof rawId === "string" ? rawId.trim() : "";
    if (!id || seen.has(id) || NO_TOOL_MODEL_IDS.has(id)) continue;
    seen.add(id);
    const fallback = known.get(id);
    const contextWindow =
      positiveInteger(max_input_tokens) ?? fallback?.contextWindow ?? UNKNOWN_CONTEXT_WINDOW;
    models.push({
      ...(fallback ?? {
        id,
        name: typeof display_name === "string" && display_name.trim() ? display_name.trim() : id,
        reasoning: false,
        input: ["text"],
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
      }),
      contextWindow,
      maxTokens: Math.min(fallback?.maxTokens ?? DEFAULT_MAX_TOKENS, contextWindow),
    });
  }
  return models;
}

function positiveInteger(value: unknown): number | undefined {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0 ? value : undefined;
}
