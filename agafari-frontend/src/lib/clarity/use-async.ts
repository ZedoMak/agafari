"use client";

import { useEffect, useRef, useState } from "react";

export type AsyncState<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
  reload: () => void;
};

function keyOf(deps: readonly unknown[]) {
  return deps
    .map((value) => (typeof value === "object" ? JSON.stringify(value) : String(value)))
    .join("|");
}

/**
 * Small load/error/empty helper so every workspace screen behaves the same way.
 * `loading` is derived from whether the settled result matches the request the
 * component is currently rendering, which keeps stale data on screen while a
 * filter change is in flight.
 */
export function useAsync<T>(
  loader: () => Promise<T>,
  deps: readonly unknown[],
): AsyncState<T> {
  const key = keyOf(deps);
  const [nonce, setNonce] = useState(0);
  const [result, setResult] = useState<{
    key: string;
    nonce: number;
    data: T | null;
    error: string | null;
  } | null>(null);

  const loaderRef = useRef(loader);
  useEffect(() => {
    loaderRef.current = loader;
  });

  useEffect(() => {
    let active = true;
    loaderRef
      .current()
      .then((data) => {
        if (active) setResult({ key, nonce, data, error: null });
      })
      .catch((error: unknown) => {
        if (!active) return;
        setResult({
          key,
          nonce,
          data: null,
          error: error instanceof Error ? error.message : "Something went wrong.",
        });
      });
    return () => {
      active = false;
    };
  }, [key, nonce]);

  const settled = result !== null && result.key === key && result.nonce === nonce;

  return {
    data: result?.data ?? null,
    error: settled ? result.error : null,
    loading: !settled,
    reload: () => setNonce((value) => value + 1),
  };
}
