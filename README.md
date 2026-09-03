# AI Assistant UI

React frontend for the deployment investigation assistant.

## Features

- Start and continue deployment investigation conversations.
- Display structured answers with confidence levels.
- List persistent application memories.
- Save production-region and default-service memories.
- Surface validation and backend errors in the interface.
- Explore the implemented backend design through the interactive **How it works** architecture dialog.
- Open a per-message execution trace to inspect what happened during one specific request.

## Architecture visualization

The **How it works** control opens a high-level diagram of the current backend architecture. Selectable nodes explain responsibilities, inputs, outputs, collaborators, and safety constraints. A request-flow walkthrough highlights the direct-answer path and the optional tool-selected RAG feedback loop step by step.

Architecture content is maintained separately from rendering in `src/architectureModel.ts` as typed nodes, edges, and flow steps. `AgentArchitectureDialog` renders that model with React, CSS, and a lightweight SVG connection layer; no graph dependency is needed for the fixed, small architecture.

The architecture view explains how the system is built. It is intentionally separate from **View execution**, which lazily loads observable events from one completed assistant request.

## Local development

Requirements: Node.js 20+ and the AI Assistant backend running on port `8080`.

```bash
npm install
npm run dev
```

The Vite development server proxies `/chat`, `/memory`, and `/api` to `http://localhost:8080`.

To call another backend directly, create `.env.local`:

```dotenv
VITE_API_BASE_URL=http://localhost:8080
```

When a direct URL is configured, that backend must permit requests from the frontend origin.

## Commands

```bash
npm run dev
npm run lint
npm run build
```
