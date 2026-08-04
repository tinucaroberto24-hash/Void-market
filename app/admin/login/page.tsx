"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("A apărut o eroare la autentificare.");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-white">
        <h1 className="text-3xl font-bold">
          VOID MARKET Admin
        </h1>

        <p className="mt-2 text-zinc-400">
          Autentifică-te pentru a continua
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none"
          />

          <input
            type="password"
            placeholder="Parolă"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none"
          />

          {error && (
            <p className="rounded-xl bg-red-900/30 p-3 text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-white py-3 font-bold text-black"
          >
            {loading ? "Se conectează..." : "Login"}
          </button>
        </form>

        <Link
          href="/"
          className="mt-6 block text-center text-zinc-500"
        >
          Înapoi la magazin
        </Link>
      </div>
    </main>
  );
}