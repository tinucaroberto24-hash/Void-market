import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type PurchasedItem = {
  id: string;
  quantity: number;
};

export async function POST(request: Request) {
  const stripeSecretKey =
    process.env.STRIPE_SECRET_KEY;

  const stripeWebhookSecret =
    process.env.STRIPE_WEBHOOK_SECRET;

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseSecretKey =
    process.env.SUPABASE_SECRET_KEY;

  if (
    !stripeSecretKey ||
    !stripeWebhookSecret ||
    !supabaseUrl ||
    !supabaseSecretKey
  ) {
    console.error(
      "Lipsesc variabilele necesare pentru webhook."
    );

    return NextResponse.json(
      {
        error:
          "Webhook-ul nu este configurat complet.",
      },
      {
        status: 500,
      }
    );
  }

  const stripe = new Stripe(stripeSecretKey);

  const signature = request.headers.get(
    "stripe-signature"
  );

  if (!signature) {
    return NextResponse.json(
      {
        error: "Lipsește semnătura Stripe.",
      },
      {
        status: 400,
      }
    );
  }

  const rawBody = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      stripeWebhookSecret
    );
  } catch (error) {
    console.error(
      "Semnătură webhook invalidă:",
      error
    );

    return NextResponse.json(
      {
        error: "Semnătură webhook invalidă.",
      },
      {
        status: 400,
      }
    );
  }

  try {
    if (
      event.type ===
      "checkout.session.completed"
    ) {
      const session =
        event.data.object as Stripe.Checkout.Session;

      if (session.payment_status !== "paid") {
        return NextResponse.json({
          received: true,
          processed: false,
          reason: "Plata nu este confirmată.",
        });
      }

      const lineItems =
        await stripe.checkout.sessions.listLineItems(
          session.id,
          {
            limit: 100,
            expand: ["data.price.product"],
          }
        );

      const purchasedItems: PurchasedItem[] = [];

      for (const lineItem of lineItems.data) {
        const stripeProduct =
          lineItem.price?.product;

        if (
          !stripeProduct ||
          typeof stripeProduct === "string" ||
          "deleted" in stripeProduct
        ) {
          continue;
        }

        const productId =
          stripeProduct.metadata.product_id;

        /*
          Transportul nu are product_id,
          deci este ignorat automat.
        */
        if (!productId) {
          continue;
        }

        const quantity =
          lineItem.quantity ?? 0;

        if (quantity <= 0) {
          continue;
        }

        purchasedItems.push({
          id: productId,
          quantity,
        });
      }

      if (purchasedItems.length === 0) {
        throw new Error(
          "Sesiunea Stripe nu conține produse valide."
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
        data: wasProcessed,
        error: stockError,
      } = await supabaseAdmin.rpc(
        "fulfill_stripe_checkout",
        {
          p_session_id: session.id,
          p_items: purchasedItems,
        }
      );

      if (stockError) {
        throw new Error(stockError.message);
      }

      console.log(
        wasProcessed
          ? `Stoc actualizat pentru sesiunea ${session.id}.`
          : `Sesiunea ${session.id} fusese deja procesată.`
      );
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error(
      "Eroare la procesarea webhook-ului:",
      error
    );

    /*
      Returnăm 500 pentru ca Stripe să încerce
      din nou livrarea evenimentului.
    */
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Webhook-ul nu a putut fi procesat.",
      },
      {
        status: 500,
      }
    );
  }
}