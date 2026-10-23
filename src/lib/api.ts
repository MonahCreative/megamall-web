import { cache } from "react";
import type { Banner, Category, ContentPage, ContentPageLink, Paginated, ProductCard, ProductPage, Region, Section, Store } from "./types";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

/** An error from the API, with Laravel's validation messages when there are any. */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors: Record<string, string[]> = {},
  ) {
    super(message);
  }

  /** The first validation message, or the general message. */
  get firstMessage(): string {
    const first = Object.values(this.errors)[0]?.[0];
    return first ?? this.message;
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api${path}`, {
      ...init,
      cache: "no-store",
      headers: { Accept: "application/json", "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError("We can't reach the shop right now. Check your connection and try again.", 0);
  }

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(body.message ?? "Something went wrong. Please try again.", response.status, body.errors ?? {});
  }
  return body as T;
}

export const post = <T>(path: string, data: unknown) => api<T>(path, { method: "POST", body: JSON.stringify(data) });

// Shared by the header, footer and pages in one render, fetched once.
export const getStore = cache(() => api<Store>("/store"));
export const getCategories = cache(async () => (await api<{ data: Category[] }>("/categories")).data);

export const getBanners = async () => (await api<{ data: Banner[] }>("/banners")).data;
export const getSections = async () => (await api<{ data: Section[] }>("/sections")).data;
export const getRegions = async () => (await api<{ data: Region[] }>("/regions")).data;
export const getProduct = (slug: string) => api<ProductPage>(`/products/${encodeURIComponent(slug)}`);
export const getPages = cache(async () => (await api<{ data: ContentPageLink[] }>("/pages")).data);
export const getContentPage = async (slug: string) => (await api<{ data: ContentPage }>(`/pages/${encodeURIComponent(slug)}`)).data;

export function getProducts(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  return api<Paginated<ProductCard>>(`/products?${query}`);
}
