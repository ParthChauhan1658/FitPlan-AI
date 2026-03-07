/**
 * Cinematic full-bleed background for each page.
 * Images live in /public/backgrounds/*.png
 * Copy source: Visionary-Canvas/client/public/backgrounds/
 */

interface PageBackgroundProps {
  image: string;
  /** How much the brand-navy overlay darkens the background image */
  overlay?: "light" | "default" | "heavy";
}

const OVERLAY: Record<NonNullable<PageBackgroundProps["overlay"]>, string> = {
  light:   "bg-brand-navy/55",
  default: "bg-brand-navy/72",
  heavy:   "bg-brand-navy/84",
};

export function PageBackground({ image, overlay = "default" }: PageBackgroundProps) {
  return (
    <>
      {/* Background image layer */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/backgrounds/${image}')` }}
        aria-hidden="true"
      />
      {/* Dark overlay so content stays legible */}
      <div
        className={`fixed inset-0 z-0 ${OVERLAY[overlay]}`}
        aria-hidden="true"
      />
    </>
  );
}
