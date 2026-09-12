interface ErrorBannerProps {
  message: string;
}

export default function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div className="bg-red-50 text-red-700 border border-red-200 rounded-md px-4 py-3 text-sm">
      {message}
    </div>
  );
}