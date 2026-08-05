"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CartItem = {
  id: string;
  name: string;
  price: number;
  size: string;
  image: string;
  quantity: number;
};

const CART_STORAGE_KEY = "void-market-cart";

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(
        CART_STORAGE_KEY
      );

      if (savedCart) {
        const parsedCart: CartItem[] =
          JSON.parse(savedCart);

        setCart(parsedCart);
      }
    } catch (error) {
      console.error(
        "Eroare la încărcarea coșului:",
        error
      );

      localStorage.removeItem(CART_STORAGE_KEY);
    } finally {
      setLoaded(true);
    }
  }, []);

  function saveCart(updatedCart: CartItem[]) {
    setCart(updatedCart);

    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(updatedCart)
    );

    window.dispatchEvent(
      new Event("cart-updated")
    );
  }

  function increaseQuantity(
    itemIndex: number
  ) {
    const updatedCart = cart.map(
      (item, index) =>
        index === itemIndex
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
    );

    saveCart(updatedCart);
  }

  function decreaseQuantity(
    itemIndex: number
  ) {
    const selectedItem = cart[itemIndex];

    if (!selectedItem) {
      return;
    }

    if (selectedItem.quantity <= 1) {
      const updatedCart = cart.filter(
        (_item, index) =>
          index !== itemIndex
      );

      saveCart(updatedCart);
      return;
    }

    const updatedCart = cart.map(
      (item, index) =>
        index === itemIndex
          ? {
              ...item,
              quantity: item.quantity - 1,
            }
          : item
    );

    saveCart(updatedCart);
  }

  function removeProduct(
    itemIndex: number
  ) {
    const selectedItem = cart[itemIndex];

    if (!selectedItem) {
      return;
    }

    const confirmed = window.confirm(
      `Sigur vrei să elimini ${selectedItem.name} din coș?`
    );

    if (!confirmed) {
      return;
    }

    const updatedCart = cart.filter(
      (_item, index) =>
        index !== itemIndex
    );

    saveCart(updatedCart);
  }

  function clearCart() {
    const confirmed = window.confirm(
      "Sigur vrei să golești tot coșul?"
    );

    if (!confirmed) {
      return;
    }

    saveCart([]);
  }

  const totalProducts = cart.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  const subtotal = cart.reduce(
    (total, item) =>
      total +
      item.price * item.quantity,
    0
  );

  if (!loaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-zinc-500">
          Se încarcă coșul...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white sm:px-6 sm:py-12">
      <section className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-6 border-b border-zinc-800 pb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
              VOID MARKET
            </p>

            <h1 className="mt-3 text-4xl font-black md:text-5xl">
              Coșul tău
            </h1>

            <p className="mt-3 text-zinc-400">
              {totalProducts}{" "}
              {totalProducts === 1
                ? "produs"
                : "produse"}
            </p>
          </div>

          <Link
            href="/#magazin"
            className="rounded-xl border border-zinc-700 px-6 py-3 text-center font-semibold transition hover:border-white"
          >
            ← Continuă cumpărăturile
          </Link>
        </header>

        {cart.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-zinc-700 px-6 py-24 text-center">
            <h2 className="text-3xl font-bold">
              Coșul este gol
            </h2>

            <p className="mt-4 text-zinc-500">
              Adaugă produse din magazin pentru a continua.
            </p>

            <Link
              href="/#magazin"
              className="mt-8 inline-block rounded-xl bg-white px-8 py-4 font-bold text-black transition hover:bg-zinc-200"
            >
              Vezi produsele
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_380px]">
            <div className="space-y-5">
              {cart.map(
                (item, itemIndex) => (
                  <article
                    key={`${item.id}-${item.size}-${itemIndex}`}
                    className="flex flex-col gap-5 rounded-3xl border border-zinc-800 bg-zinc-950 p-5 sm:flex-row"
                  >
                    <Link
                      href={`/products/${item.id}`}
                      className="flex h-52 w-full items-center justify-center overflow-hidden rounded-2xl bg-black sm:h-44 sm:w-44"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-sm text-zinc-600">
                          Fără imagine
                        </span>
                      )}
                    </Link>

                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <Link
                          href={`/products/${item.id}`}
                          className="text-2xl font-bold transition hover:text-zinc-300"
                        >
                          {item.name}
                        </Link>

                        <p className="mt-2 text-zinc-400">
                          Mărime {item.size}
                        </p>

                        <p className="mt-3 text-xl font-bold">
                          {item.price} Lei
                        </p>
                      </div>

                      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center overflow-hidden rounded-xl border border-zinc-700">
                          <button
                            type="button"
                            onClick={() =>
                              decreaseQuantity(
                                itemIndex
                              )
                            }
                            className="px-4 py-2 text-xl transition hover:bg-zinc-800"
                            aria-label="Scade cantitatea"
                          >
                            −
                          </button>

                          <span className="min-w-12 px-3 py-2 text-center font-bold">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              increaseQuantity(
                                itemIndex
                              )
                            }
                            className="px-4 py-2 text-xl transition hover:bg-zinc-800"
                            aria-label="Crește cantitatea"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeProduct(
                              itemIndex
                            )
                          }
                          className="font-semibold text-red-400 transition hover:text-red-300"
                        >
                          Elimină produsul
                        </button>
                      </div>
                    </div>

                    <p className="text-xl font-bold sm:text-right">
                      {item.price *
                        item.quantity}{" "}
                      Lei
                    </p>
                  </article>
                )
              )}

              <button
                type="button"
                onClick={clearCart}
                className="rounded-xl border border-red-900 px-5 py-3 font-semibold text-red-400 transition hover:bg-red-950"
              >
                Golește tot coșul
              </button>
            </div>

            <aside className="h-fit rounded-3xl border border-zinc-800 bg-zinc-950 p-7 lg:sticky lg:top-28">
              <h2 className="text-2xl font-bold">
                Sumar comandă
              </h2>

              <div className="mt-7 space-y-4 border-b border-zinc-800 pb-7">
                <div className="flex justify-between text-zinc-400">
                  <span>Produse</span>
                  <span>{totalProducts}</span>
                </div>

                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span>
                    {subtotal} Lei
                  </span>
                </div>

                <div className="flex justify-between text-zinc-400">
                  <span>Livrare</span>
                  <span>
                    Calculată la checkout
                  </span>
                </div>
              </div>

              <div className="mt-7 flex items-center justify-between">
                <span className="text-xl font-bold">
                  Total
                </span>

                <span className="text-3xl font-black">
                  {subtotal} Lei
                </span>
              </div>

              <Link
                href="/checkout"
                className="mt-8 block rounded-xl bg-white px-6 py-4 text-center text-lg font-bold text-black transition hover:bg-zinc-200"
              >
                Continuă spre checkout
              </Link>

              <p className="mt-4 text-center text-xs text-zinc-600">
                Coșul rămâne salvat în acest browser.
              </p>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}