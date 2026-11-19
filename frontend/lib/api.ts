/**
 * FRFP API Client Configuration
 * Menggunakan 127.0.0.1 secara default untuk mencegah masalah resolusi IPv6 (::1) pada Windows.
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
