"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type Voucher = {
  id: string;
  code: string;
  discountPercent: number;
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

export default function VoucherFloatingButton() {
  const pathname = usePathname();

  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [voucher, setVoucher] =
    useState<Voucher | null>(null);
  const [spinning, setSpinning] =
    useState(false);
  const [rotation, setRotation] =
    useState(0);
  const [error, setError] = useState("");
  const [wonVoucher, setWonVoucher] =
    useState<Voucher | null>(null);

  useEffect(() => {
    function loadSavedVoucher() {
      const savedVoucher = localStorage.getItem(
        "void-market-voucher"
      );

      if (!savedVoucher) {
        setVoucher(null);
        setLoaded(true);
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
        } else {
          localStorage.removeItem(
            "void-market-voucher"
          );
          setVoucher(null);
        }
      } catch {
        localStorage.removeItem(
          "void-market-voucher"
        );
        setVoucher(null);
      }

      setLoaded(true);
    }

    loadSavedVoucher();

    window.addEventListener(
      "voucher-updated",
      loadSavedVoucher
    );

    return () => {
      window.removeEventListener(
        "voucher-updated",
        loadSavedVoucher
      );
    };
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

      setRotation((current) =>
        getTargetRotation(
          current,
          wonVoucher.discountPercent
        )
      );

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
    setOpen(false);

    window.dispatchEvent(
      new Event("voucher-updated")
    );
  }

  if (!loaded) {
    return null;
  }

  /*
    Pe pagina produsului există deja roata mare.
    După câștigarea voucherului, badge-ul rămâne
    vizibil și pe pagina produsului.
  */
  const isProductPage =
    pathname.startsWith("/products/");

  if (isProductPage && !voucher) {
    return null;
  }

  if (voucher) {
    return (
      <div className="fixed bottom-5 right-5 z-[90]">
        <button
          type="button"
          onClick={() =>
            setOpen((current) => !current)
          }
          className="rounded-2xl border border-green-800 bg-green-950 px-5 py-4 text-left shadow-2xl transition hover:border-green-500"
        >
          <span className="block text-xs uppercase tracking-[0.2em] text-green-400">
            Voucher activ
          </span>

          <span className="mt-1 block text-2xl font-black text-white">
            -{voucher.discountPercent}%
          </span>
        </button>

        {open && (
          <div className="absolute bottom-[86px] right-0 w-[min(340px,calc(100vw-40px))] rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-white shadow-2xl">
            <p className="text-sm uppercase tracking-[0.25em] text-green-400">
              Voucherul tău
            </p>

            <p className="mt-3 text-4xl font-black">
              -{voucher.discountPercent}%
            </p>

            <div className="mt-5 rounded-2xl border border-zinc-800 bg-black p-4">
              <p className="text-xs uppercase tracking-widest text-zinc-500">
                Cod voucher
              </p>

              <p className="mt-2 break-all font-bold">
                {voucher.code}
              </p>
            </div>

            <p className="mt-4 text-sm leading-6 text-zinc-400">
              Reducerea poate fi aplicată pe pagina unui produs.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-[90] flex h-20 w-20 items-center justify-center rounded-full border-4 border-zinc-700 bg-white text-center text-xs font-black text-black shadow-2xl transition hover:scale-105 hover:border-white"
      >
        <span>
          ÎNVÂRTE
          <br />
          ROATA
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-5 py-10 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <div className="max-h-full w-full max-w-lg overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-white shadow-2xl md:p-8">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
                  VOID MARKET
                </p>

                <h2 className="mt-3 text-3xl font-black">
                  Câștigă o reducere
                </h2>

                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  Învârte roata o singură dată și află ce voucher ai primit.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={spinning || Boolean(wonVoucher)}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-sm transition hover:border-white disabled:opacity-40"
              >
                Închide
              </button>
            </div>

            <div className="relative mx-auto mt-8 h-72 w-72 max-w-full">
              <div className="absolute left-1/2 top-[-12px] z-10 -translate-x-1/2 text-4xl">
                ▼
              </div>

              <div
                className="relative h-full w-full overflow-hidden rounded-full border-8 border-zinc-800 shadow-2xl transition-transform duration-[4000ms] ease-[cubic-bezier(0.12,0.8,0.18,1)]"
                style={{
                  background: wheelBackground,
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

                <div className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-zinc-800 bg-black text-xs font-black tracking-widest">
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
                  Apasă „Continuă” pentru a salva voucherul.
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

            <button
              type="button"
              onClick={spinWheel}
              disabled={spinning}
              className="mt-8 w-full rounded-xl bg-white px-6 py-4 font-bold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {wonVoucher
                ? "Rezultat obținut"
                : spinning
                ? "Roata se învârte..."
                : "Învârte roata"}
            </button>

            {error && (
              <p className="mt-5 rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}