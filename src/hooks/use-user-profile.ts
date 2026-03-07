"use client";

import useSWR from "swr";

interface UserProfileData {
  user: {
    id: string;
    clerkId: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
    profile: Record<string, unknown> | null;
    subscription: {
      id: string;
      plan: string;
      status: string;
      generationsUsed: number;
      generationsLimit: number;
    } | null;
  };
  hasProfile: boolean;
}

interface APIResponse {
  success: boolean;
  data?: UserProfileData;
  error?: string;
}

const fetcher = async (url: string): Promise<UserProfileData> => {
  const res = await fetch(url);
  const json: APIResponse = await res.json();

  if (!json.success || !json.data) {
    throw new Error(json.error ?? "Failed to fetch profile");
  }

  return json.data;
};

export function useUserProfile() {
  const { data, error, isLoading, mutate } = useSWR<UserProfileData>(
    "/api/user/profile",
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  return {
    data,
    hasProfile: data?.hasProfile ?? false,
    subscription: data?.user?.subscription ?? null,
    error,
    isLoading,
    mutate,
  };
}
