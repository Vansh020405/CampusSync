import { NextRequest, NextResponse } from "next/server";
const pdfParse = require("pdf-parse/lib/pdf-parse.js");

// 1. Clean fragmented words
function fixFragmentedWords(text: string): string {
    let cleaned = text;

    // A. Fix hyphenated line breaks (e.g., "Py-\nthon" or "Py- \n thon")
    cleaned = cleaned.replace(/([a-z]+)-\s*\n\s*([a-z]+)/gi, '$1$2');

    // B. Fix spaced-out words (e.g., "P y t h o n" -> "Python")
    // Merges consecutive single letters separated by space
    let prev = "";
    while (cleaned !== prev) {
        prev = cleaned;
        // Match a word boundary/space, followed by a single letter, a space, and another single letter with a boundary/space
        cleaned = cleaned.replace(/(^|\s)([a-z])\s+(?=[a-z](\s|$))/ig, '$1$2');
    }

    // C. Intelligent Line Break Merging without hyphen
    // If a line ends with a lowercase and next line starts with lowercase, and the merged word exists or looks like a single token
    // For safety, we'll mostly rely on spacing and standardizing whitespaces now

    return cleaned;
}

// 2. Normalize and Sanitize
function normalizeText(text: string): string {
    // NFKC normalization removes weird unicode equivalents
    let normalized = text.normalize("NFKC").toLowerCase();

    // Fix fragments first
    normalized = fixFragmentedWords(normalized);

    // Remove hidden characters and excessive whitespace (standardize all spacing to single space)
    normalized = normalized.replace(/[\x00-\x1F\x7F-\x9F]/g, ' ');
    normalized = normalized.replace(/\s+/g, ' ').trim();

    return normalized;
}

// 3. Validation Logic
function validateExtraction(text: string): { isValid: boolean; reason: string; confidence: number } {
    if (!text || text.length < 400) {
        return { isValid: false, reason: "Character count too low (<400). Likely an image-based or protected PDF.", confidence: 0.1 };
    }

    const words = text.split(" ");

    // Check for excessive single letters
    const singleLetters = words.filter(w => w.length === 1 && /[a-z]/.test(w));
    const singleLetterRatio = singleLetters.length / words.length;

    if (singleLetterRatio > 0.15) {
        return { isValid: false, reason: "Extraction deeply fragmented. Too many isolated letters.", confidence: 0.3 };
    }

    // Check for common resume keywords
    const keywords = ["education", "skills", "experience", "projects", "university", "college", "work"];
    const keywordMatches = keywords.filter(kw => text.includes(kw));

    if (keywordMatches.length < 2 && words.length < 1000) {
        return { isValid: false, reason: "Missing expected resume structural keywords. Unrecognized format.", confidence: 0.4 };
    }

    // High confidence if we pass these basics
    return { isValid: true, reason: "Extraction quality verified.", confidence: 0.95 };
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Parse PDF using pdf-parse (Primary local engine)
        const pdfData = await pdfParse(buffer, {
            // pdf-parse options
            max: 0,
            version: 'v1.10.100'
        });

        const rawText = pdfData.text;

        // Enhance and Fix Text
        const cleanedText = normalizeText(rawText);

        // Validate Quality
        const validation = validateExtraction(cleanedText);

        return NextResponse.json({
            text: cleanedText,
            isValid: validation.isValid,
            reason: validation.reason,
            confidence: validation.confidence
        });

    } catch (error: any) {
        console.error("PDF Parsing Error:", error);
        return NextResponse.json({ error: error.message || "Failed to parse document" }, { status: 500 });
    }
}
