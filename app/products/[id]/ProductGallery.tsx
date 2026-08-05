"use client";

import { useMemo, useState } from "react";

type ProductGalleryProps = {
  productName: string;
  images: string[];
};

export default function ProductGallery({
  productName,
  images,
}: ProductGalleryProps) {
  const cleanImages = useMemo(
    () =>
      images.filter(
        (image, index, array) =>
          image &&
          array.indexOf(image) === index
      ),
    [images]
  );

  const [selectedImage, setSelectedImage] =
    useState(cleanImages[0] ?? "");

  if (cleanImages.length === 0) {
    return (
      <div className="flex min-h-[420px] items-center justify-center overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 sm:min-h-[550px]">
        <p className="text-lg font-semibold text-zinc-600">
          Imagine indisponibilă
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex min-h-[420px] items-center justify-center overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 sm:min-h-[550px]">
        <img
          src={selectedImage}
          alt={productName}
          className="h-full max-h-[700px] w-full object-contain"
        />
      </div>

      {cleanImages.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {cleanImages.map((image, index) => {
            const selected =
              image === selectedImage;

            return (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() =>
                  setSelectedImage(image)
                }
                className={`flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-zinc-950 transition ${
                  selected
                    ? "border-white"
                    : "border-zinc-800 hover:border-zinc-600"
                }`}
                aria-label={`Vezi poza ${index + 1}`}
              >
                <img
                  src={image}
                  alt={`${productName} - poza ${index + 1}`}
                  className="h-full w-full object-contain"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}