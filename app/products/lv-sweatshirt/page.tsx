"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";

export default function ProductPage() {
  const images = [
    "/lv/front.jpeg",
    "/lv/back.jpeg",
  ];

  const [selectedImage, setSelectedImage] = useState(images[0]);
  const [favorite, setFavorite] = useState(false);

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="max-w-7xl mx-auto px-6 py-12">

        <div className="grid lg:grid-cols-2 gap-16">

          {/* GALERIE FOTO */}

          <div>

            <div className="rounded-3xl bg-zinc-950 border border-zinc-800 overflow-hidden">

              <img
                src={selectedImage}
                alt="Louis Vuitton LV Sweatshirt"
                className="w-full h-[700px] object-contain"
              />

            </div>

            <div className="grid grid-cols-2 gap-4 mt-5">

              {images.map((image) => (

                <button
                  key={image}
                  onClick={() => setSelectedImage(image)}
                  className={`rounded-2xl overflow-hidden border-2 transition ${
                    selectedImage === image
                      ? "border-white"
                      : "border-zinc-800"
                  }`}
                >

                  <img
                    src={image}
                    className="w-full h-44 object-contain bg-zinc-950"
                    alt=""
                  />

                </button>

              ))}

            </div>

          </div>

          {/* DETALII PRODUS */}

          <div>

            <p className="uppercase tracking-[0.3em] text-zinc-500 text-sm">
              Louis Vuitton
            </p>

            <h1 className="text-5xl font-black mt-3">
              LV Sweatshirt
            </h1>

            <p className="text-4xl font-bold mt-8">
              250 Lei
            </p>

            <div className="flex items-center gap-3 mt-6">

              <span className="w-3 h-3 rounded-full bg-green-500"></span>

              <div>

                <p className="font-semibold">
                  În stoc
                </p>

                <p className="text-zinc-500 text-sm">
                  Expediere în 24-48 ore
                </p>

              </div>

            </div>

            <div className="mt-10">

              <h2 className="text-2xl font-bold mb-6">
                Descriere
              </h2>

              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">

                <h3 className="text-xl font-semibold mb-6">
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
                        <div className="mt-10 flex gap-4">
              <button className="flex-1 rounded-2xl bg-white py-4 text-lg font-bold text-black transition hover:bg-zinc-200">
                Adaugă în coș
              </button>

              <button
                type="button"
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

            <div className="mt-10 border-t border-zinc-800 pt-8">
              <div className="flex justify-between py-3">
                <span className="text-zinc-500">Transport</span>
                <span>20 Lei</span>
              </div>

              <div className="flex justify-between py-3">
                <span className="text-zinc-500">Expediere</span>
                <span>24–48 ore</span>
              </div>

              <div className="mt-4 flex justify-between border-t border-zinc-800 pt-5 text-2xl font-bold">
                <span>Total</span>
                <span>270 Lei</span>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-28">
          <h2 className="mb-10 text-3xl font-bold">
            Produse similare
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
              <div className="h-64 rounded-2xl bg-zinc-800" />

              <h3 className="mt-6 text-xl font-bold">
                Produs nou în curând
              </h3>

              <p className="mt-2 text-zinc-500">
                Urmărește magazinul pentru următoarele produse.
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
              <div className="h-64 rounded-2xl bg-zinc-800" />

              <h3 className="mt-6 text-xl font-bold">
                Produs nou în curând
              </h3>

              <p className="mt-2 text-zinc-500">
                Urmărește magazinul pentru următoarele produse.
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
              <div className="h-64 rounded-2xl bg-zinc-800" />

              <h3 className="mt-6 text-xl font-bold">
                Produs nou în curând
              </h3>

              <p className="mt-2 text-zinc-500">
                Urmărește magazinul pentru următoarele produse.
              </p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}