import { useState } from "react";

import { Modal } from "../ui";

interface Props {
  sessionId: string;
  onTerminate: (sessionId: string) => void;
  loading?: boolean;
}

export default function TerminateSessionButton({
  sessionId,
  onTerminate,
  loading = false,
}: Props) {
  const [isModalOpen, setIsModalOpen] =
    useState(false);

  function handleConfirm() {
    onTerminate(sessionId);
    setIsModalOpen(false);
  }

  return (
    <>
      <button
        type="button"
        className="terminate-session-button"
        onClick={() => setIsModalOpen(true)}
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
              Terminate Session
            </button>
          </>
        }
      >
        <p>
          The selected session will be signed
          out immediately. If this wasn't
          your device, terminating it helps
          protect your account.
        </p>
      </Modal>
    </>
  );
}