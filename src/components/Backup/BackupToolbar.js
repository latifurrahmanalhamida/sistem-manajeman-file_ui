import React, { useState } from "react";
import { createBackup } from "../../services/api";
import "../../pages/BackupPage.css";

const BackupToolbar = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleManualBackup = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await createBackup();
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Terjadi kesalahan pada server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="backup-toolbar">
      <button
        onClick={handleManualBackup}
        disabled={loading}
        className="btn btn-primary"
      >
        {loading ? "⏳ Membuat Backup..." : "➕ Buat Backup Manual"}
      </button>
      {message && <p className="status-message">{message}</p>}
    </div>
  );
};

export default BackupToolbar;



// import React, { useState } from 'react';
// import axios from 'axios';
// import { createBackup } from '../../services/api';
// import '../../pages/BackupPage.css';

// const BackupToolbar = () => {
//  const [loading, setLoading] = useState(false);
//  const [message, setMessage] = useState('');

//  const handleManualBackup = async () => {
//   setLoading(true);
//   setMessage('');
//  try {
//       // Menggunakan fungsi 'createBackup' yang sudah didefinisikan di api.js
//    const response = await createBackup();
//    setMessage(response.data.message);
//   } catch (error) {
//       // Menangani error dari respons API
//    setMessage(error.response?.data?.message || 'Terjadi kesalahan pada server.');
//   } finally {
//    setLoading(false);
//   }
//  };

//  return (
//   <div>
//    <button onClick={handleManualBackup} disabled={loading}>
//     {loading ? 'Sedang membuat backup...' : 'Buat Backup Manual'}
//    </button>
//    {message && <p>{message}</p>}
//   </div>
//  );
// };

// export default BackupToolbar;


// manual backup button
// import React from "react";
// import axios from "axios";

// export default function BackupToolbar({ onBackupCreated }) {
//   const handleCreateBackup = async () => {
//     try {
//       const res = await axios.post("http://localhost:8000/api/backups", {
//         schedule: "manual", // bisa diganti sesuai kebutuhan
//       });

//       alert("Backup berhasil dibuat!");
//       if (onBackupCreated) {
//         onBackupCreated(res.data); // kirim data backup baru ke parent
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Gagal membuat backup!");
//     }
//   };

//   return (
//     <div className="backup-toolbar">
//       <button className="btn btn-primary" onClick={handleCreateBackup}>
//         Buat Backup
//       </button>
//     </div>
//   );
// }
