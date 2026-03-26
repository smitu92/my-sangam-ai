import prisma from "@/lib/prisma";
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

    // Build Prisma Where Clause
    let whereClause: any = {};

    if (category && category !== "All") {
      whereClause.schemeCategory = {
        contains: category,
        mode: 'insensitive'
      };
    }

    if (search) {
      if (useAI && search.split(' ').length >= 3) {
        // AI Smart Search Focus
        try {
          const aiResult = await AIService.smartSearch(search);
          const keywordConditions = aiResult.keywords.map((keyword: string) => ({
             OR: [
                { scheme_name: { contains: keyword, mode: 'insensitive' } },
                { details: { contains: keyword, mode: 'insensitive' } },
                { benefits: { contains: keyword, mode: 'insensitive' } },
                { eligibility: { contains: keyword, mode: 'insensitive' } }
             ]
          }));

          // Always add exact search explicitly
          keywordConditions.push({
             OR: [
                { scheme_name: { contains: search, mode: 'insensitive' } },
                { details: { contains: search, mode: 'insensitive' } }
             ]
          });

          // In Prisma, we use OR for this list of conditions to be broad
          // Wait, AI keywords usually mean "must match at least one keyword"
          whereClause.OR = keywordConditions;
        } catch (error) {
           whereClause.OR = [
             { scheme_name: { contains: search, mode: 'insensitive' } },
             { details: { contains: search, mode: 'insensitive' } }
           ];
        }
      } else {
        whereClause.OR = [
           { scheme_name: { contains: search, mode: 'insensitive' } },
           { details: { contains: search, mode: 'insensitive' } }
        ];
      }
    }

    const [totalCount, rawSchemes] = await Promise.all([
      prisma.scheme.count({ where: whereClause }),
      prisma.scheme.findMany({
        where: whereClause,
        skip: offset,
        take: limit,
        orderBy: { id: "desc" }
      })
    ]);

    // Remap to what the UI strictly expects
    const paginatedSchemes = rawSchemes.map(s => ({
       id: s.id.toString(),
       title: s.scheme_name || "Unknown Scheme",
       description: s.details || "",
       category: s.schemeCategory || "Other",
       state: s.level || "Central",
       benefits: s.benefits || "",
       status: 'active'
    }));

    return NextResponse.json(
      {
        schemes: paginatedSchemes,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit)
        },
        aiPowered: useAI && !!search && search.split(' ').length >= 3
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
