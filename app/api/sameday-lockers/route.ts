import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 86400;

type SamedayLockerRaw = {
  oohId?: number | string;
  name?: string;
  county?: string;
  city?: string;
  address?: string;
  postalCode?: string;
  lat?: number | string;
  lng?: number | string;
  clientVisible?: boolean;
};

type SamedayResponse = {
  success?: boolean;
  data?: SamedayLockerRaw[];
};

type Locker = {
  id: string;
  name: string;
  county: string;
  city: string;
  address: string;
  postalCode: string;
  latitude: number;
  longitude: number;
};

const SAMEDAY_LOCKERS_URL =
  "https://sameday.ro/wp-admin/admin-ajax.php?action=get_ooh_lockers_request&country=Romania";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const county = searchParams.get("county") ?? "";
    const city = searchParams.get("city") ?? "";

    const response = await fetch(
      SAMEDAY_LOCKERS_URL,
      {
        headers: {
          Accept: "application/json",
          "User-Agent":
            "VOID-MARKET/1.0",
        },
        next: {
          revalidate: 86400,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `SAMEDAY a răspuns cu status ${response.status}.`
      );
    }

    const payload =
      (await response.json()) as SamedayResponse;

    if (
      !payload.success ||
      !Array.isArray(payload.data)
    ) {
      throw new Error(
        "Răspunsul SAMEDAY nu conține lista lockerelor."
      );
    }

    const normalizedCounty = normalize(county);
    const normalizedCity = normalize(city);

    const lockers: Locker[] = payload.data
      .filter(
        (locker) =>
          locker.clientVisible !== false
      )
      .map((locker) => ({
        id: String(
          locker.oohId ??
            `${locker.name}-${locker.address}`
        ),
        name:
          locker.name?.trim() ||
          "SAMEDAY easybox",
        county:
          locker.county?.trim() || "",
        city:
          locker.city?.trim() || "",
        address:
          locker.address?.trim() || "",
        postalCode:
          locker.postalCode?.trim() || "",
        latitude: Number(locker.lat),
        longitude: Number(locker.lng),
      }))
      .filter(
        (locker) =>
          locker.name &&
          locker.address &&
          Number.isFinite(
            locker.latitude
          ) &&
          Number.isFinite(
            locker.longitude
          )
      )
      .filter((locker) => {
        const countyMatches =
          !normalizedCounty ||
          normalize(locker.county).includes(
            normalizedCounty
          ) ||
          normalizedCounty.includes(
            normalize(locker.county)
          );

        const cityMatches =
          !normalizedCity ||
          normalize(locker.city).includes(
            normalizedCity
          ) ||
          normalizedCity.includes(
            normalize(locker.city)
          );

        return (
          countyMatches &&
          cityMatches
        );
      })
      .sort((first, second) =>
        first.name.localeCompare(
          second.name,
          "ro"
        )
      );

    return NextResponse.json({
      success: true,
      source: "sameday-public-map",
      count: lockers.length,
      lockers,
    });
  } catch (error) {
    console.error(
      "Eroare la încărcarea easybox-urilor:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Lista easybox-urilor nu este disponibilă momentan.",
        lockers: [],
      },
      {
        status: 502,
      }
    );
  }
}