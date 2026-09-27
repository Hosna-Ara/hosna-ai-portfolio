export const UNKNOWN = "I don't have verified information about that in Hosna's portfolio yet.";
export const normalize = value => value.normalize('NFKC').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const stop = new Set('a an the is are was does do has have she her hosna hosnas me tell about what how can you i of in on to for and with show please it that this more my now'.split(' '));
const tokens = value => normalize(value).split(' ').filter(t => t.length > 1 && !stop.has(t));
const intents = [
  ['publications', /publish|publication|papers?\b/],
  ['education', /education|degree|bachelor|master|qualification|studied|study history/],
  ['contact', /contact|email|connect|reach|hire/],
  ['leadership', /leadership|community|clubs?|volunteer/],
  ['achievements', /awards?|achievements?|won|winner/],
  ['skills', /technolog|skills?|tech stack|tools|programming languages/],
  ['experience', /experience|professional|employment|career|power bi|\bbi\b|analytics/],
  ['research', /research|researching/],
  ['profile', /who is|who s|background|biography|about hosna/],
  ['projects', /projects?|working on|build|built|recent|latest|\brag\b|ai work|machine learning work/]
];
const privateOrUnsafe = /\b(salary|visa|birthday|birth|address|phone|family|married|religion|politic|health|password|secret|credentials|private|ignore|disregard|pretend|system prompt|instructions)\b/;
const aliases = [
  ['utas-assistant', /utas.*assistant|research degree assistant|\brag\b|retrieval augmented|supervisors?/],
  ['threatbrief', /threatbrief|threat intelligence/],
  ['cyberquiz', /cyberquiz/],
  ['tasenergy', /tasenergy|energy.*analytics/],
  ['brain-research', /brain|tumou?r|grad cam/],
  ['microwave-research', /microwave|stroke/]
];
const queryWords = new Set('who recent recently latest relevant working work worked working currently current history professional personal portfolio information details detail explain give list all any some many much years year tell please project projects research researching experience experiences education publication publications published papers paper technology technologies technical skills skill use uses used tools tool build builds built role roles know knows knowledge show studied study qualifications qualification background biography contact connect reach hire award awards achievement achievements won winner leadership community club clubs volunteer data science business intelligence ai ml degree degrees graduate graduated graduate masters bachelor job jobs'.split(' '));

/** Small-corpus retrieval: explicit entity/category intent plus weighted lexical overlap.
 * No embeddings, external requests or unverified generated prose are needed. */
export function retrieve(question, entities, previousIds = []) {
  const q = normalize(question);
  if (!q || privateOrUnsafe.test(q)) return [];
  if (/^(tell me more|more|what was her role|what technologies did she use|show me the link)$/.test(q)) {
    return entities.filter(e => previousIds.includes(e.id)).slice(0, 2);
  }
  const evidence = normalize(entities.map(e => [e.title,e.summary,e.role,...e.tags,...e.technologies].join(' ')).join(' '));
  const unsupported = tokens(q).filter(t => !queryWords.has(t) && !evidence.includes(t));
  if (unsupported.length) return [];
  // Do not turn an unsupported skill question into a generic affirmative answer.
  const skillQuestion = q.match(/(?:experience (?:with|in)|know|use|skills? (?:in|with)) (.+?)(?:\s+and\s+|$)/);
  if (skillQuestion) {
    const subjects = tokens(skillQuestion[1]);
    const corpus = normalize(entities.map(e => [e.title, e.summary, ...e.technologies].join(' ')).join(' '));
    if (subjects.some(t => !corpus.includes(t))) return [];
  }
  const exact = aliases.find(([, regex]) => regex.test(q));
  if (exact && !/publish|paper/.test(q)) return entities.filter(e => e.id === exact[0]);
  let category = intents.find(([,regex]) => regex.test(q))?.[0];
  if (/projects?/.test(q) && !/publish/.test(q)) category = 'projects';
  if (/research history/.test(q)) category = 'research';
  if (!category) return [];
  const terms = tokens(q);
  const ranked = entities.filter(e => e.visibility === 'public' && e.category === category).map(e => {
    const title = normalize(e.title);
    const tags = normalize([...e.tags, ...e.technologies].join(' '));
    const body = normalize(e.summary);
    let score = terms.reduce((n,t) => n + (title.includes(t) ? 5 : 0) + (tags.includes(t) ? 3 : 0) + (body.includes(t) ? 1 : 0), 0);
    if (category === 'projects' && /latest|recent|working on/.test(q) && e.id === 'utas-assistant') score += 12;
    if (category === 'projects' && /\bai\b/.test(q) && !e.tags.includes('ai')) score -= 20;
    return {entity:e, score};
  }).sort((a,b) => b.score-a.score);
  // Generic category requests are useful; narrow queries must share substantive evidence.
  const generic = /education|research|publications|published|professional experience|technologies|skills|projects|working on|who is|contact|email|leadership|achievements|awards|data analytics|power bi|\bbi\b|background/.test(q);
  if (!generic && (!ranked[0] || ranked[0].score < 3)) return [];
  const count = /latest/.test(q) ? 1 : ['skills','publications'].includes(category) || /research history/.test(q) ? 3 : 2;
  return ranked.filter(r => r.score >= 0).slice(0,count).map(r => r.entity);
}

export const suggestions = [
  'What is Hosna working on now?',
  'Show me her AI projects',
  'What is her Data & BI experience?',
  'Tell me about her research'
];

export function compose(entities) {
  if (!entities.length) return {text:UNKNOWN, entries:[], followups:['Who is Hosna?', 'Show me her recent AI projects.']};
  const category = entities[0].category;
  const followups = category === 'research' ? ['What has she published?','Show me her recent AI projects.']
    : category === 'projects' ? ['What technologies does she use?','What is her data analytics experience?']
    : category === 'experience' || category === 'skills' ? ['Show me her data and BI projects.','How can I contact Hosna?']
    : ['Tell me about her research.','How can I contact Hosna?'];
  return {text:'', entries:entities, followups};
}
