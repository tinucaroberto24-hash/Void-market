import Navbar from "@/components/Navbar";

export default function Home() {
  const products = [
    {
      name: "Nike Dunk Low Panda",
      price: "950 RON",
      image: "https://images.stockx.com/images/Nike-Dunk-Low-Retro-White-Black-2021.jpg",
    },
    {
      name: "Jordan 4 Military Black",
      price: "1.850 RON",
      image: "https://images.stockx.com/images/Air-Jordan-4-Retro-Military-Black.jpg",
    },
    {
      name: "Essentials Hoodie",
      price: "780 RON",
      image: "https://images.stockx.com/images/Fear-of-God-Essentials-Hoodie.jpg",
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      {/* HERO */}
      <section className="flex flex-col items-center justify-center h-[85vh] text-center px-6">
        <h1 className="text-7xl font-black tracking-[0.35em]">
          VOID MARKET
        </h1>

        <p className="text-zinc-400 mt-6 max-w-xl text-xl">
          Marketplace premium pentru sneakers, haine și accesorii 100% autentice.
        </p>

        <button className="mt-10 px-10 py-4 rounded-xl bg-white text-black font-bold hover:scale-105 transition">
          Vezi Produsele
        </button>
      </section>

      {/* PRODUSE */}
      <section
        id="magazin"
        className="max-w-7xl mx-auto px-10 py-20"
      >
        <h2 className="text-4xl font-bold mb-12">
          Produse Populare
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          {products.map((item) => (
            <div
              key={item.name}
              className="bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 hover:border-white transition"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-80 object-cover"
              />

              <div className="p-6">
                <h3 className="text-2xl font-bold">
                  {item.name}
                </h3>

                <p className="text-zinc-400 mt-2">
                  {item.price}
                </p>

                <button className="w-full mt-6 bg-white text-black py-3 rounded-xl font-bold hover:scale-105 transition">
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
        className="bg-zinc-950 py-24 px-10"
      >
        <h2 className="text-4xl font-bold text-center mb-14">
          Recenzii
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-zinc-900 p-8 rounded-2xl">
            ⭐⭐⭐⭐⭐
            <p className="mt-5 text-zinc-300">
              "Livrare rapidă și produs original. Recomand!"
            </p>
            <h4 className="mt-5 font-bold">
              Andrei
            </h4>
          </div>

          <div className="bg-zinc-900 p-8 rounded-2xl">
            ⭐⭐⭐⭐⭐
            <p className="mt-5 text-zinc-300">
              "Cel mai bun site de resell pe care l-am folosit."
            </p>
            <h4 className="mt-5 font-bold">
              Robert
            </h4>
          </div>

          <div className="bg-zinc-900 p-8 rounded-2xl">
            ⭐⭐⭐⭐⭐
            <p className="mt-5 text-zinc-300">
              "Prețuri foarte bune și suport excelent."
            </p>
            <h4 className="mt-5 font-bold">
              Alex
            </h4>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section
        id="contact"
        className="py-24 text-center"
      >
        <h2 className="text-4xl font-bold">
          Contact
        </h2>

        <p className="text-zinc-400 mt-6">
          Email: contact@voidmarket.ro
        </p>

        <p className="text-zinc-500 mt-3">
          Răspundem în mai puțin de 24 de ore.
        </p>
      </section>

      <footer className="border-t border-zinc-800 py-8 text-center text-zinc-500">
        © 2026 VOID MARKET. Toate drepturile rezervate.
      </footer>
    </main>
  );
}