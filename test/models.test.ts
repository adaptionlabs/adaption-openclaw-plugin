import { describe, expect, it } from "vitest";
import { buildStaticAdaptionModels, projectAdaptionLiveModels } from "../src/models.js";

describe("buildStaticAdaptionModels", () => {
  it("offers only models that can call tools", () => {
    const ids = buildStaticAdaptionModels().map((model) => model.id);
    expect(ids).toContain("glm-5.2");
    expect(ids).not.toContain("gemma-4-31b-it");
    expect(ids).not.toContain("qwen3.5-397b");
  });
});

describe("projectAdaptionLiveModels", () => {
  it("keeps catalog metadata and takes the context window from the listing", () => {
    const [model] = projectAdaptionLiveModels([{ id: "qwen3.8-27b", max_input_tokens: 200000 }]);
    expect(model).toMatchObject({
      id: "qwen3.8-27b",
      reasoning: true,
      input: ["text", "image"],
      contextWindow: 200000,
      maxTokens: 32768,
    });
  });

  it("drops models without tool calling and duplicates", () => {
    const models = projectAdaptionLiveModels([
      { id: "gemma-4-31b-it" },
      { id: "qwen3.5-397b" },
      { id: "glm-5.2" },
      { id: "glm-5.2" },
      null,
      { id: "" },
    ]);
    expect(models.map((model) => model.id)).toEqual(["glm-5.2"]);
  });

  it("lists a new model with safe defaults", () => {
    const [model] = projectAdaptionLiveModels([
      { id: "new-model", display_name: "New Model", max_input_tokens: 16000 },
    ]);
    expect(model).toMatchObject({
      id: "new-model",
      name: "New Model",
      reasoning: false,
      input: ["text"],
      contextWindow: 16000,
      maxTokens: 16000,
      cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    });
  });
});
