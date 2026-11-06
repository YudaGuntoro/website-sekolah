import type { Metadata } from "next";
import UserTable from "@/components/user/UserTable";

export const metadata: Metadata = { title: "Pengguna" };

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">Cendekia</p>
        <h1 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">Pengguna</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
          Kelola akun administrator, editor, dan hak akses dashboard.
        </p>
      </div>
      <UserTable />
    </div>
  );
}
