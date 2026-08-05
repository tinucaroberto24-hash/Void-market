import Navbar from "@/components/Navbar";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="mx-auto max-w-5xl px-6 py-20">
        <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">
          VOID MARKET
        </p>

        <h1 className="mt-4 text-5xl font-black">
          Termeni și Condiții
        </h1>

        <p className="mt-6 text-lg leading-8 text-zinc-400">
          Prin utilizarea site-ului VOID MARKET și plasarea unei
          comenzi, sunteți de acord cu termenii și condițiile de mai jos.
        </p>

        <div className="mt-14 space-y-8">

          <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
            <h2 className="text-2xl font-bold">
              1. Despre VOID MARKET
            </h2>

            <p className="mt-4 leading-8 text-zinc-400">
              VOID MARKET este o platformă dedicată comercializării de
              articole vestimentare premium și produse streetwear.
            </p>
          </section>

          <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
            <h2 className="text-2xl font-bold">
              2. Comenzi
            </h2>

            <p className="mt-4 leading-8 text-zinc-400">
              O comandă este considerată înregistrată după confirmarea
              acesteia în sistem. În anumite situații, comenzile pot fi
              anulate dacă produsul nu mai este disponibil sau dacă apar
              erori tehnice.
            </p>
          </section>

          <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
            <h2 className="text-2xl font-bold">
              3. Metode de plată
            </h2>

            <ul className="mt-4 list-disc pl-6 space-y-2 text-zinc-400">
              <li>Plată online securizată cu cardul prin Stripe.</li>
              <li>Plată ramburs la livrare.</li>
            </ul>
          </section>

          <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
            <h2 className="text-2xl font-bold">
              4. Livrare
            </h2>

            <p className="mt-4 leading-8 text-zinc-400">
              Livrarea comenzilor se realizează prin firmele de curierat
              disponibile pe site. Timpul estimat de livrare poate varia
              în funcție de localitate și disponibilitatea produselor.
            </p>
          </section>

          <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
            <h2 className="text-2xl font-bold">
              5. Produse
            </h2>

            <p className="mt-4 leading-8 text-zinc-400">
              Imaginile produselor sunt prezentate cu scop informativ.
              Pot exista diferențe minore de culoare în funcție de
              ecranul dispozitivului utilizat.
            </p>
          </section>

          <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
            <h2 className="text-2xl font-bold">
              6. Răspundere
            </h2>

            <p className="mt-4 leading-8 text-zinc-400">
              VOID MARKET depune toate eforturile pentru ca informațiile
              afișate pe site să fie corecte și actualizate. Dacă apar
              erori tehnice sau de redactare, acestea vor fi corectate în
              cel mai scurt timp posibil.
            </p>
          </section>

          <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
            <h2 className="text-2xl font-bold">
              7. Contact
            </h2>

            <p className="mt-4 leading-8 text-zinc-400">
              Pentru orice întrebare legată de comenzi sau utilizarea
              platformei, ne poți contacta folosind informațiile de
              contact disponibile pe site.
            </p>
          </section>

        </div>

        <p className="mt-12 text-center text-sm text-zinc-600">
          Ultima actualizare: August 2026
        </p>
      </section>
    </main>
  );
}