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

      <section className="relative isolate flex min-h-[calc(100svh-81px)] items-center justify-center overflow-hidden px-5 py-16 text-center sm:px-6 md:min-h-[calc(100vh-89px)] md:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[42%] -z-30 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.075] blur-[105px] sm:h-[700px] sm:w-[700px] sm:bg-white/[0.06] md:h-[900px] md:w-[900px] md:blur-[150px]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-40 opacity-[0.16]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage:
              "radial-gradient(circle at center, black 0%, transparent 72%)",
            WebkitMaskImage:
              "radial-gradient(circle at center, black 0%, transparent 72%)",
          }}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[43%] -z-20 -translate-x-1/2 -translate-y-1/2 select-none animate-[pulse_8s_ease-in-out_infinite] text-[9rem] font-black leading-none tracking-[-0.12em] text-white/[0.09] sm:top-[45%] sm:text-[15rem] sm:text-white/[0.06] md:top-1/2 md:text-[24rem] md:text-white/[0.035] lg:text-[30rem]"
        >
          VM
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-5 top-6 hidden h-20 w-20 border-l border-t border-white/10 sm:block md:left-10 md:top-10 md:h-28 md:w-28"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-6 right-5 hidden h-20 w-20 border-b border-r border-white/10 sm:block md:bottom-10 md:right-10 md:h-28 md:w-28"
        />

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center">
          <p className="mb-5 text-[0.68rem] uppercase tracking-[0.42em] text-zinc-500 sm:text-xs sm:tracking-[0.5em] md:mb-6 md:text-sm">
            Streetwear Resell
          </p>

          <h1 className="max-w-full text-[2.75rem] font-black leading-[0.95] tracking-[0.12em] sm:text-6xl sm:tracking-[0.16em] md:text-8xl lg:text-[7rem]">
            VOID MARKET
          </h1>

          <p className="mx-auto mt-6 max-w-md text-sm leading-6 text-zinc-500 sm:text-base md:mt-7 md:max-w-xl">
            Piese atent selectate, stil premium și produse disponibile în
            cantități limitate.
          </p>

          <a
            href="#magazin"
            className="group mt-9 inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-white px-7 py-4 text-sm font-black text-black transition duration-300 hover:scale-[1.03] hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-4 focus:ring-offset-black sm:mt-10 sm:px-9 sm:text-base"
          >
            <span>VEZI PRODUSELE</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </a>

          <div className="mt-12 flex items-center gap-3 text-[0.65rem] uppercase tracking-[0.22em] text-zinc-700 sm:mt-14 sm:text-xs">
            <span className="h-px w-8 bg-zinc-800 sm:w-12" />
            <span>Scroll</span>
            <span className="h-px w-8 bg-zinc-800 sm:w-12" />
          </div>
        </div>
      </section>

      <section
        id="magazin"
        className="scroll-mt-24 mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20"
      >
        <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 sm:text-sm">
              Disponibil acum
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Magazin
            </h2>
          </div>

          <p className="text-sm text-zinc-500 sm:text-base">
            {products.length}{" "}
            {products.length === 1 ? "produs" : "produse"} în magazin
          </p>
        </div>

        {products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-700 px-5 py-16 text-center sm:px-6 sm:py-20">
            <h3 className="text-xl font-bold sm:text-2xl">
              Nu există produse momentan
            </h3>

            <p className="mt-3 text-sm text-zinc-500 sm:text-base">
              Produsele adăugate din panoul Admin vor apărea aici.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
            {products.map((product) => {
              const inStock = (product.stock ?? 0) > 0;

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group block overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 transition duration-300 hover:-translate-y-1 hover:border-zinc-600 sm:hover:-translate-y-2 sm:hover:border-white"
                >
                  <div className="flex aspect-[4/5] items-center justify-center overflow-hidden bg-zinc-950">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.03] sm:group-hover:scale-105"
                      />
                    ) : (
                      <div className="px-6 text-center text-zinc-600">
                        <p className="text-base font-semibold sm:text-lg">
                          Imagine indisponibilă
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-5 sm:p-6">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 sm:text-sm">
                      {product.brand}
                    </p>

                    <h3 className="mt-2 text-xl font-bold sm:text-2xl">
                      {product.name}
                    </h3>

                    <p className="mt-3 text-sm text-zinc-400 sm:text-base">
                      Mărime {product.size}
                    </p>

                    <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
                      {product.condition}
                    </p>

                    {product.description && (
                      <p className="mt-4 line-clamp-3 text-sm leading-6 text-zinc-400">
                        {product.description}
                      </p>
                    )}

                    <div className="mt-6 flex items-center justify-between gap-4">
                      <span className="text-xl font-bold sm:text-2xl">
                        {product.price} Lei
                      </span>

                      <span
                        className={`rounded-xl px-3 py-2 text-xs font-bold sm:px-4 sm:text-sm ${
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

      <section
        id="recenzii"
        className="scroll-mt-24 border-t border-zinc-800 bg-zinc-950 px-5 py-20 sm:px-6 sm:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 sm:text-sm">
              Păreri clienți
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Recenzii
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:mt-14 md:grid-cols-3 md:gap-8">
            {[
              {
                text: "Produsul a ajuns exact ca în poze și a fost ambalat foarte bine. Comunicarea a fost rapidă.",
                name: "Andrei Popescu",
                city: "București",
              },
              {
                text: "Coletul a venit repede, iar produsul a fost exact cum era descris.",
                name: "Bianca Ionescu",
                city: "Cluj-Napoca",
              },
              {
                text: "Foarte mulțumit de comandă. Aș cumpăra din nou.",
                name: "Mihai Dumitrescu",
                city: "Iași",
              },
            ].map((review) => (
              <article
                key={review.name}
                className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8"
              >
                <p className="text-lg text-yellow-400 sm:text-xl">
                  ★★★★★
                </p>

                <p className="mt-5 text-sm leading-7 text-zinc-300 sm:text-base">
                  {review.text}
                </p>

                <div className="mt-7">
                  <p className="font-semibold">
                    {review.name}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {review.city}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="scroll-mt-24 border-t border-zinc-800 px-5 py-20 sm:px-6 sm:py-24"
      >
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 sm:text-sm">
            Ai nevoie de ajutor?
          </p>

          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Contact
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            Pentru întrebări despre produse, livrare sau comenzi, ne poți
            contacta direct prin Gmail.
          </p>

          <div className="mx-auto mt-10 max-w-xl rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:mt-12 sm:p-8">
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500 sm:text-sm">
              Email
            </p>

            <p className="mt-4 break-all text-lg font-bold sm:text-xl">
              voidmarket.ro@gmail.com
            </p>

            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=voidmarket.ro@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex min-h-14 items-center justify-center rounded-xl bg-white px-7 py-4 text-sm font-bold text-black transition hover:scale-[1.02] hover:bg-zinc-200 sm:px-8 sm:text-base"
            >
              TRIMITE MESAJ
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-800 px-5 py-8 text-center text-sm text-zinc-500 sm:px-6">
        © 2026 VOID MARKET
      </footer>
    </main>
  );
}