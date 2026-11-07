export type Wave = { number: number; startDate: string | null; endDate: string | null; isOpen: boolean; whatsappGroupUrl: string | null };
export type Settings = { academicYear: string; enabled: boolean; version: number; today: string; timeZone: string; activeWave: number | null; waves: Wave[] };
export type Applicant = { id: number; registrationNumber: string; academicYear: string; waveNumber: number; studentName: string; previousSchool: string; targetGrade: string; status: string; submittedAt: string };
export type ApplicantDetail = Applicant & { nisn: string | null; birthPlace: string; birthDate: string; gender: string; guardianName: string; guardianPhone: string; guardianEmail: string | null; address: string; waveStartDate: string; waveEndDate: string; version: number };
export const statuses = ["Baru", "Diproses", "Diterima", "Ditolak"];
export const dateTime = (value: string) => new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(value.endsWith("Z") ? value : value + "Z"));
export const dateOnly = (value: string | null) => value ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" }).format(new Date(value + "T00:00:00+07:00")) : "Belum diatur";
