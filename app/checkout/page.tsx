"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

type CartItem = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  size: string;
  image: string;
  quantity: number;
  voucherId?: string;
  voucherCode?: string;
  discountPercent?: number;
  voucherUses?: number;
};

type PaymentMethod = "cash" | "card";
type DeliveryMethod =
  | "sameday_address"
  | "sameday_easybox";

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
  easyboxName: string;
  deliveryMethod: DeliveryMethod;
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
  easyboxName: "",
  deliveryMethod: "sameday_address",
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

function normalizeNumber(
  value: unknown,
  fallback = 0
) {
  const parsed =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat(
    "ro-RO",
    {
      minimumFractionDigits:
        Number.isInteger(value)
          ? 0
          : 2,
      maximumFractionDigits: 2,
    }
  ).format(value);
}

function getCartItemTotal(
  item: CartItem
) {
  const quantity = Math.max(
    0,
    normalizeNumber(
      item.quantity
    )
  );

  const discountedQuantity =
    Math.min(
      quantity,
      Math.max(
        0,
        normalizeNumber(
          item.voucherUses
        )
      )
    );

  const regularQuantity =
    quantity -
    discountedQuantity;

  const discountedPrice =
    Math.max(
      0,
      normalizeNumber(
        item.price
      )
    );

  const regularPrice =
    Math.max(
      0,
      normalizeNumber(
        item.originalPrice,
        discountedPrice
      )
    );

  return (
    discountedQuantity *
      discountedPrice +
    regularQuantity *
      regularPrice
  );
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [form, setForm] = useState<CheckoutForm>(initialForm);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("void-market-cart");

    if (savedCart) {
      try {
        const parsedCart: CartItem[] =
          JSON.parse(savedCart);

        const normalizedCart =
          parsedCart.map((item) => ({
            ...item,
            price: Math.max(
              0,
              normalizeNumber(
                item.price
              )
            ),
            originalPrice:
              item.originalPrice ===
              undefined
                ? undefined
                : Math.max(
                    0,
                    normalizeNumber(
                      item.originalPrice
                    )
                  ),
            quantity: Math.max(
              1,
              Math.floor(
                normalizeNumber(
                  item.quantity,
                  1
                )
              )
            ),
            voucherUses:
              item.voucherUses ===
              undefined
                ? undefined
                : Math.max(
                    0,
                    Math.floor(
                      normalizeNumber(
                        item.voucherUses
                      )
                    )
                  ),
          }));

        setCart(normalizedCart);
      } catch {
        localStorage.removeItem("void-market-cart");
      }
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (
      form.deliveryMethod !==
      "sameday_address"
    ) {
      updateField(
        "deliveryMethod",
        "sameday_address"
      );
    }
  }, [form.deliveryMethod]);

  useEffect(() => {
    if (!success) return;

    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      setTimeout(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 100);
    });
  }, [success]);

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
    (sum, item) =>
      sum + getCartItemTotal(item),
    0
  );

  const transport = 0;

  const total =
    subtotal + transport;

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

    if (
      form.deliveryMethod ===
        "sameday_address" &&
      !form.address.trim()
    ) {
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

  const deliveryLabel =
    "SAMEDAY la adresă";

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
Preț total: ${formatPrice(
            getCartItemTotal(item)
          )} Lei`
      )
      .join("\n\n");

    const orderMessage = `
COMANDĂ NOUĂ VOID MARKET

DATE CLIENT
Nume: ${form.firstName} ${form.lastName}
Telefon: ${form.phone}
Email: ${form.email || "Necompletat"}

LIVRARE
Metodă: ${deliveryLabel}
Județ: ${form.county}
Localitate: ${selectedCity}
Adresă / Locker: ${getDeliveryAddress()}

PRODUSE
${productsText}

PLATĂ
Metodă: ${paymentLabel}

SUMAR
Subtotal: ${formatPrice(subtotal)} Lei
Transport: ${formatPrice(transport)} Lei
Total: ${formatPrice(total)} Lei

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
          delivery_method: deliveryLabel,
          county: form.county,
          city: selectedCity,
          delivery_address: getDeliveryAddress(),
          payment_method: paymentLabel,
          subtotal: `${formatPrice(subtotal)} Lei`,
          transport: `${formatPrice(transport)} Lei`,
          total: `${formatPrice(total)} Lei`,
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
    setError("");

    try {
      const orderId = crypto.randomUUID();

      const response = await fetch("/api/orders/cash", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          customerName: `${form.firstName} ${form.lastName}`,
          email: form.email,
          phone: form.phone,
          county: form.county,
          city: selectedCity,
          deliveryAddress: getDeliveryAddress(),
          deliveryMethod:
            form.deliveryMethod,
          items: cart.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            originalPrice:
              item.originalPrice,
            voucherId:
              item.voucherId,
            voucherCode:
              item.voucherCode,
            discountPercent:
              item.discountPercent,
            voucherUses:
              item.voucherUses,
          })),
        }),
      });

      const responseText = await response.text();

      let result: {
        success?: boolean;
        error?: string;
        orderId?: string;
      };

      try {
        result = JSON.parse(responseText);
      } catch {
        throw new Error(
          responseText ||
            "Ruta pentru comenzile ramburs a returnat un răspuns invalid."
        );
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Nu am putut salva comanda."
        );
      }

      try {
        await sendOrderEmail("Ramburs");
      } catch (emailError) {
        console.error(
          "Comanda a fost salvată, dar emailul nu a putut fi trimis:",
          emailError
        );
      }

      localStorage.removeItem("void-market-cart");
      window.dispatchEvent(new Event("cart-updated"));

      const finalOrderId = result.orderId ?? orderId;

      setCart([]);
      setOrderId(finalOrderId);

      localStorage.setItem(
        "void-market-last-order",
        JSON.stringify({
          orderId: finalOrderId,
          email: form.email,
        })
      );

      setSuccess(true);
    } catch (submitError: unknown) {
      console.error(submitError);

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Comanda nu a putut fi trimisă."
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
          deliveryMethod:
            form.deliveryMethod,
          deliveryAddress: getDeliveryAddress(),
          items: cart.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            originalPrice:
              item.originalPrice,
            voucherId:
              item.voucherId,
            voucherCode:
              item.voucherCode,
            discountPercent:
              item.discountPercent,
            voucherUses:
              item.voucherUses,
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

        {showToast && (
          <div className="fixed right-5 top-24 z-[100] rounded-2xl border border-green-800 bg-green-950 px-5 py-4 text-sm font-semibold text-green-300 shadow-2xl">
            ✓ ID-ul comenzii a fost copiat.
          </div>
        )}

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

            {orderId && (
              <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-zinc-700 bg-black p-6">
                <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
                  ID comandă
                </p>

                <p className="mt-3 break-all text-lg font-bold">
                  {orderId}
                </p>

                <p className="mt-3 text-sm leading-6 text-zinc-500">
                  Păstrează acest ID. Îl vei folosi împreună cu
                  emailul în pagina „Urmărește comanda”.
                </p>

                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(orderId);
                      setCopied(true);
                      setShowToast(true);

                      window.setTimeout(() => {
                        setShowToast(false);
                      }, 5000);
                    } catch (copyError) {
                      console.error(
                        "ID-ul comenzii nu a putut fi copiat:",
                        copyError
                      );
                    }
                  }}
                  className={`mt-5 rounded-xl px-5 py-3 font-bold transition ${
                    copied
                      ? "border border-green-700 bg-green-950 text-green-300"
                      : "bg-white text-black hover:bg-zinc-200"
                  }`}
                >
                  {copied ? "✓ ID copiat" : "Copiază ID-ul"}
                </button>

                <Link
                  href="/track-order"
                  className="mt-4 block text-sm font-semibold text-zinc-400 underline transition hover:text-white"
                >
                  Urmărește comanda
                </Link>
              </div>
            )}

            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href="mailto:voidmarket.ro@gmail.com?subject=Ajutor%20comandă%20VOID%20MARKET"
                className="rounded-2xl border border-zinc-700 px-8 py-4 font-bold text-white transition hover:border-white"
              >
                Contactează-ne
              </a>

              <Link
                href="/"
                className="rounded-2xl bg-white px-8 py-4 font-bold text-black transition hover:bg-zinc-200"
              >
                Înapoi la pagina principală
              </Link>
            </div>
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

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="cursor-pointer rounded-2xl border border-white bg-zinc-900 p-5">
                  <input
                    type="radio"
                    name="delivery"
                    checked
                    readOnly
                  />

                  <span className="ml-3 font-semibold">
                    SAMEDAY la adresă
                  </span>

                  <p className="ml-7 mt-2 text-sm text-zinc-500">
                    Livrare direct la adresa completată.
                  </p>

                  <p className="ml-7 mt-3 text-lg font-black text-green-400">
                    Gratuit
                  </p>
                </label>

                <div className="rounded-2xl border border-zinc-800 bg-black/40 p-5 opacity-60">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-zinc-400">
                        SAMEDAY easybox
                      </p>

                      <p className="mt-2 text-sm leading-6 text-zinc-600">
                        Disponibil în curând, după activarea plății online.
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full border border-zinc-700 px-3 py-1 text-xs font-bold text-zinc-500">
                      În curând
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm font-semibold">
                  ✓ Transport gratuit în România
                </div>

                <div className="rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm font-semibold">
                  ✓ Plată ramburs
                </div>
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

                <div className="rounded-2xl border border-zinc-800 bg-black/40 p-5 opacity-60">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <span className="font-semibold text-zinc-400">
                        Card
                      </span>

                      <p className="mt-2 text-sm text-zinc-600">
                        Plata cu cardul este indisponibilă momentan.
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full border border-zinc-700 px-3 py-1 text-xs font-bold text-zinc-500">
                      Indisponibil
                    </span>
                  </div>
                </div>
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
              {cart.map(
                (item, index) => {
                  const itemTotal =
                    getCartItemTotal(item);

                  const regularPrice =
                    normalizeNumber(
                      item.originalPrice,
                      item.price
                    );

                  return (
                    <div
                      key={`${item.id}-${item.size}-${index}`}
                      className="flex gap-4 border-b border-zinc-800 pb-5"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-24 w-24 rounded-xl bg-zinc-900 object-contain"
                        />
                      ) : (
                        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-zinc-900 px-2 text-center text-xs text-zinc-500">
                          Fără imagine
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold">
                          {item.name}
                        </h3>

                        <p className="mt-1 text-sm text-zinc-500">
                          Mărime: {item.size}
                        </p>

                        <p className="mt-1 text-sm text-zinc-500">
                          Cantitate: {item.quantity}
                        </p>

                        <p className="mt-2 font-bold">
                          {formatPrice(
                            itemTotal
                          )}{" "}
                          Lei
                        </p>

                        {item.discountPercent &&
                          item.voucherUses ===
                            1 && (
                            <p className="mt-1 text-xs leading-5 text-green-400">
                              Reducerea de{" "}
                              {
                                item.discountPercent
                              }
                              % se aplică unei
                              singure bucăți.
                              {item.quantity >
                                1 &&
                                ` Restul rămân la ${formatPrice(
                                  regularPrice
                                )} Lei/bucată.`}
                            </p>
                          )}
                      </div>
                    </div>
                  );
                }
              )}

              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span>
                  {formatPrice(subtotal)} Lei
                </span>
              </div>

              <div className="flex justify-between text-zinc-400">
                <span>Transport</span>
                <span className="font-semibold text-green-400">
                  Gratuit
                </span>
              </div>

              <div className="flex justify-between border-t border-zinc-800 pt-5 text-2xl font-bold">
                <span>Total</span>
                <span>
                  {formatPrice(total)} Lei
                </span>
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