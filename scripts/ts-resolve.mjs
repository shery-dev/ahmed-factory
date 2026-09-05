/** Resolver hook — see ts-hooks.mjs. */
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const SRC = path.join(process.cwd(), 'src');

export async function resolve(specifier, context, nextResolve) {
  // `@/lib/repo` → <project>/src/lib/repo.ts, matching tsconfig paths.
  if (specifier.startsWith('@/')) {
    const target = path.join(SRC, specifier.slice(2));
    for (const candidate of [target, `${target}.ts`, `${target}.tsx`, path.join(target, 'index.ts')]) {
      try {
        return await nextResolve(pathToFileURL(candidate).href, context);
      } catch { /* try the next shape */ }
    }
  }

  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    // Extensionless relative import: `./db` → `./db.ts`
    if (specifier.startsWith('.') && !path.extname(specifier)) {
      for (const ext of ['.ts', '.tsx']) {
        try {
          return await nextResolve(specifier + ext, context);
        } catch { /* fall through to the original error */ }
      }
    }
    throw err;
  }
}
