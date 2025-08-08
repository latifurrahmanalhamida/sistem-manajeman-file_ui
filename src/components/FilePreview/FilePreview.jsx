import React from 'react';

const FilePreview = ({ fileUrl, mimeType }) => {
  if (!fileUrl) return null;

  if (mimeType.startsWith('image/')) {
    return <img src={fileUrl} alt="preview" style={{ maxWidth: '100%', maxHeight: '80vh' }} />;
  }

  if (mimeType === 'application/pdf') {
    return <iframe src={fileUrl} title="PDF Preview" width="100%" height="500px"></iframe>;
  }

  if (mimeType.startsWith('video/')) {
    return <video controls width="100%">
      <source src={fileUrl} type={mimeType} />
      Your browser does not support the video tag.
    </video>;
  }

  if (mimeType.startsWith('text/')) {
    return <iframe src={fileUrl} title="Text Preview" width="100%" height="400px"></iframe>;
  }

  return <p>Preview tidak tersedia untuk tipe file ini. Silakan unduh untuk melihat.</p>;
};

export default FilePreview;
