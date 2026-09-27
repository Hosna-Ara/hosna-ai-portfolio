import {retrieve, compose} from './retrieval.js';

export class LocalKnowledgeProvider {
  name = 'Verified knowledge · no live LLM';
  async answer(question, entities, previousIds = []) {
    return compose(retrieve(question, entities, previousIds),question);
  }
}

/** Optional future server adapter. Only retrieved IDs can cross the trust boundary.
 * Free text and URLs from a remote model are never rendered. A server owns secrets.
 * There is intentionally no configured endpoint in the static application. */
export class RemoteSelectionProvider {
  constructor(endpoint, fetcher = globalThis.fetch) {
    this.endpoint = endpoint;
    this.fetcher = fetcher;
    this.name = 'Verified knowledge · assisted retrieval';
  }
  async answer(question, entities, previousIds = []) {
    const candidates = retrieve(question, entities, previousIds);
    if (!candidates.length) return compose([]);
    try {
      const response = await this.fetcher(this.endpoint, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({question, candidates}), signal:AbortSignal.timeout(8000)
      });
      if (!response.ok) throw new Error('Provider unavailable');
      const {ids} = await response.json();
      if (!Array.isArray(ids) || !ids.length || ids.some(id => !candidates.some(e => e.id === id))) throw new Error('Unsupported evidence');
      return compose([...new Set(ids)].map(id => candidates.find(e => e.id === id)),question);
    } catch {
      return {...compose(candidates,question), notice:'The connected service is unavailable. Showing verified local knowledge.'};
    }
  }
}
