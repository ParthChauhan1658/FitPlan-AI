"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { PageBackground } from "@/components/shared/PageBackground";
import { toast } from "sonner";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Scale,
  Target,
  Calendar,
  Flame,
  Trophy,
  ChevronDown,
  Activity,
  BarChart3,
} from "lucide-react";
import { Input } from "@/components/ui/input";

/* ─── Local storage key ───────────────────────────────────────── */
const STORAGE_KEY = "fitplan_progress_logs";

interface ProgressEntry {
  id: string;
  date: string;
  weightKg: number;
  notes?: string;
}

function loadEntries(): ProgressEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as ProgressEntry[];
  } catch {
    return [];
  }
}

function saveEntries(entries: ProgressEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

/* ─── Stat card ───────────────────────────────────────────────── */
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-extrabold text-white mt-0.5">{value}</p>
        <p className="text-xs text-gray-600 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

/* ─── Inline bar chart ────────────────────────────────────────── */
function WeightChart({ entries }: { entries: ProgressEntry[] }) {
  if (entries.length < 2) return null;

  const recent = [...entries].slice(-12);
  const weights = recent.map((e) => e.weightKg);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const range = maxW - minW || 1;

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <BarChart3 className="w-4 h-4 text-brand-teal" />
        <h2 className="text-white font-bold">Weight Trend</h2>
        <span className="text-xs text-gray-600 ml-1">(last {recent.length} entries)</span>
      </div>
      <div className="flex items-end gap-2 h-28">
        {recent.map((entry, i) => {
          const pct = range > 0 ? ((entry.weightKg - minW) / range) * 100 : 50;
          const barH = Math.max(10, pct);
          const isLast = i === recent.length - 1;
          return (
            <div key={entry.id} className="flex-1 flex flex-col items-center gap-1 group">
              <div className="relative flex items-end justify-center" style={{ height: "100px" }}>
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap z-10 pointer-events-none">
                  {entry.weightKg}kg
                </div>
                <div
                  className={`w-full rounded-t-md transition-all duration-500 ${
                    isLast ? "bg-brand-teal" : "bg-brand-teal/40 group-hover:bg-brand-teal/70"
                  }`}
                  style={{ height: `${barH}%` }}
                />
              </div>
              <span className="text-xs text-gray-600 truncate w-full text-center">
                {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-3 text-xs text-gray-600">
        <span>{minW.toFixed(1)} kg (low)</span>
        <span>{maxW.toFixed(1)} kg (high)</span>
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────── */
export default function ProgressPage() {
  const [entries, setEntries] = useState<ProgressEntry[]>(() => loadEntries());
  const [showForm, setShowForm] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<{
    weightKg: number;
    notes: string;
  }>();

  const onSubmit = (data: { weightKg: number; notes: string }) => {
    const entry: ProgressEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      weightKg: Number(data.weightKg),
      notes: data.notes || undefined,
    };
    const updated = [...entries, entry];
    setEntries(updated);
    saveEntries(updated);
    reset();
    setShowForm(false);
    toast.success("Progress logged!");
  };

  const handleDelete = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    saveEntries(updated);
    toast.success("Entry removed");
  };

  /* ── Computed stats ── */
  const sorted = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const latest = sorted[sorted.length - 1];
  const first = sorted[0];
  const totalChange = latest && first ? latest.weightKg - first.weightKg : null;
  const lastChange =
    sorted.length >= 2 ? latest!.weightKg - sorted[sorted.length - 2]!.weightKg : null;
  const avgWeight =
    sorted.length > 0
      ? (sorted.reduce((s, e) => s + e.weightKg, 0) / sorted.length).toFixed(1)
      : "—";

  const changeLabel =
    totalChange === null
      ? "—"
      : totalChange > 0
      ? `+${totalChange.toFixed(1)} kg`
      : `${totalChange.toFixed(1)} kg`;

  const lastChangeLabel =
    lastChange === null
      ? "—"
      : lastChange > 0
      ? `+${lastChange.toFixed(1)} kg`
      : lastChange < 0
      ? `${lastChange.toFixed(1)} kg`
      : "No change";

  const TrendIcon =
    lastChange === null || lastChange === 0 ? Minus : lastChange > 0 ? TrendingUp : TrendingDown;

  const trendColor =
    lastChange === null || lastChange === 0
      ? "text-gray-500"
      : lastChange > 0
      ? "text-brand-amber"
      : "text-brand-mint";

  return (
    <>
      <PageBackground image="progress-bg.png" overlay="heavy" />
    <div className="space-y-6 max-w-3xl relative z-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Progress Tracker</h1>
          <p className="text-gray-400 mt-1">Log your weight weekly and track your fitness journey.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-teal/10 border border-brand-teal/25 text-brand-teal text-sm font-semibold hover:bg-brand-teal/20 transition-colors flex-shrink-0"
        >
          {showForm ? <ChevronDown className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancel" : "Log Progress"}
        </button>
      </div>

      {/* Log form */}
      {showForm && (
        <div className="glass-card-coral rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Scale className="w-4 h-4 text-brand-teal" />
            <h2 className="text-white font-bold">Log Today&apos;s Weight</h2>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 space-y-1">
              <label className="text-xs text-gray-500 font-medium">Weight (kg)</label>
              <Input
                type="number"
                step="0.1"
                placeholder="e.g. 72.5"
                className="h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-brand-teal/50 focus:ring-brand-teal/20"
                {...register("weightKg", {
                  required: "Weight is required",
                  min: { value: 30, message: "Min 30 kg" },
                  max: { value: 300, message: "Max 300 kg" },
                  valueAsNumber: true,
                })}
              />
              {errors.weightKg && <p className="text-xs text-red-400">{errors.weightKg.message}</p>}
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-xs text-gray-500 font-medium">Notes (optional)</label>
              <Input
                type="text"
                placeholder="e.g. feeling stronger"
                className="h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-brand-teal/50 focus:ring-brand-teal/20"
                {...register("notes")}
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="h-11 px-6 rounded-xl bg-gradient-to-r from-brand-teal to-brand-teal/80 text-white font-semibold text-sm hover:from-brand-teal/90 hover:to-brand-teal/70 shadow-[0_4px_16px_rgba(255,96,68,0.25)] transition-all"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={Activity}
          label="Entries Logged"
          value={String(entries.length)}
          sub="total logs"
          color="bg-brand-teal/10 text-brand-teal"
        />
        <StatCard
          icon={Scale}
          label="Current Weight"
          value={latest ? `${latest.weightKg} kg` : "—"}
          sub="latest entry"
          color="bg-brand-amber/10 text-brand-amber"
        />
        <StatCard
          icon={TrendIcon}
          label="Last Change"
          value={lastChangeLabel}
          sub="vs previous"
          color={`bg-white/5 ${trendColor}`}
        />
        <StatCard
          icon={Trophy}
          label="Total Change"
          value={changeLabel}
          sub={`from ${first ? new Date(first.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "start"}`}
          color="bg-brand-mint/10 text-brand-mint"
        />
      </div>

      {/* Chart */}
      <WeightChart entries={sorted} />

      {/* History */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Calendar className="w-4 h-4 text-brand-amber" />
          <h2 className="text-white font-bold">Log History</h2>
          {avgWeight !== "—" && (
            <div className="ml-auto flex items-center gap-1 text-xs text-gray-500">
              <Flame className="w-3 h-3 text-brand-amber" />
              Avg: <span className="text-white font-semibold ml-0.5">{avgWeight} kg</span>
            </div>
          )}
        </div>

        {sorted.length === 0 ? (
          <div className="text-center py-10">
            <Target className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No entries yet. Log your first weight above.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {[...sorted].reverse().map((entry) => {
              const prevIdx = sorted.findIndex((e) => e.id === entry.id) - 1;
              const prev = prevIdx >= 0 ? sorted[prevIdx] : null;
              const diff = prev ? entry.weightKg - prev.weightKg : null;
              const diffStr =
                diff === null ? null : diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);

              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/4 hover:bg-white/7 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-gray-500 w-20 flex-shrink-0">
                      {new Date(entry.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <span className="text-white font-bold text-sm">{entry.weightKg} kg</span>
                    {diffStr && (
                      <span className={`text-xs font-medium ${diff! > 0 ? "text-brand-amber" : diff! < 0 ? "text-brand-mint" : "text-gray-500"}`}>
                        {diffStr} kg
                      </span>
                    )}
                    {entry.notes && (
                      <span className="text-xs text-gray-600 italic truncate max-w-[120px]">
                        {entry.notes}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    aria-label="Remove entry"
                    className="text-gray-700 hover:text-red-400 transition-colors text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
