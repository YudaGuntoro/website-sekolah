export type Config = {
  steps: { title: string; description: string; icon: string; showPayment: boolean }[];
  title: string; introduction: string; enabled: boolean;
  registrationStart: string | null; registrationEnd: string | null;
  competitionDate: string | null; competitionTime: string; venue: string;
  announcementDate: string | null; announcementDetails: string;
  feeAmount: number; paymentDetails: string; documentInstructions: string; documentRequired: boolean;
  testDetails: string; benefits: string; afterSubmit: string; whatsappGroupUrl: string;
};
export type Information = { config: Config; version: number; isOpen: boolean; today: string };
export type Applicant = { id: number; registrationNumber: string; studentName: string; nisn: string | null; previousSchool: string; grade: number; subjects: string; status: string; paymentStatus: string; submittedAt: string };
export type Detail = Applicant & { transferAccountName: string | null; hasPaymentProof: boolean; eventTitle: string; competitionDate: string | null; contactName: string; contactPhone: string; feeAmount: number; hasDocument: boolean; version: number };
export const subjects = ["Matematika", "Bahasa Indonesia", "Bahasa Inggris"];
export const statuses = ["Baru", "Diproses", "Terverifikasi", "Dibatalkan"];
export const payments = ["Belum bayar", "Lunas"];
export const dateTime = (value: string) => new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(value));
