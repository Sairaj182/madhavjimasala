import type { FastifyInstance } from "fastify";
import { prisma } from "@repo/db";
import { requireAdmin } from "../middleware/auth";
import { z } from "zod";
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { Prisma } from "@prisma/client";
import { getGeneralStoreControls } from "../lib/general-store-settings";

const MAX_INT = 2_147_483_647;

async function inventoryManagementEnabled() {
  const rows = await prisma.$queryRaw<{ inventoryManagementEnabled: boolean }[]>`
    SELECT "inventoryManagementEnabled"
    FROM "StoreSettings"
    WHERE "id" = 'store'
    LIMIT 1
  `;
  return rows[0]?.inventoryManagementEnabled === true;
}

function hideInventory<T extends { stockQuantity?: unknown }>(product: T, enabled: boolean) {
  if (enabled) return product;
  const { stockQuantity: _stockQuantity, ...withoutInventory } = product;
  return withoutInventory;
}

const loosePricingRuleSchema = z.object({
  minWeightGrams: z.number().int().min(1),
  maxWeightGrams: z.number().int().min(1).nullable().optional(),
  rateInPaise: z.number().int().min(0).max(MAX_INT),
  rateUnit: z.literal("KILOGRAM"),
});

const loosePricingRulesSchema = z.array(loosePricingRuleSchema).max(20).superRefine((rules, ctx) => {
  const sorted = [...rules].sort((a, b) => a.minWeightGrams - b.minWeightGrams);
  sorted.forEach((rule, index) => {
    const isOpenEnded = rule.maxWeightGrams == null;
    if (isOpenEnded && index !== sorted.length - 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [rules.indexOf(rule), "maxWeightGrams"], message: "Only the final rate band can be open-ended (≥ minimum)" });
    }
    if (rule.maxWeightGrams != null && rule.maxWeightGrams < rule.minWeightGrams) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [rules.indexOf(rule), "maxWeightGrams"], message: "Maximum weight must be at least the minimum weight" });
    }
    const previous = sorted[index - 1];
    if (previous?.maxWeightGrams != null && rule.minWeightGrams <= previous.maxWeightGrams) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [rules.indexOf(rule), "minWeightGrams"], message: "Rate bands cannot overlap" });
    }
  });
});

const preferredSelectionSchema = z.object({
  selectionType: z.enum(["PACKED", "LOOSE"]),
  packingLabel: z.string().trim().min(1).max(80).optional(),
  packingWeight: z.string().trim().max(40).optional(),
  requestedWeightGrams: z.number().int().min(1).max(1000000).optional(),
});

const createProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  shortDescription: z.string().max(240).optional(),
  price: z.number().int().min(0).max(Math.floor(MAX_INT / 100)),
  priceInPaise: z.number().int().min(0).max(MAX_INT).optional(),
  stockQuantity: z.number().int().min(0).optional().default(0),
  categoryId: z.string().optional(),
  images: z.array(z.string()).optional(),
  packagingSizes: z.array(z.object({
    id: z.string().trim().min(1).max(80).optional(),
    label: z.string().trim().min(1).max(80),
    weight: z.string().trim().min(1).max(40),
    priceInPaise: z.number().int().min(0).max(MAX_INT).optional(),
    availability: z.enum(["AVAILABLE", "UNAVAILABLE", "ON_REQUEST"]).optional(),
    minQuantity: z.number().int().min(1).max(100000).optional(),
    maxQuantity: z.number().int().min(1).max(100000).optional(),
  })).max(20).optional(),
  allowLooseQuantity: z.boolean().optional(),
  loosePricingRules: loosePricingRulesSchema.optional(),
  preferredSelection: preferredSelectionSchema.nullable().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  weightValue: z.number().optional(),
  weightUnit: z.string().optional(),
  isGeneralStore: z.boolean().optional()
});

const updateProductSchema = createProductSchema.partial();

function validatePreferredSelection(selection: z.infer<typeof preferredSelectionSchema> | null | undefined, allowLoose: boolean | undefined, packagingSizes: unknown, loosePricingRules: unknown) {
  if (!selection) return;
  if (selection.selectionType === "PACKED") {
    const packings = Array.isArray(packagingSizes) ? packagingSizes : [];
    if (packings.length > 0 && !packings.some((packing) => typeof packing === "object" && packing !== null && (packing as { label?: unknown }).label === selection.packingLabel && (packing as { availability?: unknown }).availability !== "UNAVAILABLE")) throw new Error("Preferred packing must be an available packing on this product");
    return;
  }
  if (!allowLoose || !selection.requestedWeightGrams) throw new Error("Preferred loose quantity requires loose selling to be enabled");
  const rules = Array.isArray(loosePricingRules) ? loosePricingRules : [];
  const covered = rules.some((rule) => typeof rule === "object" && rule !== null && selection.requestedWeightGrams! >= Number((rule as { minWeightGrams: number }).minWeightGrams) && ((rule as { maxWeightGrams?: number | null }).maxWeightGrams == null || selection.requestedWeightGrams! <= Number((rule as { maxWeightGrams?: number | null }).maxWeightGrams)));
  if (!covered) throw new Error("Preferred loose quantity must be covered by a loose rate band");
}

