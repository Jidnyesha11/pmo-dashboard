"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="error-screen">
      <div className="error-card">
        <div className="eyebrow">LOCAL DASHBOARD</div>
        <h1>Dashboard could not render</h1>
        <p>
          The bundled project data may be missing or invalid. Regenerate it with{" "}
          <code>npm run data:generate</code>, then try again.
        </p>
        <button className="button secondary" onClick={reset}>
          Retry dashboard
        </button>
      </div>
    </main>
  );
}
