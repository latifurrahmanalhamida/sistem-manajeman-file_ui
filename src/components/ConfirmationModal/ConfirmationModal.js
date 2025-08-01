import React from 'react';
import Modal from '../Modal/Modal'; // Menggunakan komponen Modal dasar
import './ConfirmationModal.css';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Konfirmasi Tindakan">
            <div className="confirmation-modal-body">
                <p>{message}</p>
                <div className="confirmation-modal-actions">
                    <button onClick={onClose} className="modal-button cancel-button">
                        Batal
                    </button>
                    <button onClick={onConfirm} className="modal-button confirm-button">
                        Ya, Lanjutkan
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmationModal;