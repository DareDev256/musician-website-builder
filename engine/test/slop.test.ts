// Ban check: nothing the engine emits (engine/src, the world template, built worlds, the studio UI) may carry a
// marquee/ticker, spinning text badge, sparkle glyph or gradient text. House rule: design-taste-house §2.J.
// Uses the house linter; skipped (loudly) on a machine that does not have it. A planted marquee must exit 3,
// so a linter that stops seeing the failure fails this test too.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir, homedir } from 'node:os';
import { join } from 'node:path';

const LINT = process.env.SLOP_LINT ?? join(homedir(), 'Projects/wikis/the-system-wiki/bin/slop-lint.mjs');
const root = join(import.meta.dirname, '..', '..');
const run = (...targets: string[]) => spawnSync('node', [LINT, ...targets, '--bans-only'], { encoding: 'utf8' });
const skip = existsSync(LINT) ? false : `slop-lint not found at ${LINT} (set SLOP_LINT)`;

test('slop-lint catches a planted marquee (the check can fail)', { skip }, () => {
  const dir = mkdtempSync(join(tmpdir(), 'slop-'));
  writeFileSync(join(dir, 'x.html'), '<style>.marquee{overflow:hidden}</style><div class="marquee">x</div>');
  assert.equal(run(dir).status, 3);
});

test('emitters, template, worlds and studio carry no slop BAN', { skip }, () => {
  const r = run(...['engine/src', 'engine/runtime', 'worlds', 'studio/app'].map((d) => join(root, d)));
  assert.equal(r.status, 0, r.stdout + r.stderr);
});
