# Hosna interactive portfolio — living technical documentation

Last reviewed: 2026-09-27. Scope: the implemented V2 workspace, not a deployed release.

## 1. Executive technical summary — implemented now

The approved static portfolio now uses explicit work statuses, deterministic query
routing and genuine BM25 lexical ranking over curated public evidence. Its visible
name is **Hosna's Personal AI Assistant**. There is no live LLM, external AI API,
embedding model, backend, analytics or persistent conversation storage.

V2 retains the cream/off-white and dark-green palette, editorial typography, ha.
identity, two-column desktop hero, four featured project cards, seven reviewed
images, section order, filters and four suggested question cards. New portfolio
and preparation records are assistant-accessible without adding featured cards.
Only header wrapping and keyboard focus CSS were added; browser visual approval
is still required.

The build produces 32 public entities from 25 curated records, five professional
links and two dashboard descriptions. Validation and public visibility filtering
are part of the build itself. The original 59-test baseline passed before edits;
the final suite has 127 passing tests. No push, deployment or commit was performed.

## 2. Problem statement and purpose

Help visitors explore Hosna's professional work and find evidence through a
conversation, while retaining the portfolio's conventional browsing experience.
The previous implementation confused recency with current work, missed ordinary
paraphrases, discarded some multi-intent questions, repeated whole summaries for
narrow questions, and bypassed visibility checks through aliases and context.
V2 addresses these concrete issues without adding unnecessary infrastructure.

## 3. Final technology stack

- Vanilla HTML, CSS and browser JavaScript ES modules; local/system fonts.
- Node.js native filesystem, HTTP server, assertions and test runner. README
  recommends Node 22 or newer; this run used Node v26.5.1.
- JSON knowledge records and metadata; no database.
- Existing development dependencies: LinkeDOM for DOM interaction tests and
  Playwright for the sandbox-enabled browser audit. No dependency was added.
- Optional macOS AppKit/PDFKit asset preparation; generated JPEGs are already
  present and normal builds require no conversion tools.

## 4. Final system architecture

```text
Curated JSON + public links + reviewed dashboard descriptions
                       |
             schema + visibility validation
                       |
       public filtering + evidence enrichment + allowlist build
                       |
              dist/ static site and knowledge.json
                       |
      app.js DOM rendering <--> LocalKnowledgeProvider
                                    |
                     safety / context / intent routing
                                    |
                 metadata filters + public BM25 index
                                    |
                   curated metadata answer composition
                                    |
                     textContent + verified actions
```

The static development server serves only `dist/` on loopback. No application
server participates in answering questions. The optional remote selector class
is inactive and has no configured endpoint.

## 5. Knowledge-base architecture and flow

`knowledge/` contains profile/contact, education, experience, projects, research,
publications, skills, achievements and leadership arrays. `links.json` and
`media.json` hold public link and reviewed media metadata separately.

`scripts/build.mjs` loads the nine entity files, validates all records, filters
public entities/links/media and calls `src/knowledge.js`. Enrichment creates five
link records and two dashboard records from verified descriptions. It deliberately
does not use photograph captions, image pixels or alt text as professional claims.
The enriched result is validated again and serialized to `dist/knowledge.json`.

The browser fetches that single JSON document, filters entities to public again,
and uses the same evidence for browsing and conversation. Featured flags preserve
the existing four-project and three-research-card presentation.

## 6. Knowledge schema and validation

Entities require `id`, `category`, `title`, `date`, `summary`, `role`,
`technologies`, `tags`, `source`, `visibility`, `anchor` and `urls`.
`source` is a required human-readable provenance statement; `urls` is an array
of verified `{label, url}` actions, not inferred destinations.

Optional fields are `status`, integer `year`, `plannedWork` and boolean `featured`.
Projects and research require status. Dates remain display strings; project
`year` supports only the year-level chronology actually available. IDs must be
unique lowercase slugs; categories and visibility use controlled values. Text,
array types, optional fields, anchors, URL labels/schemes, image paths, positive
integer dimensions and nonempty alt/caption/source fields are validated.
Unknown entity/link/media fields are rejected for explicit review before publication.

`visibility` accepts public or private so the build can reject malformed private
records and demonstrably exclude well-formed private fixtures. Private knowledge
should still be kept outside a public source repository. Schema validation cannot
detect every sensitive fact accidentally placed in a public summary; human content
review remains required.

## 7. Status model: current, planned and completed

- **Current:** UTAS Research Degree Assistant, the interactive portfolio,
  TasEnergy Insight, human–AI interaction review, and Research / PhD Preparation.
