import mongoose from "mongoose";
import { ShoppingItem } from "@/types";

// Define the schema for individual items
const ItemSchema = new mongoose.Schema(
	{
		id: { type: String, required: true },
		name: { type: String, required: true },
		quantity: { type: Number, required: true },
		unit: { type: String, required: true, enum: ["kg", "g", "litre", "ml", "pcs", "packets", "boxes", "bottles"] },
		isCompleted: { type: Boolean, default: false },
	},
	{ _id: false },
);

// Define the main shopping list schema
const ShoppingListSchema = new mongoose.Schema({
	shareId: { type: String, required: true, unique: true },
	items: [ItemSchema],
	createdAt: {
		type: Date,
		default: Date.now,
		expires: 60 * 60 * 24 * 7, // Automatically delete after 1 week
	},
	updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt field on save
ShoppingListSchema.pre("save", function (next) {
	this.updatedAt = new Date();
	next();
});

// Create and export the model
export default mongoose.models.ShoppingList || mongoose.model("ShoppingList", ShoppingListSchema);
