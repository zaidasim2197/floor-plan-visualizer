/**
 * Rewrites all API route files from the incorrect createAPIFileRoute pattern
 * to the correct TanStack Start createFileRoute + server.handlers pattern.
 *
 * Transformation:
 *   import { createAPIFileRoute } from "@tanstack/react-start/api";
 *   export const APIRoute = createAPIFileRoute("PATH")({
 *     GET: handler,
 *     POST: handler,
 *   });
 *
 * → becomes:
 *   import { createFileRoute } from "@tanstack/react-router";
 *   export const Route = createFileRoute("PATH")({
 *     server: {
 *       handlers: {
 *         GET: handler,
 *         POST: handler,
 *       },
 *     },
 *   });
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const API_DIR = join(process.cwd(), "src", "routes", "api");

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...walk(full));
    } else if (full.endsWith(".ts")) {
      files.push(full);
    }
  }
  return files;
}

function transform(src, filePath) {
  // 1. Fix import
  let out = src.replace(
    /import \{ createAPIFileRoute \} from "@tanstack\/react-start\/api";/,
    `import { createFileRoute } from "@tanstack/react-router";`
  );

  // 2. Fix export declaration: APIRoute → Route, createAPIFileRoute → createFileRoute
  out = out.replace(
    /export const APIRoute = createAPIFileRoute\(/,
    `export const Route = createFileRoute(`
  );

  // 3. The hard part: wrap the handlers object in server: { handlers: { ... } }
  // Pattern: createFileRoute("PATH")({
  //   METHOD: handler,    ← these are the raw methods
  // });
  // We need to find the outer object passed to createFileRoute("PATH")({ ... })
  // and inject server: { handlers: { ... } } around the METHOD keys.

  // Find the position of createFileRoute("...path...")({
  const routeCallMatch = out.match(/createFileRoute\("([^"]+)"\)\(\{/);
  if (!routeCallMatch) {
    console.warn(`  [SKIP] No createFileRoute call found in ${filePath}`);
    return out;
  }

  const openBraceIdx = out.indexOf(routeCallMatch[0]) + routeCallMatch[0].length;

  // Find the matching close brace for the route config object
  let depth = 1;
  let i = openBraceIdx;
  while (i < out.length && depth > 0) {
    if (out[i] === "{") depth++;
    else if (out[i] === "}") depth--;
    i++;
  }
  // i now points one past the closing }
  const closeBraceIdx = i - 1; // position of the closing }

  // Extract the inner content (the method handlers)
  const inner = out.slice(openBraceIdx, closeBraceIdx);

  // Check if already wrapped (idempotent)
  if (inner.trim().startsWith("server:")) {
    console.log(`  [SKIP] Already wrapped: ${filePath}`);
    return out;
  }

  // Indent the inner content by 4 extra spaces (inside handlers: { })
  const indentedInner = inner
    .split("\n")
    .map((line) => (line.trim() === "" ? line : "    " + line))
    .join("\n");

  const wrapped = `\n  server: {\n    handlers: {${indentedInner}    },\n  },\n`;

  const result =
    out.slice(0, openBraceIdx) +
    wrapped +
    out.slice(closeBraceIdx);

  return result;
}

const files = walk(API_DIR);
let changed = 0;

for (const file of files) {
  const src = readFileSync(file, "utf8");
  if (!src.includes("createAPIFileRoute")) {
    console.log(`  [SKIP] Not an APIFileRoute: ${file}`);
    continue;
  }
  const result = transform(src, file);
  if (result !== src) {
    writeFileSync(file, result, "utf8");
    console.log(`  [OK]   ${file.replace(process.cwd(), "")}`);
    changed++;
  } else {
    console.warn(`  [WARN] No change made: ${file}`);
  }
}

console.log(`\nDone. ${changed} files updated.`);
