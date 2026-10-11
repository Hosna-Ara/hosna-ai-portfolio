# Hosna interactive portfolio — living technical documentation

Last reviewed: 2026-10-12. Scope: implemented Portfolio V3, locally validated and awaiting owner review; no deployment by this iteration.

## 1. Executive technical summary — implemented now

The approved static portfolio now uses explicit work statuses, deterministic query
routing and genuine BM25 lexical ranking over curated public evidence. Its visible
name is **Hosna's Personal AI Assistant**. There is no live LLM, external AI API,
embedding model, backend, analytics or persistent conversation storage.

V3 retains the cream/off-white and dark-green palette, editorial typography,
two-column desktop hero, prominent functional assistant, section order, filters
and four suggested questions. The header uses only the cropped approved HB
monogram; the assistant emblem and both hero slogan lines are removed. The exact
eyebrow is A PORTFOLIO THAT YOU CAN TALK, TO KNOW ABOUT; the large heading is
exactly Hosna, without Ara or a trailing full stop. Remaining hero content,
typography, palette and HB branding are unchanged.

Featured Work is CyberQuiz Pro, TasEnergy Insight, UTAS Research Degree Assistant,
then ThreatBrief AI. All four use ordered project media arrays and the reusable
carousel. Thirteen reviewed JPEGs and one navbar PNG are allowlisted. The build
contains 33 public entities from 26 curated records, five professional links and
two dashboard descriptions. V3 passes 180 tests and the 63-query development
evaluation. Sandbox-enabled Chrome cannot open a page in this environment.
Historical V2 metrics remain labeled below; V3 evidence is in section 34.

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
  human–AI interaction review, and Research / PhD Preparation.
- **Completed:** CyberQuiz Pro, ThreatBrief AI, TasEnergy Insight's current
  reporting milestone, brain-tumour research and microwave imaging research.
- **Planned:** a controlled status; no existing whole project is relabelled
  planned just to populate the category. Research preparation retains exploratory
  next steps. TasEnergy's obsolete modelling/SQL/Power BI plannedWork is removed.

TasEnergy completion is owner-confirmed for V3 and supported by the supplied
report screenshots. It does not establish production deployment, live Power BI
Service, automatic refresh or Fabric implementation. The fictional scenario
qualification and existing technologies/repository link remain. The other current
and completed statuses retain their prior reviewed provenance.

Research / PhD Preparation is exploratory, not an approved PhD topic, publication,
appointment or completed research. Status never comes from array order, recent
tags or Featured Work position. Latest queries use year-level metadata and
disclose ties; the three completed 2026 projects have no verified unique newest
ordering. Status and evidence remain manually maintained snapshots.

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
- HTTPS, simple mailto URLs and narrowly scoped relative selected-JPEG evidence actions are validated; script/data/http schemes, credentials,
  local hosts and mail query headers are rejected. Public images must match
  `assets/selected/[a-z0-9-]+.jpg`; future local videos may end in mp4/webm.
  Optional posters use the same JPEG allowlist. Remote media URLs are not enabled. Allowlisting does not independently certify the
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
media, filters, chat, source actions, navigation and load/image fallbacks.
`src/carousel.js` handles ordered project media, the full-screen image gallery and native future video controls. The
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

## 20. Testing architecture and current verification

V3: npm run check, npm run build, npm test and npm run evaluate pass.
The suite has **180/180** passing tests, no failures or skips; the public build
contains 33 entities, 13 selected JPEGs, one HB PNG and five browser modules.
The original 59-test and V2 127-test counts are historical evidence.

Focused V3 tests cover sorting, next/previous/wrap, keyboard controls, live count,
named region/buttons, horizontal swipe, single-item behavior, video-first mixed
metadata, native controls without autoplay, posters, outgoing video pause,
metadata rejection, nested private-slide exclusion, Pages URL resolution,
actual asset existence, branding/copy, both award placements, assistant award
answers and completed/current status distinctions. Existing DOM, retrieval,
BM25, synthetic privacy build and HTTP tests remain active.

HTTP tests verify every reviewed JPEG is served with JPEG bytes, a correct
content type and a size below 400,000 bytes; private source paths return 404.
The inventory test checks the exact production allowlist. LinkeDOM and HTTP
tests do not certify browser layout or screen-reader behavior.

