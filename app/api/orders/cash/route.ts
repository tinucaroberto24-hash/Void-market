import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    const body = await request.json();

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

    const { error } = await supabase.rpc(
      "create_cash_order",
      {
        p_order_id: orderId,
        p_customer_name: customerName,
        p_email: email,
        p_phone: phone,
        p_county: county,
        p_city: city,
        p_delivery_address: deliveryAddress,
        p_delivery_method: deliveryMethod,
        p_items: items,
      }
    );

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}