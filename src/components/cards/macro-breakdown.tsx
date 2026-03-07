import { Flame, Beef, Wheat, Droplets } from "lucide-react";

export interface MacroBreakdownProps {
  targetCalories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  proteinPercent?: number;
  carbPercent?: number;
  fatPercent?: number;
}

export function MacroBreakdown({
  targetCalories,
  proteinGrams,
  carbGrams,
  fatGrams,
  proteinPercent: proteinPercentProp,
  carbPercent: carbPercentProp,
  fatPercent: fatPercentProp,
}: MacroBreakdownProps) {
  const totalCalFromMacros = proteinGrams * 4 + carbGrams * 4 + fatGrams * 9;
  const base = totalCalFromMacros || 1;
  const proteinPercent = proteinPercentProp ?? Math.round((proteinGrams * 4 / base) * 100);
  const carbPercent = carbPercentProp ?? Math.round((carbGrams * 4 / base) * 100);
  const fatPercent = fatPercentProp ?? Math.round((fatGrams * 9 / base) * 100);

  const macros = [
    {
      label: "Protein",
      grams: proteinGrams,
      percent: proteinPercent,
      barColor: "bg-brand-teal",
      textColor: "text-brand-teal",
      icon: Beef,
      kcal: proteinGrams * 4,
    },
    {
      label: "Carbs",
      grams: carbGrams,
      percent: carbPercent,
      barColor: "bg-brand-purple-light",
      textColor: "text-brand-purple-light",
      icon: Wheat,
      kcal: carbGrams * 4,
    },
    {
      label: "Fat",
      grams: fatGrams,
      percent: fatPercent,
      barColor: "bg-brand-amber",
      textColor: "text-brand-amber",
      icon: Droplets,
      kcal: fatGrams * 9,
    },
  ];

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-bold text-lg">Macro Breakdown</h2>
          <p className="text-gray-500 text-sm mt-0.5">Daily nutritional targets</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1.5 justify-end">
            <Flame className="w-4 h-4 text-brand-amber" />
            <span className="text-2xl font-extrabold text-white">{targetCalories.toLocaleString()}</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">kcal / day</p>
        </div>
      </div>

      <div className="space-y-4 mb-5">
        {macros.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5">
                    <Icon className={`w-3.5 h-3.5 ${m.textColor}`} aria-hidden="true" />
                  </div>
                  <span className="text-sm font-medium text-gray-300">{m.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${m.textColor}`}>{m.grams}g</span>
                  <span className="text-xs text-gray-600">({m.percent}%)</span>
                  <span className="text-xs text-gray-600 hidden sm:inline">{m.kcal} kcal</span>
                </div>
              </div>
              <div className="h-2 w-full bg-white/8 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${m.barColor} transition-all duration-700`}
                  style={{ width: `${m.percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Caloric Ratio</p>
        <div className="flex h-3 overflow-hidden rounded-full">
          <div
            className="bg-brand-teal transition-all duration-700"
            style={{ width: `${proteinPercent}%` }}
            title={`Protein ${proteinPercent}%`}
          />
          <div
            className="bg-brand-purple-light transition-all duration-700"
            style={{ width: `${carbPercent}%` }}
            title={`Carbs ${carbPercent}%`}
          />
          <div
            className="bg-brand-amber transition-all duration-700"
            style={{ width: `${fatPercent}%` }}
            title={`Fat ${fatPercent}%`}
          />
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {macros.map((m) => (
            <span key={m.label} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${m.barColor}`} />
              {m.label} {m.percent}%
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
