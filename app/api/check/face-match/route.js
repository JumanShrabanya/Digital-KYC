import { NextResponse } from "next/server";
import { simulateFaceMatch } from "../../../../lib/kyc/simulation";

export async function POST() {
  // We ignore actual images for now and just simulate a result
  const result = simulateFaceMatch();
  return NextResponse.json({ success: true, ...result });
}
