import type { Metadata } from "next";
import SchoolDashboard from "@/cms/SchoolDashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Pengelola konten website SMPIT Cendekia Purwakarta",
};

export default function CendekiaHome() {
  return <SchoolDashboard />;
}
