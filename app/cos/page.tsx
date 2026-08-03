"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

type CartItem = {
  id: string;
  name: string;
  price: number;
  size: string;
  image: string;
  quantity: number;
};

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("void-market-cart");

    if (savedCart) {
      try {
        const parsedCart: CartItem[] = JSON.parse(savedCart);
        setCart(parsedCart);
      } catch {
        localStorage.removeItem("void-market-cart");
      }
    }

    setLoaded(true);
  }, []);

  function removeItem(id: string) {
    const updatedCart = cart.filter((item) => item.id !== id);

    setCart(updatedCart);
    localStorage.setItem(
      "void-market-cart",
      JSON.stringify(updatedCart)
    );

    window.dispatchEvent(new Event("cart-updated"));
  }

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const transport = cart.length > 0 ? 20 : 0;
  const total = subtotal + transport;

  if (!loaded) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Navbar />

        <div className="flex min-h-[70vh] items-center justify-center">
          <p className="text-zinc-500">Se încarcă...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-12">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            Comanda ta
          </p>

          <h1 className="mt-3 text-4xl font-black md:text-5xl">
            Coș de cumpărături
          </h1>
        </div>

        {cart.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 px-6 py-20 text-center">
            <h2 className="text-3xl font-bold">
              Coșul este gol
            </h2>

            <p className="mt-4 text-zinc-500">
              Nu ai adăugat încă niciun produs.
            </p>

            <Link
              href="/#magazin"
              className="mt-8 inline-block rounded-2xl bg-white px-8 py-4 font-bold text-black transition hover:bg-zinc-200"
            >
              Vezi produsele
            </Link>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
            <div>
              {cart.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-col gap-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:flex-row"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-56 w-full rounded-2xl bg-zinc-900 object-contain sm:w-48"
                  />

                  <div className="flex flex-1 flex-col">
                    <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
                      Louis Vuitton
                    </p>

                    <h2 className="mt-2 text-2xl font-bold">
                      {item.name}
                    </h2>

                    <p className="mt-3 text-zinc-400">
                      Mărime: {item.size}
                    </p>

                    <p className="mt-2 text-zinc-400">
                      Cantitate: 1
                    </p>

                    <p className="mt-5 text-2xl font-bold">
                      {item.price} Lei
                    </p>

                    <div className="mt-auto flex gap-4 pt-6">
                      <Link
                        href="/products/lv-sweatshirt"
                        className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold transition hover:border-white"
                      >
                        Vezi produsul
                      </Link>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="rounded-xl border border-red-900 px-5 py-3 font-semibold text-red-400 transition hover:border-red-500 hover:text-red-300"
                      >
                        Șterge
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="h-fit rounded-3xl border border-zinc-800 bg-zinc-950 p-6 lg:sticky lg:top-28">
              <h2 className="text-2xl font-bold">
                Sumar comandă
              </h2>

              <div className="mt-8 space-y-5">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span>{subtotal} Lei</span>
                </div>

                <div className="flex justify-between text-zinc-400">
                  <span>Transport</span>
                  <span>{transport} Lei</span>
                </div>

                <div className="flex justify-between border-t border-zinc-800 pt-5 text-2xl font-bold">
                  <span>Total</span>
                  <span>{total} Lei</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="mt-8 block w-full rounded-2xl bg-white py-4 text-center text-lg font-bold text-black transition hover:bg-zinc-200"
              >
                Mergi la checkout
              </Link>

              <Link
                href="/#magazin"
                className="mt-3 block w-full rounded-2xl border border-zinc-700 py-4 text-center font-semibold transition hover:border-white"
              >
                Continuă cumpărăturile
              </Link>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}