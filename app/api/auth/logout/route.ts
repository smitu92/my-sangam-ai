import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  (await cookies()).delete("session");
  return NextResponse.json({ message: "Logged out successfully" });
}
