// Types for SDK subpaths that openclaw publishes without declarations.

declare module "openclaw/plugin-sdk/provider-model-shared" {
  import type { ProviderPlugin, ProviderRuntimeModel } from "openclaw/plugin-sdk/plugin-entry";

  export type ModelDefinitionConfig = Omit<ProviderRuntimeModel, "provider" | "api" | "baseUrl"> & {
    api?: ProviderRuntimeModel["api"];
    baseUrl?: string;
  };

  export type ModelProviderConfig = {
    baseUrl: string;
    api?: ProviderRuntimeModel["api"];
    models: ModelDefinitionConfig[];
  };

  export function buildProviderReplayFamilyHooks(options: {
    family: "openai-compatible";
    dropReasoningFromHistory?: boolean;
  }): Pick<ProviderPlugin, "buildReplayPolicy" | "sanitizeReplayHistory" | "resolveReasoningOutputMode">;
}

declare module "openclaw/plugin-sdk/provider-catalog-shared" {
  import type { OpenClawConfig } from "openclaw/plugin-sdk/plugin-entry";
  import type { ModelProviderConfig } from "openclaw/plugin-sdk/provider-model-shared";

  export type ConfiguredProviderCatalogEntry = {
    id: string;
    name: string;
    provider: string;
    contextWindow?: number;
    reasoning?: boolean;
    input?: Array<"text" | "image" | "audio" | "video" | "document">;
  };

  export function buildManifestModelProviderConfig(params: {
    providerId: string;
    catalog: unknown;
  }): ModelProviderConfig;

  export function readConfiguredProviderCatalogEntries(params: {
    config?: OpenClawConfig;
    providerId: string;
  }): ConfiguredProviderCatalogEntry[];

  export function readManifestProviderDefaultModelRef(
    manifest: unknown,
    providerId: string,
  ): string | undefined;
}

declare module "openclaw/plugin-sdk/provider-entry" {
  import type {
    OpenClawConfig,
    OpenClawPluginDefinition,
    ProviderPlugin,
  } from "openclaw/plugin-sdk/plugin-entry";
  import type {
    ModelDefinitionConfig,
    ModelProviderConfig,
  } from "openclaw/plugin-sdk/provider-model-shared";

  type SingleProviderDefinition = Omit<
    ProviderPlugin,
    "id" | "label" | "docsPath" | "aliases" | "envVars" | "auth" | "catalog" | "staticCatalog"
  > & {
    label: string;
    docsPath: string;
    manifestAuth?: {
      applyConfig?: (config: OpenClawConfig) => OpenClawConfig;
      noteTitle?: string;
      noteMessage?: string;
    };
    catalog: {
      buildProvider?: () => ModelProviderConfig;
      buildStaticProvider?: () => ModelProviderConfig;
      allowExplicitBaseUrl?: boolean;
      liveModelDiscovery?:
        | true
        | {
            endpointPath?: string;
            timeoutMs?: number;
            ttlMs?: number;
            projectRows?: (rows: readonly unknown[]) => ModelDefinitionConfig[];
          };
    };
  };

  export function defineSingleProviderPluginEntry(options: {
    id: string;
    name: string;
    description: string;
    manifest?: unknown;
    provider?: SingleProviderDefinition;
  }): OpenClawPluginDefinition;
}

declare module "openclaw/plugin-sdk/provider-tools" {
  import type { ProviderPlugin } from "openclaw/plugin-sdk/plugin-entry";

  export function buildProviderToolCompatFamilyHooks(
    family: "openai",
  ): Pick<ProviderPlugin, "normalizeToolSchemas" | "inspectToolSchemas">;
}

declare module "openclaw/plugin-sdk/provider-onboard" {
  import type { OpenClawConfig, ProviderRuntimeModel } from "openclaw/plugin-sdk/plugin-entry";
  import type { ModelDefinitionConfig } from "openclaw/plugin-sdk/provider-model-shared";

  export function createModelCatalogPresetAppliers(params: {
    primaryModelRef: string;
    resolveParams: (config: OpenClawConfig) => {
      providerId: string;
      api: ProviderRuntimeModel["api"];
      baseUrl: string;
      catalogModels: ModelDefinitionConfig[];
    };
  }): {
    applyProviderConfig: (config: OpenClawConfig) => OpenClawConfig;
    applyConfig: (config: OpenClawConfig) => OpenClawConfig;
  };
}
