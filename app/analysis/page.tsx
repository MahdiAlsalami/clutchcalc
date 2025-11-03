import { Suspense } from "react";
import AnalysisClient from "./AnalysisClient";

// make sure this page is NEVER prerendered
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

function Fallback() {
  return (
    <div className="min-h-screen flex items-center justify-center text-xl font-semibold text-indigo-400">
      Analyzing your pick...
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Fallback />}>
      <AnalysisClient />
    </Suspense>
  );
}
