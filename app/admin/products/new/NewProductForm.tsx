"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ProductForm = {
  name: string;
  brand: string;
  price: string;
  size: string;
  condition: string;
  description: string;
  image: string;
  stock: string;
};

const initialForm: ProductForm = {
  name: "",
  brand: "",
  price: "",
  size: "",
  condition: "",
  description: "",
  image: "",
  stock: "1",
};

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default function NewProductForm() {
  const router = useRouter();

  const [form, setForm] =
    useState<ProductForm>(initialForm);

  const [imageFiles, setImageFiles] =
    useState<File[]>([]);

  const [imagePreviews, setImagePreviews] =
    useState<string[]>([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => {
        URL.revokeObjectURL(preview);
      });
    };
  }, [imagePreviews]);

  function updateField(
    field: keyof ProductForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleImagesChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setError("");

    const selectedFiles = Array.from(
      event.target.files ?? []
    );

    if (selectedFiles.length === 0) {
      return;
    }

    if (selectedFiles.length > MAX_IMAGES) {
      setError(
        `Poți încărca maximum ${MAX_IMAGES} poze.`
      );

      event.target.value = "";
      return;
    }

    const invalidType = selectedFiles.find(
      (file) => !file.type.startsWith("image/")
    );

    if (invalidType) {
      setError(
        "Poți încărca doar fișiere imagine."
      );

      event.target.value = "";
      return;
    }

    const tooLarge = selectedFiles.find(
      (file) => file.size > MAX_IMAGE_SIZE
    );

    if (tooLarge) {
      setError(
        "Fiecare imagine poate avea maximum 5 MB."
      );

      event.target.value = "";
      return;
    }

    imagePreviews.forEach((preview) => {
      URL.revokeObjectURL(preview);
    });

    setImageFiles(selectedFiles);

    setImagePreviews(
      selectedFiles.map((file) =>
        URL.createObjectURL(file)
      )
    );
  }

  function removeSelectedImage(index: number) {
    URL.revokeObjectURL(imagePreviews[index]);

    setImageFiles((current) =>
      current.filter((_, fileIndex) => fileIndex !== index)
    );

    setImagePreviews((current) =>
      current.filter(
        (_, previewIndex) => previewIndex !== index
      )
    );
  }

  async function uploadImages(
    supabase: ReturnType<typeof createClient>
  ) {
    const uploadedUrls: string[] = [];

    for (const file of imageFiles) {
      const rawExtension =
        file.name.split(".").pop()?.toLowerCase() ??
        "jpg";

      const extension =
        rawExtension.replace(/[^a-z0-9]/g, "") ||
        "jpg";

      const filePath =
        `products/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } =
        await supabase.storage
          .from("product-images")
          .upload(filePath, file, {
            cacheControl: "3600",
            contentType: file.type,
            upsert: false,
          });

      if (uploadError) {
        throw new Error(
          `Poza ${file.name} nu s-a încărcat: ${uploadError.message}`
        );
      }

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      uploadedUrls.push(data.publicUrl);
    }

    return uploadedUrls;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess(false);
    setLoading(true);

    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!form.name.trim()) {
      setError("Completează numele produsului.");
      setLoading(false);
      return;
    }

    if (!form.brand.trim()) {
      setError("Completează brandul.");
      setLoading(false);
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError("Introdu un preț valid.");
      setLoading(false);
      return;
    }

    if (!form.size.trim()) {
      setError("Completează mărimea.");
      setLoading(false);
      return;
    }

    if (!form.condition) {
      setError("Alege starea produsului.");
      setLoading(false);
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setError("Introdu un stoc valid.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (
        userError ||
        user?.email !== "voidmarket.ro@gmail.com"
      ) {
        throw new Error(
          "Nu ai permisiunea să adaugi produse."
        );
      }

      const uploadedUrls =
        await uploadImages(supabase);

      const manualImageUrl = form.image.trim();

      const allImageUrls = [
        ...uploadedUrls,
        ...(manualImageUrl
          ? [manualImageUrl]
          : []),
      ];

      const mainImage =
        allImageUrls.length > 0
          ? allImageUrls[0]
          : null;

      const { error: insertError } = await supabase
        .from("products")
        .insert({
          name: form.name.trim(),
          brand: form.brand.trim(),
          price,
          size: form.size.trim(),
          condition: form.condition,
          description:
            form.description.trim() || null,
          image: mainImage,
          images:
            allImageUrls.length > 0
              ? allImageUrls
              : null,
          stock,
        });

      if (insertError) {
        throw new Error(insertError.message);
      }

      imagePreviews.forEach((preview) => {
        URL.revokeObjectURL(preview);
      });

      setSuccess(true);
      setForm(initialForm);
      setImageFiles([]);
      setImagePreviews([]);

      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 1200);
    } catch (submitError) {
      console.error(
        "Eroare la salvarea produsului:",
        submitError
      );

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Produsul nu a putut fi salvat."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-10"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm text-zinc-400">
            Nume produs *
          </span>

          <input
            type="text"
            value={form.name}
            onChange={(event) =>
              updateField("name", event.target.value)
            }
            placeholder="Exemplu: Louis Vuitton Sweater"
            required
            className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none transition focus:border-white"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm text-zinc-400">
            Brand *
          </span>

          <input
            type="text"
            value={form.brand}
            onChange={(event) =>
              updateField("brand", event.target.value)
            }
            placeholder="Louis Vuitton"
            required
            className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none transition focus:border-white"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm text-zinc-400">
            Preț în lei *
          </span>

          <input
            type="number"
            min="1"
            step="1"
            value={form.price}
            onChange={(event) =>
              updateField("price", event.target.value)
            }
            placeholder="250"
            required
            className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none transition focus:border-white"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm text-zinc-400">
            Mărime *
          </span>

          <input
            type="text"
            value={form.size}
            onChange={(event) =>
              updateField("size", event.target.value)
            }
            placeholder="S, M, L, 42..."
            required
            className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none transition focus:border-white"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm text-zinc-400">
            Stare *
          </span>

          <select
            value={form.condition}
            onChange={(event) =>
              updateField(
                "condition",
                event.target.value
              )
            }
            required
            className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none transition focus:border-white"
          >
            <option value="">Alege starea</option>

            <option value="Nou cu etichetă">
              Nou cu etichetă
            </option>

            <option value="Nou fără etichetă">
              Nou fără etichetă
            </option>

            <option value="Stare foarte bună">
              Stare foarte bună
            </option>

            <option value="Stare bună">
              Stare bună
            </option>

            <option value="Stare acceptabilă">
              Stare acceptabilă
            </option>
          </select>
        </label>

        <label>
          <span className="mb-2 block text-sm text-zinc-400">
            Stoc *
          </span>

          <input
            type="number"
            min="0"
            step="1"
            value={form.stock}
            onChange={(event) =>
              updateField("stock", event.target.value)
            }
            required
            className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none transition focus:border-white"
          />
        </label>

        <div className="md:col-span-2">
          <span className="mb-2 block text-sm text-zinc-400">
            Încarcă poze din calculator
          </span>

          <input
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp"
            onChange={handleImagesChange}
            className="block w-full cursor-pointer rounded-xl border border-zinc-700 bg-black px-4 py-3 text-sm text-zinc-400 file:mr-4 file:rounded-lg file:border-0 file:bg-white file:px-4 file:py-2 file:font-bold file:text-black"
          />

          <p className="mt-2 text-xs text-zinc-600">
            Maximum 5 poze. Fiecare poză poate avea maximum
            5 MB.
          </p>
        </div>

        {imagePreviews.length > 0 && (
          <div className="md:col-span-2">
            <p className="mb-3 text-sm text-zinc-400">
              Poze selectate: {imagePreviews.length}
            </p>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {imagePreviews.map((preview, index) => (
                <div
                  key={preview}
                  className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-black"
                >
                  <img
                    src={preview}
                    alt={`Previzualizare ${index + 1}`}
                    className="h-52 w-full object-contain"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeSelectedImage(index)
                    }
                    className="absolute right-2 top-2 rounded-lg bg-black/80 px-3 py-2 text-xs font-bold text-white"
                  >
                    Șterge
                  </button>

                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 rounded-lg bg-white px-3 py-1 text-xs font-bold text-black">
                      Poză principală
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="md:col-span-2 flex items-center gap-4">
          <div className="h-px flex-1 bg-zinc-800" />

          <span className="text-xs uppercase tracking-widest text-zinc-600">
            sau
          </span>

          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        <label className="md:col-span-2">
          <span className="mb-2 block text-sm text-zinc-400">
            Link imagine
          </span>

          <input
            type="url"
            value={form.image}
            onChange={(event) =>
              updateField("image", event.target.value)
            }
            placeholder="https://..."
            className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none transition focus:border-white"
          />

          <span className="mt-2 block text-xs text-zinc-600">
            Linkul va fi adăugat după pozele selectate din
            calculator.
          </span>
        </label>

        {form.image && (
          <div className="md:col-span-2">
            <p className="mb-3 text-sm text-zinc-400">
              Previzualizare link
            </p>

            <div className="flex h-72 items-center justify-center overflow-hidden rounded-2xl border border-zinc-800 bg-black">
              <img
                src={form.image}
                alt="Previzualizare link"
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        )}

        <label className="md:col-span-2">
          <span className="mb-2 block text-sm text-zinc-400">
            Descriere
          </span>

          <textarea
            rows={6}
            value={form.description}
            onChange={(event) =>
              updateField(
                "description",
                event.target.value
              )
            }
            placeholder="Descrie produsul, defectele și materialul..."
            className="w-full resize-none rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none transition focus:border-white"
          />
        </label>
      </div>

      {error && (
        <p className="mt-6 rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {success && (
        <p className="mt-6 rounded-xl border border-green-900 bg-green-950/40 px-4 py-3 text-sm text-green-300">
          Produsul și pozele au fost salvate.
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-8 w-full rounded-xl bg-white py-4 text-lg font-bold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Se încarcă pozele și se salvează..."
          : "Salvează produsul"}
      </button>
    </form>
  );
}