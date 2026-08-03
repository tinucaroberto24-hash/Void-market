import Navbar from "@/components/Navbar";

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl font-bold">
          Checkout
        </h1>

        <p className="mt-4 text-zinc-400">
          Pagina de checkout va fi adăugată aici.
        </p>
      </section>
    </main>
  );
}