// Minimal browser shim for the node test environment.
//
// `src/types/progress.ts` guards every storage read with `typeof window === "undefined"`
// and then talks to a bare `localStorage` global. The node environment has neither,
// so without this shim the localStorage-backed logic would silently return defaults and
// every storage test would be a lie. A full DOM (jsdom/happy-dom) buys nothing here.

function createLocalStorageMock() {
  let store = new Map<string, string>();
  return {
    get length(): number {
      return store.size;
    },
    key(index: number): string | null {
      return Array.from(store.keys())[index] ?? null;
    },
    getItem(key: string): string | null {
      return store.get(String(key)) ?? null;
    },
    setItem(key: string, value: string): void {
      store.set(String(key), String(value));
    },
    removeItem(key: string): void {
      store.delete(String(key));
    },
    clear(): void {
      store = new Map();
    },
  };
}

const localStorageMock = createLocalStorageMock();

// `window` exists purely as the "are we in a browser?" marker the source code
// checks for; it also carries the storage so both access styles behave the same.
const windowMock = { localStorage: localStorageMock };

for (const [name, value] of [
  ["localStorage", localStorageMock],
  ["window", windowMock],
] as const) {
  Object.defineProperty(globalThis, name, {
    value,
    configurable: true,
    writable: true,
  });
}
