import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

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

type SavedOrder = {
  id: string;
  customer_name: string;
  email: string;
  payment_method: string;
  status: string;
  subtotal: number;
  transport: number;
  total: number;
  items: OrderItem[] | null;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatMoney(value: number) {
  return `${new Intl.NumberFormat("ro-RO", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value)} Lei`;
}

function parsePositiveInteger(
  value: string | undefined,
  fallback: number
) {
  const parsed = Number(value);

  if (
    Number.isInteger(parsed) &&
    parsed > 0
  ) {
    return parsed;
  }

  return fallback;
}

function centsToLei(value: number | null) {
  return Number(
    ((value ?? 0) / 100).toFixed(2)
  );
}

function buildOrderEmailHtml(
  order: SavedOrder,
  trackingUrl: string
) {
  const items = Array.isArray(order.items)
    ? order.items
    : [];

  const itemsHtml = items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #27272a;">
            <strong>${escapeHtml(item.name)}</strong><br />
            <span style="color:#71717a;font-size:13px;">
              Cantitate: ${item.quantity} × ${formatMoney(item.unit_price)}
            </span>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #27272a;text-align:right;font-weight:700;">
            ${formatMoney(item.total)}
          </td>
        </tr>
      `
    )
    .join("");

  return `
    <!doctype html>
    <html lang="ro">
      <body style="margin:0;background:#09090b;color:#fafafa;font-family:Arial,sans-serif;">
        <div style="max-width:640px;margin:0 auto;padding:32px 18px;">
          <div style="border:1px solid #27272a;border-radius:24px;background:#18181b;padding:32px;">
            <p style="margin:0;color:#a1a1aa;font-size:12px;letter-spacing:4px;text-transform:uppercase;">
              VOID MARKET
            </p>

            <h1 style="margin:16px 0 8px;font-size:30px;">
              Plata și comanda au fost confirmate
            </h1>

            <p style="margin:0 0 24px;color:#a1a1aa;line-height:1.6;">
              Salut, ${escapeHtml(order.customer_name)}! Plata cu cardul a fost înregistrată.
            </p>

            <div style="border:1px solid #3f3f46;border-radius:16px;background:#09090b;padding:20px;margin-bottom:24px;">
              <p style="margin:0 0 8px;color:#71717a;font-size:12px;text-transform:uppercase;letter-spacing:2px;">
                ID comandă
              </p>
              <p style="margin:0;font-size:17px;font-weight:700;word-break:break-all;">
                ${escapeHtml(order.id)}
              </p>
              <p style="margin:14px 0 0;color:#a1a1aa;font-size:14px;line-height:1.6;">
                Păstrează ID-ul comenzii într-un loc sigur. Îl vei folosi împreună cu emailul de mai jos pentru a verifica statusul în orice moment.
              </p>
            </div>

            <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
              <tr>
                <td style="padding:7px 0;color:#71717a;">Email folosit la comandă</td>
                <td style="padding:7px 0;text-align:right;font-weight:700;word-break:break-all;">
                  ${escapeHtml(order.email)}
                </td>
              </tr>
              <tr>
                <td style="padding:7px 0;color:#71717a;">Metoda de plată</td>
                <td style="padding:7px 0;text-align:right;font-weight:700;">Card</td>
              </tr>
              <tr>
                <td style="padding:7px 0;color:#71717a;">Status</td>
                <td style="padding:7px 0;text-align:right;font-weight:700;">
                  ${escapeHtml(order.status)}
                </td>
              </tr>
            </table>

            <h2 style="margin:0 0 8px;font-size:20px;">Produse</h2>

            <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
              ${itemsHtml}
            </table>

            <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
              <tr>
                <td style="padding:6px 0;color:#a1a1aa;">Subtotal</td>
                <td style="padding:6px 0;text-align:right;">${formatMoney(order.subtotal)}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#a1a1aa;">Transport</td>
                <td style="padding:6px 0;text-align:right;">${formatMoney(order.transport)}</td>
              </tr>
              <tr>
                <td style="padding:12px 0 0;font-size:20px;font-weight:700;">Total</td>
                <td style="padding:12px 0 0;text-align:right;font-size:20px;font-weight:700;">${formatMoney(order.total)}</td>
              </tr>
            </table>

            <a
              href="${escapeHtml(trackingUrl)}"
              style="display:block;text-align:center;background:#ffffff;color:#000000;text-decoration:none;font-weight:700;padding:15px 20px;border-radius:12px;"
            >
              Urmărește comanda
            </a>

            <p style="margin:24px 0 0;color:#71717a;font-size:12px;text-align:center;line-height:1.6;">
              Pentru verificare vei introduce ID-ul comenzii și emailul folosit la comandă.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

async function sendOrderConfirmationEmail(
  order: SavedOrder,
  stripeSessionId: string
) {
  const resendApiKey =
    process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.warn(
      "RESEND_API_KEY lipsește. Emailul de confirmare nu a fost trimis."
    );
    return;
  }

  const resend = new Resend(resendApiKey);

  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://void-market.com"
  ).replace(/\/$/, "");

  const fromEmail =
    process.env.RESEND_FROM_EMAIL ||
    "VOID MARKET <orders@void-market.com>";

  const recipient =
    process.env.RESEND_TEST_EMAIL?.trim() ||
    order.email;

  const { error } = await resend.emails.send(
    {
      from: fromEmail,
      to: [recipient],
      replyTo: "voidmarket.ro@gmail.com",
      subject: `Plată confirmată VOID MARKET – ${order.id}`,
      html: buildOrderEmailHtml(
        order,
        `${siteUrl}/track-order?id=${encodeURIComponent(
          order.id
        )}&email=${encodeURIComponent(
          order.email
        )}`
      ),
    },
    {
      idempotencyKey:
        `order-confirmation-card/${stripeSessionId}`,
    }
  );

  if (error) {
    throw new Error(
      `Emailul nu a putut fi trimis: ${error.message}`
    );
  }
}

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

  const stripe = new Stripe(
    stripeSecretKey
  );

  const signature = request.headers.get(
    "stripe-signature"
  );

  if (!signature) {
    return NextResponse.json(
      {
        error:
          "Lipsește semnătura Stripe.",
      },
      {
        status: 400,
      }
    );
  }

  const rawBody = await request.text();

  let event: Stripe.Event;

  try {
    event =
      stripe.webhooks.constructEvent(
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
        error:
          "Semnătură webhook invalidă.",
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
      event.data
        .object as Stripe.Checkout.Session;

    if (
      session.payment_status !== "paid"
    ) {
      return NextResponse.json({
        received: true,
        processed: false,
        reason:
          "Plata nu este confirmată.",
      });
    }

    const lineItems =
      await stripe.checkout.sessions.listLineItems(
        session.id,
        {
          limit: 100,
          expand: [
            "data.price.product",
          ],
        }
      );

    const purchasedItems:
      PurchasedItem[] = [];

    const orderItems: OrderItem[] = [];

    let productsSubtotal = 0;
    let transportTotal = 0;

    for (const lineItem of lineItems.data) {
      const stripeProduct =
        lineItem.price?.product;

      const stripeLineQuantity =
        lineItem.quantity ?? 0;

      const lineTotalLei = centsToLei(
        lineItem.amount_total
      );

      if (
        !stripeProduct ||
        typeof stripeProduct ===
          "string" ||
        "deleted" in stripeProduct
      ) {
        continue;
      }

      const productId =
        stripeProduct.metadata
          .product_id;

      if (!productId) {
        transportTotal +=
          lineTotalLei;
        continue;
      }

      const purchaseQuantity =
        parsePositiveInteger(
          stripeProduct.metadata
            .purchase_quantity,
          stripeLineQuantity
        );

      if (purchaseQuantity <= 0) {
        continue;
      }

      const averageUnitPriceLei =
        Number(
          (
            lineTotalLei /
            purchaseQuantity
          ).toFixed(2)
        );

      const cleanProductName =
        (
          stripeProduct.name ||
          lineItem.description ||
          "Produs"
        ).replace(
          /\s×\s\d+$/,
          ""
        );

      purchasedItems.push({
        id: productId,
        quantity: purchaseQuantity,
      });

      orderItems.push({
        id: productId,
        name: cleanProductName,
        quantity: purchaseQuantity,
        unit_price:
          averageUnitPriceLei,
        total: lineTotalLei,
      });

      productsSubtotal +=
        lineTotalLei;
    }

    if (
      purchasedItems.length === 0
    ) {
      throw new Error(
        "Sesiunea Stripe nu conține produse valide."
      );
    }

    const supabaseAdmin =
      createClient(
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
      session.metadata?.county?.trim() ||
      "";

    const city =
      session.metadata?.city?.trim() ||
      "";

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

    const totalLei = centsToLei(
      session.amount_total
    );

    const { error: orderError } =
      await supabaseAdmin
        .from("orders")
        .upsert(
          {
            stripe_session_id:
              session.id,
            customer_name:
              customerName,
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
            subtotal:
              productsSubtotal,
            transport:
              transportTotal,
            total: totalLei,
            items: orderItems,
          },
          {
            onConflict:
              "stripe_session_id",
            ignoreDuplicates: true,
          }
        );

    if (orderError) {
      throw new Error(
        `Comanda nu a putut fi salvată: ${orderError.message}`
      );
    }

    const {
      data: savedOrder,
      error: savedOrderError,
    } = await supabaseAdmin
      .from("orders")
      .select(
        `
          id,
          customer_name,
          email,
          payment_method,
          status,
          subtotal,
          transport,
          total,
          items
        `
      )
      .eq(
        "stripe_session_id",
        session.id
      )
      .single();

    if (
      savedOrderError ||
      !savedOrder
    ) {
      console.error(
        "Comanda Stripe a fost salvată, dar nu a putut fi citită pentru email:",
        savedOrderError
      );
    } else {
      try {
        await sendOrderConfirmationEmail(
          savedOrder as SavedOrder,
          session.id
        );
      } catch (emailError) {
        console.error(
          "Emailul de confirmare pentru plata cu cardul nu a putut fi trimis:",
          emailError
        );
      }
    }

    console.log(
      wasProcessed
        ? `Comanda ${session.id} a fost salvată, iar stocul a fost actualizat.`
        : `Comanda ${session.id} exista deja sau stocul fusese deja actualizat.`
    );

    return NextResponse.json({
      received: true,
      processed:
        Boolean(wasProcessed),
      orderSaved: true,
    });
  } catch (error) {
    console.error(
      "Eroare la procesarea webhook-ului:",
      error
    );

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