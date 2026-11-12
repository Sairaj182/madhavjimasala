import type { FastifyInstance } from "fastify";
import { prisma } from "@repo/db";
import { requireAdmin } from "../middleware/auth";
import { z } from "zod";
import { createHash } from "node:crypto";
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

      if (file.file.truncated) return reply.status(413).send({ error: "Image must be 10 MB or smaller" });
      const images = Array.isArray(product.images) ? product.images.filter((image): image is string => typeof image === "string") : [];
      if (images.length >= 8) return reply.status(400).send({ error: "A product can have at most 8 images" });
      const optimized = await sharp(await file.toBuffer())
        .rotate()
        .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 85 }).toBuffer();
      const cloud = process.env.CLOUDINARY_CLOUD_NAME;
      const key = process.env.CLOUDINARY_API_KEY;
      const secret = process.env.CLOUDINARY_API_SECRET;
      let url: string;
      if (cloud && key && secret) {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const folder = process.env.CLOUDINARY_FOLDER || "madhavji-masala";
        const publicId = `${id}-${createHash("sha256").update(optimized).digest("hex").slice(0, 20)}`;
        const signature = createHash("sha1").update(`folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${secret}`).digest("hex");
        const form = new FormData();
        form.set("file", new Blob([optimized], { type: "image/webp" }), `${publicId}.webp`);
        form.set("api_key", key); form.set("timestamp", timestamp); form.set("folder", folder); form.set("public_id", publicId); form.set("signature", signature);
        const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud)}/image/upload`, { method: "POST", body: form });
        const result = await response.json() as { secure_url?: string; public_id?: string; format?: string; width?: number; height?: number; bytes?: number; error?: { message?: string } };
        if (!response.ok || !result.secure_url) throw new Error(result.error?.message || "Cloudinary upload failed");
        url = result.secure_url;
        if (result.public_id) {
          await prisma.productImageAsset.create({
            data: { productId: id, publicId: result.public_id, secureUrl: result.secure_url, format: result.format, width: result.width, height: result.height, bytes: result.bytes },
          });
        }
      } else if (process.env.NODE_ENV !== "production") {
        throw new Error("Configure Cloudinary for uploads; local upload fallback is disabled");
      } else {
        throw new Error("Cloudinary is not configured");
      }
      const updated = await prisma.product.update({ where: { id }, data: { images: [...images, url] } });
      return reply.status(201).send({ url, images: updated.images });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message || "Unable to upload image" });
    }
  });

  app.delete("/:id/images", { preHandler: requireAdmin }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { publicId } = z.object({ publicId: z.string().trim().min(1).max(255) }).parse(request.body);
      const asset = await prisma.productImageAsset.findFirst({ where: { productId: id, publicId } });
      if (!asset) return reply.status(404).send({ error: "Image asset not found" });
      const cloud = process.env.CLOUDINARY_CLOUD_NAME;
      const key = process.env.CLOUDINARY_API_KEY;
      const secret = process.env.CLOUDINARY_API_SECRET;
      if (!cloud || !key || !secret) return reply.status(503).send({ error: "Cloudinary is not configured" });
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const signature = createHash("sha1").update(`public_id=${publicId}&timestamp=${timestamp}${secret}`).digest("hex");
      const form = new URLSearchParams({ public_id: publicId, timestamp, api_key: key, signature });
      const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud)}/image/destroy`, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: form });
      if (!response.ok) return reply.status(502).send({ error: "Cloudinary deletion failed" });
      const product = await prisma.product.findUnique({ where: { id }, select: { images: true } });
      const images = Array.isArray(product?.images) ? product.images.filter((image): image is string => typeof image === "string" && image !== asset.secureUrl) : [];
      await prisma.$transaction([
        prisma.productImageAsset.delete({ where: { id: asset.id } }),
        prisma.product.update({ where: { id }, data: { images } }),
      ]);
      return reply.send({ images });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message || "Unable to delete image" });
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
