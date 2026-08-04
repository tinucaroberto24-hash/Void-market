"use client";

import {
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";

type CardOrder = {
  id: string;
  email: string;
  status: string;
};

export default function SuccessContent() {
  const searchParams = useSearchParams();

  const sessionId =
    searchParams.get("session_id");

  const [order, setOrder] =
    useState<CardOrder | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  useEffect(() => {
    localStorage.removeItem(
      "void-market-cart"
    );

    window.dispatchEvent(
      new Event("cart-updated")
    );
  }, []);

  useEffect(() => {
    if (!sessionId) {
      setError(
        "Lipsește ID-ul sesiunii de plată."
      );

      setLoading(false);
      return;
    }

    let cancelled = false;
    let attempts = 0;
    let retryTimeout:
      | ReturnType<typeof setTimeout>
      | undefined;

    async function loadOrder() {
      attempts += 1;

      try {
        const response = await fetch(
          "/api/card-order",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              sessionId,
            }),
          }
        );

        const responseText =
          await response.text();

        let result: {
          success?: boolean;
          pending?: boolean;
          error?: string;
          order?: CardOrder;
        };

        try {
          result = JSON.parse(responseText);
        } catch {
          throw new Error(
            "Serverul a returnat un răspuns invalid."
          );
        }

        if (
          result.pending &&
          attempts < 8
        ) {
          retryTimeout = setTimeout(
            loadOrder,
            1500
          );

          return;
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

        if (cancelled) {
          return;
        }

        setOrder(result.order);

        localStorage.setItem(
          "void-market-last-order",
          JSON.stringify({
            orderId:
              result.order.id,
            email:
              result.order.email,
          })
        );

        setLoading(false);
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Comanda nu a putut fi încărcată."
        );

        setLoading(false);
      }
    }

    loadOrder();

    return () => {
      cancelled = true;

      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [sessionId]);

  async function copyOrderId() {
    if (!order) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        order.id
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (copyError) {
      console.error(
        "ID-ul nu a putut fi copiat:",
        copyError
      );
    }
  }

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
            Plata cu cardul a fost finalizată.
            Vom verifica plata și te vom
            contacta pentru confirmarea
            livrării.
          </p>

          {loading && (
            <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-zinc-800 bg-black p-6">
              <p className="text-zinc-400">
                Se încarcă ID-ul comenzii...
              </p>
            </div>
          )}

          {error && (
            <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-yellow-900 bg-yellow-950/30 p-6">
              <p className="text-sm text-yellow-300">
                {error}
              </p>

              <p className="mt-3 text-sm leading-6 text-zinc-500">
                Plata a fost înregistrată.
                ID-ul poate apărea după câteva
                secunde dacă webhook-ul Stripe
                încă procesează comanda.
              </p>
            </div>
          )}

          {order && (
            <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-zinc-700 bg-black p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
                ID comandă
              </p>

              <p className="mt-3 break-all text-lg font-bold">
                {order.id}
              </p>

              <p className="mt-3 text-sm leading-6 text-zinc-500">
                Păstrează acest ID. Îl vei
                folosi împreună cu emailul în
                pagina „Urmărește comanda”.
              </p>

              <button
                type="button"
                onClick={copyOrderId}
                className="mt-5 rounded-xl bg-white px-5 py-3 font-bold text-black transition hover:bg-zinc-200"
              >
                {copied
                  ? "ID copiat"
                  : "Copiază ID-ul"}
              </button>

              <Link
                href="/track-order"
                className="mt-4 block text-sm font-semibold text-zinc-400 underline transition hover:text-white"
              >
                Urmărește comanda
              </Link>
            </div>
          )}

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