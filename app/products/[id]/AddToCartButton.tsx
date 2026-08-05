"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
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
  stock?: number;
  voucherId?: string;
  voucherCode?: string;
  discountPercent?: number;
  voucherUses?: number;
};

const CART_STORAGE_KEY =
  "void-market-cart";

function normalizeNumber(
  value: unknown,
  fallback = 0
) {
  const parsed =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
}

export default function AddToCartButton({
  product,
}: AddToCartButtonProps) {
  const safeProductPrice = normalizeNumber(
    product.price
  );

  const safeStock = Math.max(
    0,
    Math.floor(
      normalizeNumber(product.stock)
    )
  );

  const [message, setMessage] =
    useState("");

  const [quantity, setQuantity] =
    useState(1);

  const [
    appliedVoucher,
    setAppliedVoucher,
  ] = useState<Voucher | null>(null);

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
      return safeProductPrice;
    }

    return Number(
      (
        safeProductPrice *
        (1 -
          appliedVoucher.discountPercent /
            100)
      ).toFixed(2)
    );
  }, [
    appliedVoucher,
    safeProductPrice,
  ]);

  function applyVoucher(
    voucher: Voucher
  ) {
    setAppliedVoucher(voucher);

    localStorage.setItem(
      "void-market-applied-voucher",
      JSON.stringify(voucher)
    );

    setMessage(
      `Voucherul de ${voucher.discountPercent}% a fost aplicat.`
    );
  }

  function decreaseSelectedQuantity() {
    setQuantity((current) =>
      Math.max(1, current - 1)
    );
  }

  function increaseSelectedQuantity() {
    setQuantity((current) =>
      Math.min(safeStock, current + 1)
    );
  }

  function addToCart() {
    try {
      if (safeStock <= 0) {
        setMessage(
          "Produsul nu mai este în stoc."
        );
        return;
      }

      const savedCart =
        localStorage.getItem(
          CART_STORAGE_KEY
        );

      const parsedCart: unknown =
        savedCart
          ? JSON.parse(savedCart)
          : [];

      const cart: CartItem[] =
        Array.isArray(parsedCart)
          ? parsedCart.map(
              (item: CartItem) => ({
                ...item,
                price: normalizeNumber(
                  item.price
                ),
                originalPrice:
                  item.originalPrice ===
                  undefined
                    ? undefined
                    : normalizeNumber(
                        item.originalPrice
                      ),
                quantity: Math.max(
                  1,
                  Math.floor(
                    normalizeNumber(
                      item.quantity,
                      1
                    )
                  )
                ),
                stock:
                  item.stock === undefined
                    ? undefined
                    : Math.max(
                        0,
                        Math.floor(
                          normalizeNumber(
                            item.stock
                          )
                        )
                      ),
                voucherUses:
                  item.voucherUses === undefined
                    ? undefined
                    : Math.max(
                        0,
                        Math.floor(
                          normalizeNumber(
                            item.voucherUses
                          )
                        )
                      ),
              })
            )
          : [];

      const existingProduct =
        cart.find(
          (item) =>
            item.id === product.id &&
            item.size === product.size
        );

      if (existingProduct) {
        const nextQuantity =
          existingProduct.quantity +
          quantity;

        if (nextQuantity > safeStock) {
          const availableToAdd =
            Math.max(
              0,
              safeStock -
                existingProduct.quantity
            );

          setMessage(
            availableToAdd <= 0
              ? "Ai adăugat deja tot stocul disponibil."
              : `Mai poți adăuga doar ${availableToAdd} ${
                  availableToAdd === 1
                    ? "bucată"
                    : "bucăți"
                }.`
          );
          return;
        }

        existingProduct.quantity =
          nextQuantity;

        existingProduct.price =
          finalPrice;

        existingProduct.originalPrice =
          safeProductPrice;

        existingProduct.stock =
          safeStock;

        if (appliedVoucher) {
          existingProduct.voucherId =
            appliedVoucher.id;

          existingProduct.voucherCode =
            appliedVoucher.code;

          existingProduct.discountPercent =
            appliedVoucher.discountPercent;

          existingProduct.voucherUses = 1;
        } else {
          delete existingProduct.voucherId;
          delete existingProduct.voucherCode;
          delete existingProduct.discountPercent;
          delete existingProduct.voucherUses;
        }
      } else {
        if (quantity > safeStock) {
          setMessage(
            "Cantitatea selectată depășește stocul disponibil."
          );
          return;
        }

        cart.push({
          id: product.id,
          name: product.name,
          price: finalPrice,
          originalPrice:
            safeProductPrice,
          size: product.size,
          image:
            product.image ?? "",
          quantity,
          stock: safeStock,
          voucherId:
            appliedVoucher?.id,
          voucherCode:
            appliedVoucher?.code,
          discountPercent:
            appliedVoucher?.discountPercent,
          voucherUses:
            appliedVoucher ? 1 : 0,
        });
      }

      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cart)
      );

      window.dispatchEvent(
        new Event("cart-updated")
      );

      setMessage(
        appliedVoucher && quantity > 1
          ? `Produsele au fost adăugate. Reducerea de ${appliedVoucher.discountPercent}% se aplică doar unei singure bucăți.`
          : appliedVoucher
            ? `Produsul a fost adăugat cu reducere de ${appliedVoucher.discountPercent}%.`
            : `${quantity} ${
                quantity === 1
                  ? "produs a fost adăugat"
                  : "produse au fost adăugate"
              } în coș.`
      );

      setQuantity(1);

      window.setTimeout(() => {
        setMessage("");
      }, 5000);
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
              {safeProductPrice} Lei
            </p>

            <p className="mt-4 text-sm font-semibold text-green-400">
              Voucher aplicat: -
              {
                appliedVoucher.discountPercent
              }
              %
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
              {safeProductPrice} Lei
            </p>
          </>
        )}
      </div>

      <VoucherWheel
        onApply={applyVoucher}
        appliedVoucher={
          appliedVoucher
        }
      />

      {safeStock > 1 && (
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <div>
            <p className="font-semibold">
              Cantitate
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Maximum {safeStock} în stoc
            </p>
          </div>

          <div className="flex items-center overflow-hidden rounded-xl border border-zinc-700 bg-black">
            <button
              type="button"
              onClick={
                decreaseSelectedQuantity
              }
              disabled={quantity <= 1}
              className="px-4 py-3 text-xl transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Scade cantitatea"
            >
              −
            </button>

            <span className="min-w-12 px-3 py-3 text-center font-black">
              {quantity}
            </span>

            <button
              type="button"
              onClick={
                increaseSelectedQuantity
              }
              disabled={
                quantity >= safeStock
              }
              className="px-4 py-3 text-xl transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Crește cantitatea"
            >
              +
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={addToCart}
        disabled={safeStock <= 0}
        className="mt-6 w-full rounded-xl bg-white px-8 py-4 text-lg font-bold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
      >
        {safeStock <= 0
          ? "Stoc epuizat"
          : quantity === 1
            ? "Adaugă în coș"
            : `Adaugă ${quantity} în coș`}
      </button>

      {message && (
        <p className="mt-4 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-center text-sm text-white">
          {message}
        </p>
      )}
    </div>
  );
}