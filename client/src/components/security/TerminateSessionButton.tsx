import { useState } from "react";

import { Modal } from "../ui";

interface Props {
  sessionId: string;
  onTerminate: (
    sessionId: string
  ) => Promise<void>;
  loading?: boolean;
}

export default function TerminateSessionButton({
  sessionId,
  onTerminate,
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
      await onTerminate(sessionId);
      setIsModalOpen(false);
    } catch {
      setErrorMessage(
        "Unable to terminate this session. Please try again."
      );
    }
  }

  return (
    <>
      <button
        type="button"
        className="terminate-session-button"
        onClick={openModal}
        disabled={loading}
      >
        {loading
          ? "Terminating..."
          : "Terminate Session"}
      </button>

      <Modal
        isOpen={isModalOpen}
        title="Terminate Session"
        description="This device will immediately lose access to your account. Continue?"
        onClose={closeModal}
        isBusy={loading}
      >
        <p>
          The selected session will be signed
          out immediately. If this wasn't
          your device, terminating it helps
          protect your account.
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
              ? "Terminating..."
              : "Terminate Session"}
          </button>
        </div>
      </Modal>
    </>
  );
}
