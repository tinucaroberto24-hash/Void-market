import Link from "next/link";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";

type Product = {
  id: string;
  name: string;
  brand: string;
  price: number;
  size: string;
  condition: string;
  description: string | null;
  image: string | null;
  stock: number | null;
};

export default async function Home() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, brand, price, size, condition, description, image, stock"
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Eroare la încărcarea produselor:", error);
  }

  const products: Product[] = data ?? [];

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      {/* HERO */}
      <section className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
        <p className="mb-5 text-sm uppercase tracking-[0.5em] text-zinc-500">
          Streetwear Resell
        </p>

        <h1 className="text-5xl font-black tracking-[0.18em] sm:text-7xl md:text-8xl">
          VOID MARKET
        </h1>

        <a
          href="#magazin"
          className="mt-10 rounded-xl bg-white px-8 py-4 font-bold text-black transition hover:scale-105 hover:bg-zinc-200"
        >
          VEZI PRODUSELE
        </a>
      </section>

      {/* MAGAZIN */}
      <section
        id="magazin"
        className="mx-auto max-w-7xl px-6 py-20"
      >
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
              Disponibil acum
            </p>

            <h2 className="mt-3 text-4xl font-bold">
              Magazin
            </h2>
          </div>

          <p className="text-zinc-500">
            {products.length}{" "}
            {products.length === 1 ? "produs" : "produse"} în magazin
          </p>
        </div>

        {products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-700 px-6 py-20 text-center">
            <h3 className="text-2xl font-bold">
              Nu există produse momentan
            </h3>

            <p className="mt-3 text-zinc-500">
              Produsele adăugate din panoul Admin vor apărea aici.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const inStock = (product.stock ?? 0) > 0;

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group block overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 transition hover:-translate-y-2 hover:border-white"
                >
                  <div className="flex h-96 items-center justify-center overflow-hidden bg-zinc-950">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="px-6 text-center text-zinc-600">
                        <p className="text-lg font-semibold">
                          Imagine indisponibilă
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
                      {product.brand}
                    </p>

                    <h3 className="mt-2 text-2xl font-bold">
                      {product.name}
                    </h3>

                    <p className="mt-3 text-zinc-400">
                      Mărime {product.size}
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      {product.condition}
                    </p>

                    {product.description && (
                      <p className="mt-4 line-clamp-3 text-sm leading-6 text-zinc-400">
                        {product.description}
                      </p>
                    )}

                    <div className="mt-6 flex items-center justify-between gap-4">
                      <span className="text-2xl font-bold">
                        {product.price} Lei
                      </span>

                      <span
                        className={`rounded-xl px-4 py-2 text-sm font-bold ${
                          inStock
                            ? "bg-white text-black"
                            : "bg-zinc-800 text-zinc-500"
                        }`}
                      >
                        {inStock ? "Vezi produsul" : "Stoc epuizat"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* RECENZII */}
      <section
        id="recenzii"
        className="border-t border-zinc-800 bg-zinc-950 px-6 py-24"
      >
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
              Păreri clienți
            </p>

            <h2 className="mt-3 text-4xl font-bold">
              Recenzii
            </h2>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            <article className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
              <p className="text-xl text-yellow-400">★★★★★</p>

              <p className="mt-5 leading-7 text-zinc-300">
                Produsul a ajuns exact ca în poze și a fost ambalat foarte bine.
                Comunicarea a fost rapidă.
              </p>

              <div className="mt-7">
                <p className="font-semibold">Andrei Popescu</p>
                <p className="text-sm text-zinc-500">București</p>
              </div>
            </article>

            <article className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
              <p className="text-xl text-yellow-400">★★★★★</p>

              <p className="mt-5 leading-7 text-zinc-300">
                Coletul a venit repede, iar produsul a fost exact cum era descris.
              </p>

              <div className="mt-7">
                <p className="font-semibold">Bianca Ionescu</p>
                <p className="text-sm text-zinc-500">Cluj-Napoca</p>
              </div>
            </article>

            <article className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
              <p className="text-xl text-yellow-400">★★★★★</p>

              <p className="mt-5 leading-7 text-zinc-300">
                Foarte mulțumit de comandă. Aș cumpăra din nou.
              </p>

              <div className="mt-7">
                <p className="font-semibold">Mihai Dumitrescu</p>
                <p className="text-sm text-zinc-500">Iași</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section
        id="contact"
        className="border-t border-zinc-800 px-6 py-24"
      >
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            Ai nevoie de ajutor?
          </p>

          <h2 className="mt-3 text-4xl font-bold">
            Contact
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-zinc-400">
            Pentru întrebări despre produse, livrare sau comenzi,
            ne poți contacta direct prin Gmail.
          </p>

          <div className="mx-auto mt-12 max-w-xl rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
              Email
            </p>

            <p className="mt-4 break-all text-xl font-bold">
              voidmarket.ro@gmail.com
            </p>

            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=voidmarket.ro@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-block rounded-xl bg-white px-8 py-4 font-bold text-black transition hover:scale-105 hover:bg-zinc-200"
            >
              TRIMITE MESAJ
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-800 px-6 py-8 text-center text-zinc-500">
        © 2026 VOID MARKET
      </footer>
    </main>
  );
}