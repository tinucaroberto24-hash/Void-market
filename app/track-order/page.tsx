"use client";

import {
  FormEvent,
  useState,
} from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total: number;
};

type Order = {
  id: string;
  created_at: string;
  customer_name: string;
  email: string;
  county: string;
  city: string;
  delivery_address: string;
  delivery_method: string;
  payment_method: string;
  status: string;
  subtotal: number;
  transport: number;
  total: number;
  items: OrderItem[];
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ro-RO", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(date));
}

function getStatusClasses(status: string) {
  switch (status) {
    case "Livrată":
      return "border-green-800 bg-green-950/40 text-green-300";

    case "Expediată":
      return "border-purple-800 bg-purple-950/40 text-purple-300";

    case "Pregătită":
      return "border-blue-800 bg-blue-950/40 text-blue-300";

    case "Confirmată":
      return "border-cyan-800 bg-cyan-950/40 text-cyan-300";

    case "Anulată":
      return "border-red-800 bg-red-950/40 text-red-300";

    default:
      return "border-yellow-800 bg-yellow-950/40 text-yellow-300";
  }
}

function getStatusMessage(status: string) {
  switch (status) {
    case "Confirmată":
      return "Comanda a fost confirmată și urmează să fie pregătită.";

    case "Pregătită":
      return "Comanda este pregătită pentru expediere.";

    case "Expediată":
      return "Comanda a fost predată curierului.";

    case "Livrată":
      return "Comanda a fost livrată cu succes.";

    case "Anulată":
      return "Această comandă a fost anulată.";

    default:
      return "Comanda a fost înregistrată și urmează să fie verificată.";
  }
}

