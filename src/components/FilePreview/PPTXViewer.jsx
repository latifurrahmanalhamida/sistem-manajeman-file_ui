import React, { useEffect, useRef } from 'react';
import { render } from 'pptx-preview';

const PPTXViewer = ({ fileUrl }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchAndRenderPptx = async () => {
      try {
        const response = await fetch(fileUrl);
        const fileBlob = await response.blob();

        if (containerRef.current) {
          containerRef.current.innerHTML = "";
          // Pustaka ini membutuhkan file Blob atau ArrayBuffer
          render(fileBlob, containerRef.current);
        }
      } catch (error) {
        console.error("Gagal merender PPTX:", error);
      }
    };

    if (fileUrl) {
      fetchAndRenderPptx();
    }
  }, [fileUrl]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "80vh",
        border: "1px solid #ccc",
        background: "#f0f0f0"
      }}
    >
      <p>Memuat pratinjau presentasi...</p>
    </div>
  );
};

export default PPTXViewer;

