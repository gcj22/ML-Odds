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

  const navBtnStyle: React.CSSProperties = {
    padding: '0.375rem 0.75rem',
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: '#8A8278',
    background: '#121212',
    border: '1px solid #242424',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    transition: 'border-color 200ms, color 200ms',
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => router.push(`${basePath}?date=${fmt(prevDate)}`)}
        style={navBtnStyle}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.borderColor = 'rgba(198,151,63,0.35)';
          el.style.color = '#DEB96A';
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.borderColor = '#242424';
          el.style.color = '#8A8278';
        }}
        aria-label="Previous day"
      >
        ←
      </button>
      <input
        type="date"
        value={currentDate}
        onChange={(e) => router.push(`${basePath}?date=${e.target.value}`)}
        style={{
          ...navBtnStyle,
          colorScheme: 'dark',
          color: '#EDE8E0',
          fontFamily: 'inherit',
          padding: '0.375rem 0.75rem',
        }}
        aria-label="Select date"
      />
      <button
        onClick={() => router.push(`${basePath}?date=${fmt(nextDate)}`)}
        style={navBtnStyle}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.borderColor = 'rgba(198,151,63,0.35)';
          el.style.color = '#DEB96A';
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.borderColor = '#242424';
          el.style.color = '#8A8278';
        }}
        aria-label="Next day"
      >
        →
      </button>
    </div>
  );
}
