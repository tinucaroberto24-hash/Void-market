"use client";

import { useState } from "react";

type CopyButtonProps = {
  value: string;
};

export default function CopyButton({
  value,
}: CopyButtonProps) {
  const [copied, setCopied] =
    useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(
        value
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      alert(
        "Nu s-a putut copia."
      );
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-lg border border-zinc-700 px-3 py-1 text-xs font-semibold transition hover:border-white"
    >
      {copied ? "✓ Copiat!" : "📋 Copiază"}
    </button>
  );
}