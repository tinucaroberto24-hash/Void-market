"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type OrderStatusSelectProps = {
  orderId: string;
  currentStatus: string;
};

const statuses = [
  "Nouă",
  "Pregătită",
  "Expediată",
  "Livrată",
  "Anulată",
];

export default function OrderStatusSelect({
  orderId,
  currentStatus,
}: OrderStatusSelectProps) {
  const router = useRouter();

  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function updateStatus(newStatus: string) {
    const oldStatus = status;

    setStatus(newStatus);
    setSaving(true);
    setMessage("");
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
          "Nu ai permisiunea să modifici comenzile."
        );
      }

      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: newStatus,
        })
        .eq("id", orderId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      setMessage("Statusul a fost actualizat.");

      router.refresh();
    } catch (updateError) {
      console.error(updateError);

      setStatus(oldStatus);

      setError(
        updateError instanceof Error
          ? updateError.message
          : "Statusul nu a putut fi actualizat."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <label>
        <span className="mb-3 block text-sm font-semibold text-zinc-400">
          Status comandă
        </span>

        <select
          value={status}
          disabled={saving}
          onChange={(event) =>
            updateStatus(event.target.value)
          }
          className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 font-bold text-white outline-none transition focus:border-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {statuses.map((orderStatus) => (
            <option
              key={orderStatus}
              value={orderStatus}
            >
              {orderStatus}
            </option>
          ))}
        </select>
      </label>

      {saving && (
        <p className="mt-3 text-sm text-zinc-500">
          Se salvează...
        </p>
      )}

      {message && (
        <p className="mt-3 text-sm text-green-400">
          {message}
        </p>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}