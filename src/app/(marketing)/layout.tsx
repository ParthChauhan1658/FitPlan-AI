import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { Footer } from "@/components/marketing/Footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <MarketingHeader />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}
