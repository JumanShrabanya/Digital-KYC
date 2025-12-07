import { NextResponse } from "next/server";
import { computeFinalDecision } from "../../../../lib/kyc/simulation";

export async function POST(request) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json(
      { success: false, error: "Request body is required" },
      { status: 400 }
    );
  }

  const decision = computeFinalDecision(body);

  return NextResponse.json({ success: true, ...decision });
}
