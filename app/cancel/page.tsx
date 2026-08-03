import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function CancelPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 px-6 py-20">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 text-3xl font-bold">
            ×
          </div>

          <p className="mt-8 text-sm uppercase tracking-[0.3em] text-zinc-500">
            Plata a fost anulată
          </p>

          <h1 className="mt-4 text-4xl font-black md:text-5xl">
            Comanda nu a fost plătită
          </h1>

          <p className="mx-auto mt-6 max-w-xl leading-7 text-zinc-400">
            Nu s-au retras bani. Produsul a rămas în coș și poți încerca din
            nou sau poți alege plata ramburs.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/checkout"
              className="rounded-2xl bg-white px-8 py-4 font-bold text-black transition hover:bg-zinc-200"
            >
              Încearcă din nou
            </Link>

            <Link
              href="/cos"
              className="rounded-2xl border border-zinc-700 px-8 py-4 font-semibold transition hover:border-white"
            >
              Înapoi la coș
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}