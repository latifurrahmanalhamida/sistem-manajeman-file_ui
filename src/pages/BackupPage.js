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
} from "../services/api";

export default function BackupPage() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  // --- PENAMBAHAN STATE UNTUK PAGINASI ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Anda bisa ubah angka ini jika perlu

  const loadBackups = async () => {
    setLoading(true);
    try {
      const res = await fetchBackups();
      
      // --- PENAMBAHAN LOGIKA SORTING ---
      // Urutkan data berdasarkan created_at dari yang terbaru ke terlama
      const sortedData = res.data.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      
      setBackups(sortedData);

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
    setIsCreatingBackup(true);
    try {
      await createBackup();
      await loadBackups(); // Memuat ulang dan mengurutkan lagi
    } catch (error) {
      console.error("Gagal membuat backup:", error);
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleDownload = async (id) => {
    // ... (Fungsi ini tidak perlu diubah)
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
    // ... (Fungsi ini tidak perlu diubah)
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

  // --- LOGIKA UNTUK MEMBAGI DATA PER HALAMAN ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = backups.slice(indexOfFirstItem, indexOfLastItem);

  // Fungsi untuk mengubah halaman
  const paginate = (pageNumber) => setCurrentPage(pageNumber);


  return (
    <div className="backup-page">
      <h2 className="page-title">
        <span className="icon"></span> Manajemen Backup
      </h2>

      <div className="toolbar-container">
        <BackupToolbar onBackup={handleBackup} loading={isCreatingBackup} />
      </div>

      <div className="card">
        <div className="card-header">
          <span className="icon">⚙️</span> Pengaturan Backup
        </div>
        <div className="card-body">
          <BackupSettings />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="icon">🗂️</span> Daftar Backup
        </div>
        <div className="card-body">
          <BackupTable
            // Kirim hanya data untuk halaman saat ini
            backups={currentItems} 
            loading={loading}
            onDownload={handleDownload}
            onDelete={handleDelete}
            // Kirim props tambahan untuk paginasi
            itemsPerPage={itemsPerPage}
            totalBackups={backups.length}
            paginate={paginate}
            currentPage={currentPage}
          />
        </div>
      </div>
    </div>
  );
}