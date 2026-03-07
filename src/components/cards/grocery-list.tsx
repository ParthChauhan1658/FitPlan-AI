"use client";

import { useState } from "react";
import { ShoppingCart, Share2, Check } from "lucide-react";
import type { GroceryItem } from "@/types";

interface GroceryListProps {
  items: GroceryItem[];
  title?: string;
  currency?: string;
}

function buildShareText(
  items: GroceryItem[],
  currency: string,
  totalCost: number
): string {
  const grouped = items.reduce<Record<string, GroceryItem[]>>((acc, item) => {
    const cat = item.category ?? "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const lines: string[] = [
    "🛒 FitPlan AI — Grocery List",
    `💰 Total: ${currency} ${totalCost.toFixed(0)}`,
    "",
  ];

  for (const [cat, catItems] of Object.entries(grouped)) {
    lines.push(`📦 ${cat}`);
    for (const item of catItems) {
      lines.push(`• ${item.name} — ${item.quantity}  (${currency} ${item.estimatedCost})`);
    }
    lines.push("");
  }

  lines.push("Generated with FitPlan AI 💪");
  lines.push("https://fitplanai.app");
  return lines.join("\n");
}

export function GroceryList({
  items,
  title = "Grocery List",
  currency = "INR",
}: GroceryListProps) {
  const [shared, setShared] = useState(false);
  const totalCost = items.reduce((sum, item) => sum + item.estimatedCost, 0);

  const grouped = items.reduce<Record<string, GroceryItem[]>>((acc, item) => {
    const category = item.category ?? "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  const handleShare = async () => {
    const text = buildShareText(items, currency, totalCost);

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "FitPlan AI – Grocery List", text });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
        return;
      } catch {
        // User cancelled or API unavailable — fall through to WhatsApp
      }
    }

    // WhatsApp fallback
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, "_blank", "noopener,noreferrer");
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4.5 h-4.5 text-brand-teal" />
          <h3 className="text-base font-bold text-white">{title}</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400 font-medium">
            Total:{" "}
            <span className="text-white font-bold">
              {currency} {totalCost.toFixed(0)}
            </span>
          </span>
          <button
            onClick={handleShare}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              shared
                ? "bg-brand-teal/15 text-brand-teal border-brand-teal/30"
                : "bg-white/5 text-gray-400 border-white/10 hover:text-white hover:border-white/20"
            }`}
            title="Share grocery list via WhatsApp or native share"
          >
            {shared ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Shared!
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                Share
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grouped items */}
      <div className="space-y-5">
        {Object.entries(grouped).map(([category, categoryItems]) => (
          <div key={category}>
            <h4 className="text-xs font-semibold text-brand-teal uppercase tracking-wider mb-2">
              {category}
            </h4>
            <div className="space-y-1.5">
              {categoryItems.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-white/80">{item.name}</span>
                    <span className="text-gray-600 text-xs">({item.quantity})</span>
                  </div>
                  <span className="text-gray-500 text-xs font-medium">
                    {currency} {item.estimatedCost}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
