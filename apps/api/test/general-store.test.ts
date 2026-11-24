import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import Fastify from "fastify";
import type { prisma } from "@repo/db";
import { Prisma } from "@prisma/client";
import { quoteGeneralStoreSelection } from "../src/lib/general-store-pricing";
import { isBookablePickup, pickupMinutes, storeDate } from "../src/lib/pickup-time";
import { checkoutHash, quoteCart } from "../src/lib/store-cart";
import { storeTransaction } from "../src/lib/store-transaction";

const product = {
  id: "masala", name: "Masala", slug: "masala", images: [],
  isGeneralStore: true, isActive: true, price: 99, priceInPaise: 9900,
  packagingSizes: [
    { label: "Pouch", weight: "100g", priceInPaise: 3150, maxQuantity: 12 },
    { label: "Pouch", weight: "250g", priceInPaise: 7000 },
    { label: "Sample", weight: "10g", priceInPaise: 0 },
  ],
  allowLooseQuantity: true,
  loosePricingRules: [{ minWeightGrams: 1, rateInPaise: 1002, rateUnit: "KILOGRAM" }],
} satisfies Parameters<typeof quoteGeneralStoreSelection>[0] & { id: string; name: string; slug: string; images: string[]; isGeneralStore: boolean; isActive: boolean };

const date = new Date("2026-11-23T00:00:00Z");
const legacyItem = {
  id: "cart-line", cartId: "cart", productId: product.id, product,
  selectionKey: "packed-Pouch-100g", selectionType: "PACKED", packingLabel: "Pouch",
  packingWeight: "100g", requestedWeightGrams: null,
  quantity: 3, quotedUnitPriceInPaise: 0, quotedTotalInPaise: 0,
  createdAt: date, updatedAt: date,
};

test("the cart requotes legacy packed quantities, free packs, and loose units in paise", () => {
  const snapshot = quoteCart([
    legacyItem,
    { ...legacyItem, id: "sample", packingLabel: "Sample", packingWeight: "10g" },
    { ...legacyItem, id: "loose", selectionType: "LOOSE", requestedWeightGrams: 333 },
  ]);
  assert.deepEqual(snapshot.lines.map(({ quote }) => quote?.totalPriceInPaise), [9450, 0, 1002]);
  assert.equal(snapshot.totalInPaise, 10452);
  assert.equal(quoteCart([{ ...legacyItem, product: { ...product, packagingSizes: [] } }]).totalInPaise, 29700);
});

test("selections with the same label and different weights stay distinct", () => {
  const first = quoteGeneralStoreSelection(product, legacyItem);
  const second = quoteGeneralStoreSelection(product, { ...legacyItem, packingWeight: "250g" });
  assert.notEqual(first.selectionKey, second.selectionKey);
  assert.equal(second.totalPriceInPaise, 21000);
  assert.throws(() => quoteGeneralStoreSelection(product, { ...legacyItem, packingWeight: "unknown" }), /not available/);
  assert.throws(() => quoteGeneralStoreSelection(product, { ...legacyItem, quantity: 13 }), /Maximum quantity/);
});

test("a revision changes for edits, repricing, unavailable selections and a new cart line", () => {
  const snapshot = quoteCart([legacyItem]);
  assert.equal(quoteCart([{ ...legacyItem }]).revision, snapshot.revision);
  assert.equal(quoteCart([{ ...legacyItem, quotedTotalInPaise: 123 }]).revision, snapshot.revision);
  const key = checkoutHash(["checkout-v1", "buyer", snapshot.revision]);
  for (const item of [
    { ...legacyItem, id: "another-line" },
    { ...legacyItem, quantity: 4 },
    { ...legacyItem, packingWeight: "250g" },
    { ...legacyItem, product: { ...product, isActive: false } },
    { ...legacyItem, product: { ...product, packagingSizes: [{ label: "Pouch", weight: "100g", priceInPaise: 3151 }] } },
  ]) {
    assert.notEqual(quoteCart([item]).revision, snapshot.revision);
    assert.notEqual(checkoutHash(["checkout-v1", "buyer", quoteCart([item]).revision]), key);
  }
  assert.notEqual(checkoutHash(["checkout-v1", "another-buyer", snapshot.revision]), key);
  assert.equal(quoteCart([{ ...legacyItem, product: { ...product, isActive: false } }]).lines[0].quote, null);
});

test("pickup booking uses the store's date and rejects ended, inactive, or invalid slots", () => {
  assert.equal(storeDate(new Date("2026-11-22T18:45:00Z")).toISOString(), date.toISOString());
  assert.equal(pickupMinutes("12:00 AM"), 0);
  assert.equal(pickupMinutes("12:00 PM"), 720);
  assert.equal(pickupMinutes("14:30"), 870);
  assert.equal(pickupMinutes("14:30 PM"), null);
  const slot = { date, endTime: "10:30 AM", isActive: true };
  assert.equal(isBookablePickup(slot, new Date("2026-11-23T04:59:59Z")), true);
  assert.equal(isBookablePickup(slot, new Date("2026-11-23T05:00:00Z")), false);
  assert.equal(isBookablePickup({ ...slot, isActive: false }, new Date("2026-11-22T23:00:00Z")), false);
});

