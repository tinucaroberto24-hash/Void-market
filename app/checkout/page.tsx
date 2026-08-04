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

type PaymentMethod = "cash" | "card";

type CheckoutForm = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  county: string;
  city: string;
  otherCity: string;
  address: string;
  postalCode: string;
  notes: string;
  paymentMethod: PaymentMethod;
};

const initialForm: CheckoutForm = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  county: "",
  city: "",
  otherCity: "",
  address: "",
  postalCode: "",
  notes: "",
  paymentMethod: "cash",
};

const countiesAndCities: Record<string, string[]> = {
  Alba: ["Alba Iulia", "Aiud", "Blaj", "Sebeș", "Cugir"],
  Arad: ["Arad", "Ineu", "Lipova", "Nădlac", "Pecica"],
  Argeș: [
    "Pitești",
    "Câmpulung",
    "Curtea de Argeș",
    "Mioveni",
    "Topoloveni",
  ],
  Bacău: [
    "Bacău",
    "Onești",
    "Moinești",
    "Comănești",
    "Buhuși",
    "Dărmănești",
    "Târgu Ocna",
    "Slănic Moldova",
  ],
  Bihor: ["Oradea", "Beiuș", "Marghita", "Salonta", "Aleșd"],
  "Bistrița-Năsăud": [
    "Bistrița",
    "Beclean",
    "Năsăud",
    "Sângeorz-Băi",
  ],
  Botoșani: [
    "Botoșani",
    "Dorohoi",
    "Darabani",
    "Săveni",
    "Flămânzi",
  ],
  Brașov: [
    "Brașov",
    "Făgăraș",
    "Săcele",
    "Codlea",
    "Râșnov",
    "Zărnești",
  ],
  Brăila: ["Brăila", "Ianca", "Însurăței", "Făurei"],
  București: [
    "Sector 1",
    "Sector 2",
    "Sector 3",
    "Sector 4",
    "Sector 5",
    "Sector 6",
  ],
  Buzău: [
    "Buzău",
    "Râmnicu Sărat",
    "Nehoiu",
    "Pătârlagele",
    "Pogoanele",
  ],
  "Caraș-Severin": [
    "Reșița",
    "Caransebeș",
    "Bocșa",
    "Oravița",
    "Moldova Nouă",
    "Băile Herculane",
  ],
  Călărași: [
    "Călărași",
    "Oltenița",
    "Lehliu Gară",
    "Budești",
    "Fundulea",
  ],
  Cluj: [
    "Cluj-Napoca",
    "Turda",
    "Dej",
    "Câmpia Turzii",
    "Gherla",
    "Huedin",
  ],
  Constanța: [
    "Constanța",
    "Mangalia",
    "Medgidia",
    "Năvodari",
    "Cernavodă",
    "Ovidiu",
    "Eforie",
  ],
  Covasna: [
    "Sfântu Gheorghe",
    "Târgu Secuiesc",
    "Covasna",
    "Baraolt",
  ],
  Dâmbovița: [
    "Târgoviște",
    "Moreni",
    "Pucioasa",
    "Găești",
    "Titu",
    "Fieni",
  ],
  Dolj: [
    "Craiova",
    "Băilești",
    "Calafat",
    "Filiași",
    "Segarcea",
    "Dăbuleni",
  ],
  Galați: ["Galați", "Tecuci", "Târgu Bujor", "Berești"],
  Giurgiu: ["Giurgiu", "Bolintin-Vale", "Mihăilești"],
  Gorj: [
    "Târgu Jiu",
    "Motru",
    "Rovinari",
    "Bumbești-Jiu",
    "Târgu Cărbunești",
  ],
  Harghita: [
    "Miercurea Ciuc",
    "Odorheiu Secuiesc",
    "Gheorgheni",
    "Toplița",
    "Băile Tușnad",
  ],
  Hunedoara: [
    "Deva",
    "Hunedoara",
    "Petroșani",
    "Orăștie",
    "Brad",
    "Lupeni",
    "Vulcan",
  ],
  Ialomița: [
    "Slobozia",
    "Fetești",
    "Urziceni",
    "Țăndărei",
    "Amara",
  ],
  Iași: [
    "Iași",
    "Pașcani",
    "Târgu Frumos",
    "Hârlău",
    "Podu Iloaiei",
  ],
  Ilfov: [
    "Voluntari",
    "Popești-Leordeni",
    "Otopeni",
    "Pantelimon",
    "Buftea",
    "Chitila",
    "Bragadiru",
  ],
  Maramureș: [
    "Baia Mare",
    "Sighetu Marmației",
    "Borșa",
    "Vișeu de Sus",
    "Târgu Lăpuș",
  ],
  Mehedinți: [
    "Drobeta-Turnu Severin",
    "Orșova",
    "Strehaia",
    "Vânju Mare",
    "Baia de Aramă",
  ],
  Mureș: [
    "Târgu Mureș",
    "Sighișoara",
    "Reghin",
    "Târnăveni",
    "Luduș",
    "Sovata",
  ],
  Neamț: [
    "Piatra Neamț",
    "Roman",
    "Târgu Neamț",
    "Bicaz",
    "Roznov",
  ],
  Olt: [
    "Slatina",
    "Caracal",
    "Balș",
    "Corabia",
    "Drăgănești-Olt",
    "Scornicești",
  ],
  Prahova: [
    "Ploiești",
    "Câmpina",
    "Sinaia",
    "Bușteni",
    "Breaza",
    "Mizil",
    "Vălenii de Munte",
  ],
  Sălaj: [
    "Zalău",
    "Șimleu Silvaniei",
    "Jibou",
    "Cehu Silvaniei",
  ],
  "Satu Mare": [
    "Satu Mare",
    "Carei",
    "Negrești-Oaș",
    "Tășnad",
    "Ardud",
  ],
  Sibiu: [
    "Sibiu",
    "Mediaș",
    "Cisnădie",
    "Avrig",
    "Agnita",
    "Dumbrăveni",
  ],
  Suceava: [
    "Suceava",
    "Fălticeni",
    "Rădăuți",
    "Câmpulung Moldovenesc",
    "Vatra Dornei",
    "Gura Humorului",
  ],
  Teleorman: [
    "Alexandria",
    "Roșiorii de Vede",
    "Turnu Măgurele",
    "Zimnicea",
    "Videle",
  ],
  Timiș: [
    "Timișoara",
    "Lugoj",
    "Sânnicolau Mare",
    "Jimbolia",
    "Făget",
    "Deta",
    "Buziaș",
  ],
  Tulcea: ["Tulcea", "Babadag", "Măcin", "Isaccea", "Sulina"],
  Vaslui: ["Vaslui", "Bârlad", "Huși", "Negrești", "Murgeni"],
  Vâlcea: [
    "Râmnicu Vâlcea",
    "Drăgășani",
    "Călimănești",
    "Brezoi",
    "Horezu",
    "Băile Olănești",
  ],
  Vrancea: ["Focșani", "Adjud", "Mărășești", "Odobești", "Panciu"],
};

