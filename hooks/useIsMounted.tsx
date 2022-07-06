import { useCallback, useEffect, useRef } from "react";

export default function useIsMounted(): boolean {
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mounted = useCallback(() => {
    return isMountedRef.current;
  }, []);

  return mounted();
}