// This file is loaded client-side only (via dynamic import with ssr: false)
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import type { DailyPlan, GroceryItem, Meal, FoodItem } from "@/types";

export interface MealPlanPDFData {
  logoUrl?: string;
  id: string;
  planType: string;
  fitnessGoal: string;
  dietaryPreference: string;
  targetCalories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  totalDailyCost: number;
  budgetCurrency: string;
  createdAt: string;
  meals: DailyPlan[];
  groceryList: GroceryItem[];
}

const C = {
  coral: "#FF6044",
  amber: "#FFB347",
  white: "#ffffff",
  offWhite: "#f8f8f8",
  lightGray: "#9CA3AF",
  gray: "#6B7280",
  darkGray: "#374151",
  dark: "#1a1a1a",
  border: "#E5E7EB",
  coralFaint: "#FFF3F1",
  tealFaint: "#F0FFF8",
};

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: C.dark,
    backgroundColor: C.white,
    padding: 40,
    lineHeight: 1.5,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: C.coral,
    paddingBottom: 12,
    marginBottom: 16,
  },
  logoImg: {
    width: 36,
    height: 36,
    marginRight: 8,
  },
  logoText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 18,
    color: C.coral,
  },
  logoSub: {
    fontSize: 8,
    color: C.gray,
    marginTop: 2,
  },
  headerDate: {
    fontSize: 8,
    color: C.lightGray,
    textAlign: "right",
  },

  // Summary bar
  summaryRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: C.offWhite,
    borderRadius: 6,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: C.coral,
  },
  summaryLabel: {
    fontSize: 7,
    color: C.gray,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  summaryValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 13,
    color: C.dark,
  },
  summaryUnit: {
    fontSize: 8,
    color: C.gray,
    marginTop: 1,
  },

  // Macro row
  macroRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  macroBox: {
    flex: 1,
    backgroundColor: C.offWhite,
    borderRadius: 6,
    padding: 8,
    alignItems: "center",
  },
  macroLabel: {
    fontSize: 7,
    color: C.gray,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  macroValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: C.dark,
  },
  macroUnit: {
    fontSize: 7,
    color: C.lightGray,
  },

  // Section heading
  sectionHeading: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: C.dark,
    marginBottom: 10,
    marginTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingBottom: 4,
  },

  // Day header
  dayHeader: {
    backgroundColor: C.coral,
    borderRadius: 5,
    padding: "7 12",
    marginBottom: 8,
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dayTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: C.white,
  },
  dayCalories: {
    fontSize: 8,
    color: "rgba(255,255,255,0.85)",
  },

  // Meal
  mealBlock: {
    marginBottom: 10,
    paddingLeft: 14,
    borderLeftWidth: 2,
    borderLeftColor: C.border,
  },
  mealName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: C.dark,
    marginBottom: 2,
  },
  mealMeta: {
    fontSize: 8,
    color: C.gray,
    marginBottom: 5,
  },
  foodItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
    paddingLeft: 8,
  },
  foodItemName: {
    fontSize: 8,
    color: C.darkGray,
    flex: 1,
  },
  foodItemCal: {
    fontSize: 8,
    color: C.lightGray,
    textAlign: "right",
  },
  instructions: {
    fontSize: 7.5,
    color: C.lightGray,
    fontFamily: "Helvetica-Oblique",
    marginTop: 4,
    paddingLeft: 8,
  },

  // Grocery
  groceryCategory: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: C.coral,
    marginTop: 10,
    marginBottom: 4,
  },
  groceryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
    paddingLeft: 10,
  },
  groceryName: {
    fontSize: 8.5,
    color: C.darkGray,
    flex: 1,
  },
  groceryCost: {
    fontSize: 8.5,
    color: C.lightGray,
    textAlign: "right",
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 6,
  },
  footerText: {
    fontSize: 7.5,
    color: C.lightGray,
  },
});

