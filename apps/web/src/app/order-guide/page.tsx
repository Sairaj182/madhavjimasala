import type { Metadata } from "next";
import OrderGuide from "@/components/shared/OrderGuide";

export const metadata: Metadata = {
  title: "How to Order | Madhavji Masala",
  description: "A quick guide to ordering products from the Madhavji Masala General Store.",
};

const steps = [
  { number: "01", title: "Open General Store", gujarati: "General Store ખોલો", detail: "Open the General Store and browse the products available for pickup.", action: "Explore Products", href: "/general-store" },
  { number: "02", title: "Sign in or create an account", gujarati: "Sign In કરો અથવા નવું account બનાવો", detail: "Tap Sign In. New customers can choose Sign Up, enter their name, email, and password, then continue.", action: "Sign In / Sign Up", href: "/login" },
  { number: "03", title: "Choose products and quantity", gujarati: "વસ્તુ અને quantity પસંદ કરો", detail: "Open a product, select its packing or loose quantity when available, then add it to your cart.", action: "Browse Store", href: "/general-store" },
  { number: "04", title: "Review your cart", gujarati: "તમારો cart તપાસો", detail: "Check the product, packing, quantity, and total. Remove anything you do not need, then choose Proceed to Checkout.", action: "Open Cart", href: "/cart" },
  { number: "05", title: "Choose pickup and place order", gujarati: "Pickup સમય પસંદ કરીને order કરો", detail: "Enter the customer and pickup person names, select an available pickup slot, and confirm the order. Payment is made at pickup.", action: "Checkout", href: "/checkout" },
  { number: "06", title: "Track your order", gujarati: "તમારો order track કરો", detail: "Open Orders to see your pickup number and order status. Enable order notifications to receive updates on this device.", action: "View Orders", href: "/orders" },
];

export default function OrderGuidePage() {
  return <OrderGuide />;
}
