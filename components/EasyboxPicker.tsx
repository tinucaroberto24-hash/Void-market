"use client";

import { useMemo, useState } from "react";

type EasyboxLocation = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
};

type EasyboxPickerProps = {
  county: string;
  city: string;
  selectedValue: string;
  onSelect: (value: string) => void;
};

type OverpassElement = {
  id: number;
  type: "node" | "way" | "relation";
  lat?: number;
  lon?: number;
  center?: {
    lat?: number;
    lon?: number;
  };
  tags?: Record<string, string>;
};

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function calculateDistanceKm(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number
) {
  const earthRadiusKm = 6371;

  const latitudeDifference = toRadians(
    latitude2 - latitude1
  );

  const longitudeDifference = toRadians(
    longitude2 - longitude1
  );

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(toRadians(latitude1)) *
      Math.cos(toRadians(latitude2)) *
      Math.sin(longitudeDifference / 2) ** 2;

  return (
    2 *
    earthRadiusKm *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )
  );
}

function buildAddress(
  tags: Record<string, string>
) {
  const street =
    tags["addr:street"] ?? "";

  const number =
    tags["addr:housenumber"] ?? "";

  const city =
    tags["addr:city"] ?? "";

  const parts = [
    [street, number]
      .filter(Boolean)
      .join(" "),
    city,
  ].filter(Boolean);

  return parts.join(", ");
}

