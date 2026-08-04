import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DeleteProductButton from "./DeleteProductButton";

type Product = {
  id: string;
  name: string;
  brand: string;
  price: number;
  size: string;
  image: string | null;
  stock: number | null;
};

export default async function AdminPage() {
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

  const { data, error: productsError } =
    await supabase
      .from("products")
      .select(
        "id, name, brand, price, size, image, stock"
      )
      .order("created_at", {
        ascending: false,
      });

  if (productsError) {
    console.error(
      "Eroare la încărcarea produselor:",
      productsError
    );
  }

  const { count: ordersCount, error: ordersError } =
    await supabase
      .from("orders")
      .select("*", {
        count: "exact",
        head: true,
      });

  if (ordersError) {
    console.error(
      "Eroare la numărarea comenzilor:",
      ordersError
    );
  }

  const products: Product[] = data ?? [];

  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold md:text-5xl">
              VOID MARKET ADMIN
            </h1>

            <p className="mt-4 text-zinc-400">
              Conectat ca:
            </p>

            <p className="font-bold">
              {user.email}
            </p>
          </div>

          <Link
            href="/"
            className="rounded-xl border border-zinc-700 px-6 py-3 text-center font-semibold transition hover:border-white"
          >
            Vezi site-ul
          </Link>
        </header>

        <section className="mt-10 grid gap-6 md:grid-cols-3">
          <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-zinc-400">
              Produse
            </p>

            <h2 className="mt-4 text-5xl font-bold">
              {products.length}
            </h2>
          </article>

          <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-zinc-400">
              Comenzi
            </p>

            <h2 className="mt-4 text-5xl font-bold">
              {ordersCount ?? 0}
            </h2>

            <Link
              href="/admin/orders"
              className="mt-5 inline-block rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold transition hover:border-white"
            >
              Vezi comenzile
            </Link>
          </article>

          <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-zinc-400">
              Venit real
            </p>

            <h2 className="mt-4 text-5xl font-bold">
              0 Lei
            </h2>

            <p className="mt-3 text-xs text-zinc-500">
              Plățile din Stripe Sandbox nu sunt bani reali.
            </p>
          </article>
        </section>

        <section className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-bold">
                Produse
              </h2>

              <p className="mt-3 text-zinc-400">
                Ai {products.length} produse în baza de date.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/admin/orders"
                className="rounded-xl border border-zinc-700 px-6 py-3 text-center font-bold transition hover:border-white"
              >
                Vezi comenzile
              </Link>

              <Link
                href="/admin/products/new"
                className="rounded-xl bg-white px-6 py-3 text-center font-bold text-black transition hover:bg-zinc-200"
              >
                + Adaugă produs
              </Link>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-zinc-700 px-6 py-16 text-center">
              <p className="text-zinc-500">
                Nu există produse.
              </p>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="flex flex-col gap-5 rounded-2xl border border-zinc-800 bg-black p-5 md:flex-row md:items-center"
                >
                  <div className="flex h-28 w-full items-center justify-center overflow-hidden rounded-xl bg-zinc-950 md:w-28">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-zinc-600">
                        Fără poză
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="text-sm uppercase tracking-wider text-zinc-500">
                      {product.brand}
                    </p>

                    <h3 className="mt-1 text-xl font-bold">
                      {product.name}
                    </h3>

                    <p className="mt-2 text-sm text-zinc-400">
                      {product.price} Lei • Mărime{" "}
                      {product.size} • Stoc{" "}
                      {product.stock ?? 0}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/products/${product.id}`}
                      className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold transition hover:border-white"
                    >
                      Vezi
                    </Link>

                    <DeleteProductButton
                      productId={product.id}
                      productName={product.name}
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}