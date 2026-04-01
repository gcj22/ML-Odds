export default function ErrorState({
  message = 'Something went wrong',
  retry,
}: {
  message?: string;
  retry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-4xl mb-4">⚠️</div>
      <p className="text-gray-400 mb-4">{message}</p>
      {retry && (
        <button
          onClick={retry}
          className="px-4 py-2 bg-yellow-400 text-black rounded font-semibold hover:bg-yellow-300 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
