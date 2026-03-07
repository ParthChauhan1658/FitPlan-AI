"use client";

import { useState, useRef } from "react";
import { Camera, X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import type { Meal } from "@/types";
import type { SnapResult } from "@/app/api/snap-to-meal/route";

interface SnapToMealProps {
  plannedMeal: Meal;
  currency?: string;
}

function MacroDiff({
  label,
  actual,
  planned,
  unit,
}: {
  label: string;
  actual: number;
  planned: number;
  unit: string;
}) {
  const diff = actual - planned;
  const ratio = planned > 0 ? actual / planned : 1;
  const color =
    ratio >= 0.85 && ratio <= 1.15
      ? "text-brand-teal"
      : ratio >= 0.7 && ratio <= 1.3
      ? "text-brand-amber"
      : "text-red-400";
  const icon =
    ratio >= 0.85 && ratio <= 1.15
      ? "✓"
      : diff > 0
      ? "▲"
      : "▼";

  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
      <span className={`text-sm font-bold ${color}`}>
        {actual}
        {unit}
      </span>
      <span className={`text-xs ${color} opacity-80`}>
        {icon} {diff > 0 ? "+" : ""}
        {diff}
        {unit}
      </span>
    </div>
  );
}

export function SnapToMeal({ plannedMeal }: SnapToMealProps) {
  const [open, setOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<SnapResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = () => {
    setErr(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setErr(null);
    setAnalyzing(true);

    try {
      // Convert to base64
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);

      const res = await fetch("/api/snap-to-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: file.type || "image/jpeg",
          plannedMeal: {
            name: plannedMeal.name,
            totalCalories: plannedMeal.totalCalories,
            totalProtein: plannedMeal.totalProtein,
          },
        }),
      });

      const json = await res.json();
      if (json.success) {
        setResult(json.data as SnapResult);
      } else {
        setErr(json.error ?? "Analysis failed");
      }
    } catch {
      setErr("Network error. Please try again.");
    } finally {
      setAnalyzing(false);
      e.target.value = "";
    }
  };

  const handleClose = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setOpen(false);
    setResult(null);
    setPreviewUrl(null);
    setErr(null);
  };

  const calDiff = result ? result.totalCalories - plannedMeal.totalCalories : 0;
  const calRatio = result
    ? result.totalCalories / (plannedMeal.totalCalories || 1)
    : 1;
  const onTrack = calRatio >= 0.85 && calRatio <= 1.15;
  const slightDev = calRatio >= 0.7 && calRatio <= 1.3;

  return (
    <>
      {/* Camera trigger button — shown inline */}
      <button
        onClick={() => setOpen(true)}
        title="Snap actual meal to compare with plan"
        className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-white/10 text-gray-500 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all"
      >
        <Camera className="w-3 h-3" />
        Snap
      </button>

      {/* Hidden file input — accepts camera on mobile */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

          <div className="relative w-full md:max-w-md bg-brand-dark border border-brand-border rounded-t-3xl md:rounded-2xl shadow-2xl z-10 overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border">
              <div>
                <p className="text-sm font-bold text-white">Snap-to-Meal</p>
                <p className="text-xs text-gray-500">
                  Log actual: <span className="text-gray-400">{plannedMeal.name}</span>
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/8 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Planned meal summary */}
              <div className="rounded-xl bg-white/3 border border-white/5 p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Planned</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white font-medium">{plannedMeal.name}</span>
                  <span className="text-xs text-brand-amber font-semibold">
                    {plannedMeal.totalCalories} kcal
                  </span>
                </div>
                <div className="flex gap-3 text-xs text-gray-600 mt-1">
                  <span>P: {plannedMeal.totalProtein}g</span>
                  <span>C: {plannedMeal.totalCarbs}g</span>
                  <span>F: {plannedMeal.totalFat}g</span>
                </div>
              </div>

              {/* Camera button or preview */}
              {!previewUrl ? (
                <button
                  onClick={handleCapture}
                  className="w-full h-36 rounded-2xl border-2 border-dashed border-white/15 hover:border-brand-coral/40 hover:bg-brand-coral/5 transition-all flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-brand-coral"
                >
                  <Camera className="w-8 h-8" />
                  <span className="text-sm font-medium">Take a photo or choose from gallery</span>
                </button>
              ) : (
                <div className="relative rounded-2xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Meal photo"
                    className="w-full max-h-64 object-cover rounded-2xl"
                  />
                  {analyzing && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 rounded-2xl">
                      <Loader2 className="w-8 h-8 text-brand-coral animate-spin" />
                      <p className="text-sm text-white font-medium">Analyzing your meal…</p>
                    </div>
                  )}
                  {!analyzing && (
                    <button
                      onClick={handleCapture}
                      className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/60 text-white text-xs font-medium border border-white/20 hover:bg-black/80 transition-all"
                    >
                      Retake
                    </button>
                  )}
                </div>
              )}

              {/* Error state */}
              {err && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {err}
                </div>
              )}

              {/* Results */}
              {result && (
                <div className="space-y-4">
                  {/* Status banner */}
                  <div
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium ${
                      onTrack
                        ? "bg-brand-teal/10 border-brand-teal/25 text-brand-teal"
                        : slightDev
                        ? "bg-brand-amber/10 border-brand-amber/25 text-brand-amber"
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    {result.comparisonNote || (onTrack ? "On track!" : `${calDiff > 0 ? "+" : ""}${calDiff} kcal vs plan`)}
                  </div>

                  {/* Macro comparison */}
                  <div className="rounded-xl bg-white/3 border border-white/5 p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Actual vs Planned</p>
                    <div className="grid grid-cols-4 gap-2">
                      <MacroDiff
                        label="Kcal"
                        actual={result.totalCalories}
                        planned={plannedMeal.totalCalories}
                        unit=""
                      />
                      <MacroDiff
                        label="Protein"
                        actual={result.totalProtein}
                        planned={plannedMeal.totalProtein}
                        unit="g"
                      />
                      <MacroDiff
                        label="Carbs"
                        actual={result.totalCarbs}
                        planned={plannedMeal.totalCarbs}
                        unit="g"
                      />
                      <MacroDiff
                        label="Fat"
                        actual={result.totalFat}
                        planned={plannedMeal.totalFat}
                        unit="g"
                      />
                    </div>
                  </div>

                  {/* Detected foods */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                      Detected Foods
                    </p>
                    <div className="space-y-1.5">
                      {result.detectedFoods.map((food, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0"
                        >
                          <div>
                            <span className="text-sm text-white/80">{food.name}</span>
                            <span className="text-xs text-gray-600 ml-1.5">
                              {food.estimatedQuantity}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-brand-amber font-medium">
                              {food.calories} kcal
                            </span>
                            {food.confidence === "low" && (
                              <span className="text-xs text-gray-600 italic">~</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Portion note */}
                  {result.portionNote && (
                    <p className="text-xs text-gray-600 italic">{result.portionNote}</p>
                  )}
                </div>
              )}

              {/* CTA when no image yet */}
              {!previewUrl && !analyzing && (
                <p className="text-xs text-gray-600 text-center">
                  Photos are analysed locally and not stored.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
