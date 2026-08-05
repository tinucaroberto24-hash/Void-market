"use client";

import Link from "next/link";
import {
  MouseEvent,
  useEffect,
  useState,
} from "react";
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
  const [cartCount, setCartCount] =
    useState(0);

  const [adminHref, setAdminHref] =
    useState("/admin/login");

  const [checkingAdmin, setCheckingAdmin] =
    useState(true);

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [scrolled, setScrolled] =
    useState(false);

  useEffect(() => {
    function updateCartCount() {
      const savedCart =
        localStorage.getItem(
          "void-market-cart"
        );

      if (!savedCart) {
        setCartCount(0);
        return;
      }

      try {
        const cart: CartItem[] =
          JSON.parse(savedCart);

        const totalItems = cart.reduce(
          (total, item) =>
            total + item.quantity,
          0
        );

        setCartCount(totalItems);
      } catch {
        setCartCount(0);
      }
    }

    updateCartCount();

    window.addEventListener(
      "storage",
      updateCartCount
    );

    window.addEventListener(
      "cart-updated",
      updateCartCount
    );

    return () => {
      window.removeEventListener(
        "storage",
        updateCartCount
      );

      window.removeEventListener(
        "cart-updated",
        updateCartCount
      );
    };
  }, []);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 16);
    }

    handleScroll();

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  useEffect(() => {
    const supabase = createClient();

    async function checkAdminSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (
        user?.email ===
        "voidmarket.ro@gmail.com"
      ) {
        setAdminHref("/admin");
      } else {
        setAdminHref("/admin/login");
      }

      setCheckingAdmin(false);
    }

    checkAdminSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (
          session?.user?.email ===
          "voidmarket.ro@gmail.com"
        ) {
          setAdminHref("/admin");
        } else {
          setAdminHref("/admin/login");
        }

        setCheckingAdmin(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    function closeOnResize() {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    }

    window.addEventListener(
      "resize",
      closeOnResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        closeOnResize
      );
    };
  }, [mobileOpen]);

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  function scrollToTop(
    event: MouseEvent<HTMLAnchorElement>
  ) {
    if (window.location.pathname !== "/") {
      closeMobileMenu();
      return;
    }

    event.preventDefault();

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });

    window.history.replaceState(
      null,
      "",
      "/"
    );

    closeMobileMenu();
  }

  function scrollToSection(
    event: MouseEvent<HTMLAnchorElement>,
    sectionId: string
  ) {
    if (window.location.pathname !== "/") {
      closeMobileMenu();
      return;
    }

    event.preventDefault();

    const section =
      document.getElementById(sectionId);

    if (!section) {
      return;
    }

    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    window.history.replaceState(
      null,
      "",
      `/#${sectionId}`
    );

    closeMobileMenu();
  }

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
      <nav
        className={`mx-auto max-w-7xl rounded-2xl border text-white transition-all duration-300 ${
          scrolled
            ? "border-white/15 bg-black/80 shadow-[0_14px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl"
            : "border-white/10 bg-black/65 shadow-[0_10px_35px_rgba(0,0,0,0.3)] backdrop-blur-lg"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 sm:px-5 md:px-6">
          <Link
            href="/"
            onClick={scrollToTop}
            className="min-w-0 text-base font-black tracking-[0.18em] transition hover:text-zinc-300 sm:text-lg md:text-2xl md:tracking-[0.22em]"
          >
            VOID MARKET
          </Link>

          <div className="flex items-center gap-2 lg:hidden">
            <Link
              href="/cos"
              onClick={closeMobileMenu}
              className="relative flex h-10 min-w-10 items-center justify-center rounded-xl bg-white px-3 text-sm font-black text-black transition hover:bg-zinc-200"
              aria-label={`Deschide coșul${cartCount > 0 ? `, ${cartCount} produse` : ""}`}
            >
              <span aria-hidden="true">🛒</span>

              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-black bg-white px-1 text-xs font-black text-black">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() =>
                setMobileOpen(
                  (current) => !current
                )
              }
              className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-semibold transition hover:border-white/40 hover:bg-white/[0.08]"
              aria-label="Deschide meniul"
              aria-expanded={mobileOpen}
            >
              {mobileOpen
                ? "Închide"
                : "Meniu"}
            </button>
          </div>

          <div className="hidden items-center gap-1 lg:flex">
            <Link
              href="/"
              onClick={scrollToTop}
              className="rounded-xl px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              Acasă
            </Link>

            <Link
              href="/#magazin"
              onClick={(event) =>
                scrollToSection(
                  event,
                  "magazin"
                )
              }
              className="rounded-xl px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              Magazin
            </Link>

            <Link
              href="/#recenzii"
              onClick={(event) =>
                scrollToSection(
                  event,
                  "recenzii"
                )
              }
              className="rounded-xl px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              Recenzii
            </Link>

            <Link
              href="/#contact"
              onClick={(event) =>
                scrollToSection(
                  event,
                  "contact"
                )
              }
              className="rounded-xl px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              Contact
            </Link>

            <Link
              href="/track-order"
              className="ml-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-semibold transition hover:border-white/40 hover:bg-white/[0.08]"
            >
              Urmărește comanda
            </Link>

            <Link
              href={adminHref}
              className="ml-1 rounded-xl border border-white/10 px-3 py-2 text-xs text-zinc-500 transition hover:border-white/30 hover:text-white"
            >
              {checkingAdmin
                ? "Admin..."
                : "Admin"}
            </Link>

            <Link
              href="/cos"
              className="relative ml-1 rounded-xl bg-white px-4 py-2 text-sm font-bold text-black transition hover:bg-zinc-200"
            >
              Coș

              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-black bg-white px-1 text-xs font-black text-black">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-white/10 px-4 py-4 lg:hidden">
            <div className="flex flex-col gap-2">
              <Link
                href="/"
                onClick={scrollToTop}
                className="rounded-xl px-4 py-3 text-zinc-200 transition hover:bg-white/[0.06]"
              >
                Acasă
              </Link>

              <Link
                href="/#magazin"
                onClick={(event) =>
                  scrollToSection(
                    event,
                    "magazin"
                  )
                }
                className="rounded-xl px-4 py-3 text-zinc-200 transition hover:bg-white/[0.06]"
              >
                Magazin
              </Link>

              <Link
                href="/#recenzii"
                onClick={(event) =>
                  scrollToSection(
                    event,
                    "recenzii"
                  )
                }
                className="rounded-xl px-4 py-3 text-zinc-200 transition hover:bg-white/[0.06]"
              >
                Recenzii
              </Link>

              <Link
                href="/#contact"
                onClick={(event) =>
                  scrollToSection(
                    event,
                    "contact"
                  )
                }
                className="rounded-xl px-4 py-3 text-zinc-200 transition hover:bg-white/[0.06]"
              >
                Contact
              </Link>

              <Link
                href="/track-order"
                onClick={closeMobileMenu}
                className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 font-semibold transition hover:border-white/40 hover:bg-white/[0.08]"
              >
                Urmărește comanda
              </Link>

              <Link
                href={adminHref}
                onClick={closeMobileMenu}
                className="rounded-xl border border-white/10 px-4 py-3 text-zinc-500 transition hover:border-white/30 hover:text-white"
              >
                {checkingAdmin
                  ? "Admin..."
                  : "Admin"}
              </Link>

            </div>
          </div>
        )}
      </nav>
    </header>
  );
}