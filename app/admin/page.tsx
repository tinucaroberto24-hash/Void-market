import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { count: productsCount, error: productsError } =
    await supabase
      .from("products")
      .select("*", {
        count: "exact",
        head: true,
      });

  if (productsError) {
    console.error(
      "Eroare la numărarea produselor:",
      productsError
    );
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-5xl font-bold">
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
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-zinc-400">Produse</p>

            <h2 className="mt-4 text-5xl font-bold">
              {productsCount ?? 0}
            </h2>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-zinc-400">Comenzi</p>

            <h2 className="mt-4 text-5xl font-bold">
              0
            </h2>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-zinc-400">Venit</p>

            <h2 className="mt-4 text-5xl font-bold">
              0 Lei
            </h2>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="text-3xl font-bold">
            Produse
          </h2>

          <p className="mt-3 text-zinc-400">
            Ai {productsCount ?? 0} produse în baza de date.
          </p>

          <Link
            href="/admin/products/new"
            className="mt-6 inline-block rounded-xl bg-white px-6 py-3 font-bold text-black transition hover:bg-zinc-200"
          >
            + Adaugă produs
          </Link>
        </div>
      </div>
    </main>
  );
}