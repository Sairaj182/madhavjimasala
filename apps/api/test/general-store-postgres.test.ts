import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import Fastify from "fastify";

const databaseUrl = process.env.STORE_CHECKOUT_TEST_DATABASE_URL;

test("General Store checkout against PostgreSQL", {
  skip: databaseUrl ? false : "Set STORE_CHECKOUT_TEST_DATABASE_URL to a migrated local checkout_* test database",
  timeout: 60_000,
}, async (t) => {
  const connection = new URL(databaseUrl!);
  assert.ok(["127.0.0.1", "localhost", "[::1]"].includes(connection.hostname));
  assert.match(connection.pathname, /^\/checkout_[a-z0-9_]+$/i);
  process.env.DATABASE_URL = databaseUrl;
  process.env.JWT_SECRET = "checkout-suite-only-jwt-secret-000000000000";
  process.env.BETTER_AUTH_SECRET = "checkout-suite-only-auth-secret-0000000000";
  process.env.BETTER_AUTH_URL = "http://localhost:4000/api/auth";
  delete process.env.VAPID_PUBLIC_KEY;
  delete process.env.VAPID_PRIVATE_KEY;
  delete process.env.VAPID_SUBJECT;

  const [{ prisma }, { auth }, { cartRoutes }, { orderRoutes }, { pickupRoutes }] = await Promise.all([
    import("@repo/db"), import("@repo/auth"), import("../src/routes/cart"), import("../src/routes/orders"), import("../src/routes/pickups"),
  ]);
  const app = Fastify();
  app.register(cartRoutes, { prefix: "/api/cart" });
  app.register(orderRoutes, { prefix: "/api/orders" });
  app.register(pickupRoutes, { prefix: "/api/pickups" });
  const prefix = `checkout-${randomUUID()}`;
  const ids: { users: string[]; slots: string[]; products: string[] } = { users: [], slots: [], products: [] };
  t.after(async () => {
    await app.close();
    await prisma.order.deleteMany({ where: { userId: { in: ids.users } } });
    await prisma.user.deleteMany({ where: { id: { in: ids.users } } });
    await prisma.pickupSlot.deleteMany({ where: { id: { in: ids.slots } } });
    await prisma.product.deleteMany({ where: { id: { in: ids.products } } });
    await prisma.$disconnect();
  });

  async function account(role: string) {
    const user = await prisma.user.create({ data: { role, name: role, email: `${prefix}-${ids.users.length}@example.test` } });
    ids.users.push(user.id);
    return user;
  }
  const [buyer, rival, anotherBuyer, staff, owner] = [
    await account("user"), await account("user"), await account("user"), await account("STAFF"), await account("STORE_OWNER"),
  ];
  const users = new Map([buyer, rival, anotherBuyer, staff, owner].map((user) => [user.id, user]));
  // Supply a known session at the auth boundary. The actual route guards and database are used.
  t.mock.method(auth.api, "getSession", async ({ headers }: { headers: Headers }) => {
    const user = users.get(headers.get("x-checkout-test-user") ?? "");
    return user ? { user, session: {} } : null;
  });

  const packings = [
    { label: "100g bag", weight: "100g", priceInPaise: 925 },
    { label: "50g bag", weight: "50g", priceInPaise: 475 },
  ];
  const product = await prisma.product.create({
    data: {
      slug: prefix, name: "Test cumin", price: 9, priceInPaise: 925, priceUnit: "pack",
      isGeneralStore: true, category: "", categorySlug: "", description: "", shortDescription: "",
      images: [], tags: [], usageTips: [], perfectFor: [], origin: "", originDescription: "", badges: [],
      packagingSizes: packings,
      allowLooseQuantity: true,
      loosePricingRules: [{ minWeightGrams: 1, rateInPaise: 1002, rateUnit: "KILOGRAM" }],
    },
  });
  ids.products.push(product.id);

  async function slot(capacity: number, offsetDays: number) {
    const date = new Date(new Date(Date.now() + offsetDays * 86_400_000).toISOString().slice(0, 10));
    const pickup = await prisma.pickupSlot.create({ data: { date, capacity, startTime: "10:00 AM", endTime: "1:00 PM" } });
    ids.slots.push(pickup.id);
    return pickup;
  }
  const [regular, lastPlace, expired] = [await slot(10, 2), await slot(1, 3), await slot(5, -2)];
  const get = (userId: string, url: string) => app.inject({ method: "GET", url, headers: { "x-checkout-test-user": userId } });
  const write = (userId: string, method: "POST" | "PUT" | "DELETE" | "PATCH", url: string, payload?: object) =>
    app.inject({ method, url, payload, headers: { "x-checkout-test-user": userId } });
  const add = (userId: string, selection: object = {}) => write(userId, "POST", "/api/cart/items", { productId: product.id, packingLabel: "100g bag", ...selection });
  const currentCart = async (userId: string) => {
    const response = await get(userId, "/api/cart");
    assert.equal(response.statusCode, 200, response.body);
    return response.json<{ id: string; revision: string; totalInPaise: number; items: { id: string; quantity: number; packingLabel: string; quotedTotalInPaise: number | null }[] }>();
  };
  const payload = (cartRevision: string, pickupSlotId = regular.id) => ({
    cartRevision, pickupSlotId, customerName: "Buyer", pickupPersonName: "Collector",
  });

  assert.equal((await get("unknown", "/api/cart")).statusCode, 401);
  const packedAdds = await Promise.all([add(buyer.id), add(buyer.id), add(buyer.id, { packingLabel: "50g bag" })]);
  for (const response of packedAdds) assert.equal(response.statusCode, 200, response.body);
  assert.equal((await add(buyer.id, { selectionType: "LOOSE", requestedWeightGrams: 333, quantity: 3 })).statusCode, 200);
  const mixed = await currentCart(buyer.id);
  assert.equal(mixed.items.length, 3);
  assert.equal(mixed.totalInPaise, 3327);
  const primary = mixed.items.find((line) => line.packingLabel === "100g bag")!;
  const updates = await Promise.all([
    write(buyer.id, "PUT", `/api/cart/items/${primary.id}`, { quantityDelta: 1 }),
    write(buyer.id, "PUT", `/api/cart/items/${primary.id}`, { quantityDelta: 1 }),
  ]);
  for (const response of updates) assert.equal(response.statusCode, 200, response.body);
  assert.equal((await currentCart(buyer.id)).items.find((line) => line.id === primary.id)?.quantity, 4);
  const reviewed = await currentCart(buyer.id);
  const expiredResult = await write(buyer.id, "POST", "/api/orders", payload(reviewed.revision, expired.id));
  assert.equal(expiredResult.json().code, "PICKUP_UNAVAILABLE");
  assert.equal((await currentCart(buyer.id)).revision, reviewed.revision);

  const stale = await write(buyer.id, "POST", "/api/orders", payload(mixed.revision));
  assert.equal(stale.json().code, "CART_CHANGED");
  await prisma.product.update({
    where: { id: product.id },
    data: { packagingSizes: [{ ...packings[0], priceInPaise: 950 }, packings[1]] },
  });
  assert.equal((await write(buyer.id, "POST", "/api/orders", payload(reviewed.revision))).json().code, "CART_CHANGED");
  assert.equal((await currentCart(buyer.id)).totalInPaise - reviewed.totalInPaise, 100);
  await prisma.product.update({ where: { id: product.id }, data: { packagingSizes: packings } });

  const request = payload(reviewed.revision);
  const submitted = await Promise.all([write(buyer.id, "POST", "/api/orders", request), write(buyer.id, "POST", "/api/orders", request)]);
  assert.deepEqual(submitted.map((response) => response.statusCode).sort(), [200, 201], submitted.map((response) => response.body).join("\n"));
  const placed = submitted[0].json<{ id: string; pickupNumber: string; totalInPaise: number; items: { id: string; packingLabel: string }[] }>();
  // Discard either response as a client would if its connection were lost.
  assert.equal((await write(buyer.id, "POST", "/api/orders", request)).json().id, placed.id);
  assert.equal((await write(buyer.id, "POST", "/api/orders", { ...request, pickupPersonName: "Different" })).json().code, "ORDER_ALREADY_PLACED");
  assert.equal(placed.totalInPaise, reviewed.totalInPaise);
  assert.equal((await currentCart(buyer.id)).items.length, 0);
  assert.equal((await get(buyer.id, `/api/orders/${placed.id}/receipt`)).json().pickupNumber, placed.pickupNumber);
  assert.equal((await get(rival.id, `/api/orders/${placed.id}/receipt`)).statusCode, 404);
  assert.equal((await get(staff.id, `/api/orders/${placed.id}`)).json().pickupNumber, undefined);

  await add(buyer.id);
  await add(rival.id);
  const [cartOne, cartTwo] = await Promise.all([currentCart(buyer.id), currentCart(rival.id)]);
  const contenders = await Promise.all([
    write(buyer.id, "POST", "/api/orders", payload(cartOne.revision, lastPlace.id)),
    write(rival.id, "POST", "/api/orders", payload(cartTwo.revision, lastPlace.id)),
  ]);
  assert.deepEqual(contenders.map((response) => response.statusCode).sort(), [201, 409]);
  const declined = contenders.findIndex((response) => response.statusCode === 409);
  assert.equal(contenders[declined].json().code, "PICKUP_UNAVAILABLE");
  assert.equal((await currentCart([buyer, rival][declined].id)).items.length, 1);
  const booked = contenders[1 - declined].json<{ id: string }>();
  assert.notEqual(booked.id, placed.id);
  assert.equal(await prisma.order.count({ where: { pickupSlotId: lastPlace.id } }), 1);
  const cancelled = await write(owner.id, "PATCH", `/api/orders/${booked.id}/status`, { status: "CANCELLED" });
  assert.equal(cancelled.statusCode, 200, cancelled.body);
  const publicSlots = await get("", "/api/pickups/slots");
  assert.equal(publicSlots.json().find((row: { id: string }) => row.id === lastPlace.id).remainingCapacity, 1);

  await add(anotherBuyer.id);
  const beforeConcurrentAdd = await currentCart(anotherBuyer.id);
  const [attempt, concurrentAdd] = await Promise.all([
    write(anotherBuyer.id, "POST", "/api/orders", payload(beforeConcurrentAdd.revision)),
    add(anotherBuyer.id, { packingLabel: "50g bag" }),
  ]);
  assert.equal(concurrentAdd.statusCode, 200, concurrentAdd.body);
  assert.ok([201, 409].includes(attempt.statusCode), attempt.body);
  const afterConcurrentAdd = await currentCart(anotherBuyer.id);
  assert.equal(afterConcurrentAdd.items.find((item) => item.packingLabel === "50g bag")?.quantity, 1);
  assert.equal(afterConcurrentAdd.items.length, attempt.statusCode === 201 ? 1 : 2);
  if (attempt.statusCode === 201) {
    assert.equal(attempt.json().totalInPaise, beforeConcurrentAdd.totalInPaise);
  } else {
    assert.equal(attempt.json().code, "CART_CHANGED");
  }

  const review = await write(staff.id, "PATCH", `/api/orders/${placed.id}/confirm`, {
    items: placed.items.map((line) => line.packingLabel === "100g bag" ? {
      id: line.id, quantity: 1, acceptedSelectionType: "PACKED", acceptedPackingLabel: "50g bag",
      acceptedTotalWeightGrams: 350,
    } : { id: line.id, quantity: 1 }),
  });
  assert.equal(review.statusCode, 200, review.body);
  assert.equal(review.json().status, "PARTIALLY_ACCEPTED");
  assert.equal(review.json().pickupNumber, undefined);
  assert.equal((await write(staff.id, "PATCH", `/api/orders/${placed.id}/status`, { status: "READY_FOR_PICKUP" })).statusCode, 200);
  const fulfillment = { pickupCode: placed.pickupNumber, paymentPaid: true, pickedUp: true };
  assert.equal((await write(staff.id, "PATCH", `/api/orders/${placed.id}/fulfillment`, fulfillment)).statusCode, 403);
  const pickedUp = await write(owner.id, "PATCH", `/api/orders/${placed.id}/fulfillment`, fulfillment);
  assert.equal(pickedUp.statusCode, 200, pickedUp.body);
  assert.equal(pickedUp.json().paymentStatus, "PAID");
  assert.equal(pickedUp.json().status, "PICKED_UP");
});
