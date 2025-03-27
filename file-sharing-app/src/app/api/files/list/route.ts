import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid Token" }, { status: 403 });
  }

  const files = fs.readdirSync(path.join(process.cwd(), "public/uploads"));
  return NextResponse.json({ files });
}
