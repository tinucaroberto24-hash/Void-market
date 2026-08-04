"use client";

import { useState } from "react";

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
  size: string;
  image: string;
  quantity: number;
};

export default function AddToCartButton({
  product,
}: AddToCartButtonProps) {
  const [message, setMessage] = useState("");

  function addToCart() {
    try {
      const savedCart = localStorage.getItem("void-market-cart");

      const cart: CartItem[] = savedCart
        ? JSON.parse(savedCart)
        : [];

      const existingProduct = cart.find(
        (item) => item.id === product.id
      );

      if (existingProduct) {
        if (existingProduct.quantity >= product.stock) {
          setMessage("Ai adăugat deja tot stocul disponibil.");
          return;
        }

        existingProduct.quantity += 1;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          size: product.size,
          image: product.image ?? "",
          quantity: 1,
        });
      }

      localStorage.setItem(
        "void-market-cart",
        JSON.stringify(cart)
      );

      window.dispatchEvent(new Event("cart-updated"));

      setMessage("Produsul a fost adăugat în coș.");

      setTimeout(() => {
        setMessage("");
      }, 2500);
    } catch (error) {
      console.error("Eroare la adăugarea în coș:", error);
      setMessage("Produsul nu a putut fi adăugat.");
    }
  }

  return (
    <div className="mt-10">
      <button
        type="button"
        onClick={addToCart}
        className="w-full rounded-xl bg-white px-8 py-4 text-lg font-bold text-black transition hover:bg-zinc-200"
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