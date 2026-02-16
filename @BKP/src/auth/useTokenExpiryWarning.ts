import { useEffect, useState } from "react";
import { refresh } from "@api/auth";
import { isAccessTokenValid } from "./token";

export function useTokenExpiryWarning() {
  const [expiringSoon, setExpiringSoon] = useState(false);
  const [msRemaining, setMsRemaining] = useState<number | null>(null);

  useEffect(() => {
    function update() {
      const expStr = localStorage.getItem("expires_at");
      const exp = expStr ? Number(expStr) : 0;
      const now = Date.now();
      if (!exp || !isAccessTokenValid()) {
        setExpiringSoon(false);
        setMsRemaining(null);
        return;
      }
      const remaining = exp - now;
      setMsRemaining(remaining);
      setExpiringSoon(remaining <= 5 * 60 * 1000);
    }
    update();
    const id = setInterval(update, 30 * 1000);
    return () => clearInterval(id);
  }, []);

  const renew = async () => {
    await refresh();
    setExpiringSoon(false);
    localStorage.removeItem("tokenExpiryBannerDismissed");
    const expStr = localStorage.getItem("expires_at");
    const exp = expStr ? Number(expStr) : 0;
    setMsRemaining(exp ? exp - Date.now() : null);
  };

  return { expiringSoon, msRemaining, renew };
}
