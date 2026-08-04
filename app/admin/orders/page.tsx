import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ro-RO", {
    dateStyle: "medium",
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

export default async function AdminOrdersPage() {
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
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Eroare la încărcarea comenzilor:",
      error
    );
  }

  const orders: Order[] = data ?? [];

  const totalRevenue = orders
    .filter((order) => order.status !== "Anulată")
    .reduce(
      (sum, order) => sum + order.total,
      0
    );

  const newOrders = orders.filter(
    (order) => order.status === "Nouă"
  ).length;

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-6 border-b border-zinc-800 pb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
              VOID MARKET ADMIN
            </p>

            <h1 className="mt-3 text-4xl font-black md:text-5xl">
              Comenzi
            </h1>

            <p className="mt-3 text-zinc-400">
              Vezi și administrează comenzile magazinului.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold transition hover:border-white"
            >
              ← Înapoi la Admin
            </Link>

            <Link
              href="/"
              className="rounded-xl bg-white px-5 py-3 font-bold text-black transition hover:bg-zinc-200"
            >
              Vezi site-ul
            </Link>
          </div>
        </header>

        <section className="mt-10 grid gap-6 md:grid-cols-3">
          <article className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-zinc-400">
              Total comenzi
            </p>

            <h2 className="mt-4 text-5xl font-black">
              {orders.length}
            </h2>
          </article>

          <article className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-zinc-400">
              Comenzi noi
            </p>

            <h2 className="mt-4 text-5xl font-black">
              {newOrders}
            </h2>
          </article>

          <article className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-zinc-400">
              Venit total
            </p>

            <h2 className="mt-4 text-5xl font-black">
              {totalRevenue} Lei
            </h2>
          </article>
        </section>

        {orders.length === 0 ? (
          <section className="mt-10 rounded-3xl border border-dashed border-zinc-700 px-6 py-24 text-center">
            <h2 className="text-3xl font-bold">
              Nu există comenzi
            </h2>

            <p className="mt-4 text-zinc-500">
              Comenzile noi vor apărea automat aici.
            </p>
          </section>
        ) : (
          <section className="mt-10 space-y-6">
            {orders.map((order) => (
              <article
                key={order.id}
                className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950"
              >
                <div className="flex flex-col gap-5 border-b border-zinc-800 p-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-bold">
                        {order.customer_name}
                      </h2>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusClasses(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-zinc-500">
                      {formatDate(order.created_at)}
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-sm text-zinc-500">
                      Total comandă
                    </p>

                    <p className="mt-1 text-3xl font-black">
                      {order.total} Lei
                    </p>
                  </div>
                </div>

                <div className="grid gap-8 p-6 lg:grid-cols-[1fr_1fr_320px]">
                  <div>
                    <h3 className="font-bold">
                      Date client
                    </h3>

                    <div className="mt-4 space-y-2 text-sm text-zinc-400">
                      <p>
                        <span className="text-zinc-600">
                          Email:
                        </span>{" "}
                        {order.email}
                      </p>

                      <p>
                        <span className="text-zinc-600">
                          Telefon:
                        </span>{" "}
                        {order.phone}
                      </p>

                      <p>
                        <span className="text-zinc-600">
                          Județ:
                        </span>{" "}
                        {order.county}
                      </p>

                      <p>
                        <span className="text-zinc-600">
                          Localitate:
                        </span>{" "}
                        {order.city}
                      </p>

                      <p className="leading-6">
                        <span className="text-zinc-600">
                          Adresă:
                        </span>{" "}
                        {order.delivery_address}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold">
                      Produse
                    </h3>

                    <div className="mt-4 space-y-4">
                      {order.items.map((item, index) => (
                        <div
                          key={`${order.id}-${item.id}-${index}`}
                          className="rounded-xl border border-zinc-800 bg-black p-4"
                        >
                          <p className="font-semibold">
                            {item.name}
                          </p>

                          <p className="mt-2 text-sm text-zinc-500">
                            Cantitate: {item.quantity}
                          </p>

                          <p className="mt-1 text-sm text-zinc-500">
                            Preț: {item.unit_price} Lei
                          </p>

                          <p className="mt-2 font-bold">
                            {item.total} Lei
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold">
                      Detalii comandă
                    </h3>

                    <div className="mt-4 rounded-2xl border border-zinc-800 bg-black p-5">
                      <div className="space-y-3 text-sm">
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

                        <div className="flex justify-between gap-4 border-t border-zinc-800 pt-4 text-lg font-bold">
                          <span>Total</span>

                          <span>{order.total} Lei</span>
                        </div>
                      </div>

                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="mt-6 block rounded-xl bg-white px-5 py-3 text-center font-bold text-black transition hover:bg-zinc-200"
                      >
                        Vezi și modifică
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}