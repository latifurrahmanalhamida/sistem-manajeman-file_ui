import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import DataGrid from 'react-data-grid';
import 'react-data-grid/lib/styles.css';

const XLSXViewer = ({ fileUrl }) => {
  const [sheets, setSheets] = useState([]); // Format: { name: 'Sheet1', columns: [], rows: [] }
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndParseXlsx = async () => {
      try {
        setLoading(true);
        const response = await fetch(fileUrl);
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });
        
        const parsedSheets = workbook.SheetNames.map(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length === 0) return { name: sheetName, columns: [], rows: [] };

          const columns = jsonData[0].map((header, index) => ({
            key: `col_${index}`,
            name: String(header),
          }));

          const rows = jsonData.slice(1).map((rowData, rowIndex) => {
            const rowObject = { id: rowIndex };
            columns.forEach((col, index) => {
              rowObject[col.key] = rowData[index];
            });
            return rowObject;
          });

          return { name: sheetName, columns, rows };
        });

        setSheets(parsedSheets);
        setActiveSheetIndex(0);
      } catch (error) {
        console.error("Gagal mem-parsing XLSX:", error);
      } finally {
        setLoading(false);
      }
    };

    if (fileUrl) {
      fetchAndParseXlsx();
    }
  }, [fileUrl]);

  if (loading) {
    return <p>Memuat data spreadsheet...</p>;
  }

  if (sheets.length === 0) {
    return <p>Tidak ada data untuk ditampilkan.</p>;
  }

  const currentSheet = sheets[activeSheetIndex];

  return (
    <div>
      <div className="sheet-selector" style={{ marginBottom: '10px', padding: '5px', background: '#f0f0f0', border: '1px solid #ccc' }}>
        <strong>Pilih Sheet: </strong>
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
        className="rdg-light"
      />
    </div>
  );
};

export default XLSXViewer;

