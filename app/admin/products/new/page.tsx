import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NewProductForm from "./NewProductForm";

export default async function NewProductPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  if (user.email !== "voidmarket.ro@gmail.com") {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <section className="mx-auto max-w-3xl">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
              VOID MARKET ADMIN
            </p>

            <h1 className="mt-3 text-4xl font-black">
              Adaugă produs
            </h1>
          </div>

          <Link
            href="/admin"
            className="rounded-xl border border-zinc-700 px-5 py-3 transition hover:border-white"
          >
            Înapoi
          </Link>
        </div>

        <NewProductForm />
      </section>
    </main>
  );
}