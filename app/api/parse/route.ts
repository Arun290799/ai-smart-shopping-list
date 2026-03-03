import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { id } from "zod/v4/locales";

/**
 * Initialize Groq client
 */
const groq = new Groq({
	apiKey: process.env.GROQ_API_KEY!,
});

/**
 * Zod schema for validation (without id field, will be added server-side)
 */
const ItemSchema = z.object({
	name: z.string(),
	quantity: z.number(),
	unit: z.enum(["kg", "g", "litre", "ml", "pcs", "packets", "boxes", "bottles", "rupees", "rs"]),
	isCompleted: z.boolean(),
	id: z.string(),
});

const ResponseSchema = z.object({
	items: z.array(ItemSchema),
});

/**
 * Validate and normalize unit
 */
function normalizeUnit(unit: string): "kg" | "g" | "litre" | "ml" | "pcs" | "packets" | "boxes" | "bottles" | "rupees" {
	const validUnits = ["kg", "g", "litre", "ml", "pcs", "packets", "boxes", "bottles", "rupees", "rs"];
	const normalized = unit.toLowerCase().trim();

	if (validUnits.includes(normalized)) {
		return normalized as any;
	}

	// Default to pcs for invalid units
	return "pcs";
}

/**
 * Remove duplicates based on name and unit
 */
function removeDuplicates(items: any[]): any[] {
	const seen = new Set<string>();
	return items.filter((item) => {
		const key = `${item.name.toLowerCase()}-${item.unit}`;
		if (seen.has(key)) {
			return false;
		}
		seen.add(key);
		return true;
	});
}

/**
 * Validate input content for inappropriate material
 */
function validateContent(input: string): { isValid: boolean; reason?: string; filteredInput?: string } {
	const inappropriatePatterns = [
		// Dangerous/harmful items
		/\b(weapons|guns|knives|bombs|explosives|poison|toxic|drugs|illegal)\b/gi,
		// Medical terms that shouldn't be in shopping lists
		/\b(medicine|pills|tablets|prescription|overdose|suicide|kill|harm)\b/gi,
		// Violence and harmful content
		/\b(kill|hurt|attack|violence|murder|death)\b/gi,
		// Adult content
		/\b(adult|xxx|porn|sexual|inappropriate)\b/gi,
		// Scam/fraud related
		/\b(scam|fraud|fake|counterfeit|stolen)\b/gi,
	];

	const lowerInput = input.toLowerCase();
	let hasInappropriate = false;
	let filteredInput = input;

	for (const pattern of inappropriatePatterns) {
		if (pattern.test(lowerInput)) {
			hasInappropriate = true;
			filteredInput = filteredInput.replace(pattern, "[FILTERED]");
		}
	}

	if (hasInappropriate) {
		// If after filtering there's still legitimate content, allow it
		const remainingWords = filteredInput.replace(/\[FILTERED\]/g, "").trim();
		if (remainingWords.length > 0) {
			return {
				isValid: true,
				reason: "Inappropriate content filtered",
				filteredInput,
			};
		} else {
			return {
				isValid: false,
				reason: "Input contains only inappropriate content",
			};
		}
	}

	return { isValid: true };
}

/**
 * Safely extract JSON from LLM output
 */
function extractJson(text: string) {
	const match = text.match(/\{[\s\S]*\}/);
	if (!match) throw new Error("Invalid JSON response from LLM");
	return JSON.parse(match[0]);
}

export async function POST(req: NextRequest) {
	try {
		const { input } = await req.json();

		if (!input || typeof input !== "string") {
			return NextResponse.json({ error: "Invalid input" }, { status: 400 });
		}

		// Validate content for inappropriate material
		const contentValidation = validateContent(input);
		if (!contentValidation.isValid) {
			return NextResponse.json(
				{
					error: contentValidation.reason || "Inappropriate content detected",
					items: [],
				},
				{ status: 400 },
			);
		}

		// Use filtered input if content was cleaned
		const inputToProcess = contentValidation.filteredInput || input;

		const completion = await groq.chat.completions.create({
			model: "llama-3.1-8b-instant",
			temperature: 0,
			messages: [
				{
					role: "system",
					content: `
You are a grocery and shopping item parser for a family-friendly shopping list application.

IMPORTANT SAFETY RULES:
- DO NOT parse or include any dangerous items (weapons, explosives, poisons, drugs)
- DO NOT parse medical items (prescription medicine, pills, tablets)
- DO NOT parse violent or harmful content
- DO NOT parse adult content or inappropriate material
- If input contains inappropriate content, ignore those parts and only parse legitimate shopping items
- Return empty array if no legitimate shopping items are found

Return ONLY valid JSON.
Do NOT explain.
Do NOT wrap in markdown.

Format:
{
  "items": [
    {
      "name": "string",
      "quantity": number,
      "unit": "kg | g | litre | ml | pcs | packets | boxes | bottles | pieces | rupees",
      "isCompleted": false
    }
  ]
}

Rules:
- Default quantity to 1 if missing.
- Default unit to "pcs" if missing or invalid.
- Normalize names to lowercase singular.
- Convert textual numbers to numeric.
- isCompleted must always be false.
- Do NOT include duplicate items with same name and unit.
- Validate units are from the allowed list only.
- Only parse legitimate grocery, household, and personal care items.
- Reject any items that could be harmful or inappropriate.
`,
				},
				{
					role: "user",
					content: inputToProcess,
				},
			],
		});

		const rawOutput = completion.choices[0]?.message?.content || "";

		const parsed = extractJson(rawOutput);

		// Additional validation of parsed items
		const legitimateItems = parsed.items.filter((item: any) => {
			const itemName = item.name.toLowerCase();

			// Additional check for inappropriate item names
			const inappropriateItemPatterns = [
				/(weapon|gun|knife|bomb|explosive|poison|toxic|drug|medicine|pill|tablet)/,
				/(kill|hurt|attack|violence|murder|death)/,
				/(adult|xxx|porn|sexual)/,
				/(scam|fraud|fake|counterfeit|stolen)/,
			];

			return !inappropriateItemPatterns.some((pattern) => pattern.test(itemName));
		});

		// Process items: normalize units, remove duplicates, and generate unique IDs
		const processedItems = removeDuplicates(
			legitimateItems.map((item: any) => ({
				...item,
				id: uuidv4(), // Generate unique UUID for each item
				unit: normalizeUnit(item.unit),
			})),
		);

		const validated = ResponseSchema.parse({ items: processedItems });

		// Include warning if content was filtered
		const response: any = validated;
		if (contentValidation.reason) {
			response.warning = contentValidation.reason;
		}

		return NextResponse.json(response);
	} catch (error) {
		console.error("LLM Parse Error:", error);

		return NextResponse.json({ error: "Failed to parse items" }, { status: 500 });
	}
}