- **Completed:** ThreatBrief AI, CyberQuiz Pro, brain-tumour research and microwave
  imaging research. ThreatBrief remains a strong completed project and team award.
- **Planned:** supported as a controlled status, but no existing whole project was
  relabelled planned merely to populate this category. TasEnergy is in progress;
  its proposed modelling/SQL/Power BI work is `plannedWork`. Research preparation
  also records exploratory next steps. Planned/next queries can return these
  current records, displaying their proposed steps rather than claiming completion.

UTAS current status and this portfolio's current work are recorded for this
owner-directed V2 refinement. CyberQuiz's delivered platform is classified
completed from its existing description; no exact completion date was supplied.
Research / PhD Preparation uses only the owner's supplied direction: MetaHuman /
digital human interfaces and AI/LLM systems. It expressly does not establish a
project, approved PhD topic, publication, appointment or completed research.

Status is never derived from array order, tags such as recent, repository activity
or a hard-coded project boost. Latest/recent project queries use `year` after
filtering. The 2026 projects tie; responses disclose that a unique newest project
cannot be verified. No fabricated month, completion date or ordering was added.
These are manually maintained snapshots, not automatically refreshed statuses.

## 8. Query-processing pipeline

1. Normalize Unicode with NFKC, lowercase, replace non-ASCII alphanumerics with
   spaces and trim. The UI limits questions to 400 characters.
2. Reject privacy/instruction-sensitive requests and unsupported approved-PhD claims.
3. Resolve independently answerable conjunction clauses; merge their results
   round-robin with duplicate removal, capped at five.
4. Resolve explicit entity aliases against public entities only. Filter explicit
   status-list requests separately; status questions about a named entity may
   return that entity to say it is completed.
5. Resolve referential follow-ups only when exactly one previous entity is known.
6. Collect category intents, apply status and AI/BI project filters, and require
   substantive subject terms to occur in candidate evidence.
7. Score eligible records through the cached public BM25 index; apply year filtering
   for recent/latest projects and interleave multiple categories fairly.
8. Compose grounded field-specific text and render verified actions.

## 9. Retrieval algorithm and ranking

Lexical ranking replaces the previous weighted title/tag/body substring scores.
Aliases and generic category requests remain deterministic routing shortcuts.
Ranking is not used to infer status or validate a URL. Broad category requests
may intentionally enumerate records with zero lexical scores after a recognized
category filter; narrow subject queries must have matching subject evidence and
positive scores. Unsupported subjects cannot use the generic category fallback.
Ties are deterministic by entity ID, not original array position.

## 10. BM25 implementation

`createIndex` and `bm25` in `src/retrieval.js` implement Okapi BM25 with **k1=1.2**
and **b=0.75**. Searchable text concatenates title, summary, role, tags,
technologies and proposed work once each. Source labels, URLs, dates and visibility
are not relevance evidence. There are no field multipliers.

Tokenization uses the normalization above, a small English stopword set and an
explicit canonical map for common plurals and variants (e.g. dashboards/dashboard,
currently/current, qualifications/education). There is no general stemmer or
semantic model. Query terms are deduplicated for scoring.

For each query term t and document d:

```text
idf(t) = ln(1 + (N - df(t) + 0.5) / (df(t) + 0.5))
score += idf(t) * tf(t,d) * (k1 + 1)
         / (tf(t,d) + k1 * (1 - b + b * length(d) / averageLength))
```

N counts public documents. Document frequency increments once per document per
term; term frequency counts occurrences. Length and mean length use the same
tokenization. A unit test checks document-frequency handling and the numeric
formula. A WeakMap caches indexes by corpus array; the application treats loaded
corpora as immutable. Rebuild/reload after knowledge edits. Return paths recheck
visibility even if a test changes it after indexing.

## 11. Algorithms considered but not implemented

MiniLM, embeddings, vector databases, hybrid retrieval and RRF were not added.
The development evaluation's observed failures are solved by better lexical
retrieval, coverage and routing. No evidence currently justifies those extra
models, downloads or infrastructure. This is not proof that semantic retrieval
could never help; a future held-out evaluation should establish that need first.
No local LLM, external LLM API or new backend was implemented.

## 12. Query routing and multi-intent handling

Supported routes cover current/planned/completed/recent projects, named projects,
research, publications, education, experience, individual and general skills,
BI/Power BI, dashboard examples, achievements, leadership, contact and professional
links including ORCID. All matching categories can contribute; education plus
publications and named-project plus education questions are tested.

Conjunction handling is pragmatic, not a full natural-language parser. Clauses
are used independently when each retrieves evidence; otherwise the complete
query retains its subject guard. AI/BI project filtering is separate from lexical
ranking. Unsupported skills and invented employer/project qualifiers return unknown.

