// Auth route — disabled in Phase 1 (portfolio only)
// Will be re-enabled when admin panel authentication is implemented.
//
// import {auth} from "@repo/auth";
// import { toNextJsHandler } from "better-auth/next-js";
//
// export const {GET,POST} = toNextJsHandler(auth);

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Auth not yet configured" }, { status: 501 });
}

export async function POST() {
  return NextResponse.json({ message: "Auth not yet configured" }, { status: 501 });
}
