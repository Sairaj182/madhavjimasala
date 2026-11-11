import { getProducts } from "@/lib/api";
import GeneralStoreCatalogue from "./GeneralStoreCatalogue";

export default async function GeneralStorePage() {
  const products = await getProducts("GENERAL_STORE");

  return <GeneralStoreCatalogue products={products} />;
}