## 13. Conversation context

`app.js` keeps only previous answer entity IDs as active retrieval context, while
messages remain in the page DOM. A unique project supports more/role/technology/
date/status/link follow-ups. Explicit entity names override old context. Multiple
possible referents return unknown instead of guessing. An unknown clears active
IDs on the next UI update. Clear chat and page refresh remove session context.
There are no cookies, localStorage, sessionStorage, analytics or profiling.

## 14. Assistant architecture and response generation

`LocalKnowledgeProvider.answer(question, entities, previousIds)` calls retrieval
then composition. Its result includes `text`, original `entries`, optional keyed
`details`, a `facet` and suggested `followups`. Keeping original entries preserves
source/URL ownership while details provide concise answers.

Technologies use the recorded technology list; roles use role metadata; dates use
display date and status; status answers use explicit status and proposed steps;
link requests expose only existing actions. Missing technologies, roles or external
URLs are stated as unavailable. Other queries use curated summaries; individual
skill questions identify their matched skill evidence. No free-form factual model
generation occurs. If several facets are requested, the current composer selects
one by precedence (technology, date, role, status, links); this remains a limitation.

## 15. Grounding and anti-hallucination

Answers come only from verified public records. Unmatched/private/unsafe requests
produce the explicit verified-information unknown response and no evidence links.
Every narrow query requires substantive terms in the same candidate; aliases
also check added subject terms. This favors conservative refusal over unrelated
evidence. The filter is not a comprehensive semantic truth checker and can refuse
valid unfamiliar wording. No credentials, clinical efficacy, approved PhD or live
demo is inferred from an image, project title or adjacent record.

## 16. Sources, provenance and contextual actions

Existing CV-curated public facts, prior reviewed repository READMEs and publication
DOIs retain their source labels. New preparation/portfolio records cite the owner's
V2 instruction/current implementation. Sources were not freshly fetched from the
web during V2; earlier audit verification dates remain historical.

Actions use verified entity URLs and internal anchors: project, GitHub, publication,
research, dashboard examples, contact and public profiles. ORCID and other links
are retrievable as records. Dashboard descriptions state that no client identity,
authorship, delivery date or business outcome is inferred. Source labels may name
an original PDF; this does not expose a PDF download. No live demo or CV action
was invented. Provenance remains simple text plus structured URL actions rather
than a new citation database.

## 17. Privacy and security architecture

- Every retrieval route, including aliases, direct lookup and context, uses public
  visibility. Tests mark known IDs private, including after cache creation.
- `build()` validates and filters entities, links and media before writing output;
  a synthetic private-input build proves excluded content does not enter JSON or assets.
- Build assets and source modules are explicitly allowlisted. No recursive copy
  of uploads, workspace sources, cache, evaluation fixtures or `.env` occurs.
- `.gitignore` excludes all PDFs and raw uploads, retaining selected JPEG previews.
  The CV/raw dashboard PDFs remain local and unchanged. Git has no tracked files
  or commits, so no historical private blobs required removal.
- Tests use synthetic private-address/phone/secret markers, never real private
  CV-derived values. Public facts, including the approved email, remain intentional.
- HTTPS and simple mailto URLs are validated; script/data/http schemes, credentials,
  local hosts and mail query headers are rejected. Public assets must match
  `assets/selected/[a-z0-9-]+.jpg`. Allowlisting does not independently certify the
  content of a future replacement image; review it before adding metadata.
- UI uses DOM creation and textContent, never injected question HTML. Existing
  same-origin CSP, no-object policy, referrer policy, noopener/noreferrer and
  nosniff server header remain intact. The server normalizes paths beneath dist.
- `RemoteSelectionProvider` is inactive. If explicitly enabled in future it sends
  question plus public candidate records, accepts only candidate IDs, discards
  model prose/URLs and falls back locally on failure. Its comment describes the
  accepted result boundary, not an assertion that only IDs are transmitted.

No automatic scanner can establish that every future public sentence is private-
information-free. Curated visibility and human review are part of the security model.

## 18. Frontend structure and design decisions

`public/index.html` owns semantic page structure and initial assistant controls;
`public/styles.css` owns the approved responsive layout; `src/app.js` renders records,
media, filters, chat, source actions, navigation and load/image fallbacks. The
assistant remains above the fold by design, though current measurements await a
permitted browser. Full naming appears in the heading; short “assistant” labels
avoid repetition in every answer. No new heavy UI system was added.

## 19. Accessibility

