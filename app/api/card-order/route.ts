import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type CardOrderBody = {
  sessionId?: string;
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
            "Serviciul pentru comenzi nu este configurat.",
        },
        {
          status: 500,
        }
      );
    }

    const body: CardOrderBody =
      await request.json();

    const sessionId =
      body.sessionId?.trim();

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Lipsește ID-ul sesiunii Stripe.",
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
            email,
            status
          `
        )
        .eq(
          "stripe_session_id",
          sessionId
        )
        .maybeSingle();

    if (error) {
      console.error(
        "Eroare la găsirea comenzii Stripe:",
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
          pending: true,
          error:
            "Comanda este încă în curs de procesare.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        email: order.email,
        status: order.status,
      },
    });
  } catch (error) {
    console.error(
      "Eroare card order:",
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