import React from 'react';
import './SessionTimeoutModal.css';

const SessionTimeoutModal = ({ isOpen, onLogout, onContinue }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Sesi Anda Akan Segera Berakhir</h2>
                <p>Untuk alasan keamanan, sesi Anda akan berakhir karena tidak ada aktivitas. Apa yang ingin Anda lakukan?</p>
                <div className="modal-actions">
                    <button onClick={onLogout} className="btn-logout">Logout</button>
                    <button onClick={onContinue} className="btn-continue">Tetap di Sini</button>
                </div>
            </div>
        </div>
    );
};

export default SessionTimeoutModal;
