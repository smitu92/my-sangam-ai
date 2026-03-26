/**
 * formatMessage.ts — Content Block Parser
 * 
 * Transforms raw API response into typed ContentBlock[] for the MessageRenderer.
 * This is the core of the structured output architecture.
 */

/* ── Types ────────────────────────────────────────────────── */

export interface SchemeCardData {
    scheme_id: string;
    scheme_name: string;
    level: string;
    category: string;
    description?: string;
    score?: number;
    application_url?: string | null;
}

export type ContentBlock =
    | { type: "text"; content: string }
    | { type: "schemes"; schemes: SchemeCardData[] };

export interface StructuredMessage {
    role: "user" | "assistant";
    content: string;
    blocks: ContentBlock[];
    responseType?: "SCHEME" | "GENERAL" | "OFF_TOPIC";
    schemesFound?: SchemeCardData[];
}

/* ── Parser ───────────────────────────────────────────────── */

/**
 * Parses an API response into content blocks for rendering.
 * 
 * Rules:
 * - Text is always a block
 * - Schemes block only if responseType === "SCHEME" and schemes exist
 * - GENERAL/OFF_TOPIC responses = text only, no cards
 */
export function formatAssistantMessage(
    answer: string,
    responseType: string = "GENERAL",
    schemesFound: SchemeCardData[] = []
): ContentBlock[] {
    const blocks: ContentBlock[] = [];

    // 1. Text block (always present)
    if (answer) {
        blocks.push({ type: "text", content: answer });
    }

    // 2. Schemes block (only when LLM actually found schemes)
    if (responseType === "SCHEME" && schemesFound.length > 0) {
        blocks.push({ type: "schemes", schemes: schemesFound });
    }

    return blocks;
}

/**
 * Converts a raw Message from DB/API into a StructuredMessage with blocks.
 */
export function toStructuredMessage(
    role: "user" | "assistant",
    content: string,
    responseType?: string,
    schemesFound?: SchemeCardData[]
): StructuredMessage {
    const blocks: ContentBlock[] =
        role === "user"
            ? [{ type: "text", content }]
            : formatAssistantMessage(content, responseType, schemesFound);

    return {
        role,
        content,
        blocks,
        responseType: responseType as StructuredMessage["responseType"],
        schemesFound,
    };
}
