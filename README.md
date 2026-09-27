# Hosna interactive portfolio

A static professional portfolio with **Hosna's Personal AI Assistant** in the
approved cream/dark-green hero. The browser uses 32 curated public evidence records,
deterministic routing and BM25 retrieval. No live LLM, API key, analytics, external
font or runtime package is required.

## Local use

Use Node.js 22 or newer:

```sh
npm ci --cache .cache/npm
npm run check
npm run build
npm test
npm run evaluate
npm run dev
```

Open http://127.0.0.1:4173. Only `dist/` is served. Rebuild after source/content
changes; there is no watcher. Tests and evaluation expect a current production build.

`npm run test:browser` checks real layout and keyboard/browser interactions against
the preview server. It uses installed Chrome, a workspace-local temporary profile
and Chromium sandboxing. The current environment aborts Chrome before page opening
(SIGABRT/EPERM); do not disable sandboxing. DOM/HTTP tests pass but do not certify
visual layout, screen-reader behavior or contrast.

## Source structure

- `public/`: approved HTML/CSS/favicon and reviewed selected JPEGs. Raw uploads
  remain ignored and are never copied wholesale.
- `knowledge/`: curated entity JSON plus professional links and media metadata.
- `src/`: frontend, deterministic retrieval/composition, provider interface and
  public metadata enrichment.
- `scripts/`: schema checks, allowlisted public build, loopback static server,
  evaluation and optional native asset preparation.
- `tests/`: retrieval, provider, schema/privacy, DOM and HTTP tests; browser audit.
- `evaluation/`: labeled queries, frozen original retriever/public corpus and
  measured before/after reports. Never published in the production build.
- `docs/technical-audit/`: living architecture and engineering changelog.

## Content and behavior

Statuses are explicit: current, planned or completed. ThreatBrief AI is completed.
UTAS, this portfolio and TasEnergy are current; TasEnergy's proposed work remains
distinct from finished work. Research / PhD Preparation is exploratory, not an
approved topic or publication. Year-level project ties are disclosed honestly.

The assistant supports project names, individual skills, dashboard examples,
professional links, multi-intent queries and unique-entity follow-ups. Narrow
answers use recorded technologies, role, dates, status or verified links. Unknown
and private requests receive no unrelated evidence. Conversation state stays in
memory and is cleared by Clear chat or refresh.

Update the corresponding JSON and its provenance when editing content. Entity
schema validation rejects unknown fields; add only reviewed public facts. Every
new project/research record needs explicit status. Set `featured: false` when it
should remain conversational evidence without another featured card. Featured
projects without an image also need their visual title in `src/app.js`.

## Assets and privacy

The seven approved JPEGs are already generated. `scripts/prepare-assets.js` can
regenerate them on macOS through AppKit/PDFKit from local originals:

```sh
mkdir -p .cache/pdf-review public/assets/selected
TMPDIR="$PWD/.cache/pdf-review" osascript -l JavaScript scripts/prepare-assets.js
```

Only approved hospital page 8 and pharmaceutical page 2 previews are public.
Original PDFs, CV, unused uploads and source caches remain ignored. Do not add
private content to public JSON, selected images or source code. The build filters
visibility itself and copies only named assets/modules. Tests use synthetic
private values and exercise the actual build boundary.

## Engineering evidence

Original suite: 59 passing tests. V2: 127 passing tests plus a 54-query development
evaluation. The frozen baseline allows reproducible comparison:

```sh
node scripts/evaluate.mjs --baseline
node scripts/evaluate.mjs --legacy-current
npm run evaluate
```

The reports include fixed-five Precision@5, Recall@5, MRR, rejection/status accuracy
and local latency. This small development-visible dataset is not an independent
general-accuracy benchmark. See the technical reference for definitions and results.

## Provider and deployment boundaries

`LocalKnowledgeProvider` is active. `RemoteSelectionProvider` is an inactive
extension point: if explicitly enabled, it sends question/public candidates and
accepts only candidate IDs, falling back locally on failure. No backend, vendor
client, endpoint or live model is configured. Future activation requires a separate
privacy/security review and server-only credentials.

A future static host must publish **only dist/**. No deployment, push, remote,
release or fabricated historical commits were created. Git currently has no
commits; meaningful history begins with a future honest initial snapshot.

## Living documentation

[System technical documentation](docs/technical-audit/SYSTEM_TECHNICAL_DOCUMENTATION.md)
is the authoritative current reference.
[Changelog](docs/technical-audit/CHANGELOG.md) records V2.
[Content audit](CONTENT_AUDIT.md) retains source decisions;
[review notes](REVIEW_NOTES.md) retain earlier review evidence.

As required by `AGENTS.md`, update the living technical documentation and changelog
whenever architecture, behavior, retrieval, knowledge, tests, privacy/security,
deployment or major UI changes. Separate implemented behavior from possible future work.