Automated DOM checks cover labeled form controls, 400-character limit, semantic
log and polite aria-live, aria-busy, starter buttons, filter pressed state, skip link,
menu Escape handling, image alt text/dimensions and missing-image fallback. CSS
checks preserve reduced motion, mobile rules, min-width and visible focus.
Focus styling now also covers summary and tabindex elements. These tests do not
measure contrast, actual keyboard focus order, reflow or screen-reader speech.

The existing Playwright suite checks keyboard interactions, desktop above-fold
input, overflow at 320/375/390/768/1440px, mobile menu/chat, image loading and
screenshots. V2 attempted it with Chromium sandbox enabled and a workspace-local
profile; Chrome aborted before page opening with SIGABRT and cleanup EPERM.
No browser assertion passed in that attempt. Do not disable sandboxing to obtain
an accessibility or visual claim. Human checks remain necessary.

## 20. Testing architecture and final verification

`npm run check` passes native JavaScript syntax and entity/metadata validation.
`npm run build` passes and emits 32 public records plus seven JPEG previews.
`npm test` passes **127/127**, with no failures or skips. Tests include the original
59 cases (updated for count, explicit chronology and narrow responses), evaluation
regressions, BM25 formula, status-order invariance, planned fixtures, context,
public build exclusion, schema/URL/assets, DOM rendering/injection, starters and
HTTP 404 boundaries. Existing team-summary evidence remains tested separately
from the new role-specific answer.

HTTP tests start their own loopback server and verify content types, nosniff,
private paths, all seven JPEGs and public knowledge. Build inventory tests compare
every emitted filename to the explicit expected set. DOM tests use LinkeDOM;
they are not browser layout certification. No new dependency audit result is claimed.

## 21. Evaluation dataset and reproducibility

`evaluation/queries.json` contains 54 manually labeled cases: 41 positive retrieval
queries, seven unknown/unsupported cases and six privacy/instruction cases. Nine
positive cases additionally score current/completed status accuracy. Cases cover
exact names, paraphrases, current/planned/completed work, links, dashboards, skills,
education/publications, follow-ups, unknowns and private aliases/context.

The dataset was established before replacing retrieval. `evaluation/baseline/`
preserves the actual original retriever and 23-entity public build payload; it is
excluded from production. `baseline-results.json` preserves the original measured
run. The dataset later served as a development/regression set, not a blind held-out
benchmark. Perfect development results must not be advertised as general accuracy.

Commands (after building):

```sh
npm run evaluate
node scripts/evaluate.mjs --baseline
node scripts/evaluate.mjs --legacy-current
```

Each writes a mode-specific JSON report with per-query IDs and metrics. Re-running
baseline reproduces its algorithm/corpus comparison but replaces its timing sample;
preserve recorded evidence when preparing releases. The legacy-current run controls
for corpus expansion while retaining old routing/scoring. It does not isolate BM25
from all routing improvements; no BM25-only causal claim is made.

## 22. Precision@K

K=5. Per-positive-query precision is relevant IDs retrieved in the first five divided
by **five**, even when fewer than five are returned; the report macro-averages over
41 positive queries. Original baseline: **0.131707**. Original retrieval on V2
corpus: **0.151220**. Final V2: **0.419512**.

Most queries have only one or two relevant records. Under the fixed-five definition,
0.419512 is this dataset's attainable macro precision ceiling; it is not a 58% rate
of irrelevant V2 answers. V2 returned only labeled relevant records in this set.

## 23. Recall@K

Recall is relevant returned IDs divided by all labeled relevant IDs for each
positive query, macro-averaged. Original: **0.349593**. Legacy on V2 corpus:
**0.386992**. Final V2: **1.000000**. Some original misses reflect unavailable
knowledge as well as routing; the fixed-corpus comparison makes that distinction visible.

## 24. Mean reciprocal rank

MRR uses the reciprocal rank of the first relevant result within five (zero if
missing), macro-averaged over positive queries. Original: **0.439024**. Legacy on
V2 corpus: **0.451220**. Final V2: **1.000000**. This does not measure prose quality,
all-intent completeness outside the labels or general semantic understanding.

## 25. Unknown/refusal and privacy evaluation

Correct rejection means no retrieved records. Original unknown rejection: **7/7**;
legacy on expanded corpus: **6/7**; V2: **7/7**. Original and legacy privacy rejection:
**4/6**; V2: **6/6**. The two original failures were private entity alias/context
bypasses. Privacy tests use synthetic visibility changes, not real private data.

## 26. Current-vs-completed accuracy

