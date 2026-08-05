import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OrderStatusSelect from "./OrderStatusSelect";
import CopyButton from "@/components/CopyButton";

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total: number;
};

type ProductImage = {
  id: string;
  image: string | null;
};

type Order = {
  id: string;
  created_at: string;
  stripe_session_id: string | null;
  customer_name: string;
  email: string;
  phone: string;
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

type AdminOrderPageProps = {
  params: Promise<{
    id: string;
  }>;
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

    case "Anulată":
      return "border-red-800 bg-red-950/40 text-red-300";

    default:
      return "border-yellow-800 bg-yellow-950/40 text-yellow-300";
  }
}

export default async function AdminOrderPage({
  params,
}: AdminOrderPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (
    !user ||
    user.email !== "voidmarket.ro@gmail.com"
  ) {
    redirect("/admin/login");
  }

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
        id,
        created_at,
        stripe_session_id,
        customer_name,
        email,
        phone,
        county,
        city,
        delivery_address,
        delivery_method,
        payment_method,
        status,
        subtotal,
        transport,
        total,
        items
      `
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error(
      "Eroare la încărcarea comenzii:",
      error
    );

    notFound();
  }

  const order = data as Order;

  const productIds = [
    ...new Set(
      order.items.map((item) => item.id)
    ),
  ];

  const {
    data: productImagesData,
    error: productImagesError,
  } = productIds.length
    ? await supabase
        .from("products")
        .select("id, image")
        .in("id", productIds)
    : { data: [], error: null };

  if (productImagesError) {
    console.error(
      "Eroare la încărcarea imaginilor produselor:",
      productImagesError
    );
  }

  const productImages = new Map(
    ((productImagesData as ProductImage[] | null) ?? []).map(
      (product) => [product.id, product.image]
    )
  );

  const cashAmount =
    order.payment_method === "cash"
      ? String(order.total)
      : "0";

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-6 border-b border-zinc-800 pb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
              VOID MARKET ADMIN
            </p>

            <h1 className="mt-3 text-4xl font-black md:text-5xl">
              Detalii comandă
            </h1>

            <p className="mt-3 break-all text-sm text-zinc-500">
              ID: {order.id}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/orders"
              className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold transition hover:border-white"
            >
              ← Înapoi la comenzi
            </Link>

            <Link
              href="/admin"
              className="rounded-xl bg-white px-5 py-3 font-bold text-black transition hover:bg-zinc-200"
            >
              Panou Admin
            </Link>
          </div>
        </header>

        <section className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-4">
                <h2 className="text-3xl font-black">
                  {order.customer_name}
                </h2>

                <span
                  className={`rounded-full border px-4 py-2 text-sm font-bold ${getStatusClasses(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>

              <p className="mt-3 text-zinc-500">
                Plasată la {formatDate(order.created_at)}
              </p>
            </div>

            <div className="md:text-right">
              <p className="text-sm text-zinc-500">
                Total comandă
              </p>

              <p className="mt-2 text-4xl font-black">
                {order.total} Lei
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8">
              <h2 className="text-2xl font-bold">
                Produse comandate
              </h2>

              <div className="mt-6 space-y-4">
                {order.items.map((item, index) => {
                  const productImage =
                    productImages.get(item.id);

                  return (
                    <article
                      key={`${item.id}-${index}`}
                      className="rounded-2xl border border-zinc-800 bg-black p-5"
                    >
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                        <div className="flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 sm:w-28">
                          {productImage ? (
                            <img
                              src={productImage}
                              alt={item.name}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <div className="px-3 text-center text-xs text-zinc-600">
                              Fără poză
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-xl font-bold">
                            {item.name}
                          </h3>

                          <p className="mt-2 break-all text-sm text-zinc-500">
                            ID produs: {item.id}
                          </p>

                          <p className="mt-3 text-zinc-400">
                            {item.unit_price} Lei × {item.quantity}
                          </p>

                          <p className="mt-1 text-sm text-zinc-500">
                            Cantitate: {item.quantity}
                          </p>
                        </div>

                        <div className="sm:text-right">
                          <p className="text-sm text-zinc-500">
                            Total produs
                          </p>

                          <p className="mt-1 text-2xl font-black">
                            {item.total} Lei
                          </p>
                        </div>
                      </div>

                      <Link
                        href={`/products/${item.id}`}
                        className="mt-5 inline-block text-sm font-semibold text-zinc-400 underline transition hover:text-white"
                      >
                        Vezi produsul
                      </Link>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="grid gap-8 md:grid-cols-2">
              <article className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
                <h2 className="text-xl font-bold">
                  Date client
                </h2>

                <div className="mt-6 space-y-4 text-sm">
                  <div>
                    <p className="text-zinc-500">Nume</p>
                    <div className="mt-1 flex items-center justify-between gap-3">
                      <p className="font-semibold">
                        {order.customer_name}
                      </p>
                      <CopyButton value={order.customer_name} />
                    </div>
                  </div>

                  <div>
                    <p className="text-zinc-500">Email</p>
                    <div className="mt-1 flex items-center justify-between gap-3">
                      <a
                        href={`mailto:${order.email}`}
                        className="min-w-0 break-all font-semibold underline"
                      >
                        {order.email}
                      </a>
                      <CopyButton value={order.email} />
                    </div>
                  </div>

                  <div>
                    <p className="text-zinc-500">Telefon</p>
                    <div className="mt-1 flex items-center justify-between gap-3">
                      <a
                        href={`tel:${order.phone}`}
                        className="font-semibold underline"
                      >
                        {order.phone}
                      </a>
                      <CopyButton value={order.phone} />
                    </div>
                  </div>
                </div>
              </article>

              <article className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
                <h2 className="text-xl font-bold">
                  Adresă de livrare
                </h2>

                <div className="mt-6 space-y-4 text-sm">
                  <div>
                    <p className="text-zinc-500">Județ</p>
                    <div className="mt-1 flex items-center justify-between gap-3">
                      <p className="font-semibold">{order.county}</p>
                      <CopyButton value={order.county} />
                    </div>
                  </div>

                  <div>
                    <p className="text-zinc-500">Localitate</p>
                    <div className="mt-1 flex items-center justify-between gap-3">
                      <p className="font-semibold">{order.city}</p>
                      <CopyButton value={order.city} />
                    </div>
                  </div>

                  <div>
                    <p className="text-zinc-500">Adresă completă</p>
                    <div className="mt-1 flex items-start justify-between gap-3">
                      <p className="whitespace-pre-line font-semibold leading-6">
                        {order.delivery_address}
                      </p>
                      <CopyButton value={order.delivery_address} />
                    </div>
                  </div>
                </div>
              </article>
            </section>
          </div>

          <aside className="space-y-8">
            <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <h2 className="text-xl font-bold">
                Administrare
              </h2>

              <div className="mt-6">
                <OrderStatusSelect
                  orderId={order.id}
                  currentStatus={order.status}
                />
              </div>
            </section>

            <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <h2 className="text-xl font-bold">
                Date AWB
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Copiază fiecare valoare în câmpul corespunzător din platforma curierului.
              </p>

              <div className="mt-6 space-y-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-zinc-500">Nume destinatar</p>
                    <p className="mt-1 font-semibold">{order.customer_name}</p>
                  </div>
                  <CopyButton value={order.customer_name} />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-zinc-500">Telefon</p>
                    <p className="mt-1 font-semibold">{order.phone}</p>
                  </div>
                  <CopyButton value={order.phone} />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-zinc-500">Ramburs</p>
                    <p className="mt-1 font-semibold">{cashAmount} Lei</p>
                  </div>
                  <CopyButton value={cashAmount} />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <h2 className="text-xl font-bold">
                Sumar
              </h2>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between gap-4 text-zinc-400">
                  <span>Plată</span>

                  <span className="font-semibold text-white">
                    {order.payment_method === "cash"
                      ? "Ramburs"
                      : "Card"}
                  </span>
                </div>

                <div className="flex justify-between gap-4 text-zinc-400">
                  <span>Livrare</span>

                  <span className="font-semibold text-white">
                    {order.delivery_method === "fan"
                      ? "FAN Courier"
                      : order.delivery_method}
                  </span>
                </div>

                <div className="flex justify-between gap-4 text-zinc-400">
                  <span>Subtotal</span>

                  <span>{order.subtotal} Lei</span>
                </div>

                <div className="flex justify-between gap-4 text-zinc-400">
                  <span>Transport</span>

                  <span>{order.transport} Lei</span>
                </div>

                <div className="flex justify-between gap-4 border-t border-zinc-800 pt-5 text-xl font-black">
                  <span>Total</span>

                  <span>{order.total} Lei</span>
                </div>
              </div>
            </section>

            {order.stripe_session_id && (
              <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
                <h2 className="text-xl font-bold">
                  Referință comandă
                </h2>

                <p className="mt-4 break-all text-xs leading-6 text-zinc-500">
                  {order.stripe_session_id}
                </p>
              </section>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}