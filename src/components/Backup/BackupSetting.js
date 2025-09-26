import { useEffect, useState } from "react";
import {
  fetchBackupSettings,
  updateBackupSettings,
  fetchBackupSchedule,
  updateBackupSchedule,
} from "../../services/api";

export default function BackupSetting() {
  const [backupPath, setBackupPath] = useState("");
  const [schedule, setSchedule] = useState("off");
  const [time, setTime] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("");
  const [dayOfMonth, setDayOfMonth] = useState("");
  const [month, setMonth] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);

        const pathData = await fetchBackupSettings();
        setBackupPath(pathData.backup_path || "");

        const scheduleData = await fetchBackupSchedule();
        if (scheduleData && scheduleData.schedule) {
          setSchedule(scheduleData.schedule.frequency || "off");
          setTime(scheduleData.schedule.time || "");
          setDayOfWeek(scheduleData.schedule.day_of_week || "");
          setDayOfMonth(scheduleData.schedule.day_of_month || "");
          setMonth(scheduleData.schedule.month || "");
        }

        setLoading(false);
      } catch (err) {
        console.error("Gagal ambil setting:", err.response?.data || err.message);
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handlePathSubmit = async (e) => {
    e.preventDefault();
    if (!backupPath || backupPath.trim() === "") return;

    const cleanPath = backupPath.trim().replace(/^"|"$/g, "");

    try {
      await updateBackupSettings(cleanPath);
      alert("Backup path berhasil disimpan!");
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateBackupSchedule({
        frequency: schedule,
        time,
        day_of_week: schedule === "weekly" ? dayOfWeek : null,
        day_of_month:
          schedule === "monthly" || schedule === "yearly" ? dayOfMonth : null,
        month: schedule === "yearly" ? month : null,
      });

      alert("Jadwal backup berhasil disimpan!");
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <div className="backup-settings">
      {/* Form path */}
      <form onSubmit={handlePathSubmit} className="form-card">
        <div className="form-group">
          <label>Backup Path:</label>
          <input
            type="text"
            value={backupPath}
            onChange={(e) => setBackupPath(e.target.value)}
            className="form-input"
            required
          />
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? "⏳ Menyimpan..." : "💾 Simpan Path"}
        </button>
      </form>

      {/* Form jadwal */}
      <form onSubmit={handleScheduleSubmit} className="form-card">
        <div className="form-group">
          <label>Pencadangan:</label>
          <select
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            className="form-input"
          >
            <option value="off">Nonaktif</option>
            <option value="daily">Harian</option>
            <option value="weekly">Mingguan</option>
            <option value="monthly">Bulanan</option>
            <option value="yearly">Tahunan</option>
          </select>
        </div>

        <div className="form-group">
          <label>Waktu (HH:MM):</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="form-input"
            required
          />
        </div>

        {schedule === "weekly" && (
          <div className="form-group">
            <label>Hari:</label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              className="form-input"
              required
            >
              <option value="Monday">Senin</option>
              <option value="Tuesday">Selasa</option>
              <option value="Wednesday">Rabu</option>
              <option value="Thursday">Kamis</option>
              <option value="Friday">Jumat</option>
              <option value="Saturday">Sabtu</option>
              <option value="Sunday">Minggu</option>
            </select>
          </div>
        )}

        {schedule === "monthly" && (
          <div className="form-group">
            <label>Tanggal:</label>
            <input
              type="number"
              value={dayOfMonth}
              min="1"
              max="31"
              onChange={(e) => setDayOfMonth(e.target.value)}
              className="form-input"
              required
            />
          </div>
        )}

        {schedule === "yearly" && (
          <div className="form-grid">
            <div className="form-group">
              <label>Bulan:</label>
              <input
                type="number"
                value={month}
                min="1"
                max="12"
                onChange={(e) => setMonth(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label>Tanggal:</label>
              <input
                type="number"
                value={dayOfMonth}
                min="1"
                max="31"
                onChange={(e) => setDayOfMonth(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>
        )}

        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? "⏳ Menyimpan..." : "💾 Simpan Jadwal"}
        </button>
      </form>
    </div>
  );
}
