export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-10 py-6 border-b border-zinc-800 bg-black text-white">
      <h1 className="text-3xl font-bold tracking-[0.3em]">
        VOID MARKET
      </h1>

      <div className="flex gap-8 text-lg items-center">
        <a href="#" className="hover:text-zinc-400">
          Acasă
        </a>

        <a href="#magazin" className="hover:text-zinc-400">
          Magazin
        </a>

        <a href="#recenzii" className="hover:text-zinc-400">
          Recenzii
        </a>

        <a href="#contact" className="hover:text-zinc-400">
          Contact
        </a>
      </div>
    </nav>
  );
}