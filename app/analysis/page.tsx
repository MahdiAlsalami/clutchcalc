import { Suspense } from "react";
import AnalysisClient from "./AnalysisClient";


export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-xl font-semibold text-indigo-400">
          Analyzing your pick...
        </div>
      }
    >
      <AnalysisClient />
    </Suspense>
  );
}
