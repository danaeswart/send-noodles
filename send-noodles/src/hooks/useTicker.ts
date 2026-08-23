import { useEffect, useState } from "react";

// Forces a re-render every `intervalMs` by returning a fresh Date.now()
// each tick — anything derived from a real timestamp (e.g. a challenge's
// remaining duration) recomputes on every render, so reading it off
// Date.now() directly would only ever update when something else
// happened to re-render the component. This hook is what makes it
// actually count down live instead of freezing at whatever value was on
// screen when the component first mounted.
export function useTicker(intervalMs: number): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
