/**
 * FUZZY SEARCH UTILITY
 * --------------------
 * High-performance string matching logic for typos and partial names.
 * USES: Levenshtein Distance + Trigram Overlap.
 */

export function getFuzzyScore(target: string, query: string): number {
    const t = target.toLowerCase().trim();
    const q = query.toLowerCase().trim();

    if (t === q) return 1.0;
    if (t.includes(q)) return 0.8;

    // 1. NGram / Trigram Similarity (Good for abbreviations/partial words)
    const getTrigrams = (str: string) => {
        const grams = [];
        for (let i = 0; i < str.length - 2; i++) {
            grams.push(str.substring(i, i + 3));
        }
        return grams;
    };

    const targetGrams = getTrigrams(t);
    const queryGrams = getTrigrams(q);
    
    if (queryGrams.length === 0) return t.includes(q[0]) ? 0.1 : 0;

    const intersection = queryGrams.filter(g => targetGrams.includes(g));
    const trigramScore = intersection.length / Math.max(targetGrams.length, queryGrams.length);

    // 2. Levenshtein Distance (Good for typos)
    const distance = levenshtein(t, q);
    const maxLen = Math.max(t.length, q.length);
    const levScore = 1 - (distance / maxLen);

    // Combine: Trigrams are better for government names, Lev is better for small typos
    return (trigramScore * 0.7) + (levScore * 0.3);
}

function levenshtein(a: string, b: string): number {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

/**
 * Filter and Rank a list of objects by a text field
 */
export function rankResults<T>(items: T[], query: string, key: keyof T, threshold = 0.2): (T & { fuzzyScore: number })[] {
    return items
        .map(item => ({
            ...item,
            fuzzyScore: getFuzzyScore(String(item[key]), query)
        }))
        .filter(item => item.fuzzyScore >= threshold)
        .sort((a, b) => b.fuzzyScore - a.fuzzyScore);
}
