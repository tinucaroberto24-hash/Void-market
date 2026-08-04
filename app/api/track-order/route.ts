import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type TrackOrderBody = {
  email?: string;
  orderId?: string;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
            "Serviciul de urmărire nu este configurat.",
        },
        {
          status: 500,
        }
      );
    }

    const body: TrackOrderBody =
      await request.json();

    const email = body.email
      ?.trim()
      .toLowerCase();

    const orderId = body.orderId?.trim();

    if (!email || !orderId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Completează emailul și ID-ul comenzii.",
        },
        {
          status: 400,
        }
      );
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Introdu o adresă de email validă.",
        },
        {
          status: 400,
        }
      );
    }

    if (!UUID_PATTERN.test(orderId)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "ID-ul comenzii nu este valid.",
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

    const { data: order, error } =
      await supabaseAdmin
        .from("orders")
        .select(
          `
            id,
            created_at,
            customer_name,
            email,
            county,
            city,
            delivery_address,
            delivery_method,
            payment_method,
            status,
            subtotal,
            transport,
            total,
            items
          `
        )
        .eq("id", orderId)
        .ilike("email", email)
        .maybeSingle();

    if (error) {
      console.error(
        "Eroare la căutarea comenzii:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Comanda nu a putut fi verificată.",
        },
        {
          status: 500,
        }
      );
    }

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Nu am găsit o comandă cu aceste date.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(
      "Eroare track order:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Comanda nu a putut fi verificată.",
      },
      {
        status: 500,
      }
    );
  }
}