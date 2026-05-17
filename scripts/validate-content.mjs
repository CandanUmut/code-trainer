// One-off content validator: transpiles every lesson, runs its Python through
// the real interpreter, and checks predicted outputs / fill-in answers /
// reference solutions. Also checks worked-example step line ranges.
//   node scripts/validate-content.mjs
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (p.endsWith('.ts')) out.push(p);
  }
  return out;
}

// Minimal TS->JS transform good enough for these data-only modules: drop the
// leading `import type` lines and strip the `: TypeName` annotation on the
// top-level `const`. Only touches lines before the first `const` so template
// literals containing `import ...` are left alone.
async function importTs(file) {
  const lines = readFileSync(file, 'utf8').split('\n');
  let i = 0;
  while (i < lines.length && !/^const /.test(lines[i])) {
    if (/^import\s/.test(lines[i])) lines[i] = '';
    i++;
  }
  const js = lines.join('\n').replace(/^const (\w+): \w+ =/m, 'const $1 =');
  const url = 'data:text/javascript;base64,' + Buffer.from(js).toString('base64');
  return (await import(url)).default;
}

// --- gather lessons & problems --------------------------------------------
const lessonFiles = walk(join(root, 'src/content/lessons')).filter(f => !f.endsWith('index.ts'));
const problemFiles = walk(join(root, 'src/content/problems'));

const checks = [];
const structural = [];

for (const file of lessonFiles) {
  const lesson = await importTs(file);
  const rel = file.split('lessons').pop();
  lesson.steps.forEach((step, i) => {
    const tag = `${lesson.id} step ${i + 1} [${step.kind}]`;
    if (step.kind === 'predict-output') {
      checks.push({ kind: 'predict', tag, code: step.code, expected: step.expected });
    } else if (step.kind === 'fill-in-blank') {
      // assemble with canonical answers
      let code = step.template;
      for (const b of step.blanks) {
        code = code.split(`__${b.id}__`).join(b.accept[0]);
        // placeholder presence check
        if (!step.template.includes(`__${b.id}__`))
          structural.push(`${tag}: blank id ${b.id} has no __${b.id}__ in template`);
      }
      if (step.validation) {
        checks.push({
          kind: 'fillin',
          tag,
          code,
          expectedStdout: step.validation.expectedStdout,
          expectedVar: step.validation.expectedVar,
        });
      }
    } else if (step.kind === 'write-line') {
      if (step.mode === 'expression') {
        checks.push({
          kind: 'wl-expr',
          tag,
          setup: step.setup,
          answer: step.referenceAnswer,
          expected: step.expected,
        });
      } else {
        checks.push({
          kind: 'wl-stmt',
          tag,
          setup: step.setup,
          answer: step.referenceAnswer,
          varName: step.checkVar.name,
          value: step.checkVar.value,
        });
      }
    } else if (step.kind === 'write-function') {
      checks.push({
        kind: 'wf',
        tag,
        solution: step.referenceSolution,
        functionName: step.functionName,
        tests: step.tests,
      });
    }
  });
}

// worked-example line ranges
for (const file of problemFiles) {
  if (file.endsWith('index.ts')) continue;
  const problem = await importTs(file);
  const we = problem.workedExample;
  if (!we?.steps) {
    structural.push(`${problem.id}: workedExample has no steps`);
    continue;
  }
  const lineCount = we.solution.split('\n').length;
  we.steps.forEach((s, i) => {
    const [lo, hi] = s.lines;
    if (lo < 1 || hi > lineCount || lo > hi)
      structural.push(
        `${problem.id} we-step ${i + 1}: lines [${lo},${hi}] invalid (solution has ${lineCount} lines)`,
      );
  });
  if (we.steps.length < 3) structural.push(`${problem.id}: only ${we.steps.length} worked-example steps`);
}

writeFileSync(join(root, 'scripts/checks.json'), JSON.stringify(checks));
console.log(`Collected ${checks.length} runnable checks from ${lessonFiles.length} lessons.`);
if (structural.length) {
  console.log(`\n${structural.length} STRUCTURAL ISSUES:`);
  structural.forEach(s => console.log('  - ' + s));
} else {
  console.log('Structural checks: OK');
}

// run python
try {
  const out = execFileSync('python3', [join(root, 'scripts/run-checks.py')], {
    cwd: root,
    encoding: 'utf8',
  });
  console.log(out);
} catch (e) {
  console.log(e.stdout || e.message);
  process.exitCode = 1;
}
