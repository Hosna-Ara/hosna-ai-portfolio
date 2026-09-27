# Project maintenance

Preserve the approved cream/off-white and dark-green design, hero, navigation,
featured projects and suggested-question interaction. Do not push or deploy
unless explicitly instructed. Never weaken sandbox, privacy or security controls.

Whenever architecture, behaviour, retrieval, knowledge, tests, security, privacy,
deployment or major UI functionality changes, update the relevant sections of
`docs/technical-audit/SYSTEM_TECHNICAL_DOCUMENTATION.md` and record the meaningful
iteration in `docs/technical-audit/CHANGELOG.md` before considering work complete.
Describe implemented behaviour separately from possible future work.

Run `npm run check`, `npm run build`, `npm test` and `npm run evaluate` for relevant
changes. Attempt sandbox-enabled browser validation when appropriate; document
environment blocks honestly. Never copy private source material into fixtures.
Publish only the allowlisted `dist/` artifact. Status is explicit metadata, never
inferred from project order. Preserve the frozen evaluation baseline as evidence.
