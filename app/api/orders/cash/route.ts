import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

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

type SavedOrderItem = {
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
  items: SavedOrderItem[] | null;
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
  return `${value} Lei`;
}

function buildOrderEmailHtml(
  order: SavedOrder,
  trackingUrl: string
) {
  const safeName = escapeHtml(order.customer_name);
  const safeEmail = escapeHtml(order.email);
  const safeOrderId = escapeHtml(order.id);
  const safeStatus = escapeHtml(order.status);

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
              Comanda ta a fost înregistrată
            </h1>

            <p style="margin:0 0 24px;color:#a1a1aa;line-height:1.6;">
              Salut, ${safeName}! Îți mulțumim pentru comandă.
            </p>

            <div style="border:1px solid #3f3f46;border-radius:16px;background:#09090b;padding:20px;margin-bottom:24px;">
              <p style="margin:0 0 8px;color:#71717a;font-size:12px;text-transform:uppercase;letter-spacing:2px;">
                ID comandă
              </p>
              <p style="margin:0;font-size:17px;font-weight:700;word-break:break-all;">
                ${safeOrderId}
              </p>
              <p style="margin:14px 0 0;color:#a1a1aa;font-size:14px;line-height:1.6;">
                Păstrează ID-ul comenzii într-un loc sigur. Îl vei folosi împreună cu emailul de mai jos pentru a verifica statusul în orice moment.
              </p>
            </div>

            <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
              <tr>
                <td style="padding:7px 0;color:#71717a;">Email folosit la comandă</td>
                <td style="padding:7px 0;text-align:right;font-weight:700;word-break:break-all;">${safeEmail}</td>
              </tr>
              <tr>
                <td style="padding:7px 0;color:#71717a;">Metoda de plată</td>
                <td style="padding:7px 0;text-align:right;font-weight:700;">Ramburs</td>
              </tr>
              <tr>
                <td style="padding:7px 0;color:#71717a;">Status</td>
                <td style="padding:7px 0;text-align:right;font-weight:700;">${safeStatus}</td>
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
  order: SavedOrder
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
    "https://void-market-store.vercel.app"
  ).replace(/\/$/, "");

  const fromEmail =
    process.env.RESEND_FROM_EMAIL ||
    "VOID MARKET <onboarding@resend.dev>";

  /*
    Cât timp nu ai un domeniu verificat, setează
    RESEND_TEST_EMAIL cu emailul contului tău Resend.
    Emailul va ajunge la tine, dar în conținut va apărea
    emailul real folosit de client la comandă.
  */
  const recipient =
    process.env.RESEND_TEST_EMAIL?.trim() ||
    order.email;

  const trackingUrl =
    `${siteUrl}/track-order`;

  const { error } = await resend.emails.send(
    {
      from: fromEmail,
      to: [recipient],
      replyTo: "voidmarket.ro@gmail.com",
      subject: `Comanda VOID MARKET – ${order.id}`,
      html: buildOrderEmailHtml(
        order,
        trackingUrl
      ),
    },
    {
      idempotencyKey:
        `order-confirmation-cash/${order.id}`,
    }
  );

  if (error) {
    throw new Error(
      `Emailul nu a putut fi trimis: ${error.message}`
    );
  }
}

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
        p_customer_name:
          customerName.trim(),
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

    const finalOrderId =
      typeof createdOrderId === "string" &&
      createdOrderId
        ? createdOrderId
        : orderId;

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
      .eq("id", finalOrderId)
      .single();

    if (savedOrderError || !savedOrder) {
      console.error(
        "Comanda a fost creată, dar nu a putut fi citită pentru email:",
        savedOrderError
      );
    } else {
      try {
        await sendOrderConfirmationEmail(
          savedOrder as SavedOrder
        );
      } catch (emailError) {
        /*
          Comanda rămâne validă chiar dacă emailul eșuează.
        */
        console.error(
          "Emailul de confirmare ramburs nu a putut fi trimis:",
          emailError
        );
      }
    }

    return NextResponse.json({
      success: true,
      orderId: finalOrderId,
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