import { useEffect } from "react";

export const useDebouncedEffect = <T>(effect: (val: T) => void, val: T, delay: number) => {
  useEffect(() => {
      const handler = setTimeout(() => effect(val), delay);

      return () => clearTimeout(handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [val, delay]);
}