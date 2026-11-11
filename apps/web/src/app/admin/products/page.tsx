"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  priceInPaise?: number;
  description?: string;
  shortDescription?: string;
  images?: string[];
  stockQuantity?: number;
  isActive: boolean;
  isGeneralStore?: boolean;
  category?: string;
  categoryDetails?: { name: string };
  packagingSizes?: { label: string; weight: string; weightGrams?: number; priceInPaise?: number; availability?: string }[];
  allowLooseQuantity?: boolean;
  loosePricingRules?: { minWeightGrams: number; maxWeightGrams?: number | null; rateInPaise: number; rateUnit: "GRAM" | "KILOGRAM" }[];
  preferredSelection?: { selectionType: "PACKED" | "LOOSE"; packingLabel?: string; packingWeight?: string; requestedWeightGrams?: number } | null;
};

type PackingSize = { label: string; weight: string; weightGrams?: number; priceInPaise?: number; availability?: "AVAILABLE" | "UNAVAILABLE" };
type LooseRule = { minWeightGrams: number; maxWeightGrams?: number | null; rateInPaise: number; rateUnit: "KILOGRAM" };
type PreferredSelection = { selectionType: "PACKED" | "LOOSE"; packingLabel?: string; packingWeight?: string; requestedWeightGrams?: number } | null;
type ProductFormData = {
  name: string;
  slug: string;
  price: number;
  shortDescription: string;
  description: string;
  images: string[];
  stockQuantity: number;
  isActive: boolean;
  packagingSizes: PackingSize[];
  allowLooseQuantity: boolean;
  loosePricingRules: LooseRule[];
  preferredSelection: PreferredSelection;
};

const DEFAULT_PACKING: PackingSize = { label: "100g Pouch", weight: "100g", weightGrams: 100, priceInPaise: 0, availability: "AVAILABLE" };
const DEFAULT_LOOSE_RULE: LooseRule = { minWeightGrams: 1, maxWeightGrams: 100, rateInPaise: 0, rateUnit: "KILOGRAM" };