The V3 sandbox-enabled browser attempt aborted before opening a page
(SIGABRT; EPERM during cleanup). No browser assertions or V3 browser screenshots
are claimed. The browser suite now includes carousel image loading, keyboard
wrap, single-item controls and certificate capture for a permitted future run.

## 21. Historical V2 evaluation dataset and reproducibility

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

Each writes a mode-specific JSON report with per-query IDs and metrics. The default
command now uses v3-queries.json and writes v3-results.json; queries.json and
v2-results.json remain unchanged historical evidence. Re-running
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
mistaking one valid record for a complete answer. Historically, V2 planned-next cases returned TasEnergy's proposed work and
research preparation. V3 removes TasEnergy from these cases after the owner-confirmed
reporting milestone and preserves the historical labels in queries.json.

## 27. Performance measurements

The artificial 180ms response delay was removed. Evaluation warms each query for
five corpus passes, then measures 50 passes over 54 queries: **2,700 samples**
using Node performance.now. Final V2 warm p50: **0.015208ms**; p95: **0.084292ms**.
Original recorded p50: **0.074000ms**; p95: **0.126209ms**. Legacy on V2 corpus p50:
**0.094084ms**; p95: **0.155333ms**. These are local microbenchmarks on Node v26.5.1,
not browser rendering/network timings or guaranteed production latency. They include
routing but exclude browser DOM work and cold index construction after warmup.

The historical V2 static build measured approximately **1,428 KiB on disk** with seven lazy-loaded
JPEGs (`du -sk dist`). Disk allocation is not compressed transfer size or a Core Web
Vitals measurement. No runtime package, font download or model download was added.

## 28. Asset pipeline

Original uploads are read only and remain ignored/unpublished. Existing hospital
page 8 and pharma page 2 previews remain unchanged; excluded contact-detail pages
and source PDFs are not published. Build copying is limited to reviewed public
metadata paths and the named HB derivative. All metadata, evidence-asset references
and file existence are checked before removing the previous build. A missing
required source asset fails the build; runtime load failures retain captions and
project descriptions.

scripts/prepare-assets.js remains the optional historical macOS AppKit/PDFKit
pipeline. scripts/prepare-v3-assets.py optionally creates V3 derivatives using
locally available Pillow; Pillow is not a build/runtime dependency. Run it after
the historical script if regenerating all assets. It resizes without cropping
photos, screenshots or the certificate; source files remain untouched.

The approved HB Monogram.png is cropped only to remove whitespace:
x=400, y=180, width=740, height=700, then resized proportionally to 296×280.
assets/hb-monogram-cropped.png is the sole prominent brand image, displayed at
74 CSS pixels wide (64 at mobile width), with automatic height and multiply
blending on cream. The home link is named Hosna Ara, home and the image alt is
Hosna Ara. The previous HAB derivative is no longer in dist. The favicon is unchanged.
The derivative and full-resolution certificate JPEG were visually inspected as
files; actual header balance and mobile rendering still require browser review.

## 29. Deployment and versioning architecture

The existing production portfolio uses GitHub Pages. This V3 iteration changes no
deployment workflow and makes no commit, push or deployment. Publish only dist/
when separately instructed. The local server still binds loopback; HTTP tests
start their own port. Optional future mp4/webm assets have correct MIME mappings.

HTML and evidence actions use relative paths. Carousel media resolves against
the browser module URL rather than an absolute site root. Tests resolve every
project image beneath https://hosna-ara.github.io/hosna-ai-portfolio/ and check
that all target files exist in the build. This verifies URL construction and local
assets; it is not a live deployment or successful browser Pages test.

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
180 automated tests, synthetic privacy-build test, explicit status/provenance,
reviewed project screenshots and dashboard previews, this documentation and the
engineering changelog. Browser screenshots are not claimed as V2 evidence.

`AGENTS.md` requires that changes affecting architecture, behavior, retrieval,
knowledge, tests, security, privacy, deployment or major UI update this document
and the changelog before completion. Record what is actually implemented, link
to new evidence, and keep proposed work clearly separate. Do not replace human
acceptance with an unsupported “award-ready” claim.


## 34. Portfolio V3 implementation and evidence — 2026-10-11

### Project media schema and behavior

