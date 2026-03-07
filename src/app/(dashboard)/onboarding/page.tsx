import Image from "next/image";
import { OnboardingForm } from "@/components/forms/onboarding-form";
import { PageBackground } from "@/components/shared/PageBackground";

export default function OnboardingPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <PageBackground image="onboarding-bg.png" overlay="default" />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-lg animate-fade-in-up"
      >
        <div
          className="glass-card rounded-3xl p-8 md:p-10"
          style={{
            boxShadow:
              "0 0 0 1px rgba(255,96,68,0.20), 0 20px 60px rgba(255,96,68,0.08)",
          }}
        >
          {/* Logo + Title */}
          <div className="text-center mb-7">
            <div className="flex justify-center mb-4">
              <Image
                src="/logo/fitplan-logo-full.png"
                alt="FitPlan AI"
                width={200}
                height={50}
                className="h-10 w-auto object-contain"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Complete Your Profile
            </h1>
            <p className="text-gray-400 text-sm">
              We&apos;ll calculate your personalised calorie and macro targets.
            </p>
          </div>

          <OnboardingForm />
        </div>
      </div>
    </div>
  );
}
