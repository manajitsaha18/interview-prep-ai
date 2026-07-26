import "./ConfirmationModal.scss";

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    warning = "This action cannot be undone.",
    confirmText = "Confirm",
    cancelText = "Cancel",
}) => {

    if (!isOpen) return null;

    return (
        <div className="confirmation-modal-overlay">

            <div className="confirmation-modal">

                <h2>{title}</h2>

                <p>{message}</p>

                {warning && (
                    <p className="warning">
                        {warning}
                    </p>
                )}

                <div className="confirmation-modal__actions">

                    <button
                        className="cancel-btn"
                        onClick={onClose}
                    >
                        {cancelText}
                    </button>

                    <button
                        className="confirm-btn"
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>

                </div>

            </div>

        </div>
    );
};

export default ConfirmationModal;