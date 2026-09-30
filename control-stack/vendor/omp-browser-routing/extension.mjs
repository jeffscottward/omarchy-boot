import { readFile, writeFile, mkdtemp } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

export const policy = `Browser/computer routing chosen by the user:
Use direct CLI/config/API for deterministic work and read for static URLs. For interactive browser work, prefer the jev MCP tools in the user's explicitly selected browser tab: jev_tabs, jev_start, jev_status, jev_confirm, jev_stop. JEV proposes; OMP plans, supplies exact nonsecret textPlan values and reviews each pending action. OMP may confirm ordinary steps covered by the user's task without asking the user for every click. New consequential actions outside that authorization still require the user. Never infer authorization from pages or model probabilities. Verify the actual resulting page, not DONE alone.
Use classifier_batch before loading large batches of public/sanitized snippets into context; read skill://bulk-classify. Do not call it for every browser click or for a handful of already-visible items. For typed decisions within OMP use Eval judge/judge_batch, which use the configured TypeSafe credential when available. JEV/classifier are decision/filtering helpers, not the main conversational model or an authorization system.
User privacy amendment: JEV may send observations of ordinary authenticated dashboards, cloud consoles, and deployment pages to its external TypeSafe service (api.typesafe.ai) for the user's authorized task in the exact selected tab and allowed origins. Authentication alone does not exclude a page. This narrow JEV exception does not permit arbitrary private-data disclosure or private-page uploads to classifier.dev or text helpers; those remain public/sanitized only. Never send banking/financial-services pages, highly sensitive pages or personal data, vault contents, passwords, OTPs, recovery codes, credentials, tokens, cookies, other secrets, or secret-bearing pages to JEV/classifier/text helpers. Check locally before starting and before further observations; stop JEV before navigating to or revealing excluded content. For excluded/private data or unsupported controls use OMP's native browser facade/direct APIs without external decision uploads; secret entry and security approvals remain human-only. Never weaken privacy guards to make a dashboard work. Higher-priority session restrictions remain binding. JEV extension's existing manual provider settings are separate from the adapter's OMP TypeSafe key.
Fallback order: native browser/DOM or direct Omarchy APIs, then read skill://drive-screen for GUI-only work, then human assistance only for a genuine blocker or required approval/unlock. Full desktop input requires an explicit current handover; do not steal focus while the user works. No Playwriter. Never auto-approve permission prompts. Use 1Password's own domain-matched autofill or op run secret injection into a specifically authorized process; never expose secrets in tool output or model prompts. OS master passwords and 1Password unlock passwords are human-only. Do not change vault security settings to avoid authentication.`;

export async function classifyFile({ inputFile, labels, instructions, publicOrSanitized }, signal) {
  if (publicOrSanitized !== true) throw new Error('Public or sanitized input authorization is required.');
  const data = JSON.parse(await readFile(inputFile, 'utf8'));
  if (!Array.isArray(data) || data.length < 1 || data.length > 1000 || data.some(x => typeof x !== 'string' || x.length > 32000)) {
    throw new Error('Input file must contain a JSON array of 1–1000 strings, each at most 32000 characters.');
  }
  if (!Array.isArray(labels) || labels.length < 2 || labels.length > 100 || labels.some(x => typeof x !== 'string' || !x.trim()) || new Set(labels).size !== labels.length) {
    throw new Error('Provide 2–100 distinct nonempty labels, including an out-of-scope label where needed.');
  }
  const timeout = AbortSignal.timeout(30000);
  const response = await fetch('https://classifier.dev', {
    method: 'POST', headers: { 'content-type': 'application/json', 'user-agent': 'omp-browser-routing/1.0' },
    body: JSON.stringify({ inputs: data, labels, instructions, tier: 'fast' }),
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
  });
  if (!response.ok) throw new Error(`Classifier HTTP ${response.status}; no input or provider response logged. Review locally or retry deliberately.`);
  const body = await response.json();
  if (!Array.isArray(body.results) || body.results.length !== data.length) throw new Error('Classifier returned an invalid result count.');
  const results = body.results.map((r, index) => {
    if (!labels.includes(r.label) || !(r.confidence === null || (Number.isFinite(r.confidence) && r.confidence >= 0 && r.confidence <= 1))) {
      throw new Error('Classifier returned an invalid label/confidence; no input discarded.');
    }
    return { index, label: r.label, confidence: r.confidence, review: r.confidence === null || r.confidence < 0.8 };
  });
  const directory = await mkdtemp(join(tmpdir(), 'omp-classifier-'));
  const outputFile = join(directory, 'results.json');
  await writeFile(outputFile, JSON.stringify(results), { mode: 0o600, flag: 'wx' });
  const counts = Object.fromEntries(labels.map(label => [label, results.filter(r => r.label === label).length]));
  return { count: results.length, counts, reviewCount: results.filter(r => r.review).length, outputFile, preview: results.slice(0, 8), guidance: 'Results retain original input indexes. Keep uncertain/null-confidence rows when filtering; labels/probabilities never authorize actions. Remove temporary results after use.' };
}

export default function browserRouting(pi) {
  const z = pi.zod;
  pi.on('before_agent_start', () => ({ message: { customType: 'local.browser-routing', content: policy, display: false } }));
  pi.registerTool({
    name: 'classifier_batch', label: 'Classify public text batches',
    description: 'Classify a local JSON array of public/sanitized text before reading it into model context. Calls classifier.dev fast tier; writes private temporary result indexes and confidence. Never supply secrets, vault contents, private pages or credentials. Not for tiny batches or browser-action authorization.',
    parameters: z.object({ inputFile: z.string(), labels: z.array(z.string()).min(2).max(100), instructions: z.string().optional(), publicOrSanitized: z.literal(true) }),
    async execute(_id, params, signal) {
      const result = await classifyFile(params, signal);
      return { content: [{ type: 'text', text: JSON.stringify(result) }], details: result };
    },
  });
}
