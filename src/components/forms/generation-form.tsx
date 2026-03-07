"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import {
  AlertTriangle,
  X,
  Plus,
  User,
  Activity,
  DollarSign,
  Sparkles,
  Target,
  ChefHat,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Flame,
  Info,
  Loader2,
} from "lucide-react";
import { generationInputSchema } from "@/lib/validations";
import { useGeneration } from "@/hooks/use-generation";
import { useUserProfile } from "@/hooks/use-user-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FITNESS_GOAL_LABELS,
  DIETARY_PREFERENCE_LABELS,
  CUISINE_PREFERENCE_LABELS,
  COOKING_ABILITY_LABELS,
  ACTIVITY_LEVEL_LABELS,
  GENDER_LABELS,
  PLAN_TYPE_LABELS,
} from "@/constants";

type GenerationFormData = z.infer<typeof generationInputSchema>;

// ─── Calorie & BMI preview (mirrors server calculation) ───────────────────────

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  SEDENTARY: 1.2,
  LIGHTLY_ACTIVE: 1.375,
  MODERATELY_ACTIVE: 1.55,
  VERY_ACTIVE: 1.725,
  EXTRA_ACTIVE: 1.9,
};
const GOAL_ADJUSTMENTS: Record<string, number> = {
  FAT_LOSS: 0.8,
  MUSCLE_GAIN: 1.15,
  MAINTENANCE: 1.0,
  ATHLETIC_PERFORMANCE: 1.1,
};
const MIN_SAFE_CALORIES: Record<string, number> = {
  FEMALE: 1200,
  MALE: 1500,
  OTHER: 1200,
};

function calcPreview(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: string,
  activityLevel: string,
  fitnessGoal: string
): { calories: number; bmi: number; wasFloored: boolean } | null {
  if (!weightKg || !heightCm || !age || weightKg < 30 || heightCm < 100) return null;
  let bmr: number;
  if (gender === "MALE") bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  else if (gender === "FEMALE") bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  else bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 78;
  const tdee = bmr * (ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.55);
  const raw = Math.round(tdee * (GOAL_ADJUSTMENTS[fitnessGoal] ?? 1.0));
  const floor = MIN_SAFE_CALORIES[gender] ?? 1200;
  const calories = Math.max(raw, floor);
  const bmi = parseFloat((weightKg / (heightCm / 100) ** 2).toFixed(1));
  return { calories, bmi, wasFloored: raw < floor };
}

function getBmiInfo(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: "Underweight", color: "text-blue-400" };
  if (bmi < 25) return { label: "Normal weight", color: "text-brand-teal" };
  if (bmi < 30) return { label: "Overweight", color: "text-brand-amber" };
  return { label: "Obese", color: "text-red-400" };
}

// ─── Styling ──────────────────────────────────────────────────────────────────

const fieldClass =
  "flex h-11 w-full rounded-xl border border-white/10 bg-[#1e1f21] px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-teal/50 focus:border-brand-teal/60 transition-all duration-200";

const selectClass =
  "flex h-11 w-full rounded-xl border border-white/10 bg-[#1e1f21] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-teal/50 focus:border-brand-teal/60 transition-all duration-200 [&>option]:bg-[#1e1f21] [&>option]:text-white";

const errorClass = "text-xs text-red-400 mt-1 flex items-center gap-1";

// ─── Step metadata ────────────────────────────────────────────────────────────

const STEPS = [
  { number: 1, title: "Plan Type", description: "Choose your plan duration and primary fitness objective", icon: Target },
  { number: 2, title: "Body Metrics", description: "Used for accurate calorie and BMI calculation", icon: User },
  { number: 3, title: "Lifestyle", description: "Determines your Total Daily Energy Expenditure (TDEE)", icon: Activity },
  { number: 4, title: "Dietary Preferences", description: "Every meal will strictly respect these restrictions", icon: ChefHat },
  { number: 5, title: "Budget", description: "All meals will stay within your daily food budget", icon: DollarSign },
  { number: 6, title: "Review & Generate", description: "Confirm every detail before the AI generates your plan", icon: Sparkles },
] as const;

const TOTAL_STEPS = STEPS.length;

// Fields validated per step
const STEP_FIELDS: Array<(keyof GenerationFormData)[]> = [
  ["planType", "fitnessGoal"],
  ["gender", "age", "weightKg", "heightCm"],
  ["activityLevel", "cookingAbility", "mealsPerDay"],
  ["dietaryPreference", "cuisinePreference"],
  ["dailyBudget", "budgetCurrency"],
  [],
];

// ─── Main component ──────────────────────────────────────────────────────────

