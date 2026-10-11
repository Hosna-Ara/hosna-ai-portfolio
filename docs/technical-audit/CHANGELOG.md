# Engineering changelog

## 2026-10-12 — CyberQuiz achievement media refinement (local)

- Enhanced the existing Prize for Business Acumen record and rendered it once in
  the editorial leadership/achievement area, preserving the ThreatBrief hackathon,
  Communication & community, heading, palette and other content. Copy identifies
  CyberQuiz Pro, Certificate of Excellence and UTAS School of ICT Expo 2026 with
  the exact quoted strategic-commercial-acumen recognition; no KIT700 wording.
- Added ordered image-only achievement metadata for the existing individual Expo
  photo and full certificate derivatives. Both display together using the existing
  moment styling: side-by-side desktop media, stacked small-screen media, contained
  imagery and shared full-screen gallery. No new asset or duplicate award record.
- Removed the certificate from CyberQuiz's project sequence. Four slides remain:
  product, expo demonstration, team, award celebration. Existing 2-second timing,
  navigation, counters, keyboard/swipe/gallery, project descriptions and other
  project/assistant actions remain.
- Kept the canonical certificate JPEG action; normal clicks from the project or
  assistant now navigate to the achievement and open certificate item 2 / 2.
  Modified clicks still access the reviewed file. Existing gallery lifecycle and
  autoplay pause/resume are reused; no duplicate timers/listeners are introduced.
- Extended the current validated/public media boundary to achievement sequences.
  Build inventory remains 33 entities, 13 unique JPEGs and one HB PNG; original
  certificate/photo files remain unchanged. No deployment workflow/dependency change.
- Check/build and 180/180 tests pass, including media order, single achievement,
  exact copy, photo/certificate placement, direct gallery routing, actions,
  privacy/schema/assets/Pages paths and autoplay interaction. Unchanged 63-case
  evaluation: Precision@5 0.379167, Recall@5/MRR 1.0, unknown 7/7, privacy 8/8,
  status 10/10. Current report kept in .cache; prior reports/baseline preserved.
- Sandbox-enabled Chrome aborted before page opening (SIGABRT/cleanup EPERM).
  Manual responsive balance, certificate readability, hash/scroll/focus and mobile
  gesture review remain. No commit, push or deployment; awaiting local review.

## 2026-10-11 — Project access links and full-screen gallery (local)

- Added owner-supplied Try Live Demo actions for UTAS Research Degree Assistant
  (Streamlit) and CyberQuiz Pro (CloudFront), and View Power BI Report for TasEnergy
  (the supplied GitHub PDF URL), only in canonical project urls arrays.
  Existing GitHub, certificate and assistant actions remain; unchanged rendering
  automatically exposes the same actions in project and contextual assistant answers.
  Source provenance identifies owner-supplied URLs; no unsupported demo is added.
- Project image clicks now open the selected image in a full-screen native dialog
  using existing media metadata and assets. Added captions/count, arrows, Escape,
  keyboard and swipe navigation, contained imagery, focus containment/restoration
  and reversible background scroll/inert locking. Modified clicks preserve direct
  image-file access. Future videos remain inline with no new video or placeholder.
- Gallery opening pauses all carousel timers. Closing respects hover/focus,
  reduced motion, video playback and visibility; the existing 2-second timing
  resumes with a fresh interval when eligible. Removal/close cleanup is idempotent
  and avoids stacked dialogs, global keyboard listeners or duplicate timers.
- HB branding, hero wording/typography, card layout/action styling, project order,
  statuses, awards, media order, BM25 scoring and privacy/deployment controls remain.
  No dependency, module, asset or evaluation dataset is added.
- Validation/build pass; 174/174 tests pass. Focused URL/card/assistant/privacy,
  gallery accessibility/navigation/lifecycle and autoplay integration tests added.
  Unchanged 63-case evaluation: Precision@5 0.379167, Recall@5/MRR 1.0;
  unknown 7/7, privacy 8/8, status 10/10. Current report retained in .cache;
  prior V3 report and frozen baseline/legacy evidence remain unchanged.
