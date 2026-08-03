import Navbar from "@/components/Navbar";

export default function Home() {
  const products = [
    {
      name: "Nike Dunk Low Panda",
      price: "950 RON",
      image:
        "https://images.stockx.com/images/Nike-Dunk-Low-Retro-White-Black-2021.jpg",
    },
    {
      name: "Air Jordan 4 Military Black",
      price: "1.850 RON",
      image:
        "https://images.stockx.com/images/Air-Jordan-4-Retro-Military-Black.jpg",
    },
    {
      name: "Fear Of God Essentials Hoodie",
      price: "780 RON",
      image:
        "https://images.stockx.com/images/Fear-of-God-Essentials-Hoodie.jpg",
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      {/* HERO */}
      <section className="flex flex-col justify-center items-center text-center h-[85vh] px-6">
        <h1 className="text-7xl md:text-8xl font-black tracking-[0.3em]">
          VOID MARKET
        </h1>

        <button className="mt-10 bg-white text-black px-8 py-4 rounded-xl font-bold hover:scale-105 transition">
          Vezi Produsele
        </button>
      </section>

      {/* PRODUSE */}
      <section
        id="magazin"
        className="max-w-7xl mx-auto px-8 py-20"
      >
        <h2 className="text-4xl font-bold mb-12">
          Produse Populare
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.name}
              className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-white transition duration-300"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-80 object-cover"
              />

              <div className="p-6">
                <h3 className="text-2xl font-bold">
                  {product.name}
                </h3>

                <p className="text-zinc-400 mt-2">
                  {product.price}
                </p>

                <button className="mt-6 w-full bg-white text-black py-3 rounded-xl font-bold hover:bg-zinc-200 transition">
                  Adaugă în coș
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* RECENZII */}
      <section
        id="recenzii"
        className="bg-zinc-950 py-24 px-8"
      >
        <h2 className="text-4xl font-bold text-center mb-14">
          Recenzii
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">

          <div className="bg-zinc-900 rounded-2xl p-8">
            <div className="text-yellow-400 text-xl">
              ★★★★★
            </div>

            <p className="mt-5 text-zinc-300">
              Am comandat o pereche de Jordan 4 și au ajuns în două zile.
              Totul a fost exact ca în poze.
            </p>

            <div className="mt-6">
              <h4 className="font-semibold">
                Andrei Popescu
              </h4>

              <p className="text-zinc-500 text-sm">
                București
              </p>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-2xl p-8">
            <div className="text-yellow-400 text-xl">
              ★★★★★
            </div>

            <p className="mt-5 text-zinc-300">
              Produse originale și comunicare foarte bună.
              Recomand fără probleme.
            </p>

            <div className="mt-6">
              <h4 className="font-semibold">
                Bianca Ionescu
              </h4>

              <p className="text-zinc-500 text-sm">
                Cluj-Napoca
              </p>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-2xl p-8">
            <div className="text-yellow-400 text-xl">
              ★★★★★
            </div>

            <p className="mt-5 text-zinc-300">
              Am cumpărat un hoodie Essentials.
              Livrare rapidă și produs impecabil.
            </p>

            <div className="mt-6">
              <h4 className="font-semibold">
                Mihai Dumitrescu
              </h4>

              <p className="text-zinc-500 text-sm">
                Iași
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* CONTACT */}
      <section
        id="contact"
        className="py-24 px-8"
      >
        <div className="max-w-4xl mx-auto text-center">

          <h2 className="text-4xl font-bold">
            Contact
          </h2>

          <p className="text-zinc-400 mt-6">
            Pentru întrebări despre produse sau comenzi ne poți contacta oricând.
          </p>

          <div className="mt-12 grid md:grid-cols-3 gap-8">

            <div className="bg-zinc-900 rounded-2xl p-8">
              <h3 className="font-bold text-xl">
                Email
              </h3>

              <p className="text-zinc-400 mt-3">
                contact@voidmarket.ro
              </p>
            </div>

            <div className="bg-zinc-900 rounded-2xl p-8">
              <h3 className="font-bold text-xl">
                Telefon
              </h3>

              <p className="text-zinc-400 mt-3">
                +40 700 000 000
              </p>
            </div>

            <div className="bg-zinc-900 rounded-2xl p-8">
              <h3 className="font-bold text-xl">
                Program
              </h3>

              <p className="text-zinc-400 mt-3">
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