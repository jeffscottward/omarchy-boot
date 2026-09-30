// OMP Browser Relay smoke test (Bun or Node >= 22; uses global fetch/WebSocket).
//
//   relay-tab.mjs <port>              reachability only: /json/list + /json/version
//   relay-tab.mjs <port> --with-tab   also open OUR OWN tab, read it, close it
//
// Never adopts, navigates, reads, or closes an existing user tab. The only tab
// touched is the one this script creates via Target.createTarget. Chrome makes
// that new tab active in its window (relay extension behavior), and closes it
// afterwards; Chrome then activates a neighboring tab.
// Prints exactly one JSON line: {"status":"PASS|FAIL|SKIP","detail":"..."}

const port = process.argv[2] ?? "9224";
const withTab = process.argv.includes("--with-tab");
const base = `http://127.0.0.1:${port}`;
const TEST_URL = "https://example.com/?omp-control-stack-test";

function done(status, detail) {
	console.log(JSON.stringify({ status, detail }));
	process.exit(0);
}

async function getJson(path) {
	const res = await fetch(base + path, { signal: AbortSignal.timeout(4000) });
	return { status: res.status, body: await res.json().catch(() => null) };
}

let version;
try {
	const list = await getJson("/json/list");
	if (list.status !== 200) done("FAIL", `relay /json/list HTTP ${list.status}`);
	const v = await getJson("/json/version");
	if (v.status === 503) done("FAIL", "relay server up but Chrome extension not connected (HTTP 503)");
	if (v.status !== 200) done("FAIL", `relay /json/version HTTP ${v.status}`);
	version = v.body;
} catch (err) {
	done("FAIL", `relay not reachable on ${port}: ${err.message}`);
}
const attachable = (await getJson("/json/list")).body?.length ?? 0;
if (!withTab) done("PASS", `extension connected (${version.Browser ?? "?"}); ${attachable} attachable tabs (not read)`);

const ws = new WebSocket(version.webSocketDebuggerUrl);
let seq = 0;
const pending = new Map();
ws.onmessage = ev => {
	const msg = JSON.parse(typeof ev.data === "string" ? ev.data : new TextDecoder().decode(ev.data));
	if (msg.id && pending.has(msg.id)) {
		const { resolve, reject } = pending.get(msg.id);
		pending.delete(msg.id);
		msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
	}
};
const send = (method, params = {}, sessionId) =>
	new Promise((resolve, reject) => {
		const id = ++seq;
		pending.set(id, { resolve, reject });
		ws.send(JSON.stringify(sessionId ? { id, method, params, sessionId } : { id, method, params }));
		setTimeout(() => {
			if (pending.delete(id)) reject(new Error(`${method} timed out`));
		}, 15000);
	});

await new Promise((resolve, reject) => {
	ws.onopen = resolve;
	ws.onerror = () => reject(new Error("websocket error"));
}).catch(err => done("FAIL", err.message));

let targetId;
let result = ["FAIL", "unknown"];
const t0 = Date.now();
try {
	({ targetId } = await send("Target.createTarget", { url: TEST_URL }));
	const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
	let page = null;
	for (let i = 0; i < 40; i++) {
		const r = await send(
			"Runtime.evaluate",
			{
				expression:
					"JSON.stringify({state: document.readyState, title: document.title, text: (document.body?.innerText || '').slice(0, 200)})",
				returnByValue: true,
			},
			sessionId,
		).catch(() => null);
		const val = r?.result?.value ? JSON.parse(r.result.value) : null;
		if (val && val.state === "complete" && val.title) {
			page = val;
			break;
		}
		await new Promise(r => setTimeout(r, 250));
	}
	if (!page) result = ["FAIL", "own tab opened but page text never became readable"];
	else if (!/Example Domain/.test(page.title + page.text)) result = ["FAIL", `unexpected page title ${JSON.stringify(page.title)}`];
	else result = ["PASS", `opened+read own tab "${page.title}" in ${Date.now() - t0} ms`];
} catch (err) {
	result = ["FAIL", err.message];
} finally {
	if (targetId) {
		await send("Target.closeTarget", { targetId }).catch(() => {});
		await new Promise(r => setTimeout(r, 700));
		const still = ((await getJson("/json/list").catch(() => ({ body: [] }))).body ?? []).some(
			t => t.id === targetId || (t.url ?? "").includes("omp-control-stack-test"),
		);
		if (still) result = ["FAIL", `${result[1]}; test tab still open after close`];
		else result[1] += "; closed";
	}
	ws.close();
}
done(...result);
