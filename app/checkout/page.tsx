"use client";

import { FormEvent, useEffect, useState } from "react";
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

type CheckoutForm = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  county: string;
  city: string;
  address: string;
  postalCode: string;
  notes: string;
  paymentMethod: "cash" | "card";
};

const initialForm: CheckoutForm = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  county: "",
  city: "",
  address: "",
  postalCode: "",
  notes: "",
  paymentMethod: "cash",
};

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [form, setForm] = useState<CheckoutForm>(initialForm);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

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

  function updateField(
    field: keyof CheckoutForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const transport = cart.length > 0 ? 20 : 0;
  const total = subtotal + transport;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.phone.trim() ||
      !form.county.trim() ||
      !form.city.trim() ||
      !form.address.trim()
    ) {
      setError("Completează toate câmpurile obligatorii.");
      return;
    }

    if (cart.length === 0) {
      setError("Coșul este gol.");
      return;
    }

    const productsText = cart
      .map(
        (item) =>
          `${item.name} | Mărime ${item.size} | ${item.price} Lei`
      )
      .join("\n");

    const message = `
Comandă nouă VOID MARKET

CLIENT
Nume: ${form.firstName} ${form.lastName}
Telefon: ${form.phone}
Email: ${form.email || "Nu a fost completat"}

LIVRARE
Județ: ${form.county}
Oraș: ${form.city}
Adresă: ${form.address}
Cod poștal: ${form.postalCode || "Nu a fost completat"}

PRODUSE
${productsText}

Subtotal: ${subtotal} Lei
Transport: ${transport} Lei
Total: ${total} Lei

Plată: ${
      form.paymentMethod === "cash"
        ? "Ramburs"
        : "Card"
    }

Observații:
${form.notes || "Fără observații"}
    `.trim();

    const gmailUrl =
      "https://mail.google.com/mail/?view=cm&fs=1" +
      "&to=voidmarket.ro@gmail.com" +
      "&su=" +
      encodeURIComponent("Comandă nouă VOID MARKET") +
      "&body=" +
      encodeURIComponent(message);

    window.open(gmailUrl, "_blank", "noopener,noreferrer");
  }

  if (!loaded) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Navbar />

        <div className="flex min-h-[70vh] items-center justify-center">
          <p className="text-zinc-500">
            Se încarcă...
          </p>
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Navbar />

        <section className="mx-auto max-w-4xl px-6 py-20 text-center">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 px-6 py-20">
            <h1 className="text-4xl font-black">
              Coșul este gol
            </h1>

            <p className="mt-4 text-zinc-500">
              Adaugă produsul în coș înainte să continui.
            </p>

            <Link
              href="/#magazin"
              className="mt-8 inline-block rounded-2xl bg-white px-8 py-4 font-bold text-black transition hover:bg-zinc-200"
            >
              Vezi produsele
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            Ultimul pas
          </p>

          <h1 className="mt-3 text-4xl font-black md:text-5xl">
            Checkout
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-10 lg:grid-cols-[1fr_380px]"
        >
          <div className="space-y-8">
            <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8">
              <h2 className="text-2xl font-bold">
                Date de contact
              </h2>

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm text-zinc-400">
                    Prenume *
                  </span>

                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(event) =>
                      updateField("firstName", event.target.value)
                    }
                    className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none transition focus:border-white"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-zinc-400">
                    Nume *
                  </span>

                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(event) =>
                      updateField("lastName", event.target.value)
                    }
                    className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none transition focus:border-white"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-zinc-400">
                    Telefon *
                  </span>

                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(event) =>
                      updateField("phone", event.target.value)
                    }
                    className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none transition focus:border-white"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-zinc-400">
                    Email
                  </span>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                    className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none transition focus:border-white"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8">
              <h2 className="text-2xl font-bold">
                Adresa de livrare
              </h2>

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm text-zinc-400">
                    Județ *
                  </span>

                  <input
                    type="text"
                    value={form.county}
                    onChange={(event) =>
                      updateField("county", event.target.value)
                    }
                    className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none transition focus:border-white"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-zinc-400">
                    Oraș *
                  </span>

                  <input
                    type="text"
                    value={form.city}
                    onChange={(event) =>
                      updateField("city", event.target.value)
                    }
                    className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none transition focus:border-white"
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm text-zinc-400">
                    Adresă completă *
                  </span>

                  <input
                    type="text"
                    placeholder="Stradă, număr, bloc, scară, apartament"
                    value={form.address}
                    onChange={(event) =>
                      updateField("address", event.target.value)
                    }
                    className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none transition focus:border-white"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-zinc-400">
                    Cod poștal
                  </span>

                  <input
                    type="text"
                    value={form.postalCode}
                    onChange={(event) =>
                      updateField("postalCode", event.target.value)
                    }
                    className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none transition focus:border-white"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8">
              <h2 className="text-2xl font-bold">
                Metoda de plată
              </h2>

              <div className="mt-6 space-y-4">
                <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-zinc-700 p-5">
                  <input
                    type="radio"
                    name="payment"
                    checked={form.paymentMethod === "cash"}
                    onChange={() =>
                      updateField("paymentMethod", "cash")
                    }
                  />

                  <div>
                    <p className="font-semibold">
                      Ramburs
                    </p>

                    <p className="text-sm text-zinc-500">
                      Plătești când primești coletul.
                    </p>
                  </div>
                </label>

                <label className="flex cursor-not-allowed items-center gap-4 rounded-2xl border border-zinc-800 p-5 opacity-50">
                  <input
                    type="radio"
                    name="payment"
                    disabled
                  />

                  <div>
                    <p className="font-semibold">
                      Card
                    </p>

                    <p className="text-sm text-zinc-500">
                      Va fi disponibil în curând.
                    </p>
                  </div>
                </label>
              </div>
            </section>

            <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8">
              <h2 className="text-2xl font-bold">
                Observații
              </h2>

              <textarea
                rows={5}
                value={form.notes}
                onChange={(event) =>
                  updateField("notes", event.target.value)
                }
                placeholder="Instrucțiuni pentru livrare sau alte detalii"
                className="mt-6 w-full resize-none rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none transition focus:border-white"
              />
            </section>
          </div>

          <aside className="h-fit rounded-3xl border border-zinc-800 bg-zinc-950 p-6 lg:sticky lg:top-28">
            <h2 className="text-2xl font-bold">
              Sumar comandă
            </h2>

            <div className="mt-6 space-y-5">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 border-b border-zinc-800 pb-5"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-24 w-24 rounded-xl bg-zinc-900 object-contain"
                  />

                  <div>
                    <h3 className="font-semibold">
                      {item.name}
                    </h3>

                    <p className="mt-1 text-sm text-zinc-500">
                      Mărime: {item.size}
                    </p>

                    <p className="mt-2 font-bold">
                      {item.price} Lei
                    </p>
                  </div>
                </div>
              ))}

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

            {error && (
              <p className="mt-5 rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="mt-8 w-full rounded-2xl bg-white py-4 text-lg font-bold text-black transition hover:bg-zinc-200"
            >
              Plasează comanda
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-zinc-600">
              Comanda se deschide în Gmail, iar clientul trebuie să apese
              Trimite.
            </p>

            <Link
              href="/cos"
              className="mt-4 block text-center text-sm text-zinc-400 underline transition hover:text-white"
            >
              Înapoi la coș
            </Link>
          </aside>
        </form>
      </section>
    </main>
  );
}