export function MealPlanDocument({ plan }: { plan: MealPlanPDFData }) {
  const formattedDate = new Date(plan.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const goalLabel = plan.fitnessGoal.replace(/_/g, " ");
  const dietLabel = plan.dietaryPreference.replace(/_/g, " ");

  // Group grocery by category
  const grouped: Record<string, GroceryItem[]> = {};
  for (const item of plan.groceryList) {
    const cat = item.category ?? "Other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  }

  return (
    <Document
      title={`FitPlan AI — Meal Plan`}
      author="FitPlan AI"
      creator="FitPlan AI"
    >
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {plan.logoUrl && (
              <Image src={plan.logoUrl} style={s.logoImg} />
            )}
            <View>
              <Text style={s.logoText}>FitPlan AI</Text>
              <Text style={s.logoSub}>Personalised Meal Plan</Text>
            </View>
          </View>
          <View>
            <Text style={s.headerDate}>Generated: {formattedDate}</Text>
            <Text style={[s.headerDate, { marginTop: 2 }]}>
              Goal: {goalLabel} · {dietLabel}
            </Text>
          </View>
        </View>

        {/* Summary boxes */}
        <View style={s.summaryRow}>
          <View style={s.summaryBox}>
            <Text style={s.summaryLabel}>Daily Target</Text>
            <Text style={s.summaryValue}>{plan.targetCalories.toLocaleString()}</Text>
            <Text style={s.summaryUnit}>kcal/day</Text>
          </View>
          <View style={[s.summaryBox, { borderLeftColor: C.amber }]}>
            <Text style={s.summaryLabel}>Daily Cost</Text>
            <Text style={s.summaryValue}>{plan.totalDailyCost.toFixed(0)}</Text>
            <Text style={s.summaryUnit}>{plan.budgetCurrency}/day</Text>
          </View>
          <View style={[s.summaryBox, { borderLeftColor: "#3DD68C" }]}>
            <Text style={s.summaryLabel}>Plan Type</Text>
            <Text style={[s.summaryValue, { fontSize: 10 }]}>{plan.planType}</Text>
            <Text style={s.summaryUnit}>{plan.meals.length} day(s)</Text>
          </View>
        </View>

        {/* Macros */}
        <View style={s.macroRow}>
          {[
            { label: "Protein", value: plan.proteinGrams, unit: "g" },
            { label: "Carbs", value: plan.carbGrams, unit: "g" },
            { label: "Fat", value: plan.fatGrams, unit: "g" },
          ].map(({ label, value, unit }) => (
            <View key={label} style={s.macroBox}>
              <Text style={s.macroLabel}>{label}</Text>
              <Text style={s.macroValue}>{value}</Text>
              <Text style={s.macroUnit}>{unit}/day</Text>
            </View>
          ))}
        </View>

        {/* Meals by day */}
        <Text style={s.sectionHeading}>Meal Plan</Text>

        {plan.meals.map((day: DailyPlan) => (
          <View key={day.day}>
            <View style={s.dayHeader}>
              <Text style={s.dayTitle}>Day {day.day}: {day.dayName}</Text>
              <Text style={s.dayCalories}>{day.totalCalories.toLocaleString()} kcal · {plan.budgetCurrency} {day.totalCost.toFixed(0)}</Text>
            </View>

            {(day.meals as Meal[]).map((meal, mIdx) => (
              <View key={mIdx} style={s.mealBlock}>
                <Text style={s.mealName}>{meal.name}</Text>
                <Text style={s.mealMeta}>
                  {meal.totalCalories} kcal · P: {meal.totalProtein}g · C: {meal.totalCarbs}g · F: {meal.totalFat}g · Est. {plan.budgetCurrency} {meal.estimatedCost}
                </Text>
                {(meal.foodItems as FoodItem[]).map((item, iIdx) => (
                  <View key={iIdx} style={s.foodItemRow}>
                    <Text style={s.foodItemName}>• {item.name} — {item.quantity}</Text>
                    <Text style={s.foodItemCal}>{item.calories} kcal</Text>
                  </View>
                ))}
                {meal.cookingInstructions && (
                  <Text style={s.instructions}>{meal.cookingInstructions}</Text>
                )}
              </View>
            ))}
          </View>
        ))}

        {/* Grocery list — new page */}
        <View break>
          <Text style={s.sectionHeading}>Grocery List</Text>
          {Object.entries(grouped).map(([category, items]) => (
            <View key={category}>
              <Text style={s.groceryCategory}>{category}</Text>
              {items.map((item, idx) => (
                <View key={idx} style={s.groceryRow}>
                  <Text style={s.groceryName}>• {item.name} — {item.quantity}</Text>
                  <Text style={s.groceryCost}>{plan.budgetCurrency} {item.estimatedCost}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>FitPlan AI · AI-generated meal plan · Not medical advice</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
