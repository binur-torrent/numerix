import "server-only";

import fs from "fs";
import path from "path";
import { SEED } from "@/lib/seed";
import type { Store } from "@/lib/types";

const filePath = path.join(process.cwd(), ".data", "store.json");

function cloneSeed(): Store {
  return structuredClone(SEED);
}

function read(): Store {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw) as Store;
    if (!parsed.subjects || !parsed.tests || !parsed.questions || !parsed.saved) {
      return cloneSeed();
    }
    return parsed;
  } catch {
    return cloneSeed();
  }
}

function write(store: Store) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
}

let chain: Promise<void> = Promise.resolve();

export function readStore() {
  return read();
}

export function updateStore(change: (store: Store) => void) {
  const run = chain.then(() => {
    const store = read();
    change(store);
    write(store);
  });
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}
