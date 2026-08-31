import { useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { register as registerRequest } from "../../auth/auth.api";
import {
  buildAuthPath,
  getSafeReturnTo,
} from "../../auth/utils/returnTo";

export default function RegisterForm() {
  const navigate = useNavigate();
  const [searchParams] =
    useSearchParams();

  const returnTo =
    getSafeReturnTo(
      searchParams.get("returnTo"),
    );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await registerRequest({ email, password });
      navigate(
        buildAuthPath(
          "/login",
          returnTo,
        ),
        {
          replace: true,
        },
      );
    } catch {
      setError("Unable to create your account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="auth-form"
      onSubmit={handleSubmit}
    >
      <input
        placeholder="Full Name"
        value={name}
        onChange={(e) =>
          setName(e.target.value)
        }
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) =>
          setConfirmPassword(
            e.target.value
          )
        }
      />

      {error && <p className="auth-error" role="alert">{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "Creating Account..." : "Create Account"}
      </button>

      <p className="auth-footer">
      Already have an account?{" "}
     <Link to="/login">
      Sign In
     </Link>
      </p>
    </form>
  );
}
