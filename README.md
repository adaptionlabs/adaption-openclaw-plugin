# Adaption Provider for OpenClaw

Use [Adaption](https://adaptionlabs.ai) models in [OpenClaw](https://openclaw.ai).

The plugin adds an `adaption` provider to OpenClaw. It sends requests to the
Adaption Chat Completions API, so OpenClaw's own tools (read, write, exec) run
with Adaption models such as `glm-5.2`, `deepseek-v4-flash` and `qwen3.8-27b`.

## Installation

You need OpenClaw `2026.11.10` or newer and an Adaption API key (`pt_live_…`)
with the `inference:write` scope.

```bash
openclaw plugins install @adaption/openclaw-provider
```

## Sign in

Run `openclaw onboard`, choose **Adaption** and paste your API key.

Or set the key in your environment and onboard without prompts:

```bash
export ADAPTION_API_KEY=pt_live_...
openclaw onboard --non-interactive --accept-risk --auth-choice adaption-api-key
```

Onboarding sets `adaption/glm-5.2` as the default model.

## Choose a model

```bash
openclaw models set adaption/deepseek-v4-flash
openclaw agent exec "Summarize this repository" --model adaption/qwen3.8-27b
```

| Model | Context | Images | Thinking levels |
|---|---|---|---|
| `glm-5.2` | 786K | no | off, high, max |
| `glm-5.3-flash` | 1M | no | low, high, max |
| `deepseek-v4-flash` | 1M | no | off, low, high, max |
| `qwen3.8-27b` | 262K | yes | off, low, medium, xhigh |
| `gemma-4-26b-a4b-it` | 256K | yes | — |
| `nemotron-SEA-LION-v4.8-120b-a12b` | 262K | no | — |
| `qwen-SEA-LION-v5-397b-a17b-plus` | 262K | yes | — |

Models that cannot call tools are not listed, because the OpenClaw agent needs
tool calls to work.

## Configuration

| Setting | Default | Use |
|---|---|---|
| `ADAPTION_API_KEY` | — | API key, if you do not paste it during onboarding |
| `models.providers.adaption.baseUrl` | `https://api.prod.adaptionlabs.ai/api/v1` | Another Adaption environment |

```bash
openclaw config set models.providers.adaption.baseUrl https://api.prod.adaptionlabs.ai/api/v1
```

## Development

```bash
npm install
npm run typecheck
npm test
npm pack
openclaw plugins install npm-pack:./adaption-openclaw-provider-0.1.0.tgz --force --accept-capabilities
```

## License

MIT