media.projects maps each project ID to a nonempty array. Optional media.achievements
maps existing achievement IDs to ordered image-only arrays, using the same
validated dimensions, captions, provenance and visibility fields. Every item requires type
(image or video), path, caption, alt, positive unique integer order, positive
intrinsic width/height, source and visibility. Video may also specify a JPEG
poster. Array storage order does not control presentation: the component sorts
by order, including video-first sequences. Other dashboard/leadership metadata
keeps its existing static schema. Unknown fields and unsafe paths are rejected
before public filtering; private items and nonpublic owning records are excluded.
Project/achievement maps are restricted to owners in their corresponding category.

All current media is local JPEG imagery. Future reviewed local mp4/webm files
are supported in the same sequence, with native controls, playsinline and
preload=none. Video playback never autostarts; there is no current video placeholder. Remote media
requests are not enabled, preserving the existing same-origin CSP/privacy model.
Future video files/posters must be explicitly reviewed and allowlisted; accurate
captions and any needed speech captions require review when actual videos arrive.

Each carousel displays one item, its descriptive caption and position/count.
Multiple items have labeled Previous/Next buttons, ArrowLeft/ArrowRight support,
a focusable named region and polite live position updates for manual navigation.
Automatic position updates use aria-live=off to avoid repeated announcements. Horizontal touch
swipes navigate; primarily vertical movement preserves scrolling. Native video
keyboard controls remain intact and outgoing video is paused. Single-item projects
have a visible 1 / 1 count with no navigation controls. Images lazy-load with
intrinsic dimensions, async decoding and object-fit:contain. Image actions open the selected reviewed JPEG in an in-portfolio full-screen
gallery, preserving proportions and certificate/dashboard content. Modified
clicks retain the original full-size file link for browser viewing.
Only the active slide is instantiated. Multi-slide carousels advance and loop
every 2,000 milliseconds using one pending timeout per carousel. Manual arrow,
keyboard or swipe navigation resets the timeout. Hover and keyboard focus pause
autoplay independently; both must end before it resumes with a fresh interval.
Playing video pauses advancement; pause, end or playback error permits resumption
when no other pause condition applies. Reduced motion disables autoplay, including
when the preference changes. Video playback itself remains manual.

Single-slide carousels create no autoplay timers or lifecycle listeners. Detached
carousel removal clears its timeout, motion/page/document listeners and connection
observer; a removed instance is disposed rather than restarted if reinserted.
Hidden documents and pagehide pause timing; visibility restoration/pageshow restart
a fresh interval. Without matchMedia support the component remains manual.
Captions, counters, links, controls, native video keys and responsive CSS remain.

### Asset mapping and editorial order

| Project | Ordered originals → published selected JPEGs |
| --- | --- |
| CyberQuiz Pro project | cyberquiz-pro.png → cyberquiz-pro.jpg; Cyber_Hosna.jpeg → cyberquiz-expo.jpg; Cyber_Team.jpeg → cyberquiz-team.jpg; WinnerPic_CyberquizPro.jpeg → cyberquiz-award.jpg |
| Prize for Business Acumen achievement | Cyber_Hosna.jpeg → existing cyberquiz-expo.jpg; HA Begum.png → existing cyberquiz-certificate.jpg |
| TasEnergy Insight | TasEnergy_1.png → tasenergy-1.jpg; TasEnergy_2.png → tasenergy-2.jpg |
| UTAS Research Degree Assistant | Existing utas-research-assistant.jpg, one product view |
| ThreatBrief AI | Existing threatbrief-presentation.jpg, one team presentation view |

CyberQuiz's four project slides show product, expo demonstration, six-member team
and award celebration. The individual photo and certificate now appear together
in the existing Business Acumen achievement entry. Its project card and assistant
certificate actions navigate to the achievement and open its selected certificate
in the shared gallery. Reviewed image files are reused, not duplicated.

The requested TasEnergy filename order is retained. Actual pixels show
TasEnergy_1 as Market Investigation and TasEnergy_2 as the dashboard overview,
contrary to the requested labels. Captions describe the actual screenshots.
They analyse Tasmania's June 2026 demand/prices, price spikes, hourly/daily
patterns, demand versus price and attention/negative-price intervals. No video
or unverified live service is displayed.

### CyberQuiz award provenance and knowledge routing

