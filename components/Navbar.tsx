"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type CartItem = {
  id: string;
  name: string;
  price: number;
  size: string;
  image: string;
  quantity: number;
};

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const [adminHref, setAdminHref] = useState("/admin/login");
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    function updateCartCount() {
      const savedCart = localStorage.getItem("void-market-cart");

      if (!savedCart) {
        setCartCount(0);
        return;
      }

      try {
        const cart: CartItem[] = JSON.parse(savedCart);

        const totalItems = cart.reduce(
          (total, item) => total + item.quantity,
          0
        );

        setCartCount(totalItems);
      } catch {
        setCartCount(0);
      }
    }

    updateCartCount();

    window.addEventListener("storage", updateCartCount);
    window.addEventListener("cart-updated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cart-updated", updateCartCount);
    };
  }, []);

  useEffect(() => {
    const supabase = createClient();

    async function checkAdminSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email === "voidmarket.ro@gmail.com") {
        setAdminHref("/admin");
      } else {
        setAdminHref("/admin/login");
      }

      setCheckingAdmin(false);
    }

    checkAdminSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (
        session?.user?.email ===
        "voidmarket.ro@gmail.com"
      ) {
        setAdminHref("/admin");
      } else {
        setAdminHref("/admin/login");
      }

      setCheckingAdmin(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-zinc-800 bg-black/90 px-6 py-5 text-white backdrop-blur md:px-10">
      <Link
        href="/"
        className="text-xl font-bold tracking-[0.25em] md:text-3xl"
      >
        VOID MARKET
      </Link>

      <div className="flex items-center gap-4 text-sm md:gap-8 md:text-lg">
        <Link
          href="/"
          className="transition hover:text-zinc-400"
        >
          Acasă
        </Link>

        <Link
          href="/#magazin"
          className="transition hover:text-zinc-400"
        >
          Magazin
        </Link>

        <Link
          href="/#recenzii"
          className="transition hover:text-zinc-400"
        >
          Recenzii
        </Link>

        <Link
          href="/#contact"
          className="transition hover:text-zinc-400"
        >
          Contact
        </Link>

        <Link
          href={adminHref}
          className="rounded-xl border border-zinc-800 px-3 py-2 text-xs text-zinc-500 transition hover:border-zinc-600 hover:text-white md:text-sm"
        >
          {checkingAdmin ? "Admin..." : "Admin"}
        </Link>

        <Link
          href="/cos"
          className="relative rounded-xl border border-zinc-700 px-4 py-2 transition hover:border-white"
        >
          Coș

          {cartCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1 text-xs font-bold text-black">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}