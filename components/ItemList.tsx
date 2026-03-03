"use client";

import { useAppSelector } from "@/store/hooks";
import { ShoppingItem } from "@/types";
import { ItemCard } from "./ItemCard";

export function ItemList() {
	const items = useAppSelector((state) => state.items.items);

	if (items.length === 0) {
		return (
			<div className="text-center py-12">
				<div className="text-gray-400 text-lg">No items yet</div>
				<div className="text-gray-400 text-sm mt-2">Add some items to get started!</div>
			</div>
		);
	}

	return (
		<div className="w-full max-w-4xl mx-auto space-y-3">
			<div className="text-lg font-semibold text-gray-800 flex items-center">
				<span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">{items.length}</span>
				<span className="ml-2">Items</span>
			</div>
			<div className="space-y-2">
				{items.map((item) => (
					<ItemCard key={item.id} item={item} />
				))}
			</div>
		</div>
	);
}
