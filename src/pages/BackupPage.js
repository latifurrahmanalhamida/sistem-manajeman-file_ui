import React, { useState, useEffect } from "react";
import BackupToolbar from "../components/Backup/BackupToolbar";
import BackupSettings from "../components/Backup/BackupSetting";
import BackupTable from "../components/Backup/BackupTable";
import "../pages/BackupPage.css";
import {
  fetchBackups,
  createBackup,
  deleteBackup,
  downloadBackup,
  updateBackupSettings,
  updateBackupSchedule,
} from "../services/api";

export default function BackupPage() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadBackups = async () => {
    setLoading(true);
    try {
      const res = await fetchBackups();
      setBackups(res.data);
    } catch (err) {
      console.error("Gagal memuat backup:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBackups();
  }, []);

  const handleBackup = async () => {
    setLoading(true);
    try {
      await createBackup();
      await loadBackups();
    } catch (error) {
      console.error("Gagal membuat backup:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePathChange = async (path) => {
    try {
      await updateBackupSettings({ path });
      alert("Path berhasil disimpan!");
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan path!");
    }
  };

  const handleScheduleChange = async (schedule) => {
    try {
      await updateBackupSchedule({ frequency: schedule });
      alert("Jadwal berhasil disimpan!");
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan jadwal!");
    }
  };

  const handleDownload = async (id) => {
    const backup = backups.find((b) => b.id === id);
    try {
      const res = await downloadBackup(id);
      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/zip" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", backup.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Gagal mengunduh backup:", error);
    }
  };

  const handleDelete = async (id) => {
    const backup = backups.find((b) => b.id === id);
    if (
      window.confirm(`Apakah Anda yakin ingin menghapus backup ${backup.filename}?`)
    ) {
      try {
        await deleteBackup(id);
        await loadBackups();
      } catch (err) {
        console.error("Gagal menghapus backup:", err);
        alert("Gagal menghapus backup!");
      }
    }
  };

  return (
    <div className="backup-page">
      <h2 className="page-title">
        <span className="icon"></span> Manajemen Backup
      </h2>

      {/* Toolbar */}
      <div className="toolbar-container">
        <BackupToolbar onBackup={handleBackup} loading={loading} />
      </div>

      {/* Settings */}
      <div className="card">
        <div className="card-header">
          <span className="icon">⚙️</span> Pengaturan Backup
        </div>
        <div className="card-body">
          <BackupSettings
            onPathChange={handlePathChange}
            onScheduleChange={handleScheduleChange}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <span className="icon">🗂️</span> Daftar Backup
        </div>
        <div className="card-body">
          <BackupTable
            backups={backups}
            onDownload={handleDownload}
            onDelete={handleDelete}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}

// import React, { useState, useEffect } from "react";
// import BackupToolbar from "../components/Backup/BackupToolbar";
// import BackupSettings from "../components/Backup/BackupSetting";
// import BackupTable from "../components/Backup/BackupTable";
// import "../pages/BackupPage.css";
// import {
//   fetchBackups,
//   createBackup,
//   deleteBackup,
//   downloadBackup,
//   updateBackupSettings,
//   updateBackupSchedule,
// } from "../services/api";

// export default function BackupPage() {
//   const [backups, setBackups] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const loadBackups = async () => {
//     setLoading(true);
//     try {
//       const res = await fetchBackups();
//       setBackups(res.data);
//     } catch (err) {
//       console.error("Gagal memuat backup:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadBackups();
//   }, []);

//   const handleBackup = async () => {
//     setLoading(true);
//     try {
//       await createBackup();
//       await loadBackups();
//     } catch (error) {
//       console.error("Gagal membuat backup:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePathChange = async (path) => {
//     try {
//       await updateBackupSettings({ path });
//       alert("Path berhasil disimpan!");
//     } catch (error) {
//       console.error(error);
//       alert("Gagal menyimpan path!");
//     }
//   };

//   const handleScheduleChange = async (schedule) => {
//     try {
//       await updateBackupSchedule({ frequency: schedule });
//       alert("Jadwal berhasil disimpan!");
//     } catch (error) {
//       console.error(error);
//       alert("Gagal menyimpan jadwal!");
//     }
//   };

//   const handleDownload = async (id) => {
//  const backup = backups.find((b) => b.id === id);
//  try {
//  const res = await downloadBackup(id);
//  const url = window.URL.createObjectURL(
//  new Blob([res.data], { type: "application/zip" })
// );
// const link = document.createElement("a");
// link.href = url;
// link.setAttribute("download", backup.filename);
// document.body.appendChild(link);
// link.click();
// link.remove();
// } catch (error) {

//   console.error("Gagal mengunduh backup:", error);
//  }
// };


//   const handleDelete = async (id) => {
//     const backup = backups.find((b) => b.id === id);
//     if (window.confirm(`Apakah Anda yakin ingin menghapus backup ${backup.filename}?`)) {
//       try {
//         await deleteBackup(id);
//         await loadBackups();
//       } catch (err) {
//         console.error("Gagal menghapus backup:", err);
//         alert("Gagal menghapus backup!");
//       }
//     }
//   };

//   return (
//     <div className="backup-page">
//       <h2 className="page-title">
//         <span className="icon">🛡️</span>
//         Manajemen Pencadangan
//       </h2>

//       <BackupToolbar onBackup={handleBackup} loading={loading} />

//       <div className="card">
//         <div className="card-header">
//           <span className="icon">⚙️</span>
//           Pengaturan Backup
//         </div>
//         <div className="card-body">
//           <BackupSettings
//             onPathChange={handlePathChange}
//             onScheduleChange={handleScheduleChange}
//           />
//         </div>
//       </div>

//       <div className="card">
//         <div className="card-header">
//           <span className="icon">🗂️</span>
//           Daftar Backup
//         </div>
//         <div className="card-body">
//           <BackupTable
//             backups={backups}
//             onDownload={handleDownload}
//             onDelete={handleDelete}
//             loading={loading}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }
