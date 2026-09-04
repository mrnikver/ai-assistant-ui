---
name: pull-request-authoring
description: Prepare and open review-ready GitHub pull requests for this React/TypeScript frontend. Use when publishing a change or drafting, improving, or checking a PR title and description; use git-workflow for branch and delivery mechanics.
---

# Pull request authoring

Create a PR that lets a reviewer understand the purpose, validate the user experience, and identify risk without reconstructing the work from the diff. Follow `$git-workflow` for repository state, branching, commits, pushing, and stopping for review.

## Make the change reviewable

- Keep the PR to one coherent outcome. Separate unrelated refactors, generated changes, dependency updates, and formatting churn when they obscure that outcome.
- Compare the complete branch with the actual base branch. Read every changed line, remove accidental edits, and confirm no credentials, tokens, user data, or server-only secrets entered client code or `VITE_*` variables.
- Preserve existing UI and API patterns and explain intentional deviations. If a large PR cannot be split safely, give reviewers an order through the files and identify the coupling that requires one PR.
- Use a draft PR when feedback is useful but the change is not ready to merge. Do not request final review while known required checks or work remain incomplete.

## Verify the frontend evidence

Follow the nearest `AGENTS.md`; it determines whether tests may be added and which checks are required. Report commands exactly as run and distinguish passed, failed, and not run.

For React changes, cover the relevant evidence rather than listing generic assurances:

- production build and applicable lint or focused verification;
- user-visible states: loading, empty, error, success, disabled, and responsive behavior where affected;
- screenshots or a short recording for material visual or interaction changes, when practical;
- accessibility and keyboard behavior for changed controls;
- compatibility with the Spring endpoint and shared request/response shapes when an API contract changes;
- bundle, dependency, browser, configuration, rollout, or rollback impact when relevant.

Never claim CI, tests, manual behavior, accessibility, browser coverage, or compatibility was verified when it was not.

## Write the PR

Use a short imperative title that names the observable outcome, not the activity. In the body, keep only applicable sections and replace placeholders:

```markdown
## Summary

- <what changed>
- <why this approach>

## Verification

- `npm run build` — passed
- `npm run lint` — passed
- Not run: <check and reason>

## UI evidence

- <screenshot, recording, or manual scenario>

## Review notes

- <risk, trade-off, important file, or review order>

## Related work

- Closes #<issue>
```

Add an issue-closing keyword only when merging this PR should close that issue. Call out breaking changes, security-sensitive areas, dependency changes, and follow-up work explicitly. Omit empty sections and irrelevant boilerplate.

Before opening the PR, confirm the base/head branches, title, body, final diff, and verification results. Use `gh pr create`; request reviewers or labels only when repository conventions or the user identify them. After creation, return the PR link and stop for review as required by `$git-workflow`.

## Sources

- [GitHub: Helping others review your changes](https://docs.github.com/en/pull-requests/concepts/helping-others-review-your-changes)
- [GitHub: Creating a pull request](https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/creating-a-pull-request)
- [GitHub: Linking a pull request to an issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue)
- [Google Engineering Practices: Small CLs](https://google.github.io/eng-practices/review/developer/small-cls.html)
- [Google Engineering Practices: Writing good CL descriptions](https://google.github.io/eng-practices/review/developer/cl-descriptions.html)
