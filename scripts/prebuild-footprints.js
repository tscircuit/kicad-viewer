import { mkdir, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { parseKicadModToTscircuitSoup } from "kicad-mod-converter";

const BASE_URL = "https://kicad-mod-cache.tscircuit.com";

async function fetchJson(url) {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
	return res.json();
}

async function fetchText(url) {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
	return res.text();
}

async function main() {
	const files = await fetchJson(`${BASE_URL}/kicad_files.json`);
	for (const file of files) {
		if (!file.endsWith(".kicad_mod")) continue;
		const content = await fetchText(`${BASE_URL}/${file}`).catch((err) => null);
		if (!content) continue;
		const soup = await parseKicadModToTscircuitSoup(content);
		const outPath = join(
			"public",
			"circuit-json",
			file.replace(/\.kicad_mod$/, ".json"),
		);
		await mkdir(dirname(outPath), { recursive: true });
		await writeFile(outPath, JSON.stringify(soup, null, 2), "utf8");
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
