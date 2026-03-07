"use client";

import useSWR from "swr";

interface SubscriptionData {
  id: string;
  tier: string;
  status: string;
  generationsUsed: number;
  generationsLimit: number;
  currentPeriodEnd: string | null;
  stripeSubscriptionId: string | null;
}

const fetcher = async (url: string): Promise<SubscriptionData> => {
  const res = await fetch(url);
  const json = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.error ?? "Failed to fetch subscription");
  }
  return json.data;
};

export function useSubscription() {
  const { data, error, isLoading, mutate } = useSWR<SubscriptionData>(
    "/api/user/subscription",
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  const canGenerate =
    data?.tier === "ULTIMATE" ||
    (data ? data.generationsUsed < data.generationsLimit : false);

  return {
    subscription: data ?? null,
    tier: data?.tier ?? "FREE",
    used: data?.generationsUsed ?? 0,
    limit: data?.generationsLimit ?? 3,
    canGenerate,
    error,
    isLoading,
    mutate,
  };
}