export async function productRoutes(app: FastifyInstance) {
  // Public Routes
  app.get("/", async (request, reply) => {
    const { kind } = request.query as { kind?: string };
    if (kind === "GENERAL_STORE") {
      const controls = await getGeneralStoreControls();
      if (!controls.generalStoreEnabled || !controls.generalStoreCatalogueOpen) return reply.status(503).send({ error: controls.generalStoreMaintenanceMessage });
    }
    const inventoryEnabled = await inventoryManagementEnabled();
    const products = await prisma.product.findMany({
      where: kind === "GENERAL_STORE"
        ? { isGeneralStore: true, isActive: true }
        : { isGeneralStore: false, isActive: true },
      include: { categoryDetails: true }
    });
    return reply.send(products.map((product) => hideInventory(product, inventoryEnabled)));
  });

  // Admin catalogue views must retain inactive products for restoration.
  app.get("/admin", { preHandler: requireAdmin }, async (request, reply) => {
    const { kind } = request.query as { kind?: string };
    const inventoryEnabled = await inventoryManagementEnabled();
    const products = await prisma.product.findMany({
      where: kind === "GENERAL_STORE" ? { isGeneralStore: true } : { isGeneralStore: false },
      include: { categoryDetails: true }
    });
    return reply.send(products.map((product) => hideInventory(product, inventoryEnabled)));
  });

  app.get("/:slug", async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const inventoryEnabled = await inventoryManagementEnabled();
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { categoryDetails: true }
    });
    if (!product || !product.isActive) return reply.status(404).send({ error: "Not found" });
    if (product.isGeneralStore) {
      const controls = await getGeneralStoreControls();
      if (!controls.generalStoreEnabled || !controls.generalStoreCatalogueOpen) return reply.status(503).send({ error: controls.generalStoreMaintenanceMessage });
    }
    return reply.send(hideInventory(product, inventoryEnabled));
  });

  // Admin Routes
  app.post("/", { preHandler: requireAdmin }, async (request, reply) => {
    try {
      const data = createProductSchema.parse(request.body);
      const inventoryEnabled = await inventoryManagementEnabled();
      const { categoryId, preferredSelection, ...productData } = data;
      validatePreferredSelection(preferredSelection, productData.allowLooseQuantity, productData.packagingSizes, productData.loosePricingRules);
      productData.priceInPaise ??= productData.price * 100;
      if (!inventoryEnabled) productData.stockQuantity = 0;
      const product = await prisma.product.create({
        data: {
          ...productData,
          category: "",
          categorySlug: "",
          description: productData.description ?? "",
          shortDescription: productData.shortDescription ?? productData.description ?? "",
          priceUnit: "",
          images: productData.images ?? [],
          packagingSizes: productData.packagingSizes ?? [],
          loosePricingRules: productData.loosePricingRules ?? [],
          allowLooseQuantity: productData.allowLooseQuantity ?? false,
          ...(preferredSelection ? { preferredSelection } : {}),
          tags: [],
          usageTips: [],
          perfectFor: [],
          origin: "",
          originDescription: "",
          badges: [],
          categoryDetails: categoryId ? { connect: { id: categoryId } } : undefined,
          isGeneralStore: productData.isGeneralStore ?? false,
        },
      });
      return reply.status(201).send(product);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  app.post("/:id/images", { preHandler: requireAdmin }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const product = await prisma.product.findUnique({ where: { id }, select: { isGeneralStore: true, images: true } });
      if (!product) return reply.status(404).send({ error: "Product not found" });
      if (!product.isGeneralStore) return reply.status(400).send({ error: "Image upload is only available for General Store products" });

      const file = await request.file();
      if (!file || !["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
        return reply.status(400).send({ error: "Upload a JPEG, PNG, or WebP image" });
      }

      const rootPublicDirectory = path.resolve(process.cwd(), "apps/web/public");
      const packagePublicDirectory = path.resolve(process.cwd(), "../web/public");
      const uploadDirectory = process.env.PUBLIC_UPLOAD_DIR
        ? path.resolve(process.env.PUBLIC_UPLOAD_DIR)
        : path.join(existsSync(rootPublicDirectory) ? rootPublicDirectory : packagePublicDirectory, "uploads/general-store");
      await mkdir(uploadDirectory, { recursive: true });
      const fileName = `${id}-${randomUUID()}.webp`;
      await sharp(await file.toBuffer())
        .rotate()
        .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(path.join(uploadDirectory, fileName));

      const url = `/uploads/general-store/${fileName}`;
      const images = Array.isArray(product.images) ? product.images.filter((image): image is string => typeof image === "string") : [];
      if (images.length >= 8) return reply.status(400).send({ error: "A product can have at most 8 images" });
      const updated = await prisma.product.update({ where: { id }, data: { images: [...images, url] } });
      return reply.status(201).send({ url, images: updated.images });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message || "Unable to upload image" });
    }
  });

  app.put("/:id", { preHandler: requireAdmin }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const data = updateProductSchema.parse(request.body);
      const inventoryEnabled = await inventoryManagementEnabled();
      const existing = await prisma.product.findUnique({ where: { id }, select: { allowLooseQuantity: true, packagingSizes: true, loosePricingRules: true } });
      if (!existing) return reply.status(404).send({ error: "Product not found" });
      validatePreferredSelection(data.preferredSelection, data.allowLooseQuantity ?? existing.allowLooseQuantity, data.packagingSizes ?? existing.packagingSizes, data.loosePricingRules ?? existing.loosePricingRules);
      const { categoryId, preferredSelection, ...rest } = data;
      const updateData = {
        ...rest,
        ...(inventoryEnabled ? {} : { stockQuantity: undefined }),
        ...(preferredSelection !== undefined ? { preferredSelection: preferredSelection ?? Prisma.JsonNull } : {}),
        ...(categoryId !== undefined ? { categoryDetails: categoryId ? { connect: { id: categoryId } } : { disconnect: true } } : {}),
      };
      const product = await prisma.product.update({
        where: { id },
        data: updateData
      });
      return reply.send(product);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  app.delete("/:id", { preHandler: requireAdmin }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      // Products are archived so historical cart/order lines keep their identity.
      const product = await prisma.product.update({ where: { id }, data: { isActive: false } });
      return reply.send(product);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });
}
