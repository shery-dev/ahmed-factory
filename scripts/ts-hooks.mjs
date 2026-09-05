/**
 * Lets plain `node` run the project's TypeScript directly:
 *
 *   node --import ./scripts/ts-hooks.mjs scripts/verify-stock.ts
 *
 * Node 24 strips the types on its own. What it will not do is guess a file
 * extension, and the source uses Next's extensionless `./db` and `@/lib/...`
 * forms throughout. This maps both onto real files so verification scripts can
 * import the very same modules the app imports — no second copy of any rule,
 * which is the point of keeping every SQL statement in repo.ts.
 */
import { register } from 'node:module';

register('./ts-resolve.mjs', import.meta.url);
