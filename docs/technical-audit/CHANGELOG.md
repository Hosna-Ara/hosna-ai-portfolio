# Engineering changelog

## 2026-09-27 — Small navbar brand refinement

- Reused the prepared 256×128 cropped Hosna mark as the primary navbar identity,
  preserving the complete artwork, 2:1 aspect ratio, accessible name and cream palette.
- Original PNG remains untouched and unpublished; only the 47,879-byte derivative
  is allowlisted. Existing favicon, hero, assistant and all retrieval logic remain unchanged.
- Updated only affected asset/DOM/HTTP assertions and this technical record. The
  owner subsequently committed the implementation and added the Pages workflow;
  this completion does not push or deploy. Header balance and responsive spacing
  still need human visual confirmation in a browser.
- Completion verification: schema/syntax validation, production build and all 127
  existing tests pass. Retrieval evaluation was not rerun for this visual-only task.

## 2026-09-27 — Award-ready V2 refinement (local, not deployed)

- Renamed the visible guide to **Hosna's Personal AI Assistant**, retaining short
  conversational labels, approved design and suggested-question cards.
- Added current/planned/completed schema metadata, year-level chronology and proposed
  work. ThreatBrief is completed; UTAS, portfolio, TasEnergy and research preparation
  are current. Added owner-supplied exploratory PhD wording without implying approval.
  Tied project years are disclosed rather than inventing a unique latest completion.
- Replaced weighted substring ranking with BM25 (k1=1.2, b=0.75), strengthened
  subject guards, category/multi-intent routing, entity context and deterministic
  technology/role/date/status/link answers. Removed the artificial answer delay.
- Exposed verified professional links and dashboard descriptions as evidence;
  retained caption/photograph separation and verified-only URL actions.
- Enforced public visibility in every retrieval path and in the build. Strengthened
  schema, URL and asset validation; explicitly allowlisted built modules/assets;
  ignored raw uploads/PDFs and replaced private test values with synthetic markers.
- Preserved the passing 59-test baseline and original retrieval/corpus. Added a
  54-query development evaluation, fixed-corpus legacy comparison, 127-test suite
  and local latency measurements. V2 Recall@5/MRR are 1.0 on this set; fixed-five
  Precision@5 is 0.419512; unknown/privacy/status cases all pass.
- Validation, production build, HTTP/static and DOM checks pass. Sandbox-enabled
  browser launch remains blocked (SIGABRT/EPERM); visual/accessibility acceptance
  remains human review, not a reported browser pass.
- Established this living technical reference and AGENTS.md maintenance rule;
  updated README and historical audit notes. Documented human-directed AI assistance
  and the fact Git history has not yet begun. No push, deployment or fabricated commit.
