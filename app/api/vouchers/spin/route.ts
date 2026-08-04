import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type CreatedVoucher = {
  voucher_id: string;
  voucher_code: string;
  discount_percent: number;
};

function chooseDiscountPercent() {
  const chance =
    Math.floor(Math.random() * 100) + 1;

  if (chance <= 50) {
    return 5;
  }

  if (chance <= 80) {
    return 10;
  }

  if (chance <= 95) {
    return 15;
  }

  return 20;
}

function generateVoucherCode() {
  const randomPart = crypto
    .randomUUID()
    .replaceAll("-", "")
    .slice(0, 8)
    .toUpperCase();

  return `VOID-${randomPart}`;
}

export async function POST() {
  try {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabaseSecretKey =
      process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseSecretKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cheile Supabase pentru server lipsesc.",
        },
        {
          status: 500,
        }
      );
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseSecretKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );

    const discountPercent =
      chooseDiscountPercent();

    let voucher:
      | CreatedVoucher
      | null = null;

    /*
      Încercăm de maximum 3 ori în cazul foarte rar
      în care se generează același cod.
    */
    for (let attempt = 0; attempt < 3; attempt++) {
      const voucherCode =
        generateVoucherCode();

      const {
        data,
        error,
      } = await supabaseAdmin.rpc(
        "create_spin_voucher",
        {
          p_code: voucherCode,
          p_discount_percent:
            discountPercent,
        }
      );

      if (!error) {
        const createdVoucher = Array.isArray(data)
          ? data[0]
          : data;

        if (createdVoucher) {
          voucher =
            createdVoucher as CreatedVoucher;

          break;
        }
      }

      const duplicateCode =
        error?.code === "23505";

      if (!duplicateCode) {
        console.error(
          "Eroare create_spin_voucher:",
          error
        );

        return NextResponse.json(
          {
            success: false,
            error:
              error?.message ||
              "Voucherul nu a putut fi creat.",
          },
          {
            status: 500,
          }
        );
      }
    }

    if (!voucher) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Nu am putut genera un cod unic. Încearcă din nou.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      voucher: {
        id: voucher.voucher_id,
        code: voucher.voucher_code,
        discountPercent:
          voucher.discount_percent,
      },
    });
  } catch (error) {
    console.error(
      "Eroare la generarea voucherului:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Voucherul nu a putut fi generat.",
      },
      {
        status: 500,
      }
    );
  }
}