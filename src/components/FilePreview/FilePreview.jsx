import React from 'react';

// Kita tidak lagi memerlukan viewer eksternal untuk solusi ini.

const FilePreview = ({ fileUrl, mimeType }) => {
  if (!fileUrl || !mimeType) {
    return <p style={{ padding: '20px', textAlign: 'center' }}>File atau tipe file tidak valid.</p>;
  }

  // --- Daftar MIME Type ---
  const officeMimeTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-powerpoint',
  ];

  // --- Render Berdasarkan Tipe File ---

  // Tipe file dasar (Gambar, Video, Audio, Teks)
  if (mimeType.startsWith('image/')) {
    return <img src={fileUrl} alt="pratinjau" style={{ maxWidth: '100%', maxHeight: '80vh', display: 'block', margin: 'auto' }} />;
  }
  if (mimeType.startsWith('video/')) {
    return <video src={fileUrl} controls style={{ width: '100%', maxHeight: '80vh' }}>Browser Anda tidak mendukung tag video.</video>;
  }
  if (mimeType.startsWith('audio/')) {
    return <audio src={fileUrl} controls style={{ width: '100%' }}>Browser Anda tidak mendukung tag audio.</audio>;
  }
  if (mimeType.startsWith('text/')) {
    return <iframe src={fileUrl} title="Pratinjau Teks" style={{ width: '100%', height: '80vh', border: '1px solid #ccc' }}></iframe>;
  }

  // Pratinjau PDF menggunakan <iframe> bawaan browser (Tanpa dependensi)
  if (mimeType === 'application/pdf') {
    return (
      <div style={{ width: '100%', height: '80vh', border: '1px solid #ccc' }}>
        <iframe
          src={fileUrl}
          title="Pratinjau PDF"
          style={{ width: '100%', height: '100%', border: 'none' }}
        >
          <p>Browser Anda tidak mendukung pratinjau PDF. Silakan unduh file untuk melihatnya.</p>
        </iframe>
      </div>
    );
  }
  
  // Penanganan untuk file Office di lingkungan lokal
  if (officeMimeTypes.includes(mimeType)) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', border: '1px solid #ccc', margin: '20px' }}>
        <h3>Pratinjau Tidak Didukung</h3>
        <p>Pratinjau untuk file Office (DOCX, XLSX, PPTX) tidak dapat ditampilkan secara aman tanpa layanan eksternal.</p>
        <p>Silakan <strong>unduh file</strong> untuk melihat isinya.</p>
      </div>
    );
  }
  
  // Fallback jika tipe file tidak didukung
  return <p style={{ padding: '20px', textAlign: 'center' }}>Pratinjau tidak tersedia untuk tipe file ini.</p>;
};

export default FilePreview;

