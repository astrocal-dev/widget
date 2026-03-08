import type { WidgetError } from "../types";

interface ErrorScreenProps {
  error: WidgetError;
  onRetry?: () => void;
}

export function ErrorScreen({ error, onRetry }: ErrorScreenProps) {
  const title = error.code === "not_found" ? "Not Found" : "Something went wrong";

  return (
    <div class="astrocal-error" role="alert">
      <div class="astrocal-error-icon" aria-hidden="true">
        &#33;
      </div>
      <h3>{title}</h3>
      <p>{error.message}</p>
      {onRetry && error.code !== "not_found" && (
        <button type="button" class="astrocal-retry-btn" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}
