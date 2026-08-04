import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import AddToCartButton from "./AddToCartButton";

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: product, error } =
    await supabase
      .from("products")
      .select(
        "id, name, brand, price, size, condition, description, image, stock"
      )
      .eq("id", id)
      .single();

  if (error || !product) {
    notFound();
  }

  const stock = product.stock ?? 0;
  const inStock = stock > 0;

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <Link
          href="/#magazin"
          className="text-sm text-zinc-500 transition hover:text-white"
        >
          ← Înapoi la magazin
        </Link>

        <div className="mt-10 grid gap-12 lg:grid-cols-2">
          <div className="flex min-h-[550px] items-center justify-center overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="h-full max-h-[700px] w-full object-contain"
              />
            ) : (
              <p className="text-lg font-semibold text-zinc-600">
                Imagine indisponibilă
              </p>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
              {product.brand}
            </p>

            <h1 className="mt-4 text-4xl font-black md:text-6xl">
              {product.name}
            </h1>

            <div className="mt-8 space-y-3 border-y border-zinc-800 py-8">
              <p>
                <span className="text-zinc-500">
                  Mărime:
                </span>{" "}
                <strong>{product.size}</strong>
              </p>

              <p>
                <span className="text-zinc-500">
                  Stare:
                </span>{" "}
                <strong>
                  {product.condition}
                </strong>
              </p>

              <p>
                <span className="text-zinc-500">
                  Disponibilitate:
                </span>{" "}
                <strong
                  className={
                    inStock
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {inStock
                    ? `În stoc (${stock})`
                    : "Stoc epuizat"}
                </strong>
              </p>
            </div>

            {product.description && (
              <p className="mt-8 whitespace-pre-line leading-7 text-zinc-400">
                {product.description}
              </p>
            )}

            {inStock ? (
              <AddToCartButton
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  size: product.size,
                  image: product.image,
                  stock,
                }}
              />
            ) : (
              <>
                <p className="mt-8 text-4xl font-black">
                  {product.price} Lei
                </p>

                <button
                  disabled
                  className="mt-10 cursor-not-allowed rounded-xl bg-zinc-800 px-8 py-4 text-lg font-bold text-zinc-500"
                >
                  Stoc epuizat
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}