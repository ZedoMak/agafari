import "@testing-library/jest-dom/vitest";

Object.defineProperty(HTMLElement.prototype, "scrollTo", {
  value: () => undefined,
  configurable: true,
});

if (!globalThis.crypto?.randomUUID) {
  Object.defineProperty(globalThis, "crypto", {
    value: { randomUUID: () => "test-uuid" },
  });
}
