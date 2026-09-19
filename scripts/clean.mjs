/** Remove generated build directories without touching user-authored files. */
import { rm } from "node:fs/promises";

await Promise.all([
  rm(new URL("../dist", import.meta.url), { recursive: true, force: true }),
  rm(new URL("../dist-tests", import.meta.url), { recursive: true, force: true }),
]);
