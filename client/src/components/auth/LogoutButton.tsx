import { useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/useAuth";

export default function LogoutButton() {
  const navigate = useNavigate();

  const { logout } = useAuth();

  function handleLogout() {
    logout();

    navigate("/login");
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="logout-button"
    >
      Log Out
    </button>
  );
}