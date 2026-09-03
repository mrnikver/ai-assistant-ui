# AI Assistant UI

React frontend for the deployment investigation assistant.

## Features

- Start and continue deployment investigation conversations.
- Display structured answers with confidence levels.
- List persistent application memories.
- Save production-region and default-service memories.
- Surface validation and backend errors in the interface.

## Local development

Requirements: Node.js 20+ and the AI Assistant backend running on port `8080`.

```bash
npm install
npm run dev
```

The Vite development server proxies `/chat` and `/memory` to `http://localhost:8080`.

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
