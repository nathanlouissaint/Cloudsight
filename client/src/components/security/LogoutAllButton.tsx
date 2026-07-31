import { useState } from "react";

import { Modal } from "../ui";

interface Props {
  onLogoutAll: () => Promise<void>;
  loading?: boolean;
}

export default function LogoutAllButton({
  onLogoutAll,
  loading = false,
}: Props) {
  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  function openModal() {
    setErrorMessage(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    if (loading) {
      return;
    }

    setErrorMessage(null);
    setIsModalOpen(false);
  }

  async function handleConfirm() {
    if (loading) {
      return;
    }

    setErrorMessage(null);

    try {
      await onLogoutAll();
      setIsModalOpen(false);
    } catch {
      setErrorMessage(
        "Unable to sign out the other sessions. Please try again."
      );
    }
  }

  return (
    <>
      <button
        type="button"
        className="logout-all-button"
        onClick={openModal}
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
        onClose={closeModal}
        isBusy={loading}
      >
        <p>
          This action signs out every device
          except the one you're currently
          using. You'll remain signed in on
          this device.
        </p>

        {errorMessage && (
          <p
            className="modal__error"
            role="alert"
          >
            {errorMessage}
          </p>
        )}

        <div className="modal__footer">
          <button
            type="button"
            className="modal__secondary"
            onClick={closeModal}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="button"
            className="modal__primary"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading
              ? "Signing Out..."
              : "Sign Out"}
          </button>
        </div>
      </Modal>
    </>
  );
}
