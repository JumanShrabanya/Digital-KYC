import { NextResponse } from "next/server";
import { simulateDuplicateCheck } from "../../../../lib/kyc/simulation";

export async function POST() {
  const result = simulateDuplicateCheck();
  return NextResponse.json({ success: true, ...result });
}
