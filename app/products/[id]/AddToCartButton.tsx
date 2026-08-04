"use client";

import { useEffect, useMemo, useState } from "react";
import VoucherWheel, {
  Voucher,
} from "./VoucherWheel";

type AddToCartButtonProps = {
  product: {
    id: string;
    name: string;
    price: number;
    size: string;
    image: string | null;
    stock: number;
  };
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  size: string;
  image: string;
  quantity: number;
  voucherId?: string;
  voucherCode?: string;
  discountPercent?: number;
};

export default function AddToCartButton({
  product,
}: AddToCartButtonProps) {
  const [message, setMessage] =
    useState("");
  const [appliedVoucher, setAppliedVoucher] =
    useState<Voucher | null>(null);

  useEffect(() => {
    const savedAppliedVoucher =
      localStorage.getItem(
        "void-market-applied-voucher"
      );

    if (!savedAppliedVoucher) {
      return;
    }

    try {
      const parsed = JSON.parse(
        savedAppliedVoucher
      ) as Voucher;

      if (
        parsed.id &&
        parsed.code &&
        [5, 10, 15, 20].includes(
          parsed.discountPercent
        )
      ) {
        setAppliedVoucher(parsed);
      }
    } catch {
      localStorage.removeItem(
        "void-market-applied-voucher"
      );
    }
  }, []);

  const finalPrice = useMemo(() => {
    if (!appliedVoucher) {
      return product.price;
    }

    return Number(
      (
        product.price *
        (1 -
          appliedVoucher.discountPercent /
            100)
      ).toFixed(2)
    );
  }, [appliedVoucher, product.price]);

  function applyVoucher(voucher: Voucher) {
    setAppliedVoucher(voucher);

    localStorage.setItem(
      "void-market-applied-voucher",
      JSON.stringify(voucher)
    );

    setMessage(
      `Voucherul de ${voucher.discountPercent}% a fost aplicat.`
    );
  }

  function addToCart() {
    try {
      const savedCart = localStorage.getItem(
        "void-market-cart"
      );

      const cart: CartItem[] = savedCart
        ? JSON.parse(savedCart)
        : [];

      const existingProduct = cart.find(
        (item) => item.id === product.id
      );

      if (existingProduct) {
        if (
          existingProduct.quantity >=
          product.stock
        ) {
          setMessage(
            "Ai adăugat deja tot stocul disponibil."
          );
          return;
        }

        existingProduct.quantity += 1;
        existingProduct.price = finalPrice;
        existingProduct.originalPrice =
          product.price;

        if (appliedVoucher) {
          existingProduct.voucherId =
            appliedVoucher.id;
          existingProduct.voucherCode =
            appliedVoucher.code;
          existingProduct.discountPercent =
            appliedVoucher.discountPercent;
        }
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: finalPrice,
          originalPrice: product.price,
          size: product.size,
          image: product.image ?? "",
          quantity: 1,
          voucherId:
            appliedVoucher?.id,
          voucherCode:
            appliedVoucher?.code,
          discountPercent:
            appliedVoucher?.discountPercent,
        });
      }

      localStorage.setItem(
        "void-market-cart",
        JSON.stringify(cart)
      );

      window.dispatchEvent(
        new Event("cart-updated")
      );

      setMessage(
        appliedVoucher
          ? `Produsul a fost adăugat cu reducere de ${appliedVoucher.discountPercent}%.`
          : "Produsul a fost adăugat în coș."
      );

      window.setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        "Eroare la adăugarea în coș:",
        error
      );

      setMessage(
        "Produsul nu a putut fi adăugat."
      );
    }
  }

  return (
    <div className="mt-8">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
        {appliedVoucher ? (
          <>
            <p className="text-sm text-zinc-500">
              Preț normal
            </p>

            <p className="mt-1 text-xl text-zinc-500 line-through">
              {product.price} Lei
            </p>

            <p className="mt-4 text-sm font-semibold text-green-400">
              Voucher aplicat: -
              {appliedVoucher.discountPercent}%
            </p>

            <p className="mt-2 text-4xl font-black">
              {finalPrice} Lei
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-zinc-500">
              Preț
            </p>

            <p className="mt-2 text-4xl font-black">
              {product.price} Lei
            </p>
          </>
        )}
      </div>

      <VoucherWheel
        onApply={applyVoucher}
        appliedVoucher={appliedVoucher}
      />

      <button
        type="button"
        onClick={addToCart}
        className="mt-6 w-full rounded-xl bg-white px-8 py-4 text-lg font-bold text-black transition hover:bg-zinc-200"
      >
        Adaugă în coș
      </button>

      {message && (
        <p className="mt-4 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-center text-sm text-white">
          {message}
        </p>
      )}
    </div>
  );
}