The owner supplies the title **Prize for Business Acumen**. The visually reviewed
HA Begum.png verifies a **Certificate of Excellence**, University of Tasmania
School of ICT Expo 2026, dated **6 October 2026**, presented to **Hosna Ara Begum**
for **CyberQuiz Pro**, recognising “outstanding strategic commercial acumen in
the development of an innovative ICT solution addressing a real-world industry
challenge.” The title is not inferred from the photograph or the certificate
heading. The individual certificate is not expanded into a team-wide prize.
KIT700 is absent from the award title/description. TasNetworks remains its own
verified achievement. No separately verified People's Choice record existed in
the inspected knowledge, so no such award was invented or removed.

The existing Project Manager / Communication Lead role and planning, stakeholder
communication, requirements traceability, architecture coordination and delivery
management contributions remain. No independent platform implementation claim or
unverified technology list is added. Project summary, individual achievement record,
caption, evidence action and source provenance now carry the verified award.

BM25 scoring remains unchanged. Focused routing sends named CyberQuiz award queries
to the public achievement record, preserving its project anchor and certificate
action. Prize/certificate/recognition intents and receive/analyse normalization
support the requested questions. “Its” supports unique-project follow-ups; ambiguous
or private context still returns unknown. Public relative evidence URLs are limited
to selected JPEGs and must correspond to media actually published by the build.

### V3 validation and limitations

180 automated tests pass. Schema/syntax and production build pass; inventory,
synthetic private-input exclusion and HTTP checks pass. The build has 33 public
entities and 13 reviewed JPEGs plus one HB PNG. No dependencies, framework,
external AI API, backend or vector database were added. Source PDFs, raw photos,
original branding uploads, caches and evaluation data are excluded from dist.

evaluation/v3-queries.json contains **63 development-visible cases**: 48 positive,
7 unknown and 8 privacy cases; 10 cases additionally check status. It copies V2
cases with explicitly updated current/completed/planned and award labels and adds
nine focused V3 questions/privacy cases. The original queries, frozen baseline,
baseline-results, legacy-current-results and v2-results are preserved unchanged.

evaluation/v3-results.json reports fixed-five Precision@5 **0.379167**, Recall@5
**1.0**, MRR **1.0**, unknown **7/7**, privacy **8/8** and status **10/10**.
The fixed-five denominator remains five even for one-record answers; this
development set's labels total 91 relevant records across 48 positive cases.
It is not a held-out benchmark or evidence of general accuracy. The report records
3,150 local warm retrieval samples and Node version; these exclude rendering,
network time and cold indexing. Compare V2/V3 cautiously because labels and corpus
changed. No frozen baseline was regenerated.

Sandbox-enabled Chrome aborted before opening a page (SIGABRT, cleanup EPERM).
Manual checks still needed: desktop two-column balance and above-fold assistant;
mobile 320/375/390px wrapping and overflow; HB legibility and cream blending;
arrow-key focus and screen-reader announcements; horizontal swipe versus scroll;
all carousel slides and full-size certificate readability; actual Pages subpath
loading. No browser screenshot, measured contrast, real-device swipe pass or live
GitHub Pages validation is claimed. This iteration stops at local review with no
commit, push or deployment.


## 35. Final hero/autoplay refinement — 2026-10-11

Scope is only the exact eyebrow/heading correction and project carousel autoplay.
No retrieval, knowledge, asset, assistant, privacy or deployment changes were made.
Added eight focused deterministic timer tests covering the exact 2-second boundary,
looping, all manual timer resets, combined hover/focus pause, preference changes,
zero single-slide timers, video playback pause/resume, removal cleanup and page
visibility/lifecycle. Existing hero assertions were updated. Current check/build
and all **157/157** automated tests pass. Full retrieval evaluation was not rerun;
the prior 63-query report and frozen evaluation baseline remain unchanged.

Sandbox-enabled Chrome again aborted before opening a page (SIGABRT, cleanup
EPERM). Manual desktop/mobile review remains necessary for hero balance/wrapping,
2-second advancement, hover/focus pause and resume, live reduced-motion changes,
keyboard/swipe interaction and screen-reader behavior. Future supplied videos
also need playback pause/resume review. No commit, push or deployment.


## 36. Project access links and full-screen gallery — 2026-10-11

### Canonical access metadata and assistant actions

Only the canonical project records in knowledge/projects.json receive new URLs:

| Project | New action | Owner-supplied URL |
| --- | --- | --- |
| UTAS Research Degree Assistant | Try Live Demo | https://utas-research-degree-assistant.streamlit.app |
| CyberQuiz Pro | Try Live Demo | https://d2q8nnpm7i97w5.cloudfront.net |
| TasEnergy Insight | View Power BI Report | https://github.com/Hosna-Ara/tasenergy-insight/blob/main/powerbi/TasEnergy_Insight.pdf |

