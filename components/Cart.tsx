"use client";

import { useState } from "react";

export default function Cart() {
  const [items, setItems] = useState(0);

  return (
    <button
      className="border border-zinc-700 px-4 py-2 rounded-xl hover:bg-zinc-900"
      onClick={() => setItems(items + 1)}
    >
      🛒 Coș ({items})
    </button>
  );
}