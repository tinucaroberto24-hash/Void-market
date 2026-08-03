"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";

export default function ProductPage() {
  const images = ["/lv/front.jpeg", "/lv/back.jpeg"];

  const [selectedImage, setSelectedImage] = useState(images[0]);
  const [favorite, setFavorite] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-16 lg:grid-cols-2">
          {/* GALERIE FOTO */}
          <div>
            <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
              <img
                src={selectedImage}
                alt="Louis Vuitton LV Sweatshirt"
                className="h-[700px] w-full object-contain"
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              {images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setSelectedImage(image)}
                  className={`overflow-hidden rounded-2xl border-2 transition ${
                    selectedImage === image
                      ? "border-white"
                      : "border-zinc-800 hover:border-zinc-600"
                  }`}
                >
                  <img
                    src={image}
                    alt={
                      index === 0
                        ? "Fața produsului"
                        : "Spatele produsului"
                    }
                    className="h-44 w-full bg-zinc-950 object-contain"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* DETALII PRODUS */}
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
              Louis Vuitton
            </p>

            <h1 className="mt-3 text-5xl font-black">
              LV Sweatshirt
            </h1>

            <p className="mt-8 text-4xl font-bold">
              250 Lei
            </p>

            <div className="mt-6 flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-green-500" />

              <div>
                <p className="font-semibold">
                  În stoc
                </p>

                <p className="text-sm text-zinc-500">
                  Expediere în 24–48 ore
                </p>
              </div>
            </div>

            {/* DESCRIERE */}
            <div className="mt-10">
              <h2 className="mb-6 text-2xl font-bold">
                Descriere
              </h2>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                <h3 className="mb-6 text-xl font-semibold">
                  Louis Vuitton LV Sweater
                </h3>

                <div className="space-y-4 text-zinc-300">
                  <p>• Mărime: S</p>
                  <p>• Stare: Foarte bună</p>
                  <p>• Fără defecte</p>
                  <p>• Exact ca în fotografii</p>
                  <p>• Livrare rapidă</p>
                </div>
              </div>
            </div>

            {/* BUTOANE */}
            <div className="mt-10 flex gap-4">
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="flex-1 rounded-2xl bg-white py-4 text-lg font-bold text-black transition hover:bg-zinc-200"
              >
                Adaugă în coș
              </button>

              <button
                type="button"
                aria-label="Adaugă la favorite"
                onClick={() => setFavorite(!favorite)}
                className={`w-16 rounded-2xl border text-2xl transition ${
                  favorite
                    ? "border-red-500 bg-red-500"
                    : "border-zinc-700 hover:border-white"
                }`}
              >
                ♥
              </button>
            </div>

            {/* TOTAL */}
            <div className="mt-10 border-t border-zinc-800 pt-8">
              <div className="flex justify-between py-3">
                <span className="text-zinc-500">
                  Transport
                </span>

                <span>20 Lei</span>
              </div>

              <div className="flex justify-between py-3">
                <span className="text-zinc-500">
                  Expediere
                </span>

                <span>24–48 ore</span>
              </div>

              <div className="mt-4 flex justify-between border-t border-zinc-800 pt-5 text-2xl font-bold">
                <span>Total</span>
                <span>270 Lei</span>
              </div>
            </div>
          </div>
        </div>

        {/* PRODUSE SIMILARE */}
        <section className="mt-28">
          <h2 className="mb-10 text-3xl font-bold">
            Produse similare
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
              >
                <div className="h-64 rounded-2xl bg-zinc-800" />

                <h3 className="mt-6 text-xl font-bold">
                  Produs nou în curând
                </h3>

                <p className="mt-2 text-zinc-500">
                  Urmărește magazinul pentru următoarele produse.
                </p>
              </div>
            ))}
          </div>
        </section>
      </section>

      {/* MENIU COȘ */}
      {cartOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Închide coșul"
            onClick={() => setCartOpen(false)}
            className="absolute inset-0 bg-black/70"
          />

          <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-5">
              <h2 className="text-2xl font-bold">
                Coșul tău
              </h2>

              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="h-10 w-10 rounded-full border border-zinc-700 text-xl transition hover:border-white"
              >
                ×
              </button>
            </div>

            <div className="mt-6 flex gap-4 border-b border-zinc-800 pb-6">
              <img
                src="/lv/front.jpeg"
                alt="Louis Vuitton LV Sweater"
                className="h-28 w-28 rounded-2xl bg-zinc-900 object-contain"
              />

              <div className="flex-1">
                <h3 className="font-bold">
                  Louis Vuitton LV Sweater
                </h3>

                <p className="mt-2 text-sm text-zinc-400">
                  Mărime: S
                </p>

                <p className="mt-4 text-xl font-bold">
                  250 Lei
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span>250 Lei</span>
              </div>

              <div className="flex justify-between text-zinc-400">
                <span>Transport</span>
                <span>20 Lei</span>
              </div>

              <div className="flex justify-between border-t border-zinc-800 pt-5 text-2xl font-bold">
                <span>Total</span>
                <span>270 Lei</span>
              </div>
            </div>

            <div className="mt-auto pt-8">
              <button
                type="button"
                className="w-full rounded-2xl bg-white py-4 text-lg font-bold text-black transition hover:bg-zinc-200"
              >
                Continuă spre comandă
              </button>

              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="mt-3 w-full rounded-2xl border border-zinc-700 py-4 font-semibold transition hover:border-white"
              >
                Continuă cumpărăturile
              </button>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}