async function geocodeCity(
  city: string,
  county: string
) {
  const query = encodeURIComponent(
    `${city}, ${county}, România`
  );

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=ro&q=${query}`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      "Localitatea nu a putut fi găsită."
    );
  }

  const results = (await response.json()) as Array<{
    lat: string;
    lon: string;
  }>;

  const firstResult = results[0];

  if (!firstResult) {
    throw new Error(
      "Nu am găsit localitatea selectată."
    );
  }

  return {
    latitude: Number(firstResult.lat),
    longitude: Number(firstResult.lon),
  };
}

async function fetchNearbyEasyboxes(
  latitude: number,
  longitude: number
) {
  const radiusMeters = 30000;

  const query = `
    [out:json][timeout:25];
    (
      nwr(around:${radiusMeters},${latitude},${longitude})
        ["amenity"="parcel_locker"]
        ["operator"~"sameday",i];

      nwr(around:${radiusMeters},${latitude},${longitude})
        ["amenity"="parcel_locker"]
        ["brand"~"sameday|easybox",i];

      nwr(around:${radiusMeters},${latitude},${longitude})
        ["amenity"="parcel_locker"]
        ["name"~"easybox|sameday",i];
    );
    out center tags;
  `;

  const response = await fetch(
    "https://overpass-api.de/api/interpreter",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: new URLSearchParams({
        data: query,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Lista easybox-urilor nu a putut fi încărcată."
    );
  }

  const result = (await response.json()) as {
    elements?: OverpassElement[];
  };

  const uniqueLocations =
    new Map<string, EasyboxLocation>();

  for (const element of result.elements ?? []) {
    const elementLatitude =
      element.lat ??
      element.center?.lat;

    const elementLongitude =
      element.lon ??
      element.center?.lon;

    if (
      typeof elementLatitude !== "number" ||
      typeof elementLongitude !== "number"
    ) {
      continue;
    }

    const tags = element.tags ?? {};

    const name =
      tags.name ??
      tags.brand ??
      "SAMEDAY easybox";

    const address =
      buildAddress(tags) ||
      "Adresă indisponibilă";

    const key = `${name}-${elementLatitude}-${elementLongitude}`;

    uniqueLocations.set(key, {
      id: `${element.type}-${element.id}`,
      name,
      address,
      latitude: elementLatitude,
      longitude: elementLongitude,
      distanceKm:
        calculateDistanceKm(
          latitude,
          longitude,
          elementLatitude,
          elementLongitude
        ),
    });
  }

  return [...uniqueLocations.values()]
    .sort(
      (first, second) =>
        first.distanceKm -
        second.distanceKm
    )
    .slice(0, 20);
}

function getBrowserLocation() {
  return new Promise<{
    latitude: number;
    longitude: number;
  }>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(
        new Error(
          "Browserul nu permite accesul la locație."
        )
      );

      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude:
            position.coords.latitude,
          longitude:
            position.coords.longitude,
        });
      },
      () => {
        reject(
          new Error(
            "Locația nu a fost permisă."
          )
        );
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  });
}

export default function EasyboxPicker({
  county,
  city,
  selectedValue,
  onSelect,
}: EasyboxPickerProps) {
  const [locations, setLocations] =
    useState<EasyboxLocation[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [sourceLabel, setSourceLabel] =
    useState("");

  const canSearch = useMemo(
    () =>
      Boolean(
        county.trim() &&
          city.trim() &&
          city !== "Altă localitate"
      ),
    [county, city]
  );

  async function loadNearbyEasyboxes() {
    setLoading(true);
    setError("");
    setLocations([]);
    onSelect("");

    try {
      let referenceLocation: {
        latitude: number;
        longitude: number;
      };

      try {
        referenceLocation =
          await getBrowserLocation();

        setSourceLabel(
          "Ordonate după locația ta"
        );
      } catch {
        if (!canSearch) {
          throw new Error(
            "Alege mai întâi județul și localitatea."
          );
        }

        referenceLocation =
          await geocodeCity(
            city,
            county
          );

        setSourceLabel(
          `Easybox-uri din apropierea localității ${city}`
        );
      }

      const nearbyLocations =
        await fetchNearbyEasyboxes(
          referenceLocation.latitude,
          referenceLocation.longitude
        );

      if (
        nearbyLocations.length === 0
      ) {
        throw new Error(
          "Nu am găsit easybox-uri în apropiere. Poți alege livrarea la adresă."
        );
      }

      setLocations(nearbyLocations);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Easybox-urile nu au putut fi încărcate."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="md:col-span-2">
      <p className="mb-2 text-sm text-zinc-400">
        Easybox ales *
      </p>

      <button
        type="button"
        onClick={loadNearbyEasyboxes}
        disabled={loading}
        className="w-full rounded-xl border border-zinc-700 bg-black px-5 py-4 text-left font-bold transition hover:border-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Se caută easybox-uri..."
          : "📍 Găsește easybox-uri lângă mine"}
      </button>

      <p className="mt-2 text-xs leading-5 text-zinc-500">
        Browserul îți va cere separat
        permisiunea pentru locație. Dacă o
        refuzi, folosim localitatea aleasă.
      </p>

      {error && (
        <p className="mt-4 rounded-xl border border-red-900 bg-red-950/30 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {locations.length > 0 && (
        <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-800 bg-black">
          <div className="border-b border-zinc-800 px-4 py-3">
            <p className="text-sm font-bold">
              Alege easybox-ul
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              {sourceLabel}
            </p>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {locations.map(
              (location) => {
                const value =
                  `${location.name} — ${location.address}`;

                const selected =
                  selectedValue === value;

                return (
                  <button
                    key={location.id}
                    type="button"
                    onClick={() =>
                      onSelect(value)
                    }
                    className={`flex w-full items-start justify-between gap-4 border-b border-zinc-900 px-4 py-4 text-left transition last:border-b-0 ${
                      selected
                        ? "bg-white text-black"
                        : "hover:bg-zinc-900"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block font-bold">
                        {location.name}
                      </span>

                      <span
                        className={`mt-1 block text-xs leading-5 ${
                          selected
                            ? "text-zinc-700"
                            : "text-zinc-500"
                        }`}
                      >
                        {location.address}
                      </span>
                    </span>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                        selected
                          ? "bg-black text-white"
                          : "bg-zinc-900 text-zinc-300"
                      }`}
                    >
                      {location.distanceKm <
                      1
                        ? `${Math.round(
                            location.distanceKm *
                              1000
                          )} m`
                        : `${location.distanceKm.toFixed(
                            1
                          )} km`}
                    </span>
                  </button>
                );
              }
            )}
          </div>
        </div>
      )}

      {selectedValue && (
        <div className="mt-4 rounded-xl border border-green-900 bg-green-950/30 px-4 py-4">
          <p className="text-xs font-bold uppercase tracking-wider text-green-400">
            Easybox selectat
          </p>

          <p className="mt-2 text-sm font-semibold text-white">
            {selectedValue}
          </p>
        </div>
      )}

      <p className="mt-3 text-[11px] leading-5 text-zinc-600">
        Lista este furnizată din date publice
        OpenStreetMap și poate să nu conțină
        toate easybox-urile active.
      </p>
    </div>
  );
}