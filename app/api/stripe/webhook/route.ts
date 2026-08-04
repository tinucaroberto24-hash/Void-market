import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type PurchasedItem = {
  id: string;
  quantity: number;
};

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total: number;
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
      event.type !==
      "checkout.session.completed"
    ) {
      return NextResponse.json({
        received: true,
        ignored: true,
      });
    }

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
    const orderItems: OrderItem[] = [];

    let productsSubtotal = 0;
    let transportTotal = 0;

    for (const lineItem of lineItems.data) {
      const stripeProduct =
        lineItem.price?.product;

      const quantity =
        lineItem.quantity ?? 0;

      const lineTotalLei = Math.round(
        (lineItem.amount_total ?? 0) / 100
      );

      /*
        Dacă produsul Stripe nu poate fi citit,
        ignorăm linia.
      */
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
        Transportul nu are product_id.
      */
      if (!productId) {
        transportTotal += lineTotalLei;
        continue;
      }

      if (quantity <= 0) {
        continue;
      }

      const unitPriceLei =
        quantity > 0
          ? Math.round(lineTotalLei / quantity)
          : 0;

      purchasedItems.push({
        id: productId,
        quantity,
      });

      orderItems.push({
        id: productId,
        name:
          lineItem.description ||
          stripeProduct.name ||
          "Produs",
        quantity,
        unit_price: unitPriceLei,
        total: lineTotalLei,
      });

      productsSubtotal += lineTotalLei;
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

    /*
      Scade stocul.

      Funcția SQL verifică session.id, astfel încât
      aceeași plată nu poate scădea stocul de două ori.
    */
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
      throw new Error(
        `Stocul nu a putut fi actualizat: ${stockError.message}`
      );
    }

    const customerName =
      session.metadata?.customer_name?.trim() ||
      session.customer_details?.name?.trim() ||
      "Client Stripe";

    const customerEmail =
      session.customer_details?.email?.trim() ||
      session.customer_email?.trim() ||
      "";

    const customerPhone =
      session.metadata?.phone?.trim() ||
      session.customer_details?.phone?.trim() ||
      "";

    const county =
      session.metadata?.county?.trim() || "";

    const city =
      session.metadata?.city?.trim() || "";

    const deliveryMethod =
      session.metadata?.delivery_method?.trim() ||
      "fan";

    const deliveryAddress =
      session.metadata?.delivery_address?.trim() ||
      "";

    if (!customerEmail) {
      throw new Error(
        "Comanda nu conține adresa de email a clientului."
      );
    }

    if (!customerPhone) {
      throw new Error(
        "Comanda nu conține numărul de telefon."
      );
    }

    if (
      !county ||
      !city ||
      !deliveryAddress
    ) {
      throw new Error(
        "Comanda nu conține toate datele de livrare."
      );
    }

    const totalLei = Math.round(
      (session.amount_total ?? 0) / 100
    );

    /*
      Upsert împiedică apariția aceleiași comenzi
      de mai multe ori dacă Stripe retrimite webhook-ul.
    */
    const { error: orderError } =
      await supabaseAdmin
        .from("orders")
        .upsert(
          {
            stripe_session_id: session.id,

            customer_name: customerName,
            email: customerEmail,
            phone: customerPhone,

            county,
            city,

            delivery_address:
              deliveryAddress,

            delivery_method:
              deliveryMethod,

            payment_method: "card",
            status: "Nouă",

            subtotal: productsSubtotal,
            transport: transportTotal,
            total: totalLei,

            items: orderItems,
          },
          {
            onConflict: "stripe_session_id",
            ignoreDuplicates: true,
          }
        );

    if (orderError) {
      throw new Error(
        `Comanda nu a putut fi salvată: ${orderError.message}`
      );
    }

    console.log(
      wasProcessed
        ? `Comanda ${session.id} a fost salvată, iar stocul a fost actualizat.`
        : `Comanda ${session.id} exista deja sau stocul fusese deja actualizat.`
    );

    return NextResponse.json({
      received: true,
      processed: Boolean(wasProcessed),
      orderSaved: true,
    });
  } catch (error) {
    console.error(
      "Eroare la procesarea webhook-ului:",
      error
    );

    /*
      Răspunsul 500 determină Stripe să încerce
      din nou trimiterea evenimentului.
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