import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h2 className="text-2xl font-black tracking-[0.2em]">
            VOID MARKET
          </h2>

          <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-500">
            Streetwear și articole premium, disponibile în cantități
            limitate.
          </p>
        </div>

        <div>
          <h3 className="font-bold">
            Magazin
          </h3>

          <div className="mt-4 flex flex-col gap-3 text-sm text-zinc-500">
            <Link
              href="/"
              className="transition hover:text-white"
            >
              Acasă
            </Link>

            <Link
              href="/#magazin"
              className="transition hover:text-white"
            >
              Magazin
            </Link>

            <Link
              href="/track-order"
              className="transition hover:text-white"
            >
              Urmărește comanda
            </Link>
          </div>
        </div>

        <div>
          <h3 className="font-bold">
            Informații
          </h3>

          <div className="mt-4 flex flex-col gap-3 text-sm text-zinc-500">
            <Link
              href="/termeni-si-conditii"
              className="transition hover:text-white"
            >
              Termeni și Condiții
            </Link>

            <span className="cursor-not-allowed text-zinc-700">
              Politica de livrare — în curând
            </span>

            <span className="cursor-not-allowed text-zinc-700">
              Confidențialitate — în curând
            </span>

            <span className="cursor-not-allowed text-zinc-700">
              Cookies — în curând
            </span>
          </div>
        </div>

        <div>
          <h3 className="font-bold">
            Contact
          </h3>

          <div className="mt-4 text-sm text-zinc-500">
            <a
              href="mailto:voidmarket.ro@gmail.com"
              className="break-all transition hover:text-white"
            >
              voidmarket.ro@gmail.com
            </a>

            <p className="mt-3">
              România
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-800 px-6 py-6 text-center text-sm text-zinc-600">
        © 2026 VOID MARKET. Toate drepturile rezervate.
      </div>
    </footer>
  );
}