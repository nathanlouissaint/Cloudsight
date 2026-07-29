interface Props {
  onLogoutAll: () => void;
  loading?: boolean;
}

export default function LogoutAllButton({
  onLogoutAll,
  loading = false,
}: Props) {
  return (
    <button
      type="button"
      className="logout-all-button"
      onClick={onLogoutAll}
      disabled={loading}
    >
      {loading
        ? "Signing Out..."
        : "Sign Out of All Other Devices"}
    </button>
  );
}