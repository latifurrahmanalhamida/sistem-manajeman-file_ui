import React from "react";

export default function BackupTable({ backups, onDownload, onDelete }) {

  // Helper format ukuran file
  const formatSize = (size) => {
    if (!size) return "0 B";
    const i = Math.floor(Math.log(size) / Math.log(1024));
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    return (size / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
  };

  // Helper format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString(); // contoh: 23/09/2025, 12:30:45
  };

  return (
    <div className="backup-table">
      <table>
        <thead>
          <tr>
            <th>Nama File</th>
            <th>Ukuran</th>
            <th>Tanggal</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {backups.length > 0 ? (
            backups.map((backup) => (
              <tr key={backup.id}>
                <td>{backup.filename}</td>
                <td>{formatSize(backup.size)}</td>
                <td>{formatDate(backup.created_at)}</td>
                <td>
                  <button
                    className="btn btn-success"
                    onClick={() => onDownload(backup.id)}
                  >
                    ⬇️ Download
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => onDelete(backup.id)}
                  >
                    🗑️ Hapus
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                Belum ada backup tersedia
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
