"use client";

import { useEffect, useMemo, useState } from "react";

export type Voucher = {
  id: string;
  code: string;
  discountPercent: number;
};

type VoucherWheelProps = {
  onApply: (voucher: Voucher) => void;
  appliedVoucher: Voucher | null;
};

type SpinResponse = {
  success?: boolean;
  error?: string;
  voucher?: Voucher;
};

const SEGMENTS = [
  { label: "5%", value: 5 },
  { label: "10%", value: 10 },
  { label: "5%", value: 5 },
  { label: "15%", value: 15 },
  { label: "5%", value: 5 },
  { label: "10%", value: 10 },
  { label: "5%", value: 5 },
  { label: "20%", value: 20 },
];

function getTargetRotation(
  currentRotation: number,
  discountPercent: number
) {
  const matchingIndexes = SEGMENTS
    .map((segment, index) =>
      segment.value === discountPercent ? index : -1
    )
    .filter((index) => index >= 0);

  const selectedIndex =
    matchingIndexes[
      Math.floor(Math.random() * matchingIndexes.length)
    ] ?? 0;

  const segmentAngle = 360 / SEGMENTS.length;
  const segmentCenter =
    selectedIndex * segmentAngle + segmentAngle / 2;

  const currentNormalized =
    ((currentRotation % 360) + 360) % 360;

  const desiredNormalized =
    (360 - segmentCenter) % 360;

  const correction =
    (desiredNormalized -
      currentNormalized +
      360) %
    360;

  return currentRotation + 360 * 6 + correction;
}

