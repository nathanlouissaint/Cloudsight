import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../auth/useAuth";
import { getCurrentUser } from "../auth/services/me.api";
import { refreshAccessToken } from "../auth/services/refresh.api";

export default function OAuthCompletePage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [failed, setFailed] =
    useState(false);

  useEffect(() => {
    let active = true;

    async function restore() {
      try {
        const accessToken =
          await refreshAccessToken();
        const user = await getCurrentUser();

        if (active) {
          login(accessToken, user);
          navigate("/", { replace: true });
        }
      } catch {
        if (active) {
          setFailed(true);
          navigate(
            "/login?authError=oauth_failed",
            { replace: true },
          );
        }
      }
    }

    void restore();

    return () => {
      active = false;
    };
  }, [login, navigate]);

  return (
    <main className="auth-loading" aria-live="polite">
      {failed
        ? "Federated sign-in could not be completed."
        : "Completing sign in…"}
    </main>
  );
}
