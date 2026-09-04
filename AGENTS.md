# Frontend project instructions

- This repository is the React 19 / TypeScript / Vite frontend. Its Spring Boot backend is the sibling repository `../AI-assist`.
- Read relevant components, styles, API helpers, types, and `README.md` before editing. Reuse existing UI patterns and API helpers; keep components focused and avoid unrelated redesigns.
- Preserve unrelated working-tree changes and review the final diff for accidental or generated edits. Do not hand-edit `dist/` or commit build output unless explicitly requested.
- Use `$git-workflow` for repository delivery. Every feature or project change starts from an updated `main` on a new, descriptive branch; never change `main` directly.
- Branch names must not contain `codex`. Prefer an appropriate prefix such as `feature/`, `fix/`, `docs/`, or `chore/`.
- Push the branch and open a pull request to `main`, then stop for user review. Do not merge the pull request.
- After the user confirms the reviewed change was pushed or merged, verify it reached remote `main`, switch to local `main`, and pull it with fast-forward only.
- Do not add tests unless the user explicitly requests them.
- Before changing an API contract, inspect the backend endpoint and response/request types in `../AI-assist`; keep coordinated changes independently reviewable in each repository.
- Never expose secrets through `VITE_*` variables or client-side code.
- Run `npm run build` after frontend changes. Run `npm run lint` when the change warrants it, and report any check that could not run.