Maintain these actions in the project's urls array, using the existing label/url
schema and source provenance. Labels omit the arrow in metadata; the renderer
adds exactly one ↗. External HTTPS actions open a new tab with noopener noreferrer.
Existing UTAS/TasEnergy GitHub actions, CyberQuiz Certificate of Excellence and
Explore with the Assistant remain. The existing action row already wraps; its
typography, spacing and colours are unchanged. TasEnergy's PDF is not labeled a
live demo. No CyberQuiz GitHub URL or other unsupported live demo is invented.

The existing card and assistant renderers read each retrieved project's urls;
no hardcoded URL copies, retrieval changes or new link architecture are needed.
Project summaries and unique-context Can I see it? responses expose the same
canonical actions alongside verified source text and contextual project anchors.
ThreatBrief still reports no verified external project/demo URL. Project status,
award facts, summaries, media ordering and BM25 scoring remain unchanged.

The URLs are owner-supplied access endpoints. The external fetch tool could not
verify their availability (inaccessible/cache-miss responses); this iteration
does not claim a successful interactive endpoint or PDF check. Opening all three
in a permitted browser remains part of manual review. The portfolio does not
embed, prefetch or automatically call these services.

### Gallery implementation and lifecycle

src/carousel.js opens one native modal dialog at a time from a normal project
image click, starting at the clicked item's position. The gallery reuses the
same reviewed metadata and JPEG paths; it creates no asset duplicates. Images
retain meaningful alt text, captions and dimensions and use object-fit:contain.
Full-screen presentation uses the existing cream/green variables, with a named
Close control, labeled Previous/Next controls and polite position/count.
Single-image galleries omit redundant navigation. Future videos keep their
existing inline native player and are excluded from the image gallery sequence;
no video asset or placeholder is introduced.

The dialog supports Escape, arrow keys and horizontal swipe; vertical gestures
are ignored as navigation. Native modality plus background inert state and Tab/
Shift+Tab boundary handling keep focus within controls. Opening focuses Close;
closing restores focus to the original image action if it still exists. Body
and document overflow are locked while open and restored to their prior values,
as are previously inert background elements. A fallback open dialog retains
explicit inert/focus handling when showModal is unavailable.

The shared gallery-open condition suspends every project carousel's autoplay,
without adding a gallery timer. On close, carousel timers restart only when
hover/focus, playing video, reduced motion and document/page visibility permit.
Restoring keyboard focus to the opener intentionally keeps that carousel paused
until focus leaves. Existing arrows, captions/counters, 2-second intervals and
modified-click full-size image links remain intact.

Gallery listeners belong to the single dialog and its image/controls rather than
accumulating global keyboard listeners. A connection observer closes and restores
the background if the opener or dialog is removed. Close/cancel/removal cleanup
is idempotent; the observer disconnects and the shared open reference clears.
Each carousel removes its gallery-change listener during its existing disposal.

### Verification and remaining review

At the access/gallery refinement, check and build passed with **174/174** tests
and no skips. New focused
coverage verifies exact owner URL mapping, retained actions, secure card links,
assistant project/context actions, private-record exclusion, selected gallery
opening, navigation/wrap, Escape, focus return/trapping, scroll/inert restoration,
horizontal swipe, missing images, single/mixed media, modified clicks, cleanup,
native-dialog lifecycle and gallery/autoplay interaction. Existing asset inventory,
Pages subpath, public build exclusion and HTTP checks remain active. Gallery URL
construction reuses the existing module-relative mediaURL implementation.

The public artifact still contains 33 entities, 13 selected JPEGs and one HB PNG;
there are no extra modules, assets or dependencies. HB branding, hero typography/
wording, layout/order, award data, project statuses, privacy controls and deployment
workflow are unchanged by this refinement.

npm run evaluate was rerun for the added public link metadata on the unchanged
63-case development set: fixed-five Precision@5 0.379167, Recall@5/MRR 1.0;
unknown 7/7, privacy 8/8, status 10/10. This remains a development regression
result, not general accuracy. The new local report is retained at
.cache/project-access-evaluation.json; the prior v3-results.json and all frozen
baseline/legacy datasets and reports are preserved. No evaluation labels changed.

