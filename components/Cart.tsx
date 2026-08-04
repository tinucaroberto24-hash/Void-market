"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Cart() {
  const [items, setItems] = useState(0);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setItems(cart.length);
  }, []);

  return (
    <Link
      href="/cart"
      className="border border-zinc-700 px-4 py-2 rounded-xl hover:bg-zinc-900"
    >
      🛒 Coș ({items})
    </Link>
  );
}