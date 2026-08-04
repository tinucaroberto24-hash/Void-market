"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type DeleteProductButtonProps = {
  productId: string;
  productName: string;
};

export default function DeleteProductButton({
  productId,
  productName,
}: DeleteProductButtonProps) {
  const router = useRouter();

  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function deleteProduct() {
    const confirmed = window.confirm(
      `Sigur vrei să ștergi produsul "${productName}"?`
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (
        userError ||
        user?.email !== "voidmarket.ro@gmail.com"
      ) {
        throw new Error(
          "Nu ai permisiunea să ștergi produse."
        );
      }

      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      router.refresh();
    } catch (deleteError) {
      console.error(
        "Eroare la ștergerea produsului:",
        deleteError
      );

      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Produsul nu a putut fi șters."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={deleteProduct}
        disabled={deleting}
        className="rounded-xl border border-red-800 px-5 py-3 font-bold text-red-400 transition hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {deleting ? "Se șterge..." : "Șterge"}
      </button>

      {error && (
        <p className="mt-3 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}