"use client";

import { useCart } from "@/contexts/CartContext";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatRate, formatWeightGrams, formatWeightText, looseRateUnit } from "@/lib/general-store-display";

export default function CartPage() {
  const { cartItems, totalInPaise, updateQuantity, removeItem, loading } = useCart();
  const { data: session } = authClient.useSession();
  const router = useRouter();

  if (!session?.user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-brand-cream/50 px-4">
        <h2 className="text-2xl font-bold font-heading text-brand-dark mb-4">Please Sign In</h2>
        <p className="text-brand-gray mb-8 text-center max-w-md">
          You need to be signed in to view your cart and checkout.
        </p>
        <Link
          href="/login"
          className="rounded-full bg-brand-maroon px-8 py-3 text-sm font-semibold text-white hover:bg-brand-maroon-dark transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-gold border-t-brand-maroon rounded-full animate-spin" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-brand-cream/50 px-4">
        <svg className="w-20 h-20 text-brand-gold/40 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h2 className="text-2xl font-bold font-heading text-brand-dark mb-4">Your cart is empty</h2>
        <p className="text-brand-gray mb-8">Looks like you haven't added any spices yet.</p>
        <Link
          href="/general-store"
          className="rounded-full bg-brand-maroon px-8 py-3 text-sm font-semibold text-white hover:bg-brand-maroon-dark transition-colors"
        >
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <h1 className="text-3xl font-heading font-bold text-brand-dark mb-8">Your Cart</h1>
      <p className="-mt-5 mb-8 text-sm text-brand-gray">તમારી વસ્તુઓ તપાસો અને પછી ઓર્ડર કન્ફર્મ કરવા આગળ વધો.</p>
      
      <div className="lg:grid lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-8">
          <ul className="divide-y divide-brand-border border-t border-b border-brand-border">
            {cartItems.map((item) => {
              const product = item.product;
              const price = item.quotedUnitPriceInPaise ? item.quotedUnitPriceInPaise / 100 : (product.priceInPaise ? product.priceInPaise / 100 : product.price);
              const lineTotal = item.quotedTotalInPaise ? item.quotedTotalInPaise / 100 : price * item.quantity;
              const images = product.images || ["/images/products/garam-masala.png"];
              const displayWeight = item.selectionType === "LOOSE" ? formatWeightGrams(item.requestedWeightGrams) : formatWeightText(item.packingWeight);
              const displayRate = item.selectionType === "LOOSE" ? formatRate(item.quotedUnitPriceInPaise || 0, looseRateUnit(product.loosePricingRules, item.requestedWeightGrams) || "KILOGRAM") : formatRate(price * 100, "PACK");
              
              return (
                <li key={item.id} className="flex py-6">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-brand-gold/20 bg-brand-cream/30 p-2 relative">
                    <Image
                      src={images[0]}
                      alt={product.name}
                      fill
                      className="object-contain"
                    />
                  </div>

                  <div className="ml-4 flex flex-1 flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium text-brand-dark">
                        <h3>
                          <Link href={product.isGeneralStore ? `/general-store/${product.slug}` : `/products/${product.slug}`} className="hover:text-brand-maroon">
                            {product.name}
                          </Link>
                        </h3>
                        <p className="ml-4 font-bold text-brand-maroon">₹{lineTotal.toFixed(2)}</p>
                      </div>
                      <p className="mt-1 text-sm text-brand-gray">
                        {item.selectionType === "LOOSE" ? `Loose ${displayWeight}` : `${item.packingLabel || "Default packing"}${displayWeight ? ` · ${displayWeight}` : ""}`} · {displayRate}
                      </p>
                    </div>
                    <div className="flex flex-1 items-end justify-between text-sm">
                      <div className="flex items-center border border-brand-border rounded-lg bg-white">
                        <button
                          onClick={() => item.quantity <= 1 ? removeItem(item.id) : updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1 text-brand-gray hover:text-brand-maroon hover:bg-brand-cream transition-colors rounded-l-lg"
                        >
                          -
                        </button>
                        <span className="px-3 font-semibold min-w-[2rem] text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1 text-brand-gray hover:text-brand-maroon hover:bg-brand-cream transition-colors rounded-r-lg"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex">
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="font-medium text-red-500 hover:text-red-700 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="lg:col-span-4 mt-8 lg:mt-0">
          <div className="bg-brand-cream/30 rounded-2xl p-6 sm:p-8 border border-brand-gold/20 sticky top-28">
            <h2 className="text-lg font-heading font-bold text-brand-dark mb-4">Order Summary</h2>
            
            <div className="flow-root">
              <dl className="-my-4 divide-y divide-brand-border/50 text-sm">
                <div className="flex items-center justify-between py-4">
                  <dt className="text-brand-gray">Subtotal</dt>
                  <dd className="font-medium text-brand-dark">₹{totalInPaise / 100}</dd>
                </div>
                <div className="flex items-center justify-between py-4">
                  <dt className="text-brand-gray">Tax</dt>
                  <dd className="font-medium text-brand-dark">Included</dd>
                </div>
                <div className="flex items-center justify-between py-4 text-base font-bold text-brand-dark">
                  <dt>Order Total</dt>
                  <dd className="text-brand-maroon text-xl">₹{totalInPaise / 100}</dd>
                </div>
              </dl>
            </div>

            <div className="mt-8">
              <Link
                href="/checkout"
                className="w-full flex items-center justify-center rounded-full bg-brand-maroon px-4 py-4 text-base font-bold text-white shadow-lg hover:bg-brand-maroon-dark hover:-translate-y-0.5 transition-all"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
