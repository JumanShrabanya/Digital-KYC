import { NextResponse } from "next/server";
import { simulateDocumentQuality } from "../../../../lib/kyc/simulation";

export async function POST(request) {
  const body = await request.json().catch(() => null);

  if (!body || !body.docType || !body.fileBase64) {
    return NextResponse.json(
      { success: false, error: "docType and fileBase64 are required" },
      { status: 400 }
    );
  }

  const { docType, fileBase64 } = body;

  const result = simulateDocumentQuality(docType, fileBase64);

  return NextResponse.json({ success: true, ...result });
}
