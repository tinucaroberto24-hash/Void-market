"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";

export default function ProductPage() {
  const images = [
    "/lv/front.jpeg",
    "/lv/back.jpeg",
  ];

  const [selectedImage, setSelectedImage] = useState(images[0]);
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

          {/* GALERIE FOTO */}
          <div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
              <img
                src={selectedImage}
                alt="Louis Vuitton LV Sweatshirt"
                className="w-full h-[520px] md:h-[650px] object-cover"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-5">
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
                        ? "Louis Vuitton sweatshirt față"
                        : "Louis Vuitton sweatshirt spate"
                    }
                    className="w-full h-44 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* INFORMAȚII PRODUS */}
          <div className="lg:sticky lg:top-10 lg:self-start">
            <p className="text-zinc-500 uppercase tracking-[0.3em] text-sm">
              Louis Vuitton
            </p>

            <h1 className="text-4xl md:text-6xl font-black mt-3">
              LV Sweatshirt
            </h1>

            <p className="text-3xl md:text-4xl font-bold mt-8">
              250 Lei
            </p>

            <div className="flex items-center gap-3 mt-6">
              <span className="h-3 w-3 rounded-full bg-green-500" />

              <div>
                <p className="font-semibold">În stoc</p>
                <p className="text-zinc-500 text-sm">
                  Expediere în 24–48 de ore
                </p>
              </div>
            </div>

            <div className="border-t border-zinc-800 mt-10 pt-8">
              <h2 className="text-2xl font-bold">
                Detalii produs
              </h2>

              <div className="mt-6 divide-y divide-zinc-800">
                <div className="flex justify-between py-4">
                  <span className="text-zinc-500">Mărime</span>
                  <span className="font-semibold">S</span>
                </div>

                <div className="flex justify-between py-4">
                  <span className="text-zinc-500">Culoare</span>
                  <span className="font-semibold">Negru</span>
                </div>

                <div className="flex justify-between py-4">
                  <span className="text-zinc-500">Stare</span>
                  <span className="font-semibold">Foarte bună</span>
                </div>

                <div className="flex justify-between py-4">
                  <span className="text-zinc-500">Defecte</span>
                  <span className="font-semibold">Fără defecte</span>
                </div>

                <div className="flex justify-between py-4">
                  <span className="text-zinc-500">Livrare</span>
                  <span className="font-semibold">
                    În toată România
                  </span>
                </div>
              </div>
            </div>
                        <div className="mt-10 flex gap-4">

              <button className="flex-1 bg-white text-black py-4 rounded-2xl font-bold text-lg hover:bg-zinc-200 transition duration-300">
                Adaugă în coș
              </button>

              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`w-16 rounded-2xl border transition ${
                  isFavorite
                    ? "bg-red-500 border-red-500"
                    : "border-zinc-700 hover:border-white"
                }`}
              >
                ❤️
              </button>

            </div>

          </div>

        </div>

        {/* PRODUSE SIMILARE */}

        <div className="mt-28">

          <h2 className="text-3xl font-bold mb-10">
            Produse similare
          </h2>

          <div className="grid md:grid-cols-3 gap-8">

            <div className="bg-zinc-900 rounded-3xl overflow-hidden hover:scale-105 transition">

              <img
                src="https://images.stockx.com/images/Air-Jordan-4-Retro-Military-Black.jpg"
                className="w-full h-80 object-cover"
              />

              <div className="p-6">

                <h3 className="font-bold text-xl">
                  Jordan 4 Military Black
                </h3>

                <p className="text-zinc-400 mt-2">
                  1.850 Lei
                </p>

              </div>

            </div>

            <div className="bg-zinc-900 rounded-3xl overflow-hidden hover:scale-105 transition">

              <img
                src="https://images.stockx.com/images/Nike-Dunk-Low-Retro-White-Black-2021.jpg"
                className="w-full h-80 object-cover"
              />

              <div className="p-6">

                <h3 className="font-bold text-xl">
                  Nike Dunk Panda
                </h3>

                <p className="text-zinc-400 mt-2">
                  950 Lei
                </p>

              </div>

            </div>

            <div className="bg-zinc-900 rounded-3xl overflow-hidden hover:scale-105 transition">

              <img
                src="https://images.stockx.com/images/Fear-of-God-Essentials-Hoodie.jpg"
                className="w-full h-80 object-cover"
              />

              <div className="p-6">

                <h3 className="font-bold text-xl">
                  Essentials Hoodie
                </h3>

                <p className="text-zinc-400 mt-2">
                  780 Lei
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>
    </main>
  );
}