import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <div className="mx-auto max-w-6xl">

        <h1 className="text-5xl font-bold">
          VOID MARKET ADMIN
        </h1>

        <p className="mt-3 text-zinc-400">
          Conectat ca:
        </p>

        <p className="font-bold text-xl">
          {user.email}
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-zinc-400">
              Produse
            </p>

            <h2 className="mt-4 text-4xl font-bold">
              0
            </h2>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-zinc-400">
              Comenzi
            </p>

            <h2 className="mt-4 text-4xl font-bold">
              0
            </h2>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-zinc-400">
              Venit
            </p>

            <h2 className="mt-4 text-4xl font-bold">
              0 Lei
            </h2>
          </div>

        </div>

        <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900 p-8">

          <h2 className="text-3xl font-bold">
            Produse
          </h2>

          <p className="mt-3 text-zinc-400">
            Nu există produse momentan.
          </p>

          <button className="mt-6 rounded-xl bg-white px-6 py-3 font-bold text-black">
            + Adaugă produs
          </button>

        </div>

      </div>
    </main>
  );
}