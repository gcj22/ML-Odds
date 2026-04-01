'use client';

import { useRouter } from 'next/navigation';

export default function DatePicker({
  currentDate,
  basePath = '/scores',
}: {
  currentDate: string;
  basePath?: string;
}) {
  const router = useRouter();

  const prevDate = new Date(currentDate + 'T12:00:00');
  prevDate.setDate(prevDate.getDate() - 1);
  const nextDate = new Date(currentDate + 'T12:00:00');
  nextDate.setDate(nextDate.getDate() + 1);

  const fmt = (d: Date) => d.toISOString().split('T')[0];

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => router.push(`${basePath}?date=${fmt(prevDate)}`)}
        className="px-3 py-1.5 bg-card border border-border rounded hover:border-yellow-500/40 transition-colors text-sm"
      >
        ← Prev
      </button>
      <input
        type="date"
        value={currentDate}
        onChange={(e) => router.push(`${basePath}?date=${e.target.value}`)}
        className="bg-card border border-border rounded px-3 py-1.5 text-sm text-white [color-scheme:dark]"
      />
      <button
        onClick={() => router.push(`${basePath}?date=${fmt(nextDate)}`)}
        className="px-3 py-1.5 bg-card border border-border rounded hover:border-yellow-500/40 transition-colors text-sm"
      >
        Next →
      </button>
    </div>
  );
}
