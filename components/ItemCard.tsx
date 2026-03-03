"use client";

import { ShoppingItem } from "@/types";
import { useAppDispatch } from "@/store/hooks";
import { toggleItem, deleteItem, updateQuantity } from "@/features/items/itemsSlice";
import { useState } from "react";

interface ItemCardProps {
	item: ShoppingItem;
}

export function ItemCard({ item }: ItemCardProps) {
	const dispatch = useAppDispatch();
	const [isEditing, setIsEditing] = useState(false);
	const [quantity, setQuantity] = useState(item.quantity.toString());

	const handleToggle = () => {
		dispatch(toggleItem(item.id));
	};

	const handleDelete = () => {
		dispatch(deleteItem(item.id));
	};

	const handleQuantityUpdate = () => {
		const newQuantity = parseFloat(quantity);
		if (!isNaN(newQuantity) && newQuantity > 0) {
			dispatch(updateQuantity({ id: item.id, quantity: newQuantity }));
			setIsEditing(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleQuantityUpdate();
		}
		if (e.key === "Escape") {
			setQuantity(item.quantity.toString());
			setIsEditing(false);
		}
	};

	const handleCardClick = (e: React.MouseEvent) => {
		// Don't toggle if clicking on quantity, input, or delete button
		if (
			(e.target as HTMLElement).closest("button") ||
			(e.target as HTMLElement).closest("input") ||
			(e.target as HTMLElement).closest(".quantity-controls")
		) {
			return;
		}
		handleToggle();
	};

	return (
		<div
			onClick={handleCardClick}
			className={`group relative p-4 border rounded-xl transition-all duration-300 cursor-pointer ${
				item.isCompleted
					? "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 shadow-sm"
					: "bg-gradient-to-r from-white to-blue-50 border-blue-200 hover:border-blue-300 hover:shadow-lg hover:scale-[1.02] shadow-md"
			}`}
		>
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4 flex-1">
					{/* Checkbox */}
					<div className="relative flex items-center">
						<input
							type="checkbox"
							checked={item.isCompleted}
							onChange={handleToggle}
							onClick={(e) => e.stopPropagation()}
							className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-300 rounded-md cursor-pointer transition-all duration-200"
						/>
						{item.isCompleted && (
							<div className="absolute inset-0 w-5 h-5 flex items-center justify-center pointer-events-none">
								<svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
									<path
										fillRule="evenodd"
										d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
						)}
					</div>

					{/* Item Details */}
					<div className="flex-1">
						<div className="flex items-center space-x-4">
							<h3
								className={`font-semibold text-lg transition-all duration-200 ${
									item.isCompleted
										? "line-through text-gray-400"
										: "text-gray-800 group-hover:text-blue-700"
								}`}
							>
								{item.name}
							</h3>
							{/* Quantity Display */}
							<div className="quantity-controls">
								{isEditing ? (
									<div className="flex items-center space-x-2">
										<input
											type="number"
											value={quantity}
											onChange={(e) => setQuantity(e.target.value)}
											onKeyDown={handleKeyPress}
											onBlur={handleQuantityUpdate}
											onClick={(e) => e.stopPropagation()}
											className="w-20 px-3 py-1 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-900"
											step="0.1"
											min="0.1"
											autoFocus
										/>
										<span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
											{item.unit}
										</span>
									</div>
								) : (
									<button
										onClick={(e) => {
											e.stopPropagation();
											setIsEditing(true);
										}}
										className="inline-flex items-center space-x-1 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg transition-all duration-200"
									>
										<span>{item.quantity}</span>
										<span className="lowercase">{item.unit}</span>
									</button>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Delete Button */}
				<button
					onClick={(e) => {
						e.stopPropagation();
						handleDelete();
					}}
					className="ml-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500"
					aria-label="Delete item"
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
						/>
					</svg>
				</button>
			</div>

			{/* Subtle gradient overlay on hover */}
			{!item.isCompleted && (
				<div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
			)}
		</div>
	);
}
