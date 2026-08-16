import { useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/useAuth";
import { logout as logoutRequest } from "../../auth/auth.api";

export default function LogoutButton() {
  const navigate = useNavigate();

  const { logout } = useAuth();

  async function handleLogout() {
    try {
      await logoutRequest();
    } catch {
      // Local state must still be cleared for stale sessions.
    } finally {
      logout();
      navigate("/login");
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleLogout()}
      className="logout-button"
    >
      Log Out
    </button>
  );
}
