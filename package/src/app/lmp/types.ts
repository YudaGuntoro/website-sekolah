export type LmpConfig = {
  title: string; introduction: string; enabled: boolean;
  registrationStart: string | null; registrationEnd: string | null;
  competitionDate: string | null; competitionTime: string; venue: string;
  announcementDate: string | null; announcementDetails: string;
  feeAmount: number; paymentDetails: string; documentInstructions: string; documentRequired: boolean;
  testDetails: string; benefits: string; afterSubmit: string; whatsappGroupUrl: string;
}
export type LmpInformation = { config: LmpConfig; version: number; isOpen: boolean; today: string }
export type LmpReceipt = {
  registrationNumber: string; eventTitle: string; competitionDate: string | null; feeAmount: number; afterSubmit: string; whatsappGroupUrl: string;
  transferAccountName: string | null; hasPaymentProof: boolean;
  studentName: string; previousSchool: string; grade: number; subjects: string; contactName: string; contactPhone: string;
  submittedAt: string; paymentStatus: string; hasDocument: boolean;
}
export const subjects = ['Matematika', 'Bahasa Indonesia', 'Bahasa Inggris']
export const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(new Date(`${value}T00:00:00+07:00`)) : 'Menyusul'
export const rupiah = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
