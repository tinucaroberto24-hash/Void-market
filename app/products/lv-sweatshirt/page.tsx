"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

type CartItem = {
  id: string;
  name: string;
  price: number;
  size: string;
  image: string;
  quantity: number;
};

const product: CartItem = {
  id: "lv-sweatshirt",
  name: "Louis Vuitton LV Sweater",
  price: 250,
  size: "S",
  image: "/lv/front.jpeg",
  quantity: 1,
};

export default function ProductPage() {
  const images = ["/lv/front.jpeg", "/lv/back.jpeg"];

  const [selectedImage, setSelectedImage] = useState(images[0]);
  const [favorite, setFavorite] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedCart = localStorage.getItem("void-market-cart");

    if (!savedCart) return;

    try {
      const parsedCart: CartItem[] = JSON.parse(savedCart);
      setCart(parsedCart);
    } catch {
      localStorage.removeItem("void-market-cart");
    }
  }, []);

  function saveCart(items: CartItem[]) {
    setCart(items);
    localStorage.setItem("void-market-cart", JSON.stringify(items));
    window.dispatchEvent(new Event("cart-updated"));
  }

  function addToCart() {
    const existingItem = cart.find((item) => item.id === product.id);

    if (!existingItem) {
      saveCart([...cart, product]);
      setMessage("Produs adăugat în coș");
    } else {
      setMessage("Produsul este deja în coș");
    }

    setTimeout(() => {
      setMessage("");
    }, 2500);
  }

  const cartItem = cart.find((item) => item.id === product.id);

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      {message && (
        <div className="fixed right-6 top-24 z-50 rounded-2xl border border-zinc-700 bg-zinc-900 px-6 py-4 font-semibold shadow-2xl">
          {message}
        </div>
      )}

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-16 lg:grid-cols-2">
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
                  Un singur produs disponibil
                </p>
              </div>
            </div>

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

            <div className="mt-10 flex gap-4">
              <button
                type="button"
                onClick={addToCart}
                className="flex-1 rounded-2xl bg-white py-4 text-lg font-bold text-black transition hover:bg-zinc-200"
              >
                {cartItem ? "Produsul este în coș" : "Adaugă în coș"}
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
      </section>
    </main>
  );
}