export function GenerationForm() {
  const router = useRouter();
  const { generate, isGenerating, error } = useGeneration();
  const { data: profileData, isLoading: profileLoading } = useUserProfile();
  const profile = profileData?.user?.profile as Record<string, unknown> | null;

  const [step, setStep] = useState(1);
  const [allergyInput, setAllergyInput] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<GenerationFormData>({
    resolver: zodResolver(generationInputSchema),
    defaultValues: {
      planType: "DAILY",
      fitnessGoal: (profile?.fitnessGoal as GenerationFormData["fitnessGoal"]) ?? "MAINTENANCE",
      gender: (profile?.gender as GenerationFormData["gender"]) ?? "MALE",
      age: (profile?.age as number) ?? undefined,
      weightKg: (profile?.weightKg as number) ?? undefined,
      heightCm: (profile?.heightCm as number) ?? undefined,
      activityLevel: (profile?.activityLevel as GenerationFormData["activityLevel"]) ?? "MODERATELY_ACTIVE",
      cookingAbility: (profile?.cookingAbility as GenerationFormData["cookingAbility"]) ?? "MODERATE",
      mealsPerDay: (profile?.mealsPerDay as number) ?? 3,
      dietaryPreference: (profile?.dietaryPreference as GenerationFormData["dietaryPreference"]) ?? "NON_VEG",
      cuisinePreference: (profile?.cuisinePreference as GenerationFormData["cuisinePreference"]) ?? "MIXED",
      allergies: [],
      dailyBudget: (profile?.dailyBudget as number) ?? 500,
      budgetCurrency: (profile?.budgetCurrency as GenerationFormData["budgetCurrency"]) ?? "INR",
    },
  });

  const [
    weightKg, heightCm, age, gender, activityLevel, fitnessGoal,
    allergies, planType, dietaryPreference, cuisinePreference,
    cookingAbility, mealsPerDay, dailyBudget, budgetCurrency,
  ] = watch([
    "weightKg", "heightCm", "age", "gender", "activityLevel", "fitnessGoal",
    "allergies", "planType", "dietaryPreference", "cuisinePreference",
    "cookingAbility", "mealsPerDay", "dailyBudget", "budgetCurrency",
  ]);

  const preview = calcPreview(weightKg, heightCm, age, gender, activityLevel, fitnessGoal);
  const bmiInfo = preview ? getBmiInfo(preview.bmi) : null;

  // Allergy handlers
  const handleAllergyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const trimmed = allergyInput.trim().replace(/,/g, "");
      if (trimmed && !(allergies ?? []).includes(trimmed)) {
        setValue("allergies", [...(allergies ?? []), trimmed], { shouldValidate: true });
      }
      setAllergyInput("");
    }
  };

  const addAllergy = () => {
    const trimmed = allergyInput.trim().replace(/,/g, "");
    if (trimmed && !(allergies ?? []).includes(trimmed)) {
      setValue("allergies", [...(allergies ?? []), trimmed], { shouldValidate: true });
    }
    setAllergyInput("");
  };

  const removeAllergy = (tag: string) => {
    setValue("allergies", (allergies ?? []).filter((a) => a !== tag), { shouldValidate: true });
  };

  const nextStep = async () => {
    const fields = STEP_FIELDS[step - 1] ?? [];
    const valid = fields.length > 0 ? await trigger(fields) : true;
    if (valid) setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const onSubmit = async (data: GenerationFormData) => {
    const result = await generate(data);
    if (result) {
      toast.success("Meal plan generated successfully!");
      router.push(`/meal-plans/${result.mealPlan.id}`);
    } else {
      toast.error(error ?? "Failed to generate meal plan. Please try again.");
    }
  };

  if (profileLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full rounded-2xl bg-white/5" />
        ))}
      </div>
    );
  }

  const currentStep = STEPS[step - 1]!;
  const StepIcon = currentStep.icon;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      // Enter must not submit — user must click the button explicitly
      onKeyDown={(e) => {
        if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "BUTTON") {
          e.preventDefault();
        }
      }}
      className="space-y-6"
    >
      {/* ── Step indicator ── */}
      <div className="space-y-3">
        {/* Dot row */}
        <div className="flex items-center gap-1">
          {STEPS.map((s) => (
            <div key={s.number} className="flex items-center gap-1 flex-1 last:flex-none">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 flex-shrink-0 ${
                  s.number < step
                    ? "bg-brand-teal text-white"
                    : s.number === step
                    ? "bg-brand-teal/20 border-2 border-brand-teal text-brand-teal"
                    : "bg-white/5 border border-white/10 text-gray-600"
                }`}
              >
                {s.number < step ? "✓" : s.number}
              </div>
              {s.number < TOTAL_STEPS && (
                <div
                  className={`h-px flex-1 transition-all duration-500 ${
                    s.number < step ? "bg-brand-teal" : "bg-white/8"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-teal to-brand-purple-light rounded-full transition-all duration-500"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
        {/* Step label */}
        <div className="flex items-center gap-2">
          <StepIcon className="w-4 h-4 text-brand-teal" aria-hidden="true" />
          <div>
            <p className="text-white text-sm font-semibold">
              Step {step} of {TOTAL_STEPS}: {currentStep.title}
            </p>
            <p className="text-gray-500 text-xs">{currentStep.description}</p>
          </div>
        </div>
      </div>

      {/* ── Step content ── */}
      <div className="glass-card rounded-2xl p-6 space-y-5">

        {/* STEP 1 — Plan Type & Goal */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="planType" className="text-gray-300 text-sm">Plan Type</Label>
                <select id="planType" {...register("planType")} className={selectClass}>
                  {Object.entries(PLAN_TYPE_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
                {planType === "WEEKLY" && (
                  <p className="text-xs text-brand-teal flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Generates 7 varied days with a full grocery list
                  </p>
                )}
                {errors.planType && (
                  <p className={errorClass}><X className="w-3 h-3" />{errors.planType.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fitnessGoal" className="text-gray-300 text-sm">Fitness Goal</Label>
                <select id="fitnessGoal" {...register("fitnessGoal")} className={selectClass}>
                  {Object.entries(FITNESS_GOAL_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
                {errors.fitnessGoal && (
                  <p className={errorClass}><X className="w-3 h-3" />{errors.fitnessGoal.message}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 — Body Metrics */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="gender" className="text-gray-300 text-sm">Biological Sex</Label>
                <select id="gender" {...register("gender")} className={selectClass}>
                  {Object.entries(GENDER_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-600">Used for Mifflin-St Jeor BMR formula</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="age" className="text-gray-300 text-sm">Age (years)</Label>
                <Input
                  id="age"
                  type="number"
                  min={13}
                  max={100}
                  placeholder="e.g. 28"
                  {...register("age", { valueAsNumber: true })}
                  className={fieldClass}
                />
                {errors.age && (
                  <p className={errorClass}><X className="w-3 h-3" />{errors.age.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="weightKg" className="text-gray-300 text-sm">Weight (kg)</Label>
                <Input
                  id="weightKg"
                  type="number"
                  step="0.1"
                  min={30}
                  max={300}
                  placeholder="e.g. 72.5"
                  {...register("weightKg", { valueAsNumber: true })}
                  className={fieldClass}
                />
                {errors.weightKg && (
                  <p className={errorClass}><X className="w-3 h-3" />{errors.weightKg.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="heightCm" className="text-gray-300 text-sm">Height (cm)</Label>
                <Input
                  id="heightCm"
                  type="number"
                  min={100}
                  max={250}
                  placeholder="e.g. 175"
                  {...register("heightCm", { valueAsNumber: true })}
                  className={fieldClass}
                />
                {errors.heightCm && (
                  <p className={errorClass}><X className="w-3 h-3" />{errors.heightCm.message}</p>
                )}
              </div>
            </div>

            {/* Live BMI + Calorie preview */}
            {preview && bmiInfo && (
              <div className="grid gap-3 sm:grid-cols-2 mt-2">
                <div className="rounded-xl border border-white/8 bg-white/3 p-4">
                  <p className="text-xs text-gray-500 mb-1">Your BMI</p>
                  <div className="flex items-end gap-2">
                    <span className={`text-2xl font-extrabold ${bmiInfo.color}`}>{preview.bmi}</span>
                    <span className={`text-sm font-medium pb-0.5 ${bmiInfo.color}`}>{bmiInfo.label}</span>
                  </div>
                  {(preview.bmi < 18.5 || preview.bmi >= 30) && (
                    <p className="text-xs text-brand-amber mt-2 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Consider consulting a healthcare professional
                    </p>
                  )}
                </div>
                <div className="rounded-xl border border-brand-teal/20 bg-brand-teal/5 p-4">
                  <p className="text-xs text-gray-500 mb-1">Estimated Daily Target</p>
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-extrabold text-brand-teal">{preview.calories.toLocaleString()}</span>
                    <span className="text-sm text-gray-400 pb-0.5">kcal/day</span>
                  </div>
                  {preview.wasFloored && (
                    <p className="text-xs text-brand-amber mt-2 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Raised to minimum safe level
                    </p>
                  )}
                  <p className="text-xs text-gray-600 mt-1">Updates with activity &amp; goal in later steps</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3 — Lifestyle */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="activityLevel" className="text-gray-300 text-sm">Activity Level</Label>
                <select id="activityLevel" {...register("activityLevel")} className={selectClass}>
                  {Object.entries(ACTIVITY_LEVEL_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cookingAbility" className="text-gray-300 text-sm">Cooking Ability</Label>
                <select id="cookingAbility" {...register("cookingAbility")} className={selectClass}>
                  {Object.entries(COOKING_ABILITY_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mealsPerDay" className="text-gray-300 text-sm">Meals Per Day (3–6)</Label>
                <Input
                  id="mealsPerDay"
                  type="number"
                  min={3}
                  max={6}
                  {...register("mealsPerDay", { valueAsNumber: true })}
                  className={fieldClass}
                />
                {errors.mealsPerDay && (
                  <p className={errorClass}><X className="w-3 h-3" />{errors.mealsPerDay.message}</p>
                )}
              </div>
            </div>

            {/* Updated calorie target based on activity */}
            {preview && (
              <div className="rounded-xl border border-brand-teal/20 bg-brand-teal/5 p-4 flex items-center gap-3">
                <Flame className="w-5 h-5 text-brand-amber flex-shrink-0" />
                <div>
                  <p className="text-white font-semibold text-sm">
                    Updated Target:{" "}
                    <span className="text-brand-teal">{preview.calories.toLocaleString()} kcal/day</span>
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Based on your body metrics, activity level, and {fitnessGoal?.replace(/_/g, " ").toLowerCase()} goal
                  </p>
                  {preview.wasFloored && (
                    <p className="text-xs text-brand-amber mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Raised to minimum safe level
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4 — Dietary Preferences */}
        {step === 4 && (
          <div className="space-y-5">
            {/* Health disclaimer — shown here because dietary restrictions are health-critical */}
            <div className="flex gap-3 p-4 rounded-xl border border-brand-amber/30 bg-brand-amber/5">
              <AlertTriangle className="w-5 h-5 text-brand-amber flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-gray-300 leading-relaxed">
                <span className="font-semibold text-brand-amber">Health Notice: </span>
                This tool provides AI-generated nutritional guidance for general wellness only. It is
                not a substitute for professional medical or dietary advice. If you have medical
                conditions, eating disorders, or are pregnant, consult a registered dietitian before
                following any meal plan.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="dietaryPreference" className="text-gray-300 text-sm">Dietary Preference</Label>
                <select id="dietaryPreference" {...register("dietaryPreference")} className={selectClass}>
                  {Object.entries(DIETARY_PREFERENCE_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cuisinePreference" className="text-gray-300 text-sm">Cuisine Preference</Label>
                <select id="cuisinePreference" {...register("cuisinePreference")} className={selectClass}>
                  {Object.entries(CUISINE_PREFERENCE_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Allergy tag input */}
            <div className="space-y-2">
              <Label className="text-gray-300 text-sm">
                Allergies & Intolerances{" "}
                <span className="text-gray-600 font-normal">(optional — strictly excluded from every meal)</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  onKeyDown={handleAllergyKeyDown}
                  placeholder="e.g. peanuts, gluten, dairy — press Enter to add"
                  className={fieldClass}
                  aria-label="Add allergy or intolerance"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAllergy}
                  disabled={!allergyInput.trim()}
                  className="h-11 px-3 border-brand-teal/30 text-brand-teal hover:bg-brand-teal/10 rounded-xl"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {(allergies ?? []).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {(allergies ?? []).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 border border-red-500/30 text-red-300"
                    >
                      <AlertTriangle className="w-3 h-3" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeAllergy(tag)}
                        className="ml-0.5 hover:text-white transition-colors"
                        aria-label={`Remove ${tag}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {(allergies ?? []).length > 0 && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {(allergies ?? []).length} allergen(s) will be strictly excluded. Verify accuracy.
                </p>
              )}
            </div>
          </div>
        )}

        {/* STEP 5 — Budget */}
        {step === 5 && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="dailyBudget" className="text-gray-300 text-sm">Daily Food Budget</Label>
                <div className="flex gap-2">
                  <Input
                    id="dailyBudget"
                    type="number"
                    step="1"
                    min={1}
                    placeholder="e.g. 500"
                    {...register("dailyBudget", { valueAsNumber: true })}
                    className={`${fieldClass} flex-1`}
                  />
                  <select
                    {...register("budgetCurrency")}
                    className="h-11 w-28 rounded-xl border border-white/10 bg-[#1e1f21] px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-teal/50 [&>option]:bg-[#1e1f21] [&>option]:text-white"
                  >
                    <option value="INR">INR ₹</option>
                    <option value="USD">USD $</option>
                  </select>
                </div>
                {errors.dailyBudget && (
                  <p className={errorClass}><X className="w-3 h-3" />{errors.dailyBudget.message}</p>
                )}
              </div>
              <div className="flex items-end pb-1">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Total daily meal cost will stay within your budget. A 10% tolerance is allowed for rounding.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6 — Review & Generate */}
        {step === 6 && (
          <div className="space-y-5">
            <p className="text-gray-400 text-sm">
              Review every detail below before generating. Once confirmed, the AI will create your personalised meal plan.
            </p>

            {/* Summary table */}
            <div className="space-y-2">
              {[
                { label: "Plan Type", value: PLAN_TYPE_LABELS[planType] ?? planType },
                { label: "Fitness Goal", value: FITNESS_GOAL_LABELS[fitnessGoal] ?? fitnessGoal },
                { label: "Gender", value: GENDER_LABELS[gender] ?? gender },
                { label: "Age", value: age ? `${age} years` : "—" },
                { label: "Weight", value: weightKg ? `${weightKg} kg` : "—" },
                { label: "Height", value: heightCm ? `${heightCm} cm` : "—" },
                { label: "Activity Level", value: ACTIVITY_LEVEL_LABELS[activityLevel] ?? activityLevel },
                { label: "Cooking Ability", value: COOKING_ABILITY_LABELS[cookingAbility] ?? cookingAbility },
                { label: "Meals Per Day", value: mealsPerDay ? `${mealsPerDay} meals` : "—" },
                { label: "Dietary Preference", value: DIETARY_PREFERENCE_LABELS[dietaryPreference] ?? dietaryPreference },
                { label: "Cuisine", value: CUISINE_PREFERENCE_LABELS[cuisinePreference] ?? cuisinePreference },
                {
                  label: "Allergies",
                  value: (allergies ?? []).length > 0
                    ? (allergies ?? []).join(", ")
                    : "None",
                  highlight: (allergies ?? []).length > 0 ? "text-red-400" : undefined,
                },
                { label: "Daily Budget", value: dailyBudget ? `${budgetCurrency} ${dailyBudget}` : "—" },
              ].map(({ label, value, highlight }) => (
                <div key={label} className="flex items-start justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="text-gray-500 text-sm">{label}</span>
                  <span className={`text-sm font-medium text-right max-w-[60%] ${highlight ?? "text-white"}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Calorie target highlight */}
            {preview && (
              <div className="rounded-xl border border-brand-teal/20 bg-brand-teal/5 p-4 flex items-center gap-3">
                <Flame className="w-5 h-5 text-brand-amber flex-shrink-0" />
                <div>
                  <p className="text-white font-semibold text-sm">
                    Daily Calorie Target:{" "}
                    <span className="text-brand-teal">{preview.calories.toLocaleString()} kcal</span>
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    This value is final. The AI will build every meal around this target.
                  </p>
                </div>
              </div>
            )}

            {/* Final medical reminder */}
            <div className="flex gap-3 p-3 rounded-xl border border-white/8 bg-white/3">
              <CheckCircle2 className="w-4 h-4 text-brand-teal flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-500 leading-relaxed">
                By generating this plan you confirm that you have reviewed the details above and
                understand that AI-generated nutrition guidance is for general wellness only, not
                a substitute for professional medical advice.
              </p>
            </div>

            {/* API error */}
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/5 p-4">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={step === 1}
          className="flex items-center gap-2 border-white/10 text-gray-400 hover:text-white hover:border-white/20 rounded-xl disabled:opacity-30"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        {step < TOTAL_STEPS ? (
          <Button
            type="button"
            onClick={nextStep}
            className="flex items-center gap-2 bg-brand-teal hover:bg-brand-teal-dim text-white font-semibold rounded-xl px-6 transition-all"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={isGenerating}
            className="flex items-center gap-2 h-12 px-8 rounded-xl bg-gradient-to-r from-brand-amber to-brand-amber-light text-brand-navy font-bold text-sm hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,179,71,0.35)] transition-all duration-300 disabled:opacity-60 disabled:scale-100"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating your meal plan...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Meal Plan
              </>
            )}
          </Button>
        )}
      </div>

      <p className="text-center text-xs text-gray-600">
        Generation uses Groq / LLaMA 3.3-70B. Results are for informational purposes only.
        Always verify with a qualified healthcare professional.
      </p>
    </form>
  );
}
