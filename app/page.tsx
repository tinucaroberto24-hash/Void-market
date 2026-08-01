import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="flex flex-col items-center justify-center text-center py-40 px-6">
        <h2 className="text-6xl md:text-8xl font-extrabold">
          VOID MARKET
        </h2>

        <p className="text-zinc-400 text-xl mt-6 max-w-2xl">
          Streetwear Premium • Colecții Exclusive • Livrare Rapidă
        </p>

        <a href="#magazin">
          <button className="mt-10 bg-white text-black px-8 py-4 rounded-xl font-bold hover:scale-105 transition">
            CUMPĂRĂ ACUM
          </button>
        </a>
      </section>


      <section
        id="magazin"
        className="grid grid-cols-1 md:grid-cols-3 gap-8 px-10 pb-20"
      >
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800"
          >
            <div className="h-64 bg-zinc-800 rounded-xl"></div>

            <h3 className="text-2xl font-bold mt-6">
              Produs {item}
            </h3>

            <p className="text-zinc-400 mt-2">
              Haine streetwear de calitate premium.
            </p>

            <button className="mt-6 w-full bg-white text-black py-3 rounded-xl font-semibold">
              Vezi produsul
            </button>
          </div>
        ))}
      </section>


      <section
        id="contact"
        className="py-24 px-10 text-center border-t border-zinc-800"
      >
        <h2 className="text-5xl font-bold">
          Contactează VOID MARKET
        </h2>

        <p className="text-zinc-400 text-lg mt-6 max-w-xl mx-auto">
          Ai întrebări despre produse, comenzi sau colaborări?
          Suntem aici să te ajutăm.
        </p>

        <div className="mt-8">
          <p className="text-xl font-semibold">
            Email
          </p>

          <a
            href="mailto:tinucaroberto24@gmail.com"
            className="text-zinc-300 hover:text-white"
          >
            tinucaroberto24@gmail.com
          </a>
        </div>

        <a
          href="mailto:tinucaroberto24@gmail.com"
          className="inline-block mt-8 bg-white text-black px-8 py-4 rounded-xl font-bold hover:scale-105 transition"
        >
          TRIMITE MESAJ
        </a>
      </section>

    </main>
  );
}