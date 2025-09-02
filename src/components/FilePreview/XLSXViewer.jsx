import React, { useState, useEffect } from 'react';
// Menggunakan pustaka xlsx dan react-data-grid
import * as XLSX from 'xlsx';
import { DataGrid } from 'react-data-grid';

/**
 * Komponen untuk menampilkan pratinjau file XLSX dengan sheet selector.
 */
const XLSXViewer = ({ fileUrl }) => {
  const [sheets, setSheets] = useState([]);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);

  useEffect(() => {
    const fetchAndParseXlsx = async () => {
      try {
        const response = await fetch(fileUrl);
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });
        
        const parsedSheets = workbook.SheetNames.map(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length === 0) return { name: sheetName, columns: [], rows: [] };

          const columns = jsonData[0].map((header, index) => ({
            key: `col${index}`,
            name: String(header), // Pastikan header adalah string
          }));

          const rows = jsonData.slice(1).map(rowData => {
            const rowObject = {};
            columns.forEach((col, index) => {
              rowObject[col.key] = rowData[index];
            });
            return rowObject;
          });

          return { name: sheetName, columns, rows };
        });

        setSheets(parsedSheets);
      } catch (error) {
        console.error("Gagal mem-parsing file XLSX:", error);
      }
    };

    fetchAndParseXlsx();
  }, [fileUrl]);

  if (sheets.length === 0) {
    return <p style={{ textAlign: 'center', paddingTop: '20px' }}>Memuat data spreadsheet...</p>;
  }

  const currentSheet = sheets[activeSheetIndex];

  return (
    <div>
      <div className="sheet-selector" style={{ marginBottom: '10px', padding: '5px', background: '#f0f0f0' }}>
        {sheets.map((sheet, index) => (
          <button
            key={sheet.name}
            onClick={() => setActiveSheetIndex(index)}
            disabled={index === activeSheetIndex}
            style={{ marginRight: '5px', padding: '5px 10px', cursor: 'pointer' }}
          >
            {sheet.name}
          </button>
        ))}
      </div>
      <DataGrid
        columns={currentSheet.columns}
        rows={currentSheet.rows}
        style={{ height: '75vh' }}
      />
    </div>
  );
};

export default XLSXViewer;

