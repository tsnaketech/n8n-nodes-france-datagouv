/**
 * Copie les fichiers codex (`*.node.json`) de `nodes/` vers `dist/`.
 *
 * n8n lit le codex d'un nœud dans le fichier voisin du JS compilé : pour
 * `dist/nodes/X/X.node.js`, il fait `require('dist/nodes/X/X.node.json')`.
 * Or `n8n-node build` ne recopie que les `.png`, les `.svg` et les JSON de
 * `__schema__/` — sans cette étape, le codex reste dans les sources, n8n ne le
 * trouve pas et range le nœud dans la seule catégorie « Custom Nodes ».
 *
 * Branché sur `postbuild`, donc exécuté par `npm run build`. `n8n-node dev` ne
 * le déclenche pas : en boucle de dev, relancer `npm run build` une fois si la
 * catégorie du nœud compte.
 */
import { cp, mkdir, readdir } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const sourceRoot = join(projectRoot, 'nodes');
const targetRoot = join(projectRoot, 'dist', 'nodes');

async function* codexFiles(directory) {
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const path = join(directory, entry.name);

		if (entry.isDirectory()) {
			yield* codexFiles(path);
		} else if (entry.name.endsWith('.node.json')) {
			yield path;
		}
	}
}

let copied = 0;

for await (const source of codexFiles(sourceRoot)) {
	const target = join(targetRoot, relative(sourceRoot, source));

	await mkdir(dirname(target), { recursive: true });
	await cp(source, target);
	copied++;
}

console.log(`Copied ${copied} codex file(s) to dist/nodes`);
