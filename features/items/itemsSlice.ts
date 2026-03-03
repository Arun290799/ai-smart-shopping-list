import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ShoppingItem } from "@/types";

interface ItemsState {
	items: ShoppingItem[];
}

const initialState: ItemsState = {
	items: [],
};

const itemsSlice = createSlice({
	name: "items",
	initialState,
	reducers: {
		// Add new items to the list
		addItems: (state, action: PayloadAction<ShoppingItem[]>) => {
			// Prevent duplicates based on name and unit
			const newItems = action.payload.filter((newItem) => {
				const exists = state.items.some(
					(existingItem) =>
						existingItem.name.toLowerCase() === newItem.name.toLowerCase() &&
						existingItem.unit === newItem.unit,
				);
				return !exists;
			});
			state.items.push(...newItems);
		},

		// Toggle completion status of an item
		toggleItem: (state, action: PayloadAction<string>) => {
			const item = state.items.find((item) => item.id === action.payload);
			if (item) {
				item.isCompleted = !item.isCompleted;
			}
		},

		// Delete an item
		deleteItem: (state, action: PayloadAction<string>) => {
			state.items = state.items.filter((item) => item.id !== action.payload);
		},

		// Update item quantity
		updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
			const item = state.items.find((item) => item.id === action.payload.id);
			if (item) {
				item.quantity = action.payload.quantity;
			}
		},

		// Set all items (used for loading from localStorage or URL)
		setItems: (state, action: PayloadAction<ShoppingItem[]>) => {
			state.items = action.payload;
		},

		// Clear all items
		clearItems: (state) => {
			state.items = [];
		},
	},
});

export const { addItems, toggleItem, deleteItem, updateQuantity, setItems, clearItems } = itemsSlice.actions;
export { itemsSlice };
