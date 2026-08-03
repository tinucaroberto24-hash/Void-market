import Navbar from "@/components/Navbar";

export default function Home() {
  const products = [
    {
      name: "Louis Vuitton LV Sweatshirt",
      price: "250 Lei",
      image: "/lv/front.jpeg",
      href: "/products/lv-sweatshirt",
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
        <p className="mb-5 text-sm uppercase tracking-[0.5em] text-zinc-500">
          Streetwear Resell
        </p>

        <h1 className="text-5xl font-black tracking-[0.18em] sm:text-7xl md:text-8xl">
          VOID MARKET
        </h1>

        <p className="mt-6 max-w-xl text-lg text-zinc-400">
          Produse selectate, disponibile în stoc și pregătite pentru livrare.
        </p>

        <a
          href="#magazin"
          className="mt-10 rounded-xl bg-white px-8 py-4 font-bold text-black transition hover:scale-105 hover:bg-zinc-200"
        >
          VEZI PRODUSELE
        </a>
      </section>

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
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <a
              key={product.name}
              href={product.href}
              className="group overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 transition duration-300 hover:-translate-y-2 hover:border-white"
            >
              <div className="overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-96 w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-bold">
                  {product.name}
                </h3>

                <p className="mt-2 text-zinc-400">
                  Mărime S
                </p>

                <div className="mt-6 flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {product.price}
                  </span>

                  <span className="rounded-xl bg-white px-5 py-2 font-bold text-black">
                    Vezi
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section
        id="contact"
        className="border-t border-zinc-800 py-20"
      >
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-4xl font-bold">
            Contact
          </h2>

          <p className="mt-6 text-zinc-400">
            Pentru întrebări despre produse sau comenzi ne poți contacta oricând.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">

            <div className="rounded-2xl bg-zinc-900 p-6">
              <h3 className="font-bold">Email</h3>
              <p className="mt-3 text-zinc-400">
                contact@voidmarket.ro
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-900 p-6">
              <h3 className="font-bold">Telefon</h3>
              <p className="mt-3 text-zinc-400">
                +40 700 000 000
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-900 p-6">
              <h3 className="font-bold">Program</h3>
              <p className="mt-3 text-zinc-400">
                Luni - Vineri
                <br />
                09:00 - 18:00
              </p>
            </div>

          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-800 py-8 text-center text-zinc-500">
        © 2026 VOID MARKET
      </footer>
    </main>
  );
}