export function Skeleton({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`block animate-pulse rounded-md bg-gray-200/80 dark:bg-gray-700/70 motion-reduce:animate-none ${className}`} />;
}

export function TableSkeleton({ headers, rows = 5, label = "Memuat data", className = "", columnClasses }: { headers: string[]; rows?: number; label?: string; className?: string; columnClasses?: string[] }) {
  return <div role="status" aria-label={label} aria-busy="true" className="cms-table-wrap">
    <table aria-hidden="true" className={`cms-table ${className}`}>
      {columnClasses && <colgroup>{columnClasses.map((column, index) => <col key={index} className={column} />)}</colgroup>}
      <thead><tr>{headers.map((header, index) => <th key={index}>{header}</th>)}</tr></thead>
      <tbody>{Array.from({ length: rows }, (_, row) => <tr key={row}>{headers.map((_, column) => <td key={column}>
        {column === headers.length - 1 ? <div className="flex justify-center gap-3"><Skeleton className="h-7 w-7 rounded-lg" /><Skeleton className="h-7 w-7 rounded-lg" /></div> : <Skeleton className={`h-4 ${column === 0 ? (row % 2 ? "w-3/4" : "w-5/6") : column === 2 ? "w-16 rounded-full" : "w-3/4"}`} />}
      </td>)}</tr>)}</tbody>
    </table>
    <span className="sr-only">{label}</span>
  </div>;
}

export function FormSkeleton({ panels = 2, fields = 3, preview = false, label = "Memuat pengaturan" }: { panels?: number; fields?: number; preview?: boolean; label?: string }) {
  return <div role="status" aria-label={label} aria-busy="true">
    <div aria-hidden="true" className={`grid min-w-0 gap-6 ${panels === 3 ? "xl:grid-cols-3" : panels > 1 ? "lg:grid-cols-2" : ""}`}>
      {Array.from({ length: panels }, (_, panel) => <section className="cms-panel min-w-0 overflow-hidden" key={panel}>
        <div className="cms-section-heading"><Skeleton className="h-5 w-40" /></div>
        <div className="cms-form-body">
          {preview && <Skeleton className="aspect-[4/3] w-full rounded-xl" />}
          {Array.from({ length: fields }, (_, field) => <div className="space-y-3" key={field}><Skeleton className="h-3 w-28" /><Skeleton className={`${field === fields - 1 && !preview ? "h-24" : "h-11"} w-full rounded-lg`} /></div>)}
        </div>
      </section>)}
    </div>
    <div aria-hidden="true" className="mt-5 flex justify-end"><Skeleton className="h-11 w-40 rounded-lg" /></div>
    <span className="sr-only">{label}</span>
  </div>;
}

export function ListSkeleton({ label = "Memuat aktivitas" }: { label?: string }) {
  return <div role="status" aria-label={label} aria-busy="true" className="divide-y divide-gray-100 dark:divide-gray-800">
    {Array.from({ length: 5 }, (_, index) => <div aria-hidden="true" key={index} className="flex items-center gap-4 p-5"><Skeleton className="h-10 w-10 shrink-0 rounded-xl" /><div className="min-w-0 flex-1 space-y-3"><Skeleton className={index % 2 ? "h-4 w-2/3" : "h-4 w-5/6"} /><Skeleton className="h-3 w-1/2" /></div><Skeleton className="h-6 w-16 rounded-full" /></div>)}
    <span className="sr-only">{label}</span>
  </div>;
}

export function AdminPageSkeleton() {
  return <div className="cms-page space-y-6" role="status" aria-label="Memuat halaman" aria-busy="true">
    <div aria-hidden="true" className="space-y-3"><Skeleton className="h-3 w-36" /><Skeleton className="h-9 w-56" /><Skeleton className="h-4 w-3/5 max-w-md" /></div>
    <div aria-hidden="true" className="grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div className="cms-panel space-y-4 p-5" key={index}><Skeleton className="h-3 w-24" /><Skeleton className="h-8 w-16" /><Skeleton className="h-3 w-32 max-w-full" /></div>)}</div>
    <div aria-hidden="true" className="cms-panel space-y-5 p-5">{Array.from({ length: 6 }, (_, index) => <Skeleton className="h-10 w-full" key={index} />)}</div>
    <span className="sr-only">Memuat halaman</span>
  </div>;
}