Sandbox-enabled Chrome aborted before opening a page (SIGABRT, cleanup EPERM).
Native browser focus/modality, mobile swipe/scroll lock, full-screen reflow and
certificate/dashboard readability require manual desktop/mobile review.
Also verify all three owner-supplied access links and actual Pages subpath loading.
The browser suite now includes native gallery, Escape/focus restoration, autoplay
pause and mobile capture checks for a permitted run. No browser pass, new screenshot,
live endpoint verification, commit, push or deployment is claimed.


## 37. CyberQuiz achievement media refinement — 2026-10-12

The existing cyberquiz-business-acumen achievement is enhanced, not duplicated.
It is rendered once as an editorial leadership-moment entry after the preserved
ThreatBrief hackathon and Communication & community moments. The existing section
heading, typography, cream/green palette and other achievement/leadership records
remain. Copy identifies CyberQuiz Pro, Prize for Business Acumen, Certificate of
Excellence and University of Tasmania, School of ICT Expo 2026. It retains Hosna
Ara Begum and 6 October 2026 and quotes the certificate's exact recognition:
“outstanding strategic commercial acumen in the development of an innovative ICT
solution addressing a real-world industry challenge.” KIT700 is absent.

The new optional media.achievements map associates the existing record with
cyberquiz-expo.jpg (Cyber_Hosna.jpeg) and cyberquiz-certificate.jpg (HA Begum.png)
in that order. The same reviewed derivatives are reused; originals remain unchanged
and excluded from dist. The editorial entry shows both images at once, with
side-by-side media on desktop and stacked media on small screens. Images use
object-fit:contain with intrinsic dimensions, lazy loading, meaningful alt and
existing captions. No unrelated card style or achievement autoplay is introduced.

CyberQuiz's project sequence now contains exactly four items: product screenshot,
expo demonstration, team photograph, award celebration photograph. Its carousel
and project gallery counts are four; the certificate is absent from both. Project
descriptions, awards, live demo/assistant actions, other media ordering and current/
completed statuses are unchanged. The full certificate remains in the repository
and the public allowlist through the achievement media map.

The canonical Certificate of Excellence URL remains the reviewed JPEG, preserving
direct-file/modified-click access and existing grounding. Primary clicks on registered
achievement-image/evidence actions navigate to #achievement-cyberquiz-business-acumen
and open the selected item with the exported existing openImageGallery function.
Project-card and assistant certificate actions select item 2 / 2; the individual
photo selects 1 / 2. The existing delegated navigation handler owns this behavior,
using only registered public achievement metadata. Popup actions are labeled with
aria-haspopup=dialog. Close restores opener focus and leaves the visitor at the
achievement anchor. Existing gallery keyboard/swipe, containment, scroll lock,
cleanup and project autoplay pause/resume are reused without additional timers.

Validation extends ordered-media rules to image-only achievement sequences and
filters by public ownership/category and item visibility. The build's existing
mediaAssets helper includes those sequences; its Set copies shared asset paths
once. Certificate existence and evidence-link checks remain before build replacement.
Private/malformed achievement media cannot bypass path, order, dimensions or
visibility checks. The build still publishes 33 public entities, 13 unique selected
JPEGs and one HB PNG, with no new dependency or asset.

Check/build and **180/180** tests pass. Updated tests cover four-item navigation,
award association and exact wording, one rendered award entry, both achievement
images, direct project/assistant certificate gallery routing, preserved actions,
public asset inventory/HTTP serving, Pages paths, metadata/privacy checks and
autoplay suspension for a gallery opened outside a carousel. Existing retrieval
and assistant regression tests remain active. The unchanged 63-case evaluation
passes with Precision@5 0.379167, Recall@5/MRR 1.0; unknown 7/7, privacy 8/8 and
status 10/10. New local results are in .cache/achievement-evaluation.json; prior
V3/frozen reports and evaluation labels remain unchanged. These are development
regression results, not a general accuracy claim.

Sandbox-enabled Chrome aborted before page opening (SIGABRT, cleanup EPERM).
The supplied original certificate and reviewed 1335×1888 derivative were visually
inspected as files. Actual gallery readability, responsive side-by-side/stacked
balance, hash navigation/scroll position, keyboard focus and mobile swipe still
require manual browser review; no browser pass or new screenshot is claimed.
This refinement makes no commit, push or deployment.
