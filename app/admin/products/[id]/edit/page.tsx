import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditProductForm from "./EditProductForm";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;

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

  const { data: product, error } = await supabase
    .from("products")
    .select(
      "id, name, brand, price, size, condition, description, image, images, stock"
    )
    .eq("id", id)
    .single();

  if (error || !product) {
    console.error(
      "Eroare la încărcarea produsului:",
      error
    );

    notFound();
  }

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <section className="mx-auto max-w-4xl">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
              VOID MARKET ADMIN
            </p>

            <h1 className="mt-3 text-4xl font-black">
              Editează produsul
            </h1>

            <p className="mt-3 text-zinc-500">
              {product.name}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/products/${product.id}`}
              className="rounded-xl border border-zinc-700 px-5 py-3 transition hover:border-white"
            >
              Vezi produsul
            </Link>

            <Link
              href="/admin"
              className="rounded-xl bg-white px-5 py-3 font-bold text-black transition hover:bg-zinc-200"
            >
              Înapoi la Admin
            </Link>
          </div>
        </div>

        <EditProductForm product={product} />
      </section>
    </main>
  );
}