import Image from "next/image";
export default function CendekiaBrand({ compact = false, inverted = false, size = "default", showTitle = true, subtitle }: { compact?: boolean; inverted?: boolean; size?: "default" | "large"; showTitle?: boolean; subtitle?: string }) {
  const large = size === "large" && !compact;
  return <div className={large ? "flex items-center gap-5" : "flex items-center gap-3"}>
    <Image src="/cendekia-logo-hd.png" alt="Logo SMPIT Cendekia" width={large ? 80 : 44} height={large ? 80 : 44} unoptimized className={large ? "size-20 object-contain" : "size-11 object-contain"} priority={large} />
    {showTitle && <div className="min-w-0"><p className={(large ? "text-2xl " : "text-lg ") + (inverted ? "text-white " : "text-[#102d4e] dark:text-white ") + "font-bold tracking-tight"}>SMPIT Cendekia<span className="text-sky-400">.</span></p>{subtitle && <p className={`mt-1 text-[11px] font-medium tracking-wide ${inverted ? "text-blue-100" : "text-slate-500 dark:text-slate-400"}`}>{subtitle}</p>}</div>}
  </div>;
}
