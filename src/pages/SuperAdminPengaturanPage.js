import { useState } from "react";
import SuperAdminBackupPage from "./SuperAdminBackupPage";
import DivisionQuotaPage from "./DivisionQuotaPage";
import "./SuperAdminPengaturanPage.css"; // ✅ import CSS

export default function SuperAdminPengaturanPage() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="settings-container">
      <h1 className="settings-title">⚙️ Pengaturan</h1>

      {/* Tab Menu */}
      <div className="tab-menu">
        <button
          className={`tab-btn ${activeTab === "general" ? "active" : ""}`}
          onClick={() => setActiveTab("general")}
        >
          Umum
        </button>
        <button
          className={`tab-btn ${activeTab === "backup" ? "active" : ""}`}
          onClick={() => setActiveTab("backup")}
        >
          Backup Data
        </button>

        {/* 2. TAMBAHKAN TOMBOL TAB BARU DI SINI */}
        <button
          className={`tab-btn ${activeTab === "quota" ? "active" : ""}`}
          onClick={() => setActiveTab("quota")}
        >
          Kuota Divisi
        </button>
      </div>

      {/* Isi Konten */}
      <div className="tab-content">
        {activeTab === "general" && (
          <div>
            <p>⚙️ Pengaturan umum sistem ditaruh di sini...</p>
          </div>
        )}
        {activeTab === "backup" && <SuperAdminBackupPage />}

        {/* 3. TAMBAHKAN KONTEN UNTUK TAB BARU DI SINI */}
        {activeTab === "quota" && <DivisionQuotaPage />}
      </div>
    </div>
  );
}