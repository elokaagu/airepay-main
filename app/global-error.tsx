"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background px-6 py-16 text-foreground">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        {error.message ? (
          <p className="mt-3 max-w-lg text-sm text-muted-foreground">{error.message}</p>
        ) : null}
        <button
          type="button"
          onClick={() => reset()}
          className="mt-8 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
