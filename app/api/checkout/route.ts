import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

type CartItemInput = {
  id: string;
  quantity: number;
};

type CheckoutBody = {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  county: string;
  city: string;
  deliveryMethod: string;
  deliveryAddress: string;
  items: CartItemInput[];
};

type DatabaseProduct = {
  id: string;
  name: string;
  price: number;
  stock: number | null;
};

export async function POST(request: Request) {
  try {
    const stripeSecretKey =
      process.env.STRIPE_SECRET_KEY;

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabaseSecretKey =
      process.env.SUPABASE_SECRET_KEY;

    if (!stripeSecretKey) {
      return NextResponse.json(
        {
          error:
            "STRIPE_SECRET_KEY lipsește din Environment Variables.",
        },
        { status: 500 }
      );
    }

    if (!supabaseUrl || !supabaseSecretKey) {
      return NextResponse.json(
        {
          error:
            "Cheile Supabase pentru server lipsesc.",
        },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);

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

    const body: CheckoutBody = await request.json();

    const {
      firstName,
      lastName,
      email,
      phone,
      county,
      city,
      deliveryMethod,
      deliveryAddress,
      items,
    } = body;

    if (
      !firstName?.trim() ||
      !lastName?.trim() ||
      !phone?.trim() ||
      !county?.trim() ||
      !city?.trim() ||
      !deliveryMethod?.trim() ||
      !deliveryAddress?.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Completează toate câmpurile obligatorii.",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          error: "Coșul este gol.",
        },
        { status: 400 }
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
          error:
            "Coșul conține un produs sau o cantitate invalidă.",
        },
        { status: 400 }
      );
    }

    const productIds = [
      ...new Set(
        normalizedItems.map((item) => item.id)
      ),
    ];

    const { data, error: productsError } =
      await supabaseAdmin
        .from("products")
        .select("id, name, price, stock")
        .in("id", productIds);

    if (productsError) {
      console.error(
        "Supabase products error:",
        productsError
      );

      return NextResponse.json(
        {
          error:
            "Produsele nu au putut fi verificate.",
        },
        { status: 500 }
      );
    }

    const products =
      (data as DatabaseProduct[] | null) ?? [];

    if (products.length !== productIds.length) {
      return NextResponse.json(
        {
          error:
            "Unul dintre produsele din coș nu mai există.",
        },
        { status: 400 }
      );
    }

    const productsById = new Map(
      products.map((product) => [
        product.id,
        product,
      ])
    );

    for (const item of normalizedItems) {
      const product = productsById.get(item.id);

      if (!product) {
        return NextResponse.json(
          {
            error:
              "Un produs din coș nu mai există.",
          },
          { status: 400 }
        );
      }

      const availableStock = product.stock ?? 0;

      if (availableStock < item.quantity) {
        return NextResponse.json(
          {
            error:
              availableStock <= 0
                ? `${product.name} este stoc epuizat.`
                : `Mai sunt doar ${availableStock} bucăți din ${product.name}.`,
          },
          { status: 400 }
        );
      }
    }

    const stripeLineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      normalizedItems.map((item) => {
        const product = productsById.get(
          item.id
        )!;

        return {
          quantity: item.quantity,

          price_data: {
            currency: "ron",

            unit_amount: Math.round(
              product.price * 100
            ),

            product_data: {
              name: product.name,

              metadata: {
                product_id: product.id,
              },
            },
          },
        };
      });

    stripeLineItems.push({
      quantity: 1,

      price_data: {
        currency: "ron",

        unit_amount: 2000,

        product_data: {
          name: "Transport",

          description:
            deliveryMethod === "easybox"
              ? "Livrare Easybox"
              : "Livrare FAN Courier",
        },
      },
    });

    const checkoutItems = normalizedItems.map(
      (item) => ({
        id: item.id,
        quantity: item.quantity,
      })
    );

    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const session =
      await stripe.checkout.sessions.create({
        mode: "payment",

        payment_method_types: ["card"],

        customer_email:
          email?.trim() || undefined,

        phone_number_collection: {
          enabled: true,
        },

        line_items: stripeLineItems,

        metadata: {
          customer_name:
            `${firstName.trim()} ${lastName.trim()}`,

          phone: phone.trim(),

          county: county.trim(),

          city: city.trim(),

          delivery_method:
            deliveryMethod.trim(),

          delivery_address:
            deliveryAddress.trim(),

          cart_items: JSON.stringify(
            checkoutItems
          ),
        },

        success_url:
          `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,

        cancel_url: `${origin}/cancel`,
      });

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error(
      "Stripe checkout error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Checkout-ul nu a putut fi creat.",
      },
      { status: 500 }
    );
  }
}