"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { onboardingSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Activity,
  Utensils,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  X,
  Plus,
} from "lucide-react";
import {
  GENDER_LABELS,
  ACTIVITY_LEVEL_LABELS,
  FITNESS_GOAL_LABELS,
  DIETARY_PREFERENCE_LABELS,
} from "@/constants";

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const fieldClass =
  "flex h-11 w-full rounded-xl border border-white/10 bg-[#1e1f21] px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-teal/50 focus:border-brand-teal/60 transition-all duration-200 [&>option]:bg-[#1e1f21] [&>option]:text-white";

const errorClass = "text-xs text-red-400 mt-1 flex items-center gap-1";

const STEPS = [
  {
    number: 1,
    icon: User,
    title: "Body Metrics",
    description: "Needed to accurately calculate your BMR and daily calorie target",
  },
  {
    number: 2,
    icon: Activity,
    title: "Activity & Goal",
    description: "Sets your TDEE multiplier and calorie adjustment direction",
  },
  {
    number: 3,
    icon: Utensils,
    title: "Dietary Preferences",
    description: "Every meal plan will strictly follow these restrictions",
  },
];

export function OnboardingForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [allergyInput, setAllergyInput] = useState("");
  const totalSteps = 3;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    setValue,
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      gender: "MALE",
      activityLevel: "MODERATELY_ACTIVE",
      fitnessGoal: "MAINTENANCE",
      dietaryPreference: "NON_VEG",
    },
  });

  const allergies = watch("allergies");

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error ?? "Failed to save profile");
      }

      toast.success("Profile created! Your daily calories have been calculated.");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    let fields: (keyof OnboardingFormData)[] = [];

    if (step === 1) {
      fields = ["gender", "age", "heightCm", "weightKg"];
    } else if (step === 2) {
      fields = ["activityLevel", "fitnessGoal"];
    }

    const valid = await trigger(fields);
    if (valid) setStep((s) => Math.min(s + 1, totalSteps));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleAllergyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const trimmed = allergyInput.trim().replace(/,/g, "");
      if (trimmed && !(allergies ?? []).includes(trimmed)) {
        setValue("allergies", [...(allergies ?? []), trimmed]);
      }
      setAllergyInput("");
    }
  };

  const addAllergy = () => {
    const trimmed = allergyInput.trim().replace(/,/g, "");
    if (trimmed && !(allergies ?? []).includes(trimmed)) {
      setValue("allergies", [...(allergies ?? []), trimmed]);
    }
    setAllergyInput("");
  };

  const removeAllergy = (tag: string) => {
    setValue(
      "allergies",
      (allergies ?? []).filter((a) => a !== tag)
    );
  };

  const currentStepMeta = STEPS[step - 1];
  const StepIcon = currentStepMeta.icon;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      // Prevent any Enter keypress from submitting the form — the user must
      // explicitly click "Next" or "Complete Setup".
      onKeyDown={(e) => {
        if (
          e.key === "Enter" &&
          (e.target as HTMLElement).tagName !== "BUTTON"
        ) {
          e.preventDefault();
        }
      }}
      className="space-y-6"
    >
      {/* Step indicator */}
      <div className="space-y-3">
        {/* Step dots */}
        <div className="flex items-center gap-2">
          {STEPS.map((s) => (
            <div key={s.number} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  s.number < step
                    ? "bg-brand-teal text-white"
                    : s.number === step
                    ? "bg-brand-teal/20 border-2 border-brand-teal text-brand-teal"
                    : "bg-white/5 border border-white/10 text-gray-600"
                }`}
              >
                {s.number < step ? "✓" : s.number}
              </div>
              {s.number < totalSteps && (
                <div
                  className={`h-px flex-1 min-w-[32px] transition-all duration-300 ${
                    s.number < step ? "bg-brand-teal" : "bg-white/10"
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
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
        {/* Step label */}
        <div className="flex items-center gap-2">
          <StepIcon className="w-4 h-4 text-brand-teal" aria-hidden="true" />
          <div>
            <p className="text-white text-sm font-semibold">
              Step {step} of {totalSteps}: {currentStepMeta.title}
            </p>
            <p className="text-gray-500 text-xs">{currentStepMeta.description}</p>
          </div>
        </div>
      </div>

      {/* ── Step 1: Body Metrics ── */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="gender" className="text-gray-300 text-sm">
              Biological Sex
            </Label>
            <select id="gender" {...register("gender")} className={fieldClass}>
              {Object.entries(GENDER_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-600">
              Used in the Mifflin-St Jeor BMR formula
            </p>
            {errors.gender && (
              <p className={errorClass}>
                <X className="w-3 h-3" />
                {errors.gender.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="age" className="text-gray-300 text-sm">
              Age (years)
            </Label>
            <Input
              id="age"
              type="number"
              min={13}
              max={100}
              placeholder="e.g. 25"
              {...register("age", { valueAsNumber: true })}
              className={fieldClass}
            />
            {errors.age && (
              <p className={errorClass}>
                <X className="w-3 h-3" />
                {errors.age.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="heightCm" className="text-gray-300 text-sm">
                Height (cm)
              </Label>
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
                <p className={errorClass}>
                  <X className="w-3 h-3" />
                  {errors.heightCm.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="weightKg" className="text-gray-300 text-sm">
                Weight (kg)
              </Label>
              <Input
                id="weightKg"
                type="number"
                step="0.1"
                min={30}
                max={300}
                placeholder="e.g. 70"
                {...register("weightKg", { valueAsNumber: true })}
                className={fieldClass}
              />
              {errors.weightKg && (
                <p className={errorClass}>
                  <X className="w-3 h-3" />
                  {errors.weightKg.message}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Activity & Goal ── */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="activityLevel" className="text-gray-300 text-sm">
              Activity Level
            </Label>
            <select
              id="activityLevel"
              {...register("activityLevel")}
              className={fieldClass}
            >
              {Object.entries(ACTIVITY_LEVEL_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-600">
              This multiplies your BMR to get your Total Daily Energy Expenditure
            </p>
            {errors.activityLevel && (
              <p className={errorClass}>
                <X className="w-3 h-3" />
                {errors.activityLevel.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fitnessGoal" className="text-gray-300 text-sm">
              Fitness Goal
            </Label>
            <select
              id="fitnessGoal"
              {...register("fitnessGoal")}
              className={fieldClass}
            >
              {Object.entries(FITNESS_GOAL_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-600">
              Adjusts your calorie target: Fat Loss 80% · Maintenance 100% ·
              Muscle Gain 115%
            </p>
            {errors.fitnessGoal && (
              <p className={errorClass}>
                <X className="w-3 h-3" />
                {errors.fitnessGoal.message}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Step 3: Dietary Preferences ── */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="dietaryPreference" className="text-gray-300 text-sm">
              Dietary Preference
            </Label>
            <select
              id="dietaryPreference"
              {...register("dietaryPreference")}
              className={fieldClass}
            >
              {Object.entries(DIETARY_PREFERENCE_LABELS).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                )
              )}
            </select>
            {errors.dietaryPreference && (
              <p className={errorClass}>
                <X className="w-3 h-3" />
                {errors.dietaryPreference.message}
              </p>
            )}
          </div>

          {/* Allergy tag input */}
          <div className="space-y-2">
            <Label className="text-gray-300 text-sm">
              Allergies & Intolerances{" "}
              <span className="text-gray-600 font-normal">
                (optional — strictly excluded from all meals)
              </span>
            </Label>
            <div className="flex gap-2">
              <Input
                value={allergyInput}
                onChange={(e) => setAllergyInput(e.target.value)}
                onKeyDown={handleAllergyKeyDown}
                placeholder="e.g. peanuts, gluten — press Enter to add"
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
                aria-label="Add allergy tag"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>
            {(allergies ?? []).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {(allergies ?? []).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 border border-red-500/30 text-red-300"
                  >
                    <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeAllergy(tag)}
                      className="ml-0.5 hover:text-white transition-colors"
                      aria-label={`Remove ${tag} allergy`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {(allergies ?? []).length > 0 && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                {(allergies ?? []).length} allergen(s) will be strictly
                excluded. Double-check for accuracy.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-2">
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

        {step < totalSteps ? (
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
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-gradient-to-r from-brand-teal to-brand-purple-light text-white font-bold rounded-xl px-6 hover:scale-[1.02] transition-all duration-200 disabled:opacity-60 disabled:scale-100"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Complete Setup
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </form>
  );
}
