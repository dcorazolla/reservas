import { useEffect } from "react";

// Hook intentionally disabled: page-header sticky behavior removed.
export default function usePageHeaderStick() {
  useEffect(() => {
    // no-op: preserved so imports don't break if still present elsewhere
    return () => {
      // nothing to clean up
    };
  }, []);
}
