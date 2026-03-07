"use client";

import { useState, useCallback } from "react";
import type { GenerationInput } from "@/types";

interface GenerationState {
  isGenerating: boolean;
  error: string | null;
  mealPlanId: string | null;
}

export function useGeneration() {
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    error: null,
    mealPlanId: null,
  });

  const generate = useCallback(async (input: GenerationInput) => {
    setState({ isGenerating: true, error: null, mealPlanId: null });

    try {
      const res = await fetch("/api/generate-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const json = await res.json();

      if (!json.success) {
        setState({
          isGenerating: false,
          error: json.error ?? "Generation failed",
          mealPlanId: null,
        });
        return null;
      }

      setState({
        isGenerating: false,
        error: null,
        mealPlanId: json.data.mealPlan.id,
      });

      return json.data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setState({ isGenerating: false, error: message, mealPlanId: null });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ isGenerating: false, error: null, mealPlanId: null });
  }, []);

  return {
    ...state,
    generate,
    reset,
  };
}
