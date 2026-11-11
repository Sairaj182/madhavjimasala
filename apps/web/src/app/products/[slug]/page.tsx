import { notFound } from "next/navigation";
import { getProduct } from "@/lib/api";
import ProductDetailClient from "./ProductDetailClient";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product || product.isGeneralStore) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
