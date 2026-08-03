import Navbar from "@/components/Navbar";

export default function Home() {
  const products = [
    {
      name: "Louis Vuitton LV Sweatshirt",
      price: "250 Lei",
      size: "S",
      image: "/lv/front.jpeg",
      href: "/products/lv-sweatshirt",
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      {/* PAGINA PRINCIPALĂ */}
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
        className="mx-auto max-w-7xl px-6 py-20 md:px-10"
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
            {products.length} produs în stoc
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <a
              key={product.name}
              href={product.href}
              className="group overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 transition duration-300 hover:-translate-y-2 hover:border-white"
            >
              <div className="overflow-hidden bg-zinc-950">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-96 w-full object-contain transition duration-500 group-hover:scale-105"
                />
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-bold">
                  {product.name}
                </h3>

                <p className="mt-2 text-zinc-400">
                  Mărime {product.size}
                </p>

                <div className="mt-6 flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {product.price}
                  </span>

                  <span className="rounded-xl bg-white px-5 py-2 font-bold text-black">
                    Vezi produsul
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
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
              <p className="text-xl tracking-widest text-yellow-400">
                ★★★★★
              </p>

              <p className="mt-5 leading-7 text-zinc-300">
                Produsul a ajuns exact ca în poze și a fost ambalat foarte
                bine. Comunicarea a fost rapidă.
              </p>

              <div className="mt-7">
                <p className="font-semibold">
                  Andrei Popescu
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  București
                </p>
              </div>
            </article>

            <article className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
              <p className="text-xl tracking-widest text-yellow-400">
                ★★★★★
              </p>

              <p className="mt-5 leading-7 text-zinc-300">
                Coletul a venit repede, iar produsul a fost exact cum era
                descris. Totul a decurs fără probleme.
              </p>

              <div className="mt-7">
                <p className="font-semibold">
                  Bianca Ionescu
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  Cluj-Napoca
                </p>
              </div>
            </article>

            <article className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
              <p className="text-xl tracking-widest text-yellow-400">
                ★★★★★
              </p>

              <p className="mt-5 leading-7 text-zinc-300">
                Mi-au răspuns repede la întrebări și produsul a ajuns în stare
                foarte bună. Aș mai comanda.
              </p>

              <div className="mt-7">
                <p className="font-semibold">
                  Mihai Dumitrescu
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  Iași
                </p>
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
            Pentru întrebări despre produse, livrare sau comenzi, ne poți
            contacta prin email.
          </p>

          <div className="mx-auto mt-12 max-w-xl rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
              Email
            </p>

            <a
              href="mailto:tinucaroberto24@gmail.com"
              className="mt-4 block break-all text-xl font-bold transition hover:text-zinc-300"
            >
              tinucaroberto24@gmail.com
            </a>

            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=tinucaroberto24@gmail.com"
              target="_blank"
              rel="noreferrer"
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