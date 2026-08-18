import { useEffect, useRef } from "react";
import { Accelerometer } from "expo-sensors";

const UPDATE_INTERVAL_MS = 100;
const SHAKE_THRESHOLD = 1.8;

// Fires onShake once when the combined accelerometer delta between two
// consecutive readings spikes past SHAKE_THRESHOLD g. Only listens while
// `enabled` is true, so callers can gate it to the "waiting to reveal"
// phase instead of running all the time.
export default function useShakeDetector(onShake: () => void, enabled: boolean) {
  const lastReading = useRef<{ x: number; y: number; z: number } | null>(null);
  const onShakeRef = useRef(onShake);
  onShakeRef.current = onShake;

  useEffect(() => {
    if (!enabled) {
      lastReading.current = null;
      return;
    }

    Accelerometer.setUpdateInterval(UPDATE_INTERVAL_MS);
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const last = lastReading.current;
      lastReading.current = { x, y, z };
      if (!last) return;

      const delta = Math.abs(x - last.x) + Math.abs(y - last.y) + Math.abs(z - last.z);
      if (delta > SHAKE_THRESHOLD) {
        lastReading.current = null;
        onShakeRef.current();
      }
    });

    return () => subscription.remove();
  }, [enabled]);
}
