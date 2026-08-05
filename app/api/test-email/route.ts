import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      {
        success: false,
        error:
          "Ruta de test este dezactivată în Production.",
      },
      {
        status: 403,
      }
    );
  }

  const resendApiKey =
    process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Lipsește RESEND_API_KEY din .env.local.",
      },
      {
        status: 500,
      }
    );
  }

  try {
    const resend = new Resend(
      resendApiKey
    );

    const { data, error } =
      await resend.emails.send({
        from:
          "VOID MARKET <orders@void-market.com>",

        to: [
          "voidmarket.ro@gmail.com",
        ],

        subject:
          "Test email - VOID MARKET",

        html: `
          <div
            style="
              margin: 0;
              padding: 40px 20px;
              background: #000000;
              font-family: Arial, sans-serif;
              color: #ffffff;
            "
          >
            <div
              style="
                max-width: 600px;
                margin: 0 auto;
                padding: 40px;
                border: 1px solid #27272a;
                border-radius: 24px;
                background: #09090b;
              "
            >
              <p
                style="
                  margin: 0;
                  color: #71717a;
                  font-size: 12px;
                  letter-spacing: 4px;
                "
              >
                VOID MARKET
              </p>

              <h1
                style="
                  margin: 24px 0 0;
                  font-size: 34px;
                "
              >
                Emailurile funcționează!
              </h1>

              <p
                style="
                  margin: 20px 0 0;
                  color: #a1a1aa;
                  font-size: 16px;
                  line-height: 26px;
                "
              >
                Acesta este un email de test trimis
                prin Resend de pe domeniul
                void-market.com.
              </p>

              <div
                style="
                  margin-top: 30px;
                  padding: 18px;
                  border-radius: 14px;
                  background: #ffffff;
                  color: #000000;
                  font-weight: bold;
                  text-align: center;
                "
              >
                VOID MARKET este conectat la Resend
              </div>
            </div>
          </div>
        `,
      });

    if (error) {
      console.error(
        "Eroare Resend:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error:
            error.message ||
            "Emailul nu a putut fi trimis.",
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Emailul de test a fost trimis.",
      emailId: data?.id,
    });
  } catch (error) {
    console.error(
      "Eroare test email:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Emailul nu a putut fi trimis.",
      },
      {
        status: 500,
      }
    );
  }
}