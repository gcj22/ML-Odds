export default function ErrorState({
  message = 'Something went wrong',
  retry,
}: {
  message?: string;
  retry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
        style={{ background: 'rgba(192,64,64,0.1)', border: '1px solid rgba(192,64,64,0.2)' }}
      >
        <span style={{ color: '#C04040', fontSize: '1.25rem' }}>!</span>
      </div>
      <p style={{ color: '#8A8278', fontSize: '0.875rem', marginBottom: retry ? '1.25rem' : 0 }}>
        {message}
      </p>
      {retry && (
        <button
          onClick={retry}
          className="btn btn-outline"
          style={{
            padding: '0.4375rem 1.25rem',
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: '#EDE8E0',
            background: 'transparent',
            border: '1px solid #2E2E2E',
            borderRadius: '0.25rem',
            cursor: 'pointer',
            transition: 'border-color 200ms, color 200ms',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(198,151,63,0.4)';
            (e.currentTarget as HTMLButtonElement).style.color = '#DEB96A';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#2E2E2E';
            (e.currentTarget as HTMLButtonElement).style.color = '#EDE8E0';
          }}
        >
          Try Again
        </button>
      )}
    </div>
  );
}
