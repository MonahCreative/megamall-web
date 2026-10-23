import { Mail, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { WhatsAppIcon } from "@/components/icons";
import { ApiError, getContentPage, getStore } from "@/lib/api";
import { whatsappLink } from "@/lib/format";
import type { ContentPage } from "@/lib/types";

type Params = Promise<{ slug: string }>;

async function load(slug: string): Promise<ContentPage> {
  try {
    return await getContentPage(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  try {
    return { title: (await getContentPage(slug)).title };
  } catch {
    return { title: "Page" };
  }
}

export default function InfoPage({ params }: { params: Params }) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-8">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-white" />}>
        <PageBody params={params} />
      </Suspense>
    </div>
  );
}

async function PageBody({ params }: { params: Params }) {
  const { slug } = await params;
  const [page, store] = await Promise.all([load(slug), getStore().catch(() => null)]);
  const chat = whatsappLink(store?.whatsapp ?? null, "Habari, I have a question.");

  return (
    <article className="grid gap-6">
      <nav className="text-sm text-muted">
        <Link href="/" className="hover:text-ink">
          Home
        </Link>{" "}
        / {page.title}
      </nav>
      <h1 className="text-3xl font-bold tracking-tight">{page.title}</h1>

      {slug === "contact-us" && store && (
        <div className="grid gap-3 sm:grid-cols-3">
          {store.phone && (
            <a href={`tel:${store.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 rounded-2xl bg-white p-4 font-semibold hover:shadow-md">
              <Phone className="size-5 text-brand-600" /> {store.phone}
            </a>
          )}
          {chat && (
            <a href={chat} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl bg-white p-4 font-semibold hover:shadow-md">
              <WhatsAppIcon className="size-5 text-whatsapp" /> WhatsApp us
            </a>
          )}
          {store.email && (
            <a href={`mailto:${store.email}`} className="flex min-w-0 items-center gap-3 rounded-2xl bg-white p-4 text-sm font-semibold hover:shadow-md">
              <Mail className="size-5 shrink-0 text-brand-600" /> <span className="min-w-0 [overflow-wrap:anywhere]">{store.email}</span>
            </a>
          )}
        </div>
      )}

      {/* Written in the admin; the API cleans the HTML before sending it. */}
      <div className="prose-mm rounded-3xl bg-white p-6 leading-relaxed sm:p-8" dangerouslySetInnerHTML={{ __html: page.body }} />

      {page.updated_at && (
        <p className="text-xs text-muted">Last updated {new Date(page.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
      )}
    </article>
  );
}
