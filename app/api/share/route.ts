import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import clientPromise from "@/lib/mongodb";
import ShoppingList from "@/models/ShoppingList";
import mongoose from "mongoose";

// POST - Create new shared list
export async function POST(req: NextRequest) {
	try {
		const { items } = await req.json();

		if (!Array.isArray(items)) {
			return NextResponse.json({ error: "Items must be an array" }, { status: 400 });
		}

		const shareId = uuidv4();

		await clientPromise;
		await mongoose.connect(process.env.MONGODB_URI!);

		const shoppingList = new ShoppingList({
			shareId,
			items,
		});

		await shoppingList.save();

		return NextResponse.json({ shareId, items });
	} catch (error) {
		console.error("Error creating shared list:", error);
		return NextResponse.json({ error: "Failed to create shared list" }, { status: 500 });
	}
}

// GET - Retrieve shared list by ID
export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const shareId = searchParams.get("id");

		if (!shareId) {
			return NextResponse.json({ error: "Share ID is required" }, { status: 400 });
		}

		await clientPromise;
		await mongoose.connect(process.env.MONGODB_URI!);

		const shoppingList = await ShoppingList.findOne({ shareId });

		if (!shoppingList) {
			// Check if it might have expired
			return NextResponse.json(
				{
					error: "Shared list not found or has expired",
					expired: true,
				},
				{ status: 410 },
			); // 410 Gone - specifically for expired content
		}

		// Check if list is close to expiry (optional - for client warnings)
		const now = new Date();
		const createdAt = new Date(shoppingList.createdAt);
		const hoursOld = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
		const isExpiringSoon = hoursOld > 20; // Warning if less than 4 hours left

		return NextResponse.json({
			items: shoppingList.items,
			isExpiringSoon,
			hoursRemaining: Math.max(0, 24 - hoursOld),
		});
	} catch (error) {
		console.error("Error retrieving shared list:", error);
		return NextResponse.json({ error: "Failed to retrieve shared list" }, { status: 500 });
	}
}

// PUT - Update shared list
export async function PUT(req: NextRequest) {
	try {
		const { shareId, items } = await req.json();

		if (!shareId || !Array.isArray(items)) {
			return NextResponse.json({ error: "Share ID and items array are required" }, { status: 400 });
		}

		await clientPromise;
		await mongoose.connect(process.env.MONGODB_URI!);

		const shoppingList = await ShoppingList.findOneAndUpdate(
			{ shareId },
			{ items, updatedAt: new Date() },
			{ new: true, upsert: true },
		);

		return NextResponse.json({ items: shoppingList.items });
	} catch (error) {
		console.error("Error updating shared list:", error);
		return NextResponse.json({ error: "Failed to update shared list" }, { status: 500 });
	}
}
