import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import SuccessContent from "./SuccessContent";

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black text-white">
          <Navbar />

          <section className="mx-auto max-w-3xl px-6 py-24 text-center">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 px-6 py-20">
              <p className="text-zinc-400">
                Se încarcă detaliile comenzii...
              </p>
            </div>
          </section>
        </main>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}