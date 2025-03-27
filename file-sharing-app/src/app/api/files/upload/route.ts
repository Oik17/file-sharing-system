import { NextRequest, NextResponse } from "next/server";
import multer from "multer";
import jwt from "jsonwebtoken";
import { writeFile } from "fs/promises";

const upload = multer({ dest: "./public/uploads" });

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  try {
    jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid Token" }, { status: 403 });
  }

  const data = await req.formData();
  const file = data.get("file") as Blob;
  if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = `./public/uploads/${file.name}`;
  await writeFile(filePath, buffer);

  return NextResponse.json({ message: "File uploaded successfully", path: filePath });
}
