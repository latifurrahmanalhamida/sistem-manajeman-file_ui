import React, { useEffect, useRef } from 'react';
import { renderAsync } from 'docx-preview';

const DOCXViewer = ({ fileUrl }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchAndRenderDocx = async () => {
      try {
        // Ambil data file dari blob URL
        const response = await fetch(fileUrl);
        const fileBlob = await response.blob();
        
        // Render file di dalam div target
        if (containerRef.current) {
          // Kosongkan kontainer sebelum merender
          containerRef.current.innerHTML = "";
          renderAsync(fileBlob, containerRef.current);
        }
      } catch (error) {
        console.error("Gagal merender DOCX:", error);
      }
    };

    if (fileUrl) {
      fetchAndRenderDocx();
    }
  }, [fileUrl]);

  return (
    // Style kontainer agar bisa di-scroll
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        height: '80vh', 
        overflowY: 'auto', 
        border: '1px solid #ccc', 
        padding: '20px',
        backgroundColor: 'white'
      }} 
    >
      <p>Memuat pratinjau DOCX...</p>
    </div>
  );
};

export default DOCXViewer;

