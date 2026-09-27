# Portfolio refinement review notes

## V2 update — 2026-09-27

The sections below preserve the **pre-V2 review** and its 59-test baseline. Their
retrieval, record-count and privacy conclusions are historical, superseded by
[the living technical reference](docs/technical-audit/SYSTEM_TECHNICAL_DOCUMENTATION.md).
V2 fixes the alias/context visibility bypasses and enforces publication filtering
inside the build. Final validation/build and 127 tests pass; the 54-query evaluation
and fixed-corpus comparison are saved in `evaluation/`. Sandbox-enabled Chrome
still aborts before opening a page (SIGABRT/EPERM), so no V2 browser pass is claimed.
The approved layout and media remain; human visual/accessibility review is pending.
Nothing was pushed or deployed. See [the changelog](docs/technical-audit/CHANGELOG.md).

## Built

The approved cream/dark-green palette, serif/sans typography, “ha.” branding and editorial spacing are preserved. The working portfolio assistant occupies the right-hand hero column, with concise identity/positioning on the left and no hero portrait. Four visible starter questions actually submit to the same no-key provider; the input requires no CTA to reveal it. Clear chat restores the starters, and conversations continue in the hero with typed follow-ups and verified contextual actions. Its current name is Hosna's Personal AI Assistant.

The evidence sections now follow selected work → professional experience → research/publications → education → skills → industry/leadership/achievements → contact. The longer profile is retained in an expandable “More about Hosna” panel within experience. Project previews, two dashboard examples and two restrained leadership/achievement moments add evidence without a photo gallery. The old decorative hero graphic no longer occupies the landing panel.

## Architecture and local use

Vanilla HTML/CSS/ES modules; no runtime dependencies. Twenty-three public JSON knowledge entities feed both the website and lightweight lexical retrieval. `LocalKnowledgeProvider` remains active; the provider abstraction, grounding and verified URLs are preserved. Asset metadata is separate in `knowledge/media.json`. `dist/` is the only served/deployable directory. The current generated site is approximately 1.4 MB including all seven lazy-loaded JPEG previews. No dependencies were added for this refinement.

```sh
npm ci --cache .cache/npm
npm run build
npm run dev
```

Open `http://127.0.0.1:4173`. Rebuild after changes. See README for content updates and provider/deployment contracts.

## Verification status

- Production build: **passed**.
- JavaScript syntax and knowledge-schema checks: **passed** (`npm run check`). No TypeScript or separate lint configuration.
- Behavioral suite: **59 passed, 0 failed** (`npm test`): the single hero assistant and exposed input; starter submissions; typed education, research, latest-project and Data/BI queries; typed and clickable follow-ups; verified GitHub/internal actions; unknown refusal; image loading; missing-image recovery; page order; existing retrieval/provider/filter/navigation/privacy/HTTP checks.
- Dependency audit: zero reported vulnerabilities at installation; production dependency audit also passed (no runtime packages).
- Real-browser suite: **still blocked by environment**. Retried using the existing workspace-local temporary directory and sandbox-enabled Chrome; the process aborted with SIGABRT/EPERM before opening the page. The expanded suite includes input visibility at 1440×900, 1366×768, 1280×720 and 1024×768, mobile overflow checks, image loading and missing-image recovery. These browser checks have not passed or produced screenshots. No sandbox disabling, permission changes or personal browser profile access was attempted.
- Content and privacy audits completed; see `CONTENT_AUDIT.md`.

## Assets, links and dependencies

Seven reviewed derivatives of supplied local assets are used:

| Supplied source | Placement |
| --- | --- |
| `utas-research-assistant.png` | UTAS project UI preview |
| `cyberquiz-pro.png` | CyberQuiz team-product UI preview |
| `threatbrief-presentation.jpg` | ThreatBrief project presentation preview |
| `hackathon-first-prize.jpg` | Team achievement moment |
| `iiuc-speaking.jpg` | Earlier speaking/community context; no inferred event/date |
| `hospital-analytics.pdf`, page 8 | Aggregate resource-utilisation dashboard example |
| `pharma-analytics.pdf`, page 2 | Executive-summary dashboard example |

Images were inspected and resized/rendered with native macOS AppKit/PDFKit. Their reviewed JPEGs are in `public/assets/selected/`; originals are unchanged. Two PDF pages containing individual contact details were excluded, as were covers and unused pages. No PDF viewer or raw PDF download is exposed. No stock assets, external image requests or new portrait are used. Team roles remain stated beside project previews. Supplied photos do not establish new professional claims.

Featured repository links: [UTAS assistant](https://github.com/Hosna-Ara/utas-research-degree-assistant), [TasEnergy Insight](https://github.com/Hosna-Ara/tasenergy-insight). Public professional links: [GitHub](https://github.com/Hosna-Ara), [LinkedIn](https://www.linkedin.com/in/habegum/), [Scholar](https://scholar.google.com/citations?user=jyz6s4MAAAAJ), [ORCID](https://orcid.org/0009-0009-4352-5652). Three publication DOIs came from CV annotations. No verified external URL was available for ThreatBrief AI or CyberQuiz Pro.

Other repositories discovered through the permitted profile: `719_tutorials`, `reuters-information-retrieval-system`, `portfolio`, `certiflow-iq`, `sql`, `MLP2_Titanic-Survival-Prediction-using-Logistic-Regression`, `MLP1_netflix-data-analysis`. These are not promoted as audited featured work.

Only development dependencies were added, with a lockfile: **Playwright** for browser interaction, viewport and screenshot checks; **LinkeDOM** to exercise actual application DOM handlers where browser execution is unavailable. Build, retrieval, HTTP server and core tests use native Node capabilities. All dependency caches are workspace-local.

## Tomorrow’s review and limitations

1. Open the site on desktop and a phone. Run `npm run test:browser` with the local server active in an environment that permits sandbox-enabled Chrome. Confirm that the assistant input is visible above the fold on desktop, and review the mobile identity-to-chat flow, keyboard focus, screen-reader announcements and scrollable conversations. DOM tests do not substitute for measured layout checks.
2. Confirm current master’s status/GPA, project descriptions and ongoing leadership. Review the publication links (IEEE returned HTTP 202 to automated requests). TasEnergy is intentionally in progress, not a finished client solution.
3. Review the selected screenshot scale, dashboard legibility and photo composition. Preview images open at a larger size. Some source images are low-resolution; no detail was fabricated or AI-upscaled. The hero intentionally has no portrait. Verify any future live demo URLs before adding them.
4. The assistant is a **local grounded knowledge guide, not a live LLM**. Unfamiliar phrasing can receive an unknown answer; no embeddings are used. No durable conversation history is kept. Core content loads with JavaScript; a no-JavaScript notice and email remain available.
5. A real model requires a separately implemented/configured server integration, server-only environment credentials, and activating the optional provider adapter. `.env.example` contains placeholders only. Revisit the privacy notice and CSP before any remote AI requests.

## Not performed

No public deployment, Git push, remote creation, authentication, release, paid resource creation or system/global installation. Future static hosting should publish **only `dist/`**, never the workspace root. No security settings or OS/shell configuration were changed. The source CV remains unmodified.

No known public security/privacy issue remains. The outstanding validation limitation is the blocked real-browser visual/accessibility audit.
