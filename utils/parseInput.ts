import { v4 as uuidv4 } from "uuid";
import { ParsedItem, ShoppingItem, Unit } from "@/types";

// Unit patterns for regex matching
const UNIT_PATTERNS: Record<Unit, RegExp> = {
	kg: /\b(\d+(?:\.\d+)?)\s*kg\b/gi,
	g: /\b(\d+(?:\.\d+)?)\s*g\b/gi,
	litre: /\b(\d+(?:\.\d+)?)\s*litre[s]?\b/gi,
	ml: /\b(\d+(?:\.\d+)?)\s*ml\b/gi,
	pcs: /\b(\d+(?:\.\d+)?)\s*pcs\b/gi,
	packets: /\b(\d+(?:\.\d+)?)\s*packet[s]?\b/gi,
	boxes: /\b(\d+(?:\.\d+)?)\s*box[es]?\b/gi,
	bottles: /\b(\d+(?:\.\d+)?)\s*bottle[s]?\b/gi,
};

/**
 * Extracts quantity and unit from text using regex patterns
 */
function extractQuantityAndUnit(text: string): { quantity: number; unit: Unit; remainingText: string } {
	let remainingText = text;

	// Try each unit pattern
	for (const [unit, pattern] of Object.entries(UNIT_PATTERNS)) {
		const match = pattern.exec(text);
		if (match) {
			const quantity = parseFloat(match[1]);
			remainingText = text.replace(match[0], "").trim();
			return { quantity, unit: unit as Unit, remainingText };
		}
	}

	// Try to extract standalone numbers (default to pcs)
	const numberMatch = text.match(/\b(\d+(?:\.\d+)?)\b/);
	if (numberMatch) {
		const quantity = parseFloat(numberMatch[1]);
		remainingText = text.replace(numberMatch[0], "").trim();
		return { quantity, unit: "pcs", remainingText };
	}

	return { quantity: 1, unit: "pcs", remainingText: text };
}

/**
 * Parses a single item string into structured data
 */
function parseSingleItem(itemText: string): ParsedItem | null {
	const trimmedText = itemText.trim();
	if (!trimmedText) return null;

	const { quantity, unit, remainingText } = extractQuantityAndUnit(trimmedText);
	const name = remainingText.replace(/[,，]$/, "").trim(); // Remove trailing commas

	if (!name) return null;

	return {
		name,
		quantity,
		unit,
	};
}

/**
 * Main parser function that converts free text input into structured shopping items
 */
export function parseInput(input: string): ShoppingItem[] {
	if (!input || !input.trim()) return [];

	// Split by commas and clean up
	const itemTexts = input
		.split(/[,，]/)
		.map((text) => text.trim())
		.filter((text) => text);

	const parsedItems: ParsedItem[] = [];

	for (const itemText of itemTexts) {
		const parsed = parseSingleItem(itemText);
		if (parsed) {
			parsedItems.push(parsed);
		}
	}

	// Convert to ShoppingItem format with UUIDs
	return parsedItems.map((item) => ({
		id: uuidv4(),
		name: item.name,
		quantity: item.quantity,
		unit: item.unit,
		isCompleted: false,
	}));
}
