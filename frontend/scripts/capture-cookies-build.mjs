import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { stripVTControlCharacters } from 'node:util';

const build = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'build'], { windowsHide: true });
let output = '';
for (const stream of [build.stdout, build.stderr]) {
  stream.on('data', (chunk) => { output += chunk.toString(); process.stdout.write(chunk); });
}
build.on('error', (error) => { throw error; });
build.on('close', async (code) => {
  const evidence = '../docs/evidence/cookies-and-headers';
  await mkdir(evidence, { recursive: true });
  await writeFile(`${evidence}/build.txt`, stripVTControlCharacters(output));
  process.exitCode = code ?? 1;
});
