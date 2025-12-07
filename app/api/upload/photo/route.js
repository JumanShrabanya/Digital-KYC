import { NextResponse } from "next/server";
import { simulatePhotoUpload } from "../../../../lib/kyc/simulation";

export async function POST(request) {
  const body = await request.json().catch(() => null);

  if (!body || !body.fileBase64) {
    return NextResponse.json(
      { success: false, error: "fileBase64 is required" },
      { status: 400 }
    );
  }

  const { fileBase64 } = body;
  const result = simulatePhotoUpload(fileBase64);

  return NextResponse.json({ success: true, ...result });
}
