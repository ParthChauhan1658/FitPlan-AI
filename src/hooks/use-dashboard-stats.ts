"use client";

import useSWR from "swr";
import type { DashboardStats } from "@/types";

const fetcher = (url: string) =>
  fetch(url).then((res) => res.json()).then((json) => {
    if (!json.success) throw new Error(json.error ?? "Failed to fetch");
    return json.data as DashboardStats;
  });

export function useDashboardStats() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/dashboard/stats",
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    stats: data ?? null,
    isLoading,
    isError: !!error,
    mutate,
  };
}
