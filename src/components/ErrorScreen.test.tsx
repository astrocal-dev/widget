import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/preact";
import { ErrorScreen } from "./ErrorScreen";

describe("ErrorScreen", () => {
  it("shows 'Not Found' for not_found error code", () => {
    const error = {
      code: "not_found" as const,
      message: "Event type not found",
    };

    render(<ErrorScreen error={error} />);

    expect(screen.getByRole("heading", { name: /not found/i })).toBeInTheDocument();
  });

  it("shows 'Something went wrong' for other error codes", () => {
    const error = {
      code: "unknown" as const,
      message: "An unexpected error occurred",
    };

    render(<ErrorScreen error={error} />);

    expect(screen.getByRole("heading", { name: /something went wrong/i })).toBeInTheDocument();
  });

  it("shows error message", () => {
    const error = {
      code: "network_error" as const,
      message: "Failed to connect to server",
    };

    render(<ErrorScreen error={error} />);

    expect(screen.getByText("Failed to connect to server")).toBeInTheDocument();
  });

  it("shows retry button when onRetry provided and code is not not_found", () => {
    const error = {
      code: "unknown" as const,
      message: "An error occurred",
    };
    const onRetry = vi.fn();

    render(<ErrorScreen error={error} onRetry={onRetry} />);

    const retryButton = screen.getByRole("button", { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
  });

  it("retry button calls onRetry when clicked", () => {
    const error = {
      code: "network_error" as const,
      message: "Network failed",
    };
    const onRetry = vi.fn();

    render(<ErrorScreen error={error} onRetry={onRetry} />);

    const retryButton = screen.getByRole("button", { name: /try again/i });
    fireEvent.click(retryButton);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("does not show retry button for not_found errors", () => {
    const error = {
      code: "not_found" as const,
      message: "Event type not found",
    };
    const onRetry = vi.fn();

    render(<ErrorScreen error={error} onRetry={onRetry} />);

    const retryButton = screen.queryByRole("button", { name: /try again/i });
    expect(retryButton).not.toBeInTheDocument();
  });

  it("does not show retry button when onRetry is not provided", () => {
    const error = {
      code: "unknown" as const,
      message: "An error occurred",
    };

    render(<ErrorScreen error={error} />);

    const retryButton = screen.queryByRole("button", { name: /try again/i });
    expect(retryButton).not.toBeInTheDocument();
  });

  it("has role alert for accessibility", () => {
    const error = {
      code: "unknown" as const,
      message: "An error occurred",
    };

    render(<ErrorScreen error={error} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("shows exclamation icon", () => {
    const error = {
      code: "unknown" as const,
      message: "An error occurred",
    };

    render(<ErrorScreen error={error} />);

    // The exclamation is &#33; which renders as !
    const icon = screen.getByText("!");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });

  it("handles validation_error code", () => {
    const error = {
      code: "validation_error" as const,
      message: "Invalid input provided",
    };
    const onRetry = vi.fn();

    render(<ErrorScreen error={error} onRetry={onRetry} />);

    expect(screen.getByRole("heading", { name: /something went wrong/i })).toBeInTheDocument();
    expect(screen.getByText("Invalid input provided")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("handles slot_unavailable code", () => {
    const error = {
      code: "slot_unavailable" as const,
      message: "This time slot is no longer available",
    };
    const onRetry = vi.fn();

    render(<ErrorScreen error={error} onRetry={onRetry} />);

    expect(screen.getByRole("heading", { name: /something went wrong/i })).toBeInTheDocument();
    expect(screen.getByText("This time slot is no longer available")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });
});
