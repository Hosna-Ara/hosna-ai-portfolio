// Metadata-to-evidence mapping deliberately excludes image captions and photographs.
export function enrichKnowledge(entities, links, media) {
  const base={date:'',role:'',technologies:[],visibility:'public',urls:[],featured:false};
  return [...entities,
    ...links.filter(l=>l.visibility==='public').map(l=>({...base,id:`link-${l.label.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`,category:'links',title:l.label,summary:`Public professional profile: ${l.label}.`,tags:[l.label],source:l.source,anchor:'contact',urls:[{label:l.label,url:l.url}]})),
    ...media.dashboards.filter(m=>m.visibility==='public').map(m=>({...base,id:m.src.includes('hospital')?'dashboard-hospital':'dashboard-pharma',category:'dashboards',title:m.title,summary:`${m.description} Selected dashboard preview only; no client identity, authorship, delivery date or business outcome is inferred.`,tags:[m.title,'dashboard','analytics','reporting'],source:m.source,anchor:'analytics'}))
  ].filter(e=>e.visibility==='public');
}
