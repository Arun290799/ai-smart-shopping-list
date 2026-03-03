export interface ShoppingItem {
	id: string;
	name: string;
	quantity: number;
	unit: Unit;
	isCompleted: boolean;
}

export type Unit = "kg" | "g" | "litre" | "ml" | "pcs" | "packets" | "boxes" | "bottles";

export interface ParsedItem {
	name: string;
	quantity: number;
	unit: Unit;
}
