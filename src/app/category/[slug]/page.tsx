import { redirect } from "next/navigation";
import { Suspense } from "react";

/** Old-style /category/fashion links (used by home page sections) open the filtered product list. */
export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={null}>
      <Go params={params} />
    </Suspense>
  );
}

async function Go({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/products?category=${encodeURIComponent(slug)}`);
  return null;
}
