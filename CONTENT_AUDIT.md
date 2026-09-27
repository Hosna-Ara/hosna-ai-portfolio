# V2 amendment — 2026-09-27

This amendment supersedes earlier recency/privacy implementation conclusions below;
earlier source-verification dates remain historical. See the
[living technical reference](docs/technical-audit/SYSTEM_TECHNICAL_DOCUMENTATION.md).

- ThreatBrief AI is completed, never current. CyberQuiz is classified as completed
  from its delivered-platform description. No precise completion dates were supplied.
- UTAS and the interactive portfolio are current for this owner-directed refinement.
  TasEnergy retains its verified in-progress and fictional-scenario wording, with
  proposed modelling/SQL/Power BI work stored separately. No finished product is implied.
- Research / PhD Preparation is a new public record drawn only from the owner's
  instruction: MetaHuman/digital human interfaces and AI/LLM systems as exploratory
  direction. It is not an approved topic, established project or publication.
- Existing professional URLs and approved dashboard descriptions are retrievable.
  Image captions do not establish new claims. No live demo URLs were added.
- Build-time filtering now enforces visibility across entities, links and media.
  Raw PDFs/uploads are ignored by Git as well as excluded from builds. Privacy
  fixtures use synthetic values; no private CV-derived test values remain.
- Browser visual/accessibility verification remains blocked by sandbox-enabled
  Chrome launch failure. No security restrictions were weakened.

---

# Content and privacy audit

Audit date: 27 September 2026. Primary source: the existing, unmodified three-page `Hosna_Ara_CV.pdf`, read locally through macOS PDFKit. Embedded links were extracted from its link annotations. Public supplementary sources were read without authentication. No private UTAS materials or datasets were accessed.

## Included professional facts

| Content | Evidence and treatment |
| --- | --- |
| Display name Hosna Ara; professional email | User-specified display name; email from CV. Full author name is represented through publication citations. |
| AI, analytics and BI positioning | CV research profile and technical skills. Nearly four years of BI/analytics experience is consistent with June 2019–April 2023 employment. |
| UTAS master’s | CV: February 2025–December 2026 **expected**, cumulative GPA 6.25/7.00 and 2026 GPA 6.75/7.00. Explicitly in progress; not presented as a completed degree. Specialisation wording is retained from the CV. |
| IIUC bachelor’s | CV: March 2014–January 2019, CGPA 3.769/4.00, Summa Cum Laude. |
| EBIW Analytics | CV: Business Intelligence Engineer, March 2022–April 2023; Power BI, DAX, Power Query, SQL, modelling and reporting. |
| eGeneration Ltd | CV: June 2019–March 2022; Data Analytics Engineer was the final/highest role, not necessarily the title for the full period. 50+ dashboards and reports is the CV’s stated total. |
| UTAS Research Degree Assistant | CV: independent end-to-end development, hybrid retrieval, knowledge graphs, Python and Streamlit. Public repository confirms an unofficial student-built prototype. No private source counts, documents, dataset contents or deployment URLs are exposed. |
| ThreatBrief AI | CV: winning hackathon **team**; Hosna’s contribution was analysis, coordination and presentation. The later independent recreation/extension is explicitly separated from team delivery. No invented live demo or repository. |
| CyberQuiz Pro | CV: Project Manager / Communication Lead for a six-member capstone team. No claim that she independently implemented the platform; no unverified technology list or demo. |
| TasEnergy Insight | Public repository README: setup/business analysis in progress; planned analytics work and initial stack; fictional business scenario. Not presented as a finished product or client outcome. |
| Human–AI interaction review | CV: 2026–present, PRISMA-guided review of 30 studies, final manuscript draft. Not counted as a published paper. |
| Brain tumour research | CV: first author, 2025–2026, comparison using 7,023 scans and reported 92% validation accuracy for DenseNet121. Scope is explicitly research validation, not clinical efficacy or deployment. |
| Microwave imaging research | CV: co-developed undergraduate research, 2018, CST and MATLAB. |
| Three publications | CV titles, author lists as provided, years, venues, volume/pages and embedded DOIs. Springer 2026 paper refers to BIM 2025 proceedings; both dates are preserved rather than conflated. |
| Skills | Selected CV skills only. No proficiency levels or additional technologies inferred from repository language statistics. |
| Leadership/achievements | CV: TasNetworks team win (2026), IEEE volunteer award (2018), cybersecurity club secretary (2026–present), IEEE WIE chairperson (2016–2018). |

## Public sources and verified links

