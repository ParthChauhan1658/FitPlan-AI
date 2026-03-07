import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MacroBreakdown } from "@/components/cards/macro-breakdown";

describe("MacroBreakdown", () => {
  it("displays all macro values", () => {
    render(
      <MacroBreakdown
        proteinGrams={150}
        carbGrams={200}
        fatGrams={70}
        targetCalories={2000}
      />
    );
    expect(screen.getByText(/150g/)).toBeInTheDocument();
    expect(screen.getByText(/200g/)).toBeInTheDocument();
    expect(screen.getByText(/70g/)).toBeInTheDocument();
  });

  it("renders the component without erroring", () => {
    const { container } = render(
      <MacroBreakdown
        proteinGrams={0}
        carbGrams={0}
        fatGrams={0}
        targetCalories={0}
      />
    );
    expect(container.firstChild).toBeTruthy();
  });
});
