// src/hooks/useInactivityTimer.js
import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook untuk melacak inaktivitas pengguna dan memicu callback.
 * @param {function} onTimeout - Fungsi yang akan dipanggil saat pengguna tidak aktif.
 * @param {number} timeoutDuration - Durasi waktu tunggu dalam milidetik.
 */
const useInactivityTimer = (onTimeout, timeoutDuration) => {
    const timeoutRef = useRef(null);

    // Daftar event yang menandakan aktivitas pengguna
    const activityEvents = [
        'mousemove',
        'mousedown',
        'keypress',
        'touchstart',
        'scroll'
    ];

    // Fungsi untuk me-reset timer, dibungkus dengan useCallback
    const resetTimer = useCallback(() => {
        // Hapus timeout sebelumnya
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        // Atur timeout baru
        timeoutRef.current = setTimeout(onTimeout, timeoutDuration);
    }, [onTimeout, timeoutDuration]);

    useEffect(() => {
        // Atur timer awal saat komponen dimuat
        resetTimer();

        // Tambahkan event listener untuk me-reset timer saat ada aktivitas
        activityEvents.forEach(event => {
            window.addEventListener(event, resetTimer);
        });

        // Fungsi cleanup untuk menghapus listener dan membersihkan timeout
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            activityEvents.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [resetTimer]); // Jalankan efek ini hanya jika resetTimer berubah

    return null; // Hook ini tidak me-render apa pun
};

export default useInactivityTimer;
