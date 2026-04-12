import { connectDB } from "@/lib/db";
import Product from "@/models/Products";

// CREATE PRODUCT
export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const product = await Product.create(body);

    return Response.json(product, { status: 201 });
  } catch (error) {
    return Response.json({ error: "Failed to create product" }, { status: 500 });
  }
}

// GET ALL PRODUCTS
export async function GET() {
  try {
    await connectDB();

    const products = await Product.find().sort({ createdAt: -1 });

    return Response.json(products);
  } catch (error) {
    return Response.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}