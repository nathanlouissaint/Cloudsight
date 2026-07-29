import { useState } from "react";

import { Modal } from "../ui";

interface Props {
  onLogoutAll: () => void;
  loading?: boolean;
}

export default function LogoutAllButton({
  onLogoutAll,
  loading = false,
}: Props) {
  const [isModalOpen, setIsModalOpen] =
    useState(false);

  function handleConfirm() {
    onLogoutAll();
    setIsModalOpen(false);
  }

  return (
    <>
      <button
        type="button"
        className="logout-all-button"
        onClick={() => setIsModalOpen(true)}
        disabled={loading}
      >
        {loading
          ? "Signing Out..."
          : "Sign Out of All Other Devices"}
      </button>

      <Modal
        isOpen={isModalOpen}
        title="Sign Out of All Other Devices"
        description="All other active sessions will immediately lose access to your account."
        onClose={() =>
          setIsModalOpen(false)
        }
        footer={
          <>
            <button
              type="button"
              className="modal__secondary"
              onClick={() =>
                setIsModalOpen(false)
              }
            >
              Cancel
            </button>

            <button
              type="button"
              className="modal__primary"
              onClick={handleConfirm}
            >
              Sign Out
            </button>
          </>
        }
      >
        <p>
          This action signs out every device except
          the one you're currently using. You'll
          remain signed in on this device.
        </p>
      </Modal>
    </>
  );
}