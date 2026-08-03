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

type DeliveryMethod = "easybox" | "fan";

type CheckoutForm = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  county: string;
  city: string;
  address: string;
  postalCode: string;
  easyboxLocation: string;
  notes: string;
  deliveryMethod: DeliveryMethod;
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
  easyboxLocation: "",
  notes: "",
  deliveryMethod: "easybox",
};

const WEB3FORMS_ACCESS_KEY =
  "7005de1f-745e-419a-9cdc-1cd961b7f67f";

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [form, setForm] = useState<CheckoutForm>(initialForm);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [sending, setSending] = useState(false);

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

  function updateField<K extends keyof CheckoutForm>(
    field: K,
    value: CheckoutForm[K]
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

  function validateForm() {
    if (!form.firstName.trim()) {
      return "Completează prenumele.";
    }

    if (!form.lastName.trim()) {
      return "Completează numele.";
    }

    if (!form.phone.trim()) {
      return "Completează numărul de telefon.";
    }

    if (!form.county.trim()) {
      return "Completează județul.";
    }

    if (!form.city.trim()) {
      return "Completează orașul.";
    }

    if (
      form.deliveryMethod === "easybox" &&
      !form.easyboxLocation.trim()
    ) {
      return "Completează locația Easybox.";
    }

    if (
      form.deliveryMethod === "fan" &&
      !form.address.trim()
    ) {
      return "Completează adresa de livrare.";
    }

    if (cart.length === 0) {
      return "Coșul este gol.";
    }

    return "";
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess(false);

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSending(true);

    const productsText = cart
      .map(
        (item) =>
          `${item.name}
Mărime: ${item.size}
Cantitate: ${item.quantity}
Preț: ${item.price} Lei`
      )
      .join("\n\n");

    const deliveryDetails =
      form.deliveryMethod === "easybox"
        ? `Easybox
Locație Easybox: ${form.easyboxLocation}`
        : `FAN Courier
Adresă: ${form.address}
Cod poștal: ${form.postalCode || "Necompletat"}`;

    const orderMessage = `
COMANDĂ NOUĂ VOID MARKET

DATE CLIENT
Nume: ${form.firstName} ${form.lastName}
Telefon: ${form.phone}
Email: ${form.email || "Necompletat"}

LIVRARE
Metodă: ${deliveryDetails}
Județ: ${form.county}
Oraș: ${form.city}

PRODUSE
${productsText}

PLATĂ
Metodă: Ramburs

SUMAR
Subtotal: ${subtotal} Lei
Transport: ${transport} Lei
Total: ${total} Lei

OBSERVAȚII
${form.notes || "Fără observații"}
    `.trim();

    try {
      const response = await fetch(
        "https://api.web3forms.com/submit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            access_key: WEB3FORMS_ACCESS_KEY,
            subject: "Comandă nouă VOID MARKET",
            from_name: "VOID MARKET Checkout",
            name: `${form.firstName} ${form.lastName}`,
            email:
              form.email.trim() ||
              "voidmarket.ro@gmail.com",
            phone: form.phone,
            delivery_method:
              form.deliveryMethod === "easybox"
                ? "Easybox"
                : "FAN Courier",
            county: form.county,
            city: form.city,
            address:
              form.deliveryMethod === "easybox"
                ? form.easyboxLocation
                : form.address,
            postal_code:
              form.deliveryMethod === "fan"
                ? form.postalCode || "Necompletat"
                : "Nu se aplică",
            payment_method: "Ramburs",
            subtotal: `${subtotal} Lei`,
            transport: `${transport} Lei`,
            total: `${total} Lei`,
            message: orderMessage,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Comanda nu a putut fi trimisă."
        );
      }

      localStorage.removeItem("void-market-cart");
      window.dispatchEvent(new Event("cart-updated"));

      setCart([]);
      setForm(initialForm);
      setSuccess(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (submitError) {
      console.error(submitError);

      setError(
        "Comanda nu a putut fi trimisă. Verifică internetul și încearcă din nou."
      );
    } finally {
      setSending(false);
    }
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

  if (success) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Navbar />

        <section className="mx-auto max-w-3xl px-6 py-24 text-center">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 px-6 py-20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-3xl text-black">
              ✓
            </div>

            <p className="mt-8 text-sm uppercase tracking-[0.3em] text-green-400">
              Comandă trimisă
            </p>

            <h1 className="mt-4 text-4xl font-black md:text-5xl">
              Mulțumim pentru comandă!
            </h1>

            <p className="mx-auto mt-6 max-w-xl leading-7 text-zinc-400">
              Am primit datele comenzii. Te vom contacta
              pentru confirmare și pentru detaliile livrării.
            </p>

            <Link
              href="/"
              className="mt-10 inline-block rounded-2xl bg-white px-8 py-4 font-bold text-black transition hover:bg-zinc-200"
            >
              Înapoi la pagina principală
            </Link>
          </div>
        </section>
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
              Adaugă un produs în coș înainte să continui.
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
            {/* DATE DE CONTACT */}
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
                      updateField(
                        "firstName",
                        event.target.value
                      )
                    }
                    autoComplete="given-name"
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
                      updateField(
                        "lastName",
                        event.target.value
                      )
                    }
                    autoComplete="family-name"
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
                      updateField(
                        "phone",
                        event.target.value
                      )
                    }
                    autoComplete="tel"
                    placeholder="07xx xxx xxx"
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
                      updateField(
                        "email",
                        event.target.value
                      )
                    }
                    autoComplete="email"
                    placeholder="email@exemplu.ro"
                    className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none transition focus:border-white"
                  />
                </label>
              </div>
            </section>

            {/* METODA DE LIVRARE */}
            <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8">
              <h2 className="text-2xl font-bold">
                Metoda de livrare
              </h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label
                  className={`cursor-pointer rounded-2xl border p-5 transition ${
                    form.deliveryMethod === "easybox"
                      ? "border-white bg-zinc-900"
                      : "border-zinc-700 hover:border-zinc-500"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="delivery"
                      checked={
                        form.deliveryMethod === "easybox"
                      }
                      onChange={() =>
                        updateField(
                          "deliveryMethod",
                          "easybox"
                        )
                      }
                    />

                    <div>
                      <p className="font-semibold">
                        Easybox
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        Ridicare din locker.
                      </p>
                    </div>
                  </div>
                </label>

                <label
                  className={`cursor-pointer rounded-2xl border p-5 transition ${
                    form.deliveryMethod === "fan"
                      ? "border-white bg-zinc-900"
                      : "border-zinc-700 hover:border-zinc-500"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="delivery"
                      checked={
                        form.deliveryMethod === "fan"
                      }
                      onChange={() =>
                        updateField(
                          "deliveryMethod",
                          "fan"
                        )
                      }
                    />

                    <div>
                      <p className="font-semibold">
                        FAN Courier
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        Livrare la adresă.
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </section>

            {/* DATE PENTRU LIVRARE */}
            <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8">
              <h2 className="text-2xl font-bold">
                Date pentru livrare
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
                      updateField(
                        "county",
                        event.target.value
                      )
                    }
                    autoComplete="address-level1"
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
                      updateField(
                        "city",
                        event.target.value
                      )
                    }
                    autoComplete="address-level2"
                    className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none transition focus:border-white"
                  />
                </label>

                {form.deliveryMethod === "easybox" ? (
                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm text-zinc-400">
                      Locația Easybox dorită *
                    </span>

                    <input
                      type="text"
                      value={form.easyboxLocation}
                      onChange={(event) =>
                        updateField(
                          "easyboxLocation",
                          event.target.value
                        )
                      }
                      placeholder="Exemplu: Easybox Kaufland Bacău"
                      className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none transition focus:border-white"
                    />

                    <p className="mt-2 text-xs text-zinc-600">
                      Scrie numele sau adresa Easybox-ului.
                    </p>
                  </label>
                ) : (
                  <>
                    <label className="block md:col-span-2">
                      <span className="mb-2 block text-sm text-zinc-400">
                        Adresă completă *
                      </span>

                      <input
                        type="text"
                        value={form.address}
                        onChange={(event) =>
                          updateField(
                            "address",
                            event.target.value
                          )
                        }
                        autoComplete="street-address"
                        placeholder="Stradă, număr, bloc, scară, apartament"
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
                          updateField(
                            "postalCode",
                            event.target.value
                          )
                        }
                        autoComplete="postal-code"
                        className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none transition focus:border-white"
                      />
                    </label>
                  </>
                )}
              </div>
            </section>

            {/* METODA DE PLATĂ */}
            <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8">
              <h2 className="text-2xl font-bold">
                Metoda de plată
              </h2>

              <label className="mt-6 flex items-center gap-4 rounded-2xl border border-white bg-zinc-900 p-5">
                <input type="radio" checked readOnly />

                <div>
                  <p className="font-semibold">
                    Ramburs
                  </p>

                  <p className="text-sm text-zinc-500">
                    Plătești când primești coletul.
                  </p>
                </div>
              </label>
            </section>

            {/* OBSERVAȚII */}
            <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8">
              <h2 className="text-2xl font-bold">
                Observații
              </h2>

              <textarea
                rows={5}
                value={form.notes}
                onChange={(event) =>
                  updateField(
                    "notes",
                    event.target.value
                  )
                }
                placeholder="Instrucțiuni pentru livrare sau alte detalii"
                className="mt-6 w-full resize-none rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none transition focus:border-white"
              />
            </section>
          </div>

          {/* SUMAR COMANDĂ */}
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
              disabled={sending}
              className="mt-8 w-full rounded-2xl bg-white py-4 text-lg font-bold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending
                ? "Se trimite..."
                : "Plasează comanda"}
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-zinc-600">
              După trimitere, comanda ajunge automat la
              VOID MARKET.
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