import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { isAccessTokenValid } from "../../auth/token";

type Props = {
  children: ReactNode;
};

export default function RequireAuth({ children }: Props) {
  const allowed = isAccessTokenValid();
  if (!allowed) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
