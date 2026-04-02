export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dim = { sm: 16, md: 32, lg: 48 }[size];
  return (
    <div className="flex items-center justify-center" aria-label="Loading" role="status">
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 32 32"
        fill="none"
        style={{ animation: 'spin 1s linear infinite' }}
      >
        <circle cx="16" cy="16" r="13" stroke="#242424" strokeWidth="2" />
        <path
          d="M16 3 A13 13 0 0 1 29 16"
          stroke="#C6973F"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