- [Previous portfolio](https://sites.google.com/view/hosna-ara-begum/home?pli=1): public professional overview and dashboard examples. Its header image is generic technology imagery, not a portrait; it is not used.
- [GitHub profile](https://github.com/Hosna-Ara): public repository discovery through the GitHub API.
- [UTAS Research Degree Assistant](https://github.com/Hosna-Ara/utas-research-degree-assistant): README confirms prototype scope and unofficial status. Repository returned HTTP 200.
- [TasEnergy Insight](https://github.com/Hosna-Ara/tasenergy-insight): README confirms in-progress status and fictional scenario. Repository returned HTTP 200.
- [Springer paper](https://doi.org/10.1007/978-3-032-15764-5_4): DOI extracted from CV; redirect returned HTTP 200.
- [IEEE imaging paper](https://doi.org/10.1109/ICISET.2018.8745555) and [IEEE IoT paper](https://doi.org/10.1109/ICAEE.2017.8255436): DOIs extracted from CV. Publisher endpoints returned HTTP 202; citation details are verified against the CV, not a claim that publisher full text was read.
- LinkedIn, Google Scholar and ORCID URLs are exact embedded CV links, recorded in `knowledge/links.json`. Availability and profile currency should be checked manually.

## Omitted or uncertain details

- Planned summer 2026–27 research and a submitted scholarship application: omitted to avoid implying an awarded scholarship or confirmed research appointment.
- The CV’s 2026–27 IEEE IIUC strategy vice-chair role: omitted pending confirmation of timing and current scope; older confirmed leadership is sufficient.
- Undated competition results and nonessential conference attendance, IELTS results and course marks: omitted for relevance and brevity.
- Other public repositories were discovered but not promoted without a deeper content/ownership audit. No live project URLs were discovered for the featured projects; repository actions are used only where verified.
- The refined hero intentionally contains no portrait. Its previous decorative visual has been replaced by the actual working assistant. Supplied project screenshots are used only in the evidence sections below.
- Project recency is curated from the CV’s 2026 entries and public repository activity. A repository update is not represented as a project completion date.

## Privacy exclusions and checks

Date of birth, home/street address, phone number, family/visa information, application-specific footer details, private reference contacts, private UTAS documents and datasets are absent from public knowledge and assets. The public email is intentionally included. No real `.env`, API key or credential was created. The CV is unchanged, ignored by Git and excluded from `dist/`.

Automated checks inspect generated and rendered content for sensitive source facts, validate safe/approved external URLs, and verify that the server returns 404 for the CV, environment files, repository metadata and source/cache paths. Build output consists only of public assets, application modules and curated knowledge. Chat input uses text-only DOM rendering, remains in memory and makes no external AI request. No analytics or persistence is installed.

Result: no known security/privacy exposure identified in the public build. Browser-level visual/accessibility validation remains unconfirmed because the sandboxed browser process could not launch; this is documented rather than reported as passed.

## Supplied asset refinement audit

All supplied filenames were inventoried. Product screenshots and candidate event photographs were inspected; all pages of both image-only dashboard PDFs were rendered locally into review sheets using native PDFKit. PDFKit detected 14 hospital pages and 11 pharmaceutical pages (the generic `file` utility’s initial page counts were inaccurate).

Selected images: UTAS assistant UI, CyberQuiz UI, ThreatBrief presentation, first-prize placard and earlier IIUC speaking photo. The latter supplies visual context only: no event name, date, title or new responsibility is inferred. Captions preserve the CV’s independent/team distinctions and the existing WIE role. Unused group/event photographs are not published.

Selected PDF previews: hospital page 8 (aggregate resource utilisation) and pharmaceutical page 2 (executive summary). They are examples of report presentation, not evidence of client identity, Hosna’s sole authorship, a project date or business outcomes. Charts and values were not redrawn, selectively altered or repurposed as portfolio metrics. Pages containing individual contact information (hospital page 5 and pharmaceutical page 8) are excluded, and neither original PDF is copied to the build.

`knowledge/media.json` records provenance, alt text and dimensions. `scripts/prepare-assets.js` creates resized JPEG derivatives with native AppKit/PDFKit inside the workspace; originals remain untouched. Final derivatives were visually inspected. The production build now allowlists just seven reviewed image paths instead of recursively copying uploaded assets. HTTP tests confirm all seven JPEGs load and original PDFs/unused uploads return 404; DOM tests confirm missing-image fallbacks preserve the descriptions.

The CV SHA-256 remains `91032f3b795c002125fc1b0f73fc70bff40cf361c810f3cedce3c7d73316af7f`, unchanged from the initial implementation audit. No new qualifications, employment, roles, awards, project technologies or external URLs were introduced during this refinement.