export default function TrackOrderPage() {
  const [email, setEmail] =
    useState("");

  const [orderId, setOrderId] =
    useState("");

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const response = await fetch(
        "/api/track-order",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email,
            orderId,
          }),
        }
      );

      const responseText =
        await response.text();

      let result: {
        success?: boolean;
        error?: string;
        order?: Order;
      };

      try {
        result = JSON.parse(responseText);
      } catch {
        throw new Error(
          "Serverul a returnat un răspuns invalid."
        );
      }

      if (
        !response.ok ||
        !result.success ||
        !result.order
      ) {
        throw new Error(
          result.error ||
            "Comanda nu a fost găsită."
        );
      }

      setOrder(result.order);
    } catch (searchError) {
      console.error(searchError);

      setError(
        searchError instanceof Error
          ? searchError.message
          : "Comanda nu a putut fi verificată."
      );
    } finally {
      setLoading(false);
    }
  }

  function resetSearch() {
    setOrder(null);
    setError("");
    setEmail("");
    setOrderId("");
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            VOID MARKET
          </p>

          <h1 className="mt-4 text-4xl font-black md:text-6xl">
            Urmărește comanda
          </h1>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-zinc-400">
            Introdu emailul folosit la comandă și
            ID-ul unic al comenzii pentru a vedea
            statusul actual.
          </p>
        </div>

        {!order ? (
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-12 max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-10"
          >
            <label className="block">
              <span className="mb-2 block text-sm text-zinc-400">
                Emailul folosit la comandă
              </span>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="email@exemplu.ro"
                required
                className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none transition focus:border-white"
              />
            </label>

            <label className="mt-6 block">
              <span className="mb-2 block text-sm text-zinc-400">
                ID comandă
              </span>

              <input
                type="text"
                value={orderId}
                onChange={(event) =>
                  setOrderId(
                    event.target.value
                  )
                }
                placeholder="Exemplu: 7c2f...-..."
                required
                className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none transition focus:border-white"
              />

              <span className="mt-2 block text-xs text-zinc-600">
                ID-ul este codul unic primit după
                plasarea comenzii.
              </span>
            </label>

            {error && (
              <p className="mt-6 rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-8 w-full rounded-xl bg-white py-4 text-lg font-bold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Se caută comanda..."
                : "Caută comanda"}
            </button>

            <Link
              href="/"
              className="mt-5 block text-center text-sm text-zinc-500 underline transition hover:text-white"
            >
              Înapoi la magazin
            </Link>
          </form>
        ) : (
          <div className="mt-12 space-y-8">
            <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-10">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
                    Comandă găsită
                  </p>

                  <h2 className="mt-3 text-3xl font-black">
                    {order.customer_name}
                  </h2>

                  <p className="mt-3 text-zinc-500">
                    Plasată la{" "}
                    {formatDate(
                      order.created_at
                    )}
                  </p>
                </div>

                <span
                  className={`w-fit rounded-full border px-5 py-3 font-bold ${getStatusClasses(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>

              <div className="mt-8 rounded-2xl border border-zinc-800 bg-black p-5">
                <p className="text-sm text-zinc-500">
                  Statusul comenzii
                </p>

                <p className="mt-2 text-lg font-semibold">
                  {getStatusMessage(
                    order.status
                  )}
                </p>
              </div>
            </section>

            <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
              <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8">
                <h2 className="text-2xl font-bold">
                  Produse comandate
                </h2>

                <div className="mt-6 space-y-4">
                  {order.items.map(
                    (item, index) => (
                      <article
                        key={`${item.id}-${index}`}
                        className="rounded-2xl border border-zinc-800 bg-black p-5"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h3 className="text-lg font-bold">
                              {item.name}
                            </h3>

                            <p className="mt-2 text-sm text-zinc-500">
                              Cantitate:{" "}
                              {item.quantity}
                            </p>

                            <p className="mt-1 text-sm text-zinc-500">
                              Preț unitar:{" "}
                              {item.unit_price} Lei
                            </p>
                          </div>

                          <p className="text-2xl font-black">
                            {item.total} Lei
                          </p>
                        </div>
                      </article>
                    )
                  )}
                </div>
              </section>

              <aside className="space-y-8">
                <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
                  <h2 className="text-xl font-bold">
                    Sumar comandă
                  </h2>

                  <div className="mt-6 space-y-4">
                    <div className="flex justify-between text-zinc-400">
                      <span>Plată</span>

                      <span className="font-semibold text-white">
                        {order.payment_method ===
                        "cash"
                          ? "Ramburs"
                          : "Card"}
                      </span>
                    </div>

                    <div className="flex justify-between text-zinc-400">
                      <span>Livrare</span>

                      <span className="font-semibold text-white">
                        {order.delivery_method ===
                        "fan"
                          ? "FAN Courier"
                          : order.delivery_method}
                      </span>
                    </div>

                    <div className="flex justify-between text-zinc-400">
                      <span>Subtotal</span>

                      <span>
                        {order.subtotal} Lei
                      </span>
                    </div>

                    <div className="flex justify-between text-zinc-400">
                      <span>Transport</span>

                      <span>
                        {order.transport} Lei
                      </span>
                    </div>

                    <div className="flex justify-between border-t border-zinc-800 pt-5 text-xl font-black">
                      <span>Total</span>

                      <span>
                        {order.total} Lei
                      </span>
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
                  <h2 className="text-xl font-bold">
                    Livrare
                  </h2>

                  <div className="mt-5 space-y-3 text-sm">
                    <p>
                      <span className="text-zinc-500">
                        Județ:
                      </span>{" "}
                      {order.county}
                    </p>

                    <p>
                      <span className="text-zinc-500">
                        Localitate:
                      </span>{" "}
                      {order.city}
                    </p>

                    <p className="leading-6">
                      <span className="text-zinc-500">
                        Adresă:
                      </span>{" "}
                      {order.delivery_address}
                    </p>
                  </div>
                </section>
              </aside>
            </div>

            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <button
                type="button"
                onClick={resetSearch}
                className="rounded-xl border border-zinc-700 px-6 py-3 font-semibold transition hover:border-white"
              >
                Caută altă comandă
              </button>

              <Link
                href="/"
                className="rounded-xl bg-white px-6 py-3 text-center font-bold text-black transition hover:bg-zinc-200"
              >
                Înapoi la magazin
              </Link>
            </div>

            <p className="break-all text-center text-xs text-zinc-700">
              ID comandă: {order.id}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}