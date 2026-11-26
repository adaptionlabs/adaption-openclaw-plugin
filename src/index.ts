import { readConfiguredProviderCatalogEntries } from "openclaw/plugin-sdk/provider-catalog-shared";
import { defineSingleProviderPluginEntry } from "openclaw/plugin-sdk/provider-entry";
import { buildProviderReplayFamilyHooks } from "openclaw/plugin-sdk/provider-model-shared";
import { createModelCatalogPresetAppliers } from "openclaw/plugin-sdk/provider-onboard";
import { buildProviderToolCompatFamilyHooks } from "openclaw/plugin-sdk/provider-tools";
import type { OpenClawPluginDefinition } from "openclaw/plugin-sdk/plugin-entry";
import manifest from "../openclaw.plugin.json" with { type: "json" };
import {
  ADAPTION_API,
  ADAPTION_BASE_URL,
  ADAPTION_DEFAULT_MODEL_REF,
  buildStaticAdaptionModels,
  buildStaticAdaptionProvider,
  PROVIDER_ID,
  projectAdaptionLiveModels,
} from "./models.js";

const presets = createModelCatalogPresetAppliers({
  primaryModelRef: ADAPTION_DEFAULT_MODEL_REF,
  resolveParams: () => ({
    providerId: PROVIDER_ID,
    api: ADAPTION_API,
    baseUrl: ADAPTION_BASE_URL,
    catalogModels: buildStaticAdaptionModels(),
  }),
});

const adaptionPlugin: OpenClawPluginDefinition = defineSingleProviderPluginEntry({
  id: PROVIDER_ID,
  name: "Adaption Provider",
  description: "Adaption provider plugin",
  manifest,
  provider: {
    label: "Adaption",
    docsPath: "/providers/adaption",
    manifestAuth: {
      applyConfig: presets.applyConfig,
      noteTitle: "Adaption",
      noteMessage: [
        "Adaption serves open-weight models through an OpenAI-compatible API.",
        "Create an API key with the inference:write scope at https://adaptionlabs.ai.",
      ].join("\n"),
    },
    catalog: {
      buildProvider: buildStaticAdaptionProvider,
      buildStaticProvider: buildStaticAdaptionProvider,
      allowExplicitBaseUrl: true,
      liveModelDiscovery: {
        endpointPath: "models?type=hosted",
        projectRows: projectAdaptionLiveModels,
      },
    },
    augmentModelCatalog: ({ config }) =>
      readConfiguredProviderCatalogEntries({ config, providerId: PROVIDER_ID }),
    ...buildProviderReplayFamilyHooks({ family: "openai-compatible" }),
    ...buildProviderToolCompatFamilyHooks("openai"),
  },
});

export default adaptionPlugin;