export default function VoucherWheel({
  onApply,
  appliedVoucher,
}: VoucherWheelProps) {
  const [open, setOpen] = useState(false);
  const [voucher, setVoucher] =
    useState<Voucher | null>(null);
  const [spinning, setSpinning] =
    useState(false);
  const [rotation, setRotation] =
    useState(0);
  const [error, setError] = useState("");
  const [copied, setCopied] =
    useState(false);
  const [wonVoucher, setWonVoucher] =
    useState<Voucher | null>(null);

  useEffect(() => {
    const savedVoucher = localStorage.getItem(
      "void-market-voucher"
    );

    if (!savedVoucher) {
      return;
    }

    try {
      const parsed = JSON.parse(
        savedVoucher
      ) as Voucher;

      if (
        parsed.id &&
        parsed.code &&
        [5, 10, 15, 20].includes(
          parsed.discountPercent
        )
      ) {
        setVoucher(parsed);
      }
    } catch {
      localStorage.removeItem(
        "void-market-voucher"
      );
    }
  }, []);

  const wheelBackground = useMemo(
    () =>
      `conic-gradient(
        #fafafa 0deg 45deg,
        #27272a 45deg 90deg,
        #fafafa 90deg 135deg,
        #27272a 135deg 180deg,
        #fafafa 180deg 225deg,
        #27272a 225deg 270deg,
        #fafafa 270deg 315deg,
        #27272a 315deg 360deg
      )`,
    []
  );

  async function spinWheel() {
    if (voucher || spinning) {
      return;
    }

    setSpinning(true);
    setError("");

    try {
      const response = await fetch(
        "/api/vouchers/spin",
        {
          method: "POST",
        }
      );

      const responseText =
        await response.text();

      let result: SpinResponse;

      try {
        result = JSON.parse(responseText);
      } catch {
        throw new Error(
          "Serverul a returnat un răspuns invalid."
        );
      }

      if (
        !response.ok ||
        !result.success ||
        !result.voucher
      ) {
        throw new Error(
          result.error ||
            "Voucherul nu a putut fi generat."
        );
      }

      const wonVoucher = result.voucher;
      const targetRotation =
        getTargetRotation(
          rotation,
          wonVoucher.discountPercent
        );

      setRotation(targetRotation);

      window.setTimeout(() => {
        setWonVoucher(wonVoucher);
        setSpinning(false);
      }, 4200);
    } catch (spinError) {
      console.error(spinError);

      setError(
        spinError instanceof Error
          ? spinError.message
          : "Voucherul nu a putut fi generat."
      );

      setSpinning(false);
    }
  }

  function continueAfterWin() {
    if (!wonVoucher) {
      return;
    }

    localStorage.setItem(
      "void-market-voucher",
      JSON.stringify(wonVoucher)
    );

    setVoucher(wonVoucher);
    setWonVoucher(null);

    window.dispatchEvent(
      new Event("voucher-updated")
    );
  }

  async function copyCode() {
    if (!voucher) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        voucher.code
      );

      setCopied(true);
    } catch (copyError) {
      console.error(
        "Codul nu a putut fi copiat:",
        copyError
      );
    }
  }

  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={() =>
          setOpen((current) => !current)
        }
        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-5 py-4 text-left font-semibold transition hover:border-white"
      >
        <span className="flex items-center justify-between gap-4">
          <span>
            {appliedVoucher
              ? `Voucher aplicat: -${appliedVoucher.discountPercent}%`
              : voucher
              ? `Ai un voucher de ${voucher.discountPercent}%`
              : "Ai un voucher?"}
          </span>

          <span>{open ? "−" : "+"}</span>
        </span>
      </button>

      {open && (
        <div className="mt-4 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          {!voucher ? (
            <>
              <div className="relative mx-auto h-72 w-72 max-w-full">
                <div className="absolute left-1/2 top-[-12px] z-10 -translate-x-1/2 text-4xl text-white">
                  ▼
                </div>

                <div
                  className="relative h-full w-full overflow-hidden rounded-full border-8 border-zinc-800 shadow-2xl transition-transform duration-[4000ms] ease-[cubic-bezier(0.12,0.8,0.18,1)]"
                  style={{
                    background:
                      wheelBackground,
                    transform: `rotate(${rotation}deg)`,
                  }}
                >
                  {SEGMENTS.map(
                    (segment, index) => {
                      const segmentAngle =
                        360 / SEGMENTS.length;

                      const centerAngle =
                        index * segmentAngle +
                        segmentAngle / 2;

                      const radians =
                        ((centerAngle - 90) *
                          Math.PI) /
                        180;

                      const radius = 34;

                      const left =
                        50 +
                        Math.cos(radians) *
                          radius;

                      const top =
                        50 +
                        Math.sin(radians) *
                          radius;

                      return (
                        <div
                          key={`${segment.label}-${index}`}
                          className="absolute flex h-10 w-14 items-center justify-center text-lg font-black"
                          style={{
                            left: `${left}%`,
                            top: `${top}%`,
                            transform:
                              "translate(-50%, -50%)",
                          }}
                        >
                          <span
                            className={
                              index % 2 === 0
                                ? "text-black"
                                : "text-white"
                            }
                          >
                            {segment.label}
                          </span>
                        </div>
                      );
                    }
                  )}

                  <div className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-zinc-800 bg-black text-xs font-black tracking-widest text-white">
                    VOID
                  </div>
                </div>
              </div>

              {wonVoucher && (
                <div className="mt-6 rounded-2xl border border-green-800 bg-green-950/40 p-6 text-center">
                  <p className="text-sm uppercase tracking-[0.25em] text-green-400">
                    Felicitări!
                  </p>

                  <h3 className="mt-3 text-3xl font-black">
                    Ai câștigat {wonVoucher.discountPercent}% reducere
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    Apasă „Continuă” pentru a salva voucherul și a-l folosi la produs.
                  </p>

                  <button
                    type="button"
                    onClick={continueAfterWin}
                    className="mt-5 w-full rounded-xl bg-white px-6 py-4 font-bold text-black transition hover:bg-zinc-200"
                  >
                    Continuă
                  </button>
                </div>
              )}

              {!wonVoucher && (
                <button
                  type="button"
                  onClick={spinWheel}
                  disabled={spinning}
                  className="mt-8 w-full rounded-xl bg-white px-6 py-4 font-bold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {spinning
                    ? "Roata se învârte..."
                    : "Învârte roata"}
                </button>
              )}
            </>
          ) : (
            <div className="text-center">
              <p className="text-sm uppercase tracking-[0.25em] text-green-400">
                Voucherul tău
              </p>

              <p className="mt-4 text-5xl font-black">
                -{voucher.discountPercent}%
              </p>

              <div className="mt-6 rounded-2xl border border-zinc-700 bg-black p-5">
                <p className="text-xs uppercase tracking-widest text-zinc-500">
                  Cod voucher
                </p>

                <p className="mt-2 break-all text-xl font-bold">
                  {voucher.code}
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={copyCode}
                  className={`rounded-xl px-5 py-3 font-bold transition ${
                    copied
                      ? "border border-green-700 bg-green-950 text-green-300"
                      : "border border-zinc-700 hover:border-white"
                  }`}
                >
                  {copied
                    ? "✓ Cod copiat"
                    : "Copiază codul"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onApply(voucher)
                  }
                  disabled={
                    appliedVoucher?.id ===
                    voucher.id
                  }
                  className="rounded-xl bg-white px-5 py-3 font-bold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-green-950 disabled:text-green-300"
                >
                  {appliedVoucher?.id ===
                  voucher.id
                    ? "✓ Voucher aplicat"
                    : "Aplică voucherul"}
                </button>
              </div>
            </div>
          )}

          {error && (
            <p className="mt-5 rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}