const WEB3FORMS_ACCESS_KEY =
  process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ?? "";

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [form, setForm] = useState<CheckoutForm>(initialForm);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

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

  function handleCountyChange(county: string) {
    setForm((current) => ({
      ...current,
      county,
      city: "",
      otherCity: "",
    }));
  }

  const availableCities = form.county
    ? countiesAndCities[form.county] ?? []
    : [];

  const selectedCity =
    form.city === "Altă localitate"
      ? form.otherCity.trim()
      : form.city.trim();

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

    const normalizedPhone = form.phone.trim();
    const phoneDigits = normalizedPhone.replace(/\D/g, "");

    const isInternationalPhone = /^\+[1-9]\d{7,14}$/.test(
      normalizedPhone
    );

    const isNationalPhone = /^0\d{8,14}$/.test(
      normalizedPhone
    );

    const hasRepeatedDigits = /^(\d)\1+$/.test(phoneDigits);

    if (
      (!isInternationalPhone && !isNationalPhone) ||
      hasRepeatedDigits
    ) {
      return "Introdu un număr de telefon valid, de exemplu 0712345678 sau +40712345678.";
    }

    const emailValue = form.email.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!emailValue) {
      return "Completează adresa de email.";
    }

    if (!emailPattern.test(emailValue)) {
      return "Introdu o adresă de email validă.";
    }

    if (!form.county) {
      return "Alege județul.";
    }

    if (!form.city) {
      return "Alege orașul sau localitatea.";
    }

    if (
      form.city === "Altă localitate" &&
      !form.otherCity.trim()
    ) {
      return "Scrie numele localității.";
    }

    if (!form.address.trim()) {
      return "Completează adresa de livrare.";
    }

    if (cart.length === 0) {
      return "Coșul este gol.";
    }

    return "";
  }

  function getDeliveryAddress() {
    return `${form.address.trim()}${
      form.postalCode.trim()
        ? `, Cod poștal: ${form.postalCode.trim()}`
        : ""
    }`;
  }

  async function sendOrderEmail(paymentLabel: string) {
    if (!WEB3FORMS_ACCESS_KEY) {
      throw new Error("Cheia Web3Forms nu este configurată.");
    }

    const productsText = cart
      .map(
        (item) =>
          `${item.name}
Mărime: ${item.size}
Cantitate: ${item.quantity}
Preț: ${item.price} Lei`
      )
      .join("\n\n");

    const orderMessage = `
COMANDĂ NOUĂ VOID MARKET

DATE CLIENT
Nume: ${form.firstName} ${form.lastName}
Telefon: ${form.phone}
Email: ${form.email || "Necompletat"}

LIVRARE
Metodă: FAN Courier
Județ: ${form.county}
Localitate: ${selectedCity}
Adresă / Locker: ${getDeliveryAddress()}

PRODUSE
${productsText}

PLATĂ
Metodă: ${paymentLabel}

SUMAR
Subtotal: ${subtotal} Lei
Transport: ${transport} Lei
Total: ${total} Lei

OBSERVAȚII
${form.notes || "Fără observații"}
    `.trim();

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
          subject: `Comandă nouă VOID MARKET - ${paymentLabel}`,
          from_name: "VOID MARKET Checkout",
          name: `${form.firstName} ${form.lastName}`,
          email:
            form.email.trim() || "voidmarket.ro@gmail.com",
          phone: form.phone,
          delivery_method: "FAN Courier",
          county: form.county,
          city: selectedCity,
          delivery_address: getDeliveryAddress(),
          payment_method: paymentLabel,
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
        result.message || "Comanda nu a putut fi trimisă."
      );
    }
  }

  async function handleCashOrder() {
    setSending(true);

    try {
      await sendOrderEmail("Ramburs");

      localStorage.removeItem("void-market-cart");
      window.dispatchEvent(new Event("cart-updated"));

      setCart([]);
      setSuccess(true);
    } catch (submitError) {
      console.error(submitError);

      setError(
        "Comanda nu a putut fi trimisă. Încearcă din nou."
      );
    } finally {
      setSending(false);
    }
  }

  async function handleCardPayment() {
    setSending(true);
    setError("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          county: form.county,
          city: selectedCity,
          deliveryMethod: "fan",
          deliveryAddress: getDeliveryAddress(),
          items: cart.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.url) {
        throw new Error(
          result.error || "Nu am putut porni plata."
        );
      }

      window.location.href = result.url;
    } catch (paymentError: unknown) {
      console.error(paymentError);

      setError(
        paymentError instanceof Error
          ? paymentError.message
          : "Nu am putut deschide plata cu cardul."
      );

      setSending(false);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (form.paymentMethod === "card") {
      await handleCardPayment();
      return;
    }

    await handleCashOrder();
  }

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
              Comanda ramburs a fost trimisă. Te vom contacta
              pentru confirmare și livrare.
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
              Adaugă un produs înainte să continui.
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
                <label>
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
                    required
                    className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-white"
                  />
                </label>

                <label>
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
                    required
                    className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-white"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm text-zinc-400">
                    Telefon *
                  </span>

                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(event) => {
                      const value = event.target.value
                        .replace(/[^\d+]/g, "")
                        .replace(/(?!^)\+/g, "")
                        .slice(0, 16);

                      updateField("phone", value);
                    }}
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="0712345678 sau +40712345678"
                    required
                    className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-white"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm text-zinc-400">
                    Email *
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
                    required
                    className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-white"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8">
              <h2 className="text-2xl font-bold">
                Metoda de livrare
              </h2>

              <div className="mt-6 rounded-2xl border border-white bg-zinc-900 p-5">
                <p className="font-semibold">FAN Courier</p>
                <p className="mt-2 text-sm text-zinc-500">
                  Livrare la adresa completată mai jos.
                </p>
              </div>
            </section>

            <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8">
              <h2 className="text-2xl font-bold">
                Date pentru livrare
              </h2>

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <label>
                  <span className="mb-2 block text-sm text-zinc-400">
                    Județ *
                  </span>

                  <select
                    value={form.county}
                    onChange={(event) =>
                      handleCountyChange(event.target.value)
                    }
                    className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-white"
                  >
                    <option value="">Alege județul</option>

                    {Object.keys(countiesAndCities).map(
                      (county) => (
                        <option key={county} value={county}>
                          {county}
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label>
                  <span className="mb-2 block text-sm text-zinc-400">
                    Oraș / Localitate *
                  </span>

                  <select
                    value={form.city}
                    disabled={!form.county}
                    onChange={(event) =>
                      updateField("city", event.target.value)
                    }
                    className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-white disabled:opacity-50"
                  >
                    <option value="">
                      Alege localitatea
                    </option>

                    {availableCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}

                    {form.county && (
                      <option value="Altă localitate">
                        Altă localitate
                      </option>
                    )}
                  </select>
                </label>

                {form.city === "Altă localitate" && (
                  <label className="md:col-span-2">
                    <span className="mb-2 block text-sm text-zinc-400">
                      Scrie localitatea *
                    </span>

                    <input
                      type="text"
                      value={form.otherCity}
                      onChange={(event) =>
                        updateField(
                          "otherCity",
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-white"
                    />
                  </label>
                )}

                <label className="md:col-span-2">
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
                    placeholder="Stradă, număr, bloc, scară, apartament"
                    autoComplete="street-address"
                    required
                    className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-white"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm text-zinc-400">
                    Cod poștal
                  </span>

                  <input
                    type="text"
                    value={form.postalCode}
                    onChange={(event) =>
                      updateField(
                        "postalCode",
                        event.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                    inputMode="numeric"
                    autoComplete="postal-code"
                    className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-white"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8">
              <h2 className="text-2xl font-bold">
                Metoda de plată
              </h2>

              <div className="mt-6 space-y-4">
                <label
                  className={`block cursor-pointer rounded-2xl border p-5 ${
                    form.paymentMethod === "cash"
                      ? "border-white bg-zinc-900"
                      : "border-zinc-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={form.paymentMethod === "cash"}
                    onChange={() =>
                      updateField("paymentMethod", "cash")
                    }
                  />

                  <span className="ml-3 font-semibold">
                    Ramburs
                  </span>

                  <p className="ml-7 mt-2 text-sm text-zinc-500">
                    Plătești când primești coletul.
                  </p>
                </label>

                <label
                  className={`block cursor-pointer rounded-2xl border p-5 ${
                    form.paymentMethod === "card"
                      ? "border-white bg-zinc-900"
                      : "border-zinc-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={form.paymentMethod === "card"}
                    onChange={() =>
                      updateField("paymentMethod", "card")
                    }
                  />

                  <span className="ml-3 font-semibold">
                    Card
                  </span>

                  <p className="ml-7 mt-2 text-sm text-zinc-500">
                    Vei fi redirecționat pe pagina securizată Stripe.
                  </p>
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
                className="mt-6 w-full resize-none rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-white"
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
              disabled={sending}
              className="mt-8 w-full rounded-2xl bg-white py-4 text-lg font-bold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending
                ? "Se procesează..."
                : form.paymentMethod === "card"
                ? "Continuă spre plata cu cardul"
                : "Plasează comanda"}
            </button>

            <Link
              href="/cos"
              className="mt-4 block text-center text-sm text-zinc-400 underline hover:text-white"
            >
              Înapoi la coș
            </Link>
          </aside>
        </form>
      </section>
    </main>
  );
}