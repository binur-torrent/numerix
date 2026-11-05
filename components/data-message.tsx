export function DataMessage({ error }: { error: unknown }) {
  const message =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : "Could not load tests.";
  return <p className="max-w-md text-center text-sm leading-6 text-muted">{message}</p>;
}