A status case passes only if retrieval is nonempty and every result belongs to
the independently labeled allowed set for the requested status. Original: **0/9**;
legacy on V2 corpus: **3/9**; final V2: **9/9**. Recall is scored separately to avoid
mistaking one valid record for a complete answer. Planned-next cases also pass
their exact relevance tests; they correctly return TasEnergy's proposed work and
research preparation without labelling these finished.

## 27. Performance measurements

The artificial 180ms response delay was removed. Evaluation warms each query for
five corpus passes, then measures 50 passes over 54 queries: **2,700 samples**
using Node performance.now. Final V2 warm p50: **0.015208ms**; p95: **0.084292ms**.
Original recorded p50: **0.074000ms**; p95: **0.126209ms**. Legacy on V2 corpus p50:
**0.094084ms**; p95: **0.155333ms**. These are local microbenchmarks on Node v26.5.1,
not browser rendering/network timings or guaranteed production latency. They include
routing but exclude browser DOM work and cold index construction after warmup.

The static build measured approximately **1,428 KiB on disk** with seven lazy-loaded
JPEGs (`du -sk dist`). Disk allocation is not compressed transfer size or a Core Web
Vitals measurement. No runtime package, font download or model download was added.

## 28. Asset pipeline

Keep originals local and ignored. `scripts/prepare-assets.js` optionally creates
reviewed JPEGs using native macOS PDFKit/AppKit. Existing hospital page 8 and pharma
page 2 previews remain unchanged; excluded contact-detail pages are not published.
The build copies only metadata-listed public selected JPEGs and named HTML/CSS/SVG
files. Missing optional previews warn and retain UI fallback. Alt text, dimensions,
lazy loading, decoding hints and larger-image actions remain. Metadata is not a
license to introduce unreviewed image claims or public raw PDF downloads.

## 29. Deployment and versioning architecture

Only `dist/` is a future publishable artifact. The local server binds 127.0.0.1 and
defaults to port 4173; HTTP tests use 4187. Static hosting can serve the module-relative
paths, including a repository subdirectory. No workflow, remote repository, deployment,
push, release or backend was created. An existing local preview process already owned
4173 during the browser attempt; it was not terminated.

Git reports no commits on main; source files are currently untracked. This V2 evidence
does not imply earlier versioned history. A future initial commit must honestly record
the current implementation; subsequent meaningful iterations can then be versioned.
No historical commits were fabricated.

## 30. Human-directed AI-assisted development

Human direction supplies the concept, goals, professional content, privacy decisions,
design review, requirements, corrections, validation priorities and acceptance decisions.
AI assistance supports code refinement, test construction, audit, implementation
suggestions and documentation. The AI did not independently conceive this portfolio.
No contribution percentages are claimed. The owner must approve visual/content
acceptance; passing development tests does not substitute for that judgment.

## 31. Current limitations

- English lexical normalization is deliberately small; typos, non-English input,
  complex negation, novel paraphrases and complicated mixed intents can be refused.
- Context has one-turn entity resolution, not a conversation model; ambiguous
  follow-ups return unknown, and multiple answer facets currently use precedence.
- Year-level dates cannot establish a unique latest 2026 completed project.
- Knowledge/status/source URLs need manual maintenance; V2 did not reverify web links.
- The evaluation is small and development-visible, with no independent held-out set.
- Browser visual/accessibility/performance checks remain blocked by the environment.
- No automated image OCR/privacy detector, exhaustive sensitive-text classifier,
  contrast audit or independently verified award-readiness score is claimed.

## 32. Possible future work — not implemented

Collect owner-reviewed held-out visitor questions, expand grounded synonyms based
on failures, improve multi-facet answers and ask for clarification when context is
ambiguous. Record verified finer project dates if available. Perform real-browser,
screen-reader and visual review in a permitted environment. Consider semantic
retrieval only if a measured lexical gap warrants it. Any remote provider requires
separate privacy disclosure, server-only secrets, endpoint controls and acceptance.

## 33. Award/demo evidence and maintenance contract

Available evidence includes the frozen original retrieval implementation/corpus,
before/after and fixed-corpus JSON reports, a reproducible evaluation script,
127 automated tests, synthetic privacy-build test, explicit status/provenance,
reviewed project screenshots and dashboard previews, this documentation and the
engineering changelog. Browser screenshots are not claimed as V2 evidence.

`AGENTS.md` requires that changes affecting architecture, behavior, retrieval,
knowledge, tests, security, privacy, deployment or major UI update this document
and the changelog before completion. Record what is actually implemented, link
to new evidence, and keep proposed work clearly separate. Do not replace human
acceptance with an unsupported “award-ready” claim.
