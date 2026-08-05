"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";
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

type SavedOrder = {
  orderId?: string;
  email?: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ro-RO", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusClasses(status: string) {
  const normalizedStatus =
    status.trim().toLowerCase();

  if (
    normalizedStatus.includes("livrat") ||
    normalizedStatus.includes("finalizat")
  ) {
    return "border-green-800 bg-green-950/40 text-green-300";
  }

  if (
    normalizedStatus.includes("expediat") ||
    normalizedStatus.includes("curier") ||
    normalizedStatus.includes("tranzit")
  ) {
    return "border-blue-800 bg-blue-950/40 text-blue-300";
  }

  if (
    normalizedStatus.includes("anulat") ||
    normalizedStatus.includes("refuzat")
  ) {
    return "border-red-800 bg-red-950/40 text-red-300";
  }

  return "border-yellow-800 bg-yellow-950/40 text-yellow-300";
}

function getStatusMessage(status: string) {
  const normalizedStatus =
    status.trim().toLowerCase();

  if (
    normalizedStatus.includes("livrat") ||
    normalizedStatus.includes("finalizat")
  ) {
    return "Comanda ta a fost livrată. Îți mulțumim că ai ales VOID MARKET.";
  }

  if (
    normalizedStatus.includes("expediat") ||
    normalizedStatus.includes("curier") ||
    normalizedStatus.includes("tranzit")
  ) {
    return "Comanda a fost predată curierului și este în drum spre tine.";
  }

  if (
    normalizedStatus.includes("pregăt") ||
    normalizedStatus.includes("proces")
  ) {
    return "Comanda este pregătită pentru expediere.";
  }

  if (
    normalizedStatus.includes("anulat") ||
    normalizedStatus.includes("refuzat")
  ) {
    return "Comanda a fost anulată. Pentru detalii, contactează echipa VOID MARKET.";
  }

  return "Comanda a fost înregistrată și va fi procesată în curând.";
}

export default function TrackOrderPage() {
  const [email, setEmail] = useState("");
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] =
    useState<Order | null>(null);
  const [loading, setLoading] =
    useState(false);
  const [error, setError] = useState("");
  const [prefilled, setPrefilled] =
    useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(
      window.location.search
    );

    const urlEmail =
      searchParams.get("email")?.trim() ?? "";

    const urlOrderId =
      searchParams.get("id")?.trim() ?? "";

    if (urlEmail) {
      setEmail(urlEmail);
    }

    if (urlOrderId) {
      setOrderId(urlOrderId);
    }

    if (urlEmail && urlOrderId) {
      setPrefilled(true);
      return;
    }

    const savedOrder = localStorage.getItem(
      "void-market-last-order"
    );

    if (!savedOrder) {
      return;
    }

    try {
      const parsed: SavedOrder =
        JSON.parse(savedOrder);

      if (parsed.email) {
        setEmail(parsed.email);
      }

      if (parsed.orderId) {
        setOrderId(parsed.orderId);
      }

      if (
        parsed.email &&
        parsed.orderId
      ) {
        setPrefilled(true);
      }
    } catch {
      localStorage.removeItem(
        "void-market-last-order"
      );
    }
  }, []);

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

      localStorage.setItem(
        "void-market-last-order",
        JSON.stringify({
          orderId: result.order.id,
          email: result.order.email,
        })
      );
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
    setPrefilled(false);
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="mx-auto max-w-5xl px-5 py-12 sm:px-6 sm:py-16">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 sm:text-sm">
            VOID MARKET
          </p>

          <h1 className="mt-4 text-4xl font-black sm:text-5xl md:text-6xl">
            Urmărește comanda
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            Introdu emailul folosit la comandă și
            ID-ul unic al comenzii pentru a vedea
            statusul actual.
          </p>
        </div>

        {!order ? (
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-10 max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-950 p-5 sm:mt-12 sm:p-6 md:p-10"
          >
            {prefilled && (
              <div className="mb-6 rounded-xl border border-green-900 bg-green-950/30 px-4 py-3 text-sm text-green-300">
                Am completat automat datele comenzii.
              </div>
            )}

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
                autoComplete="email"
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
                  setOrderId(event.target.value)
                }
                placeholder="Lipește ID-ul din emailul de confirmare"
                required
                autoComplete="off"
                className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none transition focus:border-white"
              />
            </label>

            <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 sm:p-5">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl text-black sm:h-12 sm:w-12">
                  📦
                </div>

                <div>
                  <h3 className="font-bold text-white">
                    Nu găsești ID-ul comenzii?
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Îl găsești în emailul de confirmare
                    primit de la{" "}
                    <span className="font-semibold text-white">
                      VOID MARKET
                    </span>{" "}
                    după finalizarea comenzii.
                  </p>

                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Folosește ID-ul și aceeași adresă de
                    email cu care ai plasat comanda.
                  </p>

                  <div className="mt-4 rounded-xl border border-zinc-700 bg-black px-4 py-3 text-xs leading-5 text-zinc-400 sm:text-sm">
                    Nu vezi mesajul? Verifică și folderul{" "}
                    <span className="font-semibold text-white">
                      Spam / Junk
                    </span>.
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <p className="mt-6 rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-8 w-full rounded-xl bg-white py-4 text-base font-bold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50 sm:text-lg"
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