test("a serialization conflict reruns the entire operation with a fresh transaction", async () => {
  const writeConflict = new Prisma.PrismaClientKnownRequestError("write conflict", { code: "P2034", clientVersion: "test" });
  const failed = {} as Prisma.TransactionClient;
  const committed = {} as Prisma.TransactionClient;
  let attempts = 0;
  const transaction = async (operation: (tx: Prisma.TransactionClient) => Promise<object>, config: { isolationLevel: string }) => {
    assert.equal(config.isolationLevel, "Serializable");
    if (++attempts === 1) {
      await operation(failed);
      throw writeConflict;
    }
    return operation(committed);
  };
  const seen: object[] = [];
  const result = await storeTransaction(async (tx) => {
    seen.push(tx);
    return tx;
  }, { $transaction: transaction as typeof prisma.$transaction });
  assert.deepEqual(seen, [failed, committed]);
  assert.equal(result, committed);
});

test("cart and receipt routes require authentication and checkout requires a reviewed revision", async (t) => {
  process.env.DATABASE_URL = "postgresql://test@127.0.0.1/checkout_offline";
  process.env.BETTER_AUTH_URL = "http://localhost:4000/api/auth";
  process.env.JWT_SECRET = "offline-test-only-000000000000000000000000";
  process.env.BETTER_AUTH_SECRET = "offline-test-only-111111111111111111111111";
  const [{ auth }, { cartRoutes }, { orderRoutes }] = await Promise.all([
    import("@repo/auth"), import("../src/routes/cart"), import("../src/routes/orders"),
  ]);
  t.mock.method(auth.api, "getSession", async ({ headers }: { headers: Headers }) => {
    return headers.get("x-checkout-test-user") ? { user: { id: "buyer", role: "user" }, session: {} } : null;
  });
  const app = Fastify();
  t.after(() => app.close());
  app.register(cartRoutes, { prefix: "/api/cart" });
  app.register(orderRoutes, { prefix: "/api/orders" });
  for (const url of ["/api/cart", "/api/orders", "/api/orders/existing/receipt"]) {
    const response = await app.inject({ method: "GET", url });
    assert.equal(response.statusCode, 401, response.body);
    assert.equal(response.headers["cache-control"], "private, no-store");
  }
  const checkout = await app.inject({
    method: "POST", url: "/api/orders", headers: { "x-checkout-test-user": "1" },
    payload: { customerName: "Buyer", pickupPersonName: "Collector", pickupSlotId: "slot" },
  });
  assert.equal(checkout.statusCode, 400, checkout.body);
  assert.equal(checkout.json().code, "INVALID_CHECKOUT");
});

test("the service worker avoids private APIs and deletes the previous unsafe cache", async () => {
  const source = await readFile(new URL("../../web/public/sw.js", import.meta.url), "utf8");
  const handlers = new Map<string, (event: any) => void>();
  const deleted: string[] = [];
  const cached: string[] = [];
  const origin = "https://store.example";
  const self = {
    location: { origin },
    clients: { claim() {} },
    addEventListener: (name: string, listen: (event: any) => void) => { handlers.set(name, listen); },
  };
  const caches = {
    keys: async () => ["madhavji-shell-v2", "madhavji-shell-v3", "unrelated-cache"],
    delete: async (key: string) => { deleted.push(key); },
    open: async () => ({ match: async () => null, put: async (request: { url: string }) => { cached.push(request.url); } }),
  };
  runInNewContext(source, { self, URL, caches, fetch: async () => new Response("asset") });
  let completion: Promise<unknown> | undefined;
  handlers.get("activate")!({ waitUntil: (promise: Promise<unknown>) => { completion = promise; } });
  await completion;
  assert.deepEqual(deleted, ["madhavji-shell-v2"]);

  const fetchEvent = handlers.get("fetch")!;
  for (const path of ["/api/cart", "/api/orders", "/api/orders/1/receipt", "/api/auth/get-session", "/checkout", "/orders", "/admin/orders", "/general-store?_rsc=1"]) {
    fetchEvent({
      request: { method: "GET", mode: "navigate", url: origin + path },
      respondWith: () => assert.fail(`Private or live request intercepted: ${path}`),
    });
  }
  const asset = origin + "/_next/static/chunks/main.js";
  let response: Promise<Response> | undefined;
  fetchEvent({
    request: { method: "GET", url: asset },
    respondWith: (value: Promise<Response>) => { response = value; },
    waitUntil: (promise: Promise<unknown>) => { completion = promise; },
  });
  assert.equal(await (await response)?.text(), "asset");
  await completion;
  assert.deepEqual(cached, [asset]);
});
