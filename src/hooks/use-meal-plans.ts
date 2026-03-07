"use client";

import useSWR from "swr";

interface MealPlanSummary {
  id: string;
  planType: string;
  targetCalories: number;
  fitnessGoal: string;
  dietaryPreference: string;
  isFavorite: boolean;
  createdAt: string;
  totalDailyCost: number;
  budgetCurrency: string;
}

interface PaginatedResponse {
  items: MealPlanSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const fetcher = async (url: string): Promise<PaginatedResponse> => {
  const res = await fetch(url);
  const json = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.error ?? "Failed to fetch meal plans");
  }
  return json.data;
};

export function useMealPlans(
  options: { page?: number; limit?: number; favorites?: boolean } = {}
) {
  const { page = 1, limit = 10, favorites } = options;
  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (favorites) searchParams.set("favorites", "true");

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse>(
    `/api/meal-plans?${searchParams.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    plans: data?.items ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
    currentPage: data?.page ?? 1,
    error,
    isError: !!error,
    isLoading,
    mutate,
  };
}
