/** Mark the secondary build as CommonJS inside the ESM package boundary. */
import { writeFile } from "node:fs/promises";

const target = new URL("../dist/cjs/package.json", import.meta.url);
await writeFile(target, `${JSON.stringify({ type: "commonjs" }, null, 2)}\n`, "utf8");
