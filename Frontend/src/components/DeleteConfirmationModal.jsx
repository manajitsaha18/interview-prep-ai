import "./DeleteConfirmationModal.scss";

const DeleteConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Delete Interview?",
    message = "This interview report will be permanently deleted.",
}) => {

    if (!isOpen) return null;

    return (
        <div className="delete-modal-overlay">

            <div className="delete-modal">

                <h2>{title}</h2>

                <p>{message}</p>

                <p className="warning">
                    This action cannot be undone.
                </p>

                <div className="delete-modal__actions">

                    <button
                        className="cancel-btn"
                        onClick={onClose}
                    >
                        Cancel
                    </button>

                    <button
                        className="confirm-delete-btn"
                        onClick={onConfirm}
                    >
                        Delete
                    </button>

                </div>

            </div>

        </div>
    );
};

export default DeleteConfirmationModal;