function normalizeLooseRule(rule: NonNullable<Product["loosePricingRules"]>[number]): LooseRule {
  return {
    minWeightGrams: rule.minWeightGrams,
    maxWeightGrams: rule.maxWeightGrams ?? null,
    rateInPaise: rule.rateUnit === "GRAM" ? rule.rateInPaise * 1000 : rule.rateInPaise,
    rateUnit: "KILOGRAM",
  };
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const isGeneralStore = pathname === "/admin/general-store";
  const [inventoryManagementEnabled, setInventoryManagementEnabled] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [formError, setFormError] = useState("");

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    slug: "",
    price: 0,
    shortDescription: "",
    description: "",
    images: [],
    stockQuantity: 0,
    isActive: true,
    packagingSizes: [DEFAULT_PACKING],
    allowLooseQuantity: false,
    loosePricingRules: [DEFAULT_LOOSE_RULE],
    preferredSelection: null,
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/products/admin${isGeneralStore ? "?kind=GENERAL_STORE" : ""}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetch(`${API_URL}/settings/store`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => setInventoryManagementEnabled(data?.inventoryManagementEnabled === true))
      .catch(() => setInventoryManagementEnabled(false));
  }, [isGeneralStore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGeneralStore && formData.allowLooseQuantity) {
      const rules = [...formData.loosePricingRules].sort((a, b) => a.minWeightGrams - b.minWeightGrams);
      const invalid = rules.some((rule, index) =>
        (rule.maxWeightGrams != null && rule.maxWeightGrams < rule.minWeightGrams) ||
        (rule.maxWeightGrams == null && index !== rules.length - 1) ||
        (index > 0 && rules[index - 1].maxWeightGrams != null && rule.minWeightGrams <= rules[index - 1].maxWeightGrams!),
      );
      if (invalid) {
        setFormError("Rate bands must be ordered, must not overlap, and only the final band can be open-ended (≥ minimum).");
        return;
      }
    }
    setFormError("");
    try {
      const url = editingId ? `${API_URL}/products/${editingId}` : `${API_URL}/products`;
      const method = editingId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Admin routes require auth
        body: JSON.stringify({
          ...formData,
          ...(inventoryManagementEnabled ? { stockQuantity: formData.stockQuantity } : {}),
          isGeneralStore,
        }),
      });

      if (res.ok) {
        const savedProduct = await res.json();
        for (const file of imageFiles) {
          const upload = new FormData();
          upload.append("file", file);
          const uploadResponse = await fetch(`${API_URL}/products/${editingId || savedProduct.id}/images`, {
            method: "POST",
            credentials: "include",
            body: upload,
          });
          if (!uploadResponse.ok) {
            const uploadError = await uploadResponse.json().catch(() => null);
            throw new Error(uploadError?.error || "Unable to upload product image");
          }
        }
        setIsModalOpen(false);
        setImageFiles([]);
        fetchProducts();
      } else {
        const data = await res.json();
        alert(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        fetchProducts();
      } else {
        alert("Failed to delete product");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name,
        slug: product.slug,
        price: product.price,
        shortDescription: product.shortDescription || "",
        description: product.description || "",
        images: product.images || [],
        stockQuantity: product.stockQuantity ?? 0,
        isActive: product.isActive,
        packagingSizes: product.packagingSizes?.length ? product.packagingSizes.map((packing) => ({ ...DEFAULT_PACKING, ...packing, priceInPaise: packing.priceInPaise ?? 0, weightGrams: packing.weightGrams ?? 0, availability: (packing.availability === "UNAVAILABLE" ? "UNAVAILABLE" : "AVAILABLE") as PackingSize["availability"] })) : [DEFAULT_PACKING],
        allowLooseQuantity: product.allowLooseQuantity ?? false,
        loosePricingRules: product.loosePricingRules?.length ? product.loosePricingRules.map(normalizeLooseRule) : [DEFAULT_LOOSE_RULE],
        preferredSelection: product.preferredSelection ?? null,
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", slug: "", price: 0, shortDescription: "", description: "", images: [], stockQuantity: 0, isActive: true, packagingSizes: [DEFAULT_PACKING], allowLooseQuantity: false, loosePricingRules: [DEFAULT_LOOSE_RULE], preferredSelection: null });
    }
    setImageFiles([]);
    setFormError("");
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{isGeneralStore ? "General Store Products" : "Products Management"}</h1>
        <button 
          onClick={() => openModal()}
          className="bg-brand-maroon text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-maroon-dark transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading products...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Price</th>
                  <th className="p-4 font-semibold">Packings</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">No products found.</td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <p className="font-semibold text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.slug}</p>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{product.categoryDetails?.name || product.category || "Uncategorized"}</td>
                      <td className="p-4 text-sm font-medium">₹{(product.priceInPaise ? product.priceInPaise / 100 : product.price).toFixed(2)}</td>
                      <td className="p-4 text-sm text-gray-600">{product.packagingSizes?.length || 0} packings</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${product.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => openModal(product)} className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-4">Edit</button>
                        <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain bg-black/50 p-2 sm:items-center sm:p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex max-h-[calc(100dvh-1rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl sm:max-h-[calc(100dvh-2rem)]"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-4 sm:px-6">
              <h2 className="text-xl font-bold text-gray-900">{editingId ? "Edit Product" : "Add Product"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="min-h-0 space-y-4 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input 
                  type="text" required 
                  value={formData.name} onChange={(e) => {
                    setFormData({...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})
                  }}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-maroon/20 focus:border-brand-maroon outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL-friendly)</label>
                <input 
                  type="text" required 
                  value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-maroon/20 focus:border-brand-maroon outline-none"
                />
              </div>
              {isGeneralStore && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Short description <span className="font-normal text-gray-400">(optional)</span></label>
                    <input
                      type="text"
                      maxLength={240}
                      value={formData.shortDescription}
                      onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                      placeholder="One-line description shown in the catalogue"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2 outline-none focus:border-brand-maroon focus:ring-2 focus:ring-brand-maroon/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="font-normal text-gray-400">(optional)</span></label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="A clear description for the product detail page"
                      className="w-full resize-y rounded-xl border border-gray-200 px-4 py-2 outline-none focus:border-brand-maroon focus:ring-2 focus:ring-brand-maroon/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product photos <span className="font-normal text-gray-400">(up to 8)</span></label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={(e) => setImageFiles(Array.from(e.target.files || []).slice(0, 8))}
                      className="block w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-cream file:px-3 file:py-2 file:font-semibold file:text-brand-maroon"
                    />
                    <p className="mt-1 text-xs text-gray-500">Images are resized and stored as optimized WebP files.</p>
                    {formData.images?.length ? <p className="mt-1 text-xs text-gray-500">{formData.images.length} existing photo(s) saved.</p> : null}
                    {imageFiles.length ? <p className="mt-1 text-xs font-medium text-brand-maroon">{imageFiles.length} new photo(s) selected.</p> : null}
                  </div>
                </>
              )}
              <div className={inventoryManagementEnabled ? "grid grid-cols-2 gap-4" : "grid grid-cols-1 gap-4"}>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base price (₹, stored as paise)</label>
                  <input 
                    type="number" required min="0"
                    value={formData.price} onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-maroon/20 focus:border-brand-maroon outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">₹{formData.price.toFixed(2)}</p>
                </div>
                {inventoryManagementEnabled && <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference quantity</label>
                  <input 
                    type="number" required min="0"
                    value={formData.stockQuantity} onChange={(e) => setFormData({...formData, stockQuantity: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-maroon/20 focus:border-brand-maroon outline-none"
                  />
                </div>}
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Packings and weights</label>
                    <p className="text-xs text-gray-500">Customers can choose one of these sizes when ordering.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData((current) => ({
                      ...current,
                      packagingSizes: [...current.packagingSizes, { ...DEFAULT_PACKING, label: "", weight: "", priceInPaise: 0 }],
                    }))}
                    className="text-xs font-bold text-brand-maroon hover:text-brand-maroon-dark"
                  >
                    + Add packing
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.packagingSizes.map((packing, index) => (
                    <div key={`${index}-${packing.label}`} className="relative grid min-w-0 grid-cols-1 gap-2 rounded-xl border border-gray-100 bg-gray-50/50 p-3 sm:grid-cols-[minmax(0,1fr)_8rem_7rem_9rem_auto] sm:items-center sm:border-0 sm:bg-transparent sm:p-0">
                      <input
                        type="text"
                        required
                        placeholder="Label e.g. 200g Pouch"
                        value={packing.label}
                        onChange={(event) => setFormData((current) => ({
                          ...current,
                          packagingSizes: current.packagingSizes.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item),
                        }))}
                        className="min-w-0 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-maroon"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Weight e.g. 200g"
                        value={packing.weight}
                        onChange={(event) => setFormData((current) => ({
                          ...current,
                          packagingSizes: current.packagingSizes.map((item, itemIndex) => itemIndex === index ? { ...item, weight: event.target.value } : item),
                        }))}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-maroon"
                      />
                      <input type="number" min="0" placeholder="Price ₹" value={(packing.priceInPaise || 0) / 100} onChange={(event) => setFormData((current) => ({ ...current, packagingSizes: current.packagingSizes.map((item, itemIndex) => itemIndex === index ? { ...item, priceInPaise: Math.round(Number(event.target.value || 0) * 100) } : item) }))} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-maroon" />
                      <select value={packing.availability || "AVAILABLE"} aria-label="Packing availability" onChange={(event) => setFormData((current) => ({ ...current, packagingSizes: current.packagingSizes.map((item, itemIndex) => itemIndex === index ? { ...item, availability: event.target.value as PackingSize["availability"] } : item) }))} className="w-full rounded-xl border border-gray-200 px-2 py-2 text-sm"><option value="AVAILABLE">Available</option><option value="UNAVAILABLE">Unavailable</option></select>
                      {formData.packagingSizes.length > 1 && (
                        <button
                          type="button"
                          aria-label={`Remove packing ${index + 1}`}
                          onClick={() => setFormData((current) => ({
                            ...current,
                            packagingSizes: current.packagingSizes.filter((_, itemIndex) => itemIndex !== index),
                          }))}
                          className="absolute right-5 top-3 px-2 text-gray-400 hover:text-red-600 sm:static"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-brand-gold/30 bg-brand-cream/20 p-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700"><input type="checkbox" checked={formData.allowLooseQuantity} onChange={(event) => setFormData({ ...formData, allowLooseQuantity: event.target.checked })} /> Allow loose quantity</label>
                <p className="mt-1 text-xs text-gray-500">Customers can enter an exact quantity. All loose rates are entered and stored as ₹ per kilogram.</p>
                {formData.allowLooseQuantity && <div className="mt-3 space-y-2 overflow-x-hidden"><div className="hidden grid-cols-[1fr_1fr_1fr_auto] gap-2 text-[11px] font-bold uppercase text-gray-500 sm:grid"><span>From g</span><span>To g</span><span>Rate ₹ / kg</span><span /></div>{formData.loosePricingRules.map((rule, index) => <div key={index} className="grid min-w-0 grid-cols-2 gap-2 rounded-lg border border-gray-100 p-2 sm:grid-cols-[1fr_1fr_1fr_auto] sm:border-0 sm:p-0"><label className="text-[10px] text-gray-500 sm:hidden">From g<input aria-label="Minimum grams" type="number" min="1" value={rule.minWeightGrams} onChange={(event) => setFormData((current) => ({ ...current, loosePricingRules: current.loosePricingRules.map((item, itemIndex) => itemIndex === index ? { ...item, minWeightGrams: Number(event.target.value) } : item) }))} className="mt-1 w-full rounded-lg border px-2 py-2 text-sm" /></label><input aria-label="Minimum grams" type="number" min="1" value={rule.minWeightGrams} onChange={(event) => setFormData((current) => ({ ...current, loosePricingRules: current.loosePricingRules.map((item, itemIndex) => itemIndex === index ? { ...item, minWeightGrams: Number(event.target.value) } : item) }))} className="hidden rounded-lg border px-2 py-2 text-sm sm:block" /><label className="text-[10px] text-gray-500 sm:hidden">To g<input aria-label="Maximum grams" type="number" min="1" placeholder="No limit" value={rule.maxWeightGrams ?? ""} onChange={(event) => setFormData((current) => ({ ...current, loosePricingRules: current.loosePricingRules.map((item, itemIndex) => itemIndex === index ? { ...item, maxWeightGrams: event.target.value ? Number(event.target.value) : null } : item) }))} className="mt-1 w-full rounded-lg border px-2 py-2 text-sm" /></label><input aria-label="Maximum grams" type="number" min="1" placeholder="No limit" value={rule.maxWeightGrams ?? ""} onChange={(event) => setFormData((current) => ({ ...current, loosePricingRules: current.loosePricingRules.map((item, itemIndex) => itemIndex === index ? { ...item, maxWeightGrams: event.target.value ? Number(event.target.value) : null } : item) }))} className="hidden rounded-lg border px-2 py-2 text-sm sm:block" /><label className="text-[10px] text-gray-500 sm:col-span-2 sm:hidden">Rate<input aria-label="Loose rate" type="number" min="0" step="0.01" value={rule.rateInPaise / 100} onChange={(event) => setFormData((current) => ({ ...current, loosePricingRules: current.loosePricingRules.map((item, itemIndex) => itemIndex === index ? { ...item, rateInPaise: Math.round(Number(event.target.value || 0) * 100) } : item) }))} className="mt-1 w-full rounded-lg border px-2 py-2 text-sm" /></label><input aria-label="Loose rate" type="number" min="0" step="0.01" value={rule.rateInPaise / 100} onChange={(event) => setFormData((current) => ({ ...current, loosePricingRules: current.loosePricingRules.map((item, itemIndex) => itemIndex === index ? { ...item, rateInPaise: Math.round(Number(event.target.value || 0) * 100) } : item) }))} className="hidden rounded-lg border px-2 py-2 text-sm sm:block" /><span className="flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-600">per kg</span><button type="button" onClick={() => setFormData((current) => ({ ...current, loosePricingRules: current.loosePricingRules.filter((_, itemIndex) => itemIndex !== index) }))} className="absolute right-5 top-3 px-2 text-red-500 sm:static">×</button></div>)}<button type="button" onClick={() => setFormData((current) => ({ ...current, loosePricingRules: [...current.loosePricingRules, { ...DEFAULT_LOOSE_RULE, minWeightGrams: current.loosePricingRules.at(-1)?.maxWeightGrams ? current.loosePricingRules.at(-1)!.maxWeightGrams! + 1 : 1 }] }))} className="text-xs font-bold text-brand-maroon">+ Add rate band</button></div>}
                {formData.allowLooseQuantity && <div className="mt-3 flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs text-gray-600"><input type="checkbox" aria-label="Use open-ended final rate band" checked={formData.loosePricingRules.length > 0 && formData.loosePricingRules.at(-1)?.maxWeightGrams == null} onChange={(event) => setFormData((current) => ({ ...current, loosePricingRules: current.loosePricingRules.map((rule, index) => index === current.loosePricingRules.length - 1 ? { ...rule, maxWeightGrams: event.target.checked ? null : rule.minWeightGrams + 1 } : rule) }))} /><span>Final rate band is <strong>≥ minimum grams</strong> (no upper limit)</span></div>}
              </div>
              {formError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
              {isGeneralStore && <div className="rounded-xl border border-brand-maroon/20 bg-brand-maroon/5 p-4"><p className="text-sm font-semibold text-gray-800">Preferred Quick add option</p><p className="mt-1 text-xs text-gray-500">This is the one-unit selection used by Quick add. Customers can still customize it from the product details page.</p><div className="mt-3 grid gap-2 sm:grid-cols-2"><select aria-label="Preferred selection type" value={formData.preferredSelection?.selectionType || "NONE"} onChange={(event) => { const type = event.target.value; setFormData((current) => ({ ...current, preferredSelection: type === "LOOSE" ? { selectionType: "LOOSE", requestedWeightGrams: current.preferredSelection?.requestedWeightGrams || current.loosePricingRules[0]?.minWeightGrams || 1, packingLabel: "Loose quantity" } : type === "PACKED" ? { selectionType: "PACKED", packingLabel: current.packagingSizes[0]?.label || "default", packingWeight: current.packagingSizes[0]?.weight } : null })); }} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"><option value="NONE">No preferred option</option><option value="PACKED">Preferred pre-packed option</option><option value="LOOSE" disabled={!formData.allowLooseQuantity}>Preferred loose quantity</option></select>{formData.preferredSelection?.selectionType === "PACKED" && <select aria-label="Preferred packing" value={formData.preferredSelection.packingLabel || ""} onChange={(event) => { const packing = formData.packagingSizes.find((item) => item.label === event.target.value); setFormData((current) => ({ ...current, preferredSelection: { selectionType: "PACKED", packingLabel: event.target.value, packingWeight: packing?.weight } })); }} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm">{formData.packagingSizes.map((packing) => <option key={packing.label} value={packing.label}>{packing.label} · {packing.weight}</option>)}</select>}{formData.preferredSelection?.selectionType === "LOOSE" && <input aria-label="Preferred loose weight in grams" type="number" min="1" value={formData.preferredSelection.requestedWeightGrams || 1} onChange={(event) => setFormData((current) => ({ ...current, preferredSelection: { ...current.preferredSelection!, requestedWeightGrams: Math.max(1, Number(event.target.value) || 1), packingLabel: "Loose quantity", packingWeight: `${Math.max(1, Number(event.target.value) || 1)}g` } }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="Preferred grams" />}</div></div>}
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" id="isActive"
                  checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-4 h-4 text-brand-maroon rounded border-gray-300 focus:ring-brand-maroon"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active (Visible to customers)</label>
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-brand-maroon text-white font-medium rounded-xl hover:bg-brand-maroon-dark transition-colors">
                  {editingId ? "Save Changes" : "Add Product"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
