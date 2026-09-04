---
name: frontend-feature
description: Implement or modify React UI behavior in ai-assistant-ui while preserving its component, styling, state, accessibility, and API conventions. Use for frontend feature or maintenance changes; not for unrelated redesigns.
---

# Frontend feature

Follow the repository `AGENTS.md`.

## Workflow

1. Trace the affected UI from `src/App.tsx` into existing components, colocated CSS, `src/api.ts`, and `src/types.ts`. Inspect the backend contract in `../AI-assist` when data crosses the API boundary.
2. Reuse established components, semantic HTML, accessibility behavior, styling vocabulary, state patterns, API error handling, and typed contracts. Add a component when it creates a clear responsibility boundary; avoid both oversized components and needless wrappers.
3. Implement the smallest coherent change. Do not redesign unrelated screens, introduce a new state/styling/data-fetching system for a local need, or edit generated `dist/` output.
4. Verify loading, empty, success, validation, and failure states relevant to the change. Preserve keyboard and dialog behavior where applicable.
5. Run `npm run build`; also run `npm run lint` when relevant. Review `git diff` and `git status` before reporting.
