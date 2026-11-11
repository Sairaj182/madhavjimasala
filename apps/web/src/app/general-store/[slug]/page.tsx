import { notFound } from "next/navigation";
import { getProduct } from "@/lib/api";
import GeneralStoreProductDetail from "./GeneralStoreProductDetail";

export default async function GeneralStoreProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product || !product.isGeneralStore) {
    notFound();
  }

  return <GeneralStoreProductDetail product={product} />;
}
