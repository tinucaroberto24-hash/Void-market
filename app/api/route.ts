import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error(
    "Lipsește STRIPE_SECRET_KEY din fișierul .env.local."
  );
}

const stripe = new Stripe(stripeSecretKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      firstName,
      lastName,
      email,
      phone,
      county,
      city,
      deliveryMethod,
      deliveryAddress,
    } = body;

    if (
      !firstName ||
      !lastName ||
      !phone ||
      !county ||
      !city ||
      !deliveryMethod ||
      !deliveryAddress
    ) {
      return NextResponse.json(
        {
          error: "Lipsesc date obligatorii pentru comandă.",
        },
        {
          status: 400,
        }
      );
    }

    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      payment_method_types: ["card"],

      customer_email: email || undefined,

      phone_number_collection: {
        enabled: true,
      },

      line_items: [
        {
          quantity: 1,

          price_data: {
            currency: "ron",

            unit_amount: 25000,

            product_data: {
              name: "Louis Vuitton LV Sweater",

              description:
                "Mărime S • Stare foarte bună • Fără defecte",

              images: [
                `${origin}/lv/front.jpeg`,
              ],
            },
          },
        },

        {
          quantity: 1,

          price_data: {
            currency: "ron",

            unit_amount: 2000,

            product_data: {
              name: "Transport",
              description:
                deliveryMethod === "easybox"
                  ? "Livrare la Easybox"
                  : "Livrare prin FAN Courier",
            },
          },
        },
      ],

      metadata: {
        customer_name: `${firstName} ${lastName}`,
        phone,
        county,
        city,
        delivery_method: deliveryMethod,
        delivery_address: deliveryAddress,
      },

      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url: `${origin}/cancel`,
    });

    if (!session.url) {
      return NextResponse.json(
        {
          error: "Stripe nu a returnat URL-ul de plată.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);

    return NextResponse.json(
      {
        error:
          "Nu am putut porni plata cu cardul.",
      },
      {
        status: 500,
      }
    );
  }
}