"use client";

// Loaded only client-side (dynamic import with ssr:false in meal plan page)
import { PDFDownloadLink } from "@react-pdf/renderer";
import { MealPlanDocument, type MealPlanPDFData } from "./MealPlanPDF";
import { Download } from "lucide-react";

export function MealPlanPDFButton({ plan }: { plan: MealPlanPDFData }) {
  // Construct absolute URL for the monochrome logo so react-pdf can fetch it
  const logoUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/logo/fitplan-logo-light.png`
      : undefined;

  return (
    <PDFDownloadLink
      document={<MealPlanDocument plan={{ ...plan, logoUrl }} />}
      fileName={`fitplan-${plan.id}.pdf`}
    >
      {({ loading, error }) => (
        <button
          disabled={loading}
          title={error ? "PDF generation failed" : undefined}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-brand-teal/25 bg-brand-teal/8 text-brand-teal hover:bg-brand-teal/15 transition-all disabled:opacity-60 disabled:cursor-wait"
        >
          <Download className="w-3.5 h-3.5" />
          {loading ? "Preparing..." : error ? "PDF Error" : "PDF"}
        </button>
      )}
    </PDFDownloadLink>
  );
}
