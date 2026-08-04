import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type CashOrderItem = {
  id: string;
  quantity: number;
};

type CashOrderBody = {
  orderId: string;
  customerName: string;
  email: string;
  phone: string;
  county: string;
  city: string;
  deliveryAddress: string;
  deliveryMethod: string;
  items: CashOrderItem[];
};

export async function POST(request: Request) {
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

    const body: CashOrderBody =
      await request.json();

    const {
      orderId,
      customerName,
      email,
      phone,
      county,
      city,
      deliveryAddress,
      deliveryMethod,
      items,
    } = body;

    if (
      !orderId ||
      !customerName?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !county?.trim() ||
      !city?.trim() ||
      !deliveryAddress?.trim() ||
      !deliveryMethod?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Lipsesc date obligatorii pentru comandă.",
        },
        {
          status: 400,
        }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Coșul este gol.",
        },
        {
          status: 400,
        }
      );
    }

    const normalizedItems = items.map((item) => ({
      id: String(item.id),
      quantity: Number(item.quantity),
    }));

    const invalidItem = normalizedItems.find(
      (item) =>
        !item.id ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
    );

    if (invalidItem) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Coșul conține un produs sau o cantitate invalidă.",
        },
        {
          status: 400,
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

    const {
      data: createdOrderId,
      error: orderError,
    } = await supabaseAdmin.rpc(
      "create_cash_order",
      {
        p_order_id: orderId,
        p_customer_name: customerName.trim(),
        p_email: email.trim(),
        p_phone: phone.trim(),
        p_county: county.trim(),
        p_city: city.trim(),
        p_delivery_address:
          deliveryAddress.trim(),
        p_delivery_method:
          deliveryMethod.trim(),
        p_items: normalizedItems,
      }
    );

    if (orderError) {
      console.error(
        "Eroare create_cash_order:",
        orderError
      );

      return NextResponse.json(
        {
          success: false,
          error: orderError.message,
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: createdOrderId,
    });
  } catch (error) {
    console.error(
      "Eroare comandă ramburs:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Comanda ramburs nu a putut fi salvată.",
      },
      {
        status: 500,
      }
    );
  }
}