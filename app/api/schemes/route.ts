
import { db } from "@/db";
import { schemes } from "@/db/schemas/scheme";
import { desc, eq, count } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "6");
    const offset = (page - 1) * limit;

    // 1. Build where clause
    const whereClause = category && category !== "All" ? eq(schemes.category, category) : undefined;

    // 2. Get total count for pagination
    const totalResult = await db.select({ value: count() }).from(schemes).where(whereClause);
    const totalCount = totalResult[0].value;

    // 3. Get paginated schemes
    let query = db.select().from(schemes);
    
    if (whereClause) {
      // @ts-ignore
      query = query.where(whereClause);
    }

    // @ts-ignore
    query = query.orderBy(desc(schemes.createdAt)).limit(limit).offset(offset);

    const paginatedSchemes = await query;

    return NextResponse.json(
      { 
        schemes: paginatedSchemes,
        pagination: {
            total: totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit)
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching schemes:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
