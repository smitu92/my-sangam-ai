
import { db } from "@/db";
import { schemes } from "@/db/schemas/scheme";
import { desc, eq, count, and, or, ilike } from "drizzle-orm";
import { NextResponse } from "next/server";
import { AIService } from "@/lib/ai-service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "6");
    const offset = (page - 1) * limit;
    const useAI = process.env.USE_AI === 'true';

    // 1. Build where clause
    const conditions = [];

    if (category && category !== "All") {
      conditions.push(eq(schemes.category, category));
    }

    if (search) {
      if (useAI && search.split(' ').length >= 3) {
        // AI Smart Search: understand natural language queries
        console.log('🤖 AI Smart Search for:', search);
        try {
          const aiResult = await AIService.smartSearch(search);

          // Build OR conditions from AI-extracted keywords
          const keywordConditions = aiResult.keywords.map(keyword =>
            or(
              ilike(schemes.title, `%${keyword}%`),
              ilike(schemes.description, `%${keyword}%`),
              ilike(schemes.benefits, `%${keyword}%`),
              ilike(schemes.eligibility, `%${keyword}%`)
            )
          );

          // Also search the original query as fallback
          keywordConditions.push(
            or(
              ilike(schemes.title, `%${search}%`),
              ilike(schemes.description, `%${search}%`)
            )
          );

          conditions.push(or(...keywordConditions));

          // If AI identified a category and user didn't pick one already
          if (aiResult.category && aiResult.category !== 'All' && (!category || category === 'All')) {
            // Don't force category filter — let keywords do the broad search
            // but we log it for debugging
            console.log('🏷️ AI suggested category:', aiResult.category);
          }

          console.log(`✅ AI extracted ${aiResult.keywords.length} keywords:`, aiResult.keywords);
        } catch (aiError) {
          console.error('⚠️ AI search failed, falling back to basic search:', aiError);
          // Fallback to basic search
          conditions.push(
            or(
              ilike(schemes.title, `%${search}%`),
              ilike(schemes.description, `%${search}%`)
            )
          );
        }
      } else {
        // Basic keyword search (USE_AI=false or short queries)
        conditions.push(
          or(
            ilike(schemes.title, `%${search}%`),
            ilike(schemes.description, `%${search}%`)
          )
        );
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

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
        },
        aiPowered: useAI && search && search.split(' ').length >= 3
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
