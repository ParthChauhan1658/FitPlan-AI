import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EmptyState } from "@/components/shared/empty-state";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(
      <EmptyState
        title="No items"
        description="There are no items to display."
      />
    );
    expect(screen.getByText("No items")).toBeInTheDocument();
    expect(
      screen.getByText("There are no items to display.")
    ).toBeInTheDocument();
  });

  it("renders action button with link", () => {
    render(
      <EmptyState
        title="No plans"
        description="Get started."
        actionLabel="Create Plan"
        actionHref="/meal-plans/new"
      />
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/meal-plans/new");
    expect(screen.getByText("Create Plan")).toBeInTheDocument();
  });

  it("calls onAction when button clicked (no href)", () => {
    const handler = vi.fn();
    render(
      <EmptyState
        title="Empty"
        description="Nothing here"
        actionLabel="Retry"
        onAction={handler}
      />
    );
    fireEvent.click(screen.getByText("Retry"));
    expect(handler).toHaveBeenCalledOnce();
  });

  it("does not render button when no action props", () => {
    render(
      <EmptyState title="Empty" description="Nothing here" />
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
