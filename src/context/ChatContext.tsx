"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { DailyPlan } from "@/types";

export interface PlanChatContext {
  id: string;
  planType: string;
  fitnessGoal: string;
  dietaryPreference: string;
  targetCalories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  dailyBudget: number;
  budgetCurrency: string;
  meals: DailyPlan[];
}

interface ChatContextValue {
  planContext: PlanChatContext | null;
  setPlanContext: (ctx: PlanChatContext | null) => void;
}

const ChatContext = createContext<ChatContextValue>({
  planContext: null,
  setPlanContext: () => {},
});

export function ChatProvider({ children }: { children: ReactNode }) {
  const [planContext, setPlanContext] = useState<PlanChatContext | null>(null);
  return (
    <ChatContext.Provider value={{ planContext, setPlanContext }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  return useContext(ChatContext);
}
