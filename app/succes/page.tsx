"use client";

import { useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function SuccessPage() {
  useEffect(() => {
    localStorage.removeItem("void-market-cart");
    window.dispatchEvent(new Event("cart-updated"));
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 px-6 py-20">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-3xl font-bold text-black">
            ✓
          </div>

          <p className="mt-8 text-sm uppercase tracking-[0.3em] text-green-400">
            Plată reușită
          </p>

          <h1 className="mt-4 text-4xl font-black md:text-5xl">
            Comanda a fost plătită
          </h1>

          <p className="mx-auto mt-6 max-w-xl leading-7 text-zinc-400">
            Plata cu cardul a fost finalizată. Vom verifica plata și te vom
            contacta pentru confirmarea livrării.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/"
              className="rounded-2xl bg-white px-8 py-4 font-bold text-black transition hover:bg-zinc-200"
            >
              Pagina principală
            </Link>

            <a
              href="mailto:voidmarket.ro@gmail.com"
              className="rounded-2xl border border-zinc-700 px-8 py-4 font-semibold transition hover:border-white"
            >
              Contactează-ne
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}