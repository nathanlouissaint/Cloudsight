import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { resendVerification, verifyEmail } from "../auth/auth.api";
import { AuthLayout } from "../components/auth";

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<"loading" | "success" | "error">(
    token ? "loading" : "error",
  );
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");
  const verificationStarted = useRef(false);
  const authenticated = Boolean(localStorage.getItem("cloudsight.accessToken"));

  useEffect(() => {
    if (!token) return;
    if (verificationStarted.current) return;
    verificationStarted.current = true;
    void verifyEmail(token).then(() => setState("success")).catch(() => setState("error"));
  }, [token]);

  async function handleResend() {
    setResending(true);
    setResendMessage("");
    setResendError("");
    try {
      const result = await resendVerification();
      setResendMessage(result.message);
    } catch (error) {
      setResendError(error instanceof Error ? error.message : "Unable to resend verification email.");
    } finally {
      setResending(false);
    }
  }

  return <AuthLayout>
    <div className="auth-form">
      <h2>{state === "loading" ? "Verifying email…" : state === "success" ? "Email verified" : "Verification link invalid"}</h2>
      <p>{state === "success" ? "Your email address has been verified." : state === "error" ? "This verification link is invalid or expired." : "Please wait while we verify your email."}</p>
      {state !== "loading" && <p className="auth-footer"><Link to="/login">Back to Sign In</Link></p>}
      {state === "error" && authenticated && <>
        <p>Didn't receive the verification email?</p>
        <button type="button" onClick={() => void handleResend()} disabled={resending}>
          {resending ? "Sending…" : "Resend verification email"}
        </button>
        {resendMessage && <p>{resendMessage}</p>}
        {resendError && <p className="auth-error">{resendError}</p>}
      </>}
    </div>
  </AuthLayout>;
}