- Sandbox-enabled Chrome aborted before page opening (SIGABRT/cleanup EPERM).
  External fetch could not verify endpoint availability. Manual desktop/mobile
  gallery focus, scroll lock, swipe, readability, Pages loading and live link
  checks remain. No commit, push or deployment; awaiting local review.

## 2026-10-11 — Final hero text and carousel autoplay refinement (local)

- Set the exact hero eyebrow to A PORTFOLIO THAT YOU CAN TALK, TO KNOW ABOUT
  and the large heading to Hosna. Preserved typography, palette, HB logo,
  positioning and remaining hero content.
- Added looping 2,000ms autoplay to multi-slide project carousels. Arrows,
  keyboard and swipe reset the timer. Hover/focus and playing video pause it;
  reduced motion disables it. Hidden documents/pagehide pause it, and leaving
  pause conditions resumes a fresh interval. Single-slide carousels have no timer.
  Removal cleans timers/listeners/observer; resets never stack duplicate timers.
  Automatic counter updates are silent to screen readers; manual updates remain
  polite. Video playback remains manual and existing carousel controls remain.
- Added eight focused timer tests and corrected existing hero assertions.
  Syntax/schema validation, production build and 157/157 automated tests pass.
  Retrieval/knowledge/assistant/privacy controls and evaluation files unchanged;
  full retrieval evaluation was not rerun for this UI-only refinement.
- Sandbox-enabled Chrome aborted before page opening (SIGABRT/cleanup EPERM).
  Hero desktop/mobile wrapping and actual autoplay/hover/focus/reduced-motion/
  swipe/screen-reader behavior still need manual browser review.
- No commit, push or deployment; awaiting owner review.

## 2026-10-11 — Portfolio V3 (local, awaiting review)

- Replaced the header HAB asset with a whitespace-cropped derivative of the approved
  HB Monogram.png, preserving its artwork and original file. Removed the assistant
  emblem and both hero slogan lines; applied the exact requested eyebrow.
- Added reusable ordered project carousels with named buttons/region, keyboard and
  swipe navigation, live position/count, captions, contained lazy images and larger
  image links. Single-item projects have no redundant navigation. The schema/build
  supports reviewed future local mp4/webm media and posters without autoplay or
  placeholder players; no video exists in the published data.
- Preserved Featured Work order: CyberQuiz, TasEnergy, UTAS assistant, ThreatBrief.
  Added five CyberQuiz images and both TasEnergy screenshots. TasEnergy filenames
  are preserved in requested order; visual inspection confirms _1 is investigation
  and _2 overview, so captions follow actual pixels.
- Added Prize for Business Acumen to CyberQuiz content/carousel and Achievements,
  with the individual Certificate of Excellence and a full-size evidence link.
  Certificate provenance: UTAS School of ICT Expo 2026, Hosna Ara Begum,
  CyberQuiz Pro, 6 October 2026, strategic commercial acumen recognition.
  Existing TasNetworks recognition and CyberQuiz role remain separate and intact.
- Marked TasEnergy's reporting milestone completed, removed obsolete plannedWork,
  documented June 2026 demand/price/dashboard evidence and limited completion claims.
  Current-work retrieval excludes completed TasEnergy and ThreatBrief.
- Extended only focused award/context routing and normalization; genuine BM25,
  same-origin CSP, public filtering and allowlisted dist build remain. Nested private
  slides are filtered; asset existence/evidence references are checked before build
  replacement. No framework or dependency added; deployment workflow unchanged.
- Validation: check/build pass; 149/149 tests pass, including focused carousel,
  mixed-media metadata, accessibility semantics, asset/subpath, privacy, branding,
  award and status coverage. Default evaluation now writes separate V3 evidence:
  63 development cases, fixed-five Precision@5 0.379167, Recall@5/MRR 1.0,
  unknown 7/7, privacy 8/8, status 10/10. Frozen V2/baseline files unchanged.
- Sandbox-enabled browser launch aborted before page opening (SIGABRT/cleanup EPERM).
  Desktop/mobile layout, actual focus/screen-reader/swipe behavior, certificate
  readability and live Pages paths require manual visual checks. Source/derivative
  images were visually inspected as files; no browser pass is claimed.
- No commit, push or deployment. Awaiting owner local review.

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
