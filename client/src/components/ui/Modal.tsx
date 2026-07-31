import {
  useEffect,
  type MouseEvent,
  type ReactNode,
} from "react";

import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  isBusy?: boolean;
}

export default function Modal({
  isOpen,
  title,
  description,
  children,
  footer,
  onClose,
  closeOnBackdrop = true,
  closeOnEscape = true,
  isBusy = false,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (
      !isOpen ||
      !closeOnEscape ||
      isBusy
    ) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    isOpen,
    closeOnEscape,
    isBusy,
    onClose,
  ]);

  if (!isOpen) {
    return null;
  }

  function handleBackdropClick() {
    if (
      closeOnBackdrop &&
      !isBusy
    ) {
      onClose();
    }
  }

  function handleDialogClick(
    event: MouseEvent<HTMLDivElement>
  ) {
    event.stopPropagation();
  }

  function handleClose() {
    if (!isBusy) {
      onClose();
    }
  }

  return createPortal(
    <div
      className="modal-overlay"
      onClick={handleBackdropClick}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-busy={isBusy}
        onClick={handleDialogClick}
      >
        <header className="modal__header">
          <div>
            <h2
              id="modal-title"
              className="modal__title"
            >
              {title}
            </h2>

            {description && (
              <p className="modal__description">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            className="modal__close"
            aria-label="Close dialog"
            onClick={handleClose}
            disabled={isBusy}
          >
            <X size={18} />
          </button>
        </header>

        <div className="modal__content">
          {children}
        </div>

        {footer && (
          <footer className="modal__footer">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body
  );
}
