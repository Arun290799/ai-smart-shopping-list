import {
	itemsSlice,
	addItems,
	toggleItem,
	deleteItem,
	updateQuantity,
	setItems,
	clearItems,
} from "@/features/items/itemsSlice";
import { ShoppingItem } from "@/types";

describe("itemsSlice", () => {
	const mockItem: ShoppingItem = {
		id: "1",
		name: "Milk",
		quantity: 2,
		unit: "litre",
		isCompleted: false,
	};

	const mockItem2: ShoppingItem = {
		id: "2",
		name: "Bread",
		quantity: 1,
		unit: "pcs",
		isCompleted: false,
	};

	describe("Initial State", () => {
		test("should return initial state", () => {
			const initialState = itemsSlice.reducer(undefined, { type: "unknown" });
			expect(initialState).toEqual({
				items: [],
			});
		});
	});

	describe("addItems action", () => {
		test("should add items to empty state", () => {
			const initialState = { items: [] };
			const action = addItems([mockItem]);
			const state = itemsSlice.reducer(initialState, action);

			expect(state.items).toHaveLength(1);
			expect(state.items[0]).toEqual(mockItem);
		});

		test("should add multiple items", () => {
			const initialState = { items: [] };
			const action = addItems([mockItem, mockItem2]);
			const state = itemsSlice.reducer(initialState, action);

			expect(state.items).toHaveLength(2);
			expect(state.items[0]).toEqual(mockItem);
			expect(state.items[1]).toEqual(mockItem2);
		});

		test("should not add duplicate items (same name and unit)", () => {
			const initialState = { items: [mockItem] };
			const duplicateItem = { ...mockItem, id: "3" };
			const action = addItems([duplicateItem]);
			const state = itemsSlice.reducer(initialState, action);

			expect(state.items).toHaveLength(1);
			expect(state.items[0]).toEqual(mockItem);
		});

		test("should add items with different units even if names are same", () => {
			const initialState = { items: [mockItem] };
			const sameNameDifferentUnit = {
				...mockItem,
				id: "3",
				unit: "ml" as const,
			};
			const action = addItems([sameNameDifferentUnit]);
			const state = itemsSlice.reducer(initialState, action);

			expect(state.items).toHaveLength(2);
		});

		test("should add items with different names even if units are same", () => {
			const initialState = { items: [mockItem] };
			const differentNameSameUnit = {
				...mockItem,
				id: "3",
				name: "Water",
			};
			const action = addItems([differentNameSameUnit]);
			const state = itemsSlice.reducer(initialState, action);

			expect(state.items).toHaveLength(2);
		});

		test("should handle case-insensitive duplicate detection", () => {
			const initialState = { items: [mockItem] };
			const caseInsensitiveDuplicate = {
				...mockItem,
				id: "3",
				name: "milk", // lowercase
			};
			const action = addItems([caseInsensitiveDuplicate]);
			const state = itemsSlice.reducer(initialState, action);

			expect(state.items).toHaveLength(1);
		});

		test("should add non-duplicate items when mixed with duplicates", () => {
			const initialState = { items: [mockItem] };
			const duplicateItem = { ...mockItem, id: "3" };
			const newItem = mockItem2;
			const action = addItems([duplicateItem, newItem]);
			const state = itemsSlice.reducer(initialState, action);

			expect(state.items).toHaveLength(2);
			expect(state.items).toContainEqual(mockItem);
			expect(state.items).toContainEqual(mockItem2);
		});
	});

	describe("toggleItem action", () => {
		test("should toggle incomplete item to completed", () => {
			const initialState = { items: [mockItem] };
			const action = toggleItem(mockItem.id);
			const state = itemsSlice.reducer(initialState, action);

			expect(state.items[0].isCompleted).toBe(true);
		});

		test("should toggle completed item to incomplete", () => {
			const completedItem = { ...mockItem, isCompleted: true };
			const initialState = { items: [completedItem] };
			const action = toggleItem(mockItem.id);
			const state = itemsSlice.reducer(initialState, action);

			expect(state.items[0].isCompleted).toBe(false);
		});

		test("should not affect other items when toggling one item", () => {
			const initialState = { items: [mockItem, mockItem2] };
			const action = toggleItem(mockItem.id);
			const state = itemsSlice.reducer(initialState, action);

			expect(state.items[0].isCompleted).toBe(true);
			expect(state.items[1].isCompleted).toBe(false);
		});

		test("should handle toggling non-existent item gracefully", () => {
			const initialState = { items: [mockItem] };
			const action = toggleItem("non-existent-id");
			const state = itemsSlice.reducer(initialState, action);

			expect(state.items).toEqual([mockItem]);
		});
	});

	describe("deleteItem action", () => {
		test("should delete existing item", () => {
			const initialState = { items: [mockItem, mockItem2] };
			const action = deleteItem(mockItem.id);
			const state = itemsSlice.reducer(initialState, action);

			expect(state.items).toHaveLength(1);
			expect(state.items[0]).toEqual(mockItem2);
		});

		test("should handle deleting non-existent item gracefully", () => {
			const initialState = { items: [mockItem] };
			const action = deleteItem("non-existent-id");
			const state = itemsSlice.reducer(initialState, action);

			expect(state.items).toEqual([mockItem]);
		});

		test("should delete last item", () => {
			const initialState = { items: [mockItem] };
			const action = deleteItem(mockItem.id);
			const state = itemsSlice.reducer(initialState, action);

			expect(state.items).toHaveLength(0);
		});

		test("should not affect other items when deleting one", () => {
			const initialState = { items: [mockItem, mockItem2] };
			const action = deleteItem(mockItem.id);
			const state = itemsSlice.reducer(initialState, action);

			expect(state.items).toHaveLength(1);
			expect(state.items[0].id).toBe(mockItem2.id);
		});
	});

	describe("updateQuantity action", () => {
		test("should update item quantity", () => {
			const initialState = { items: [mockItem] };
			const action = updateQuantity({ id: mockItem.id, quantity: 5 });
			const state = itemsSlice.reducer(initialState, action);

			expect(state.items[0].quantity).toBe(5);
		});

		test("should handle decimal quantities", () => {
			const initialState = { items: [mockItem] };
			const action = updateQuantity({ id: mockItem.id, quantity: 2.5 });
			const state = itemsSlice.reducer(initialState, action);

			expect(state.items[0].quantity).toBe(2.5);
		});

		test("should not affect other items when updating one", () => {
			const initialState = { items: [mockItem, mockItem2] };
			const action = updateQuantity({ id: mockItem.id, quantity: 10 });
			const state = itemsSlice.reducer(initialState, action);

			expect(state.items[0].quantity).toBe(10);
			expect(state.items[1].quantity).toBe(mockItem2.quantity);
		});

		test("should handle updating non-existent item gracefully", () => {
			const initialState = { items: [mockItem] };
			const action = updateQuantity({ id: "non-existent-id", quantity: 5 });
			const state = itemsSlice.reducer(initialState, action);

			expect(state.items).toEqual([mockItem]);
		});
	});

	describe("setItems action", () => {
		test("should set items to empty array", () => {
			const initialState = { items: [mockItem, mockItem2] };
			const action = setItems([]);
			const state = itemsSlice.reducer(initialState, action);

			expect(state.items).toHaveLength(0);
		});

		test("should replace all items with new items", () => {
			const initialState = { items: [mockItem] };
			const newItems = [mockItem2];
			const action = setItems(newItems);
			const state = itemsSlice.reducer(initialState, action);

			expect(state.items).toEqual(newItems);
		});

		test("should handle setting same items", () => {
			const initialState = { items: [mockItem] };
			const action = setItems([mockItem]);
			const state = itemsSlice.reducer(initialState, action);

			expect(state.items).toEqual([mockItem]);
		});
	});

	describe("clearItems action", () => {
		test("should clear all items", () => {
			const initialState = { items: [mockItem, mockItem2] };
			const action = clearItems();
			const state = itemsSlice.reducer(initialState, action);

			expect(state.items).toHaveLength(0);
		});

		test("should handle clearing empty state", () => {
			const initialState = { items: [] };
			const action = clearItems();
			const state = itemsSlice.reducer(initialState, action);

			expect(state.items).toHaveLength(0);
		});
	});

	describe("Complex Scenarios", () => {
		test("should handle multiple operations in sequence", () => {
			let state = itemsSlice.reducer(undefined, { type: "unknown" });

			// Add items
			state = itemsSlice.reducer(state, addItems([mockItem, mockItem2]));
			expect(state.items).toHaveLength(2);

			// Toggle first item
			state = itemsSlice.reducer(state, toggleItem(mockItem.id));
			expect(state.items[0].isCompleted).toBe(true);

			// Update quantity of second item
			state = itemsSlice.reducer(state, updateQuantity({ id: mockItem2.id, quantity: 5 }));
			expect(state.items[1].quantity).toBe(5);

			// Delete first item
			state = itemsSlice.reducer(state, deleteItem(mockItem.id));
			expect(state.items).toHaveLength(1);
			expect(state.items[0].id).toBe(mockItem2.id);
		});

		test("should handle adding duplicate after deletion", () => {
			let state = itemsSlice.reducer(undefined, { type: "unknown" });

			// Add item
			state = itemsSlice.reducer(state, addItems([mockItem]));
			expect(state.items).toHaveLength(1);

			// Delete item
			state = itemsSlice.reducer(state, deleteItem(mockItem.id));
			expect(state.items).toHaveLength(0);

			// Add item with same name and unit but different ID
			const sameItemDifferentId = { ...mockItem, id: "3" };
			state = itemsSlice.reducer(state, addItems([sameItemDifferentId]));
			expect(state.items).toHaveLength(1);
			expect(state.items[0].id).toBe("3");
		});

		test("should maintain immutability", () => {
			const initialState = { items: [mockItem] };
			const action = toggleItem(mockItem.id);
			const newState = itemsSlice.reducer(initialState, action);

			// Original state should not be mutated
			expect(initialState.items[0].isCompleted).toBe(false);
			expect(newState.items[0].isCompleted).toBe(true);
			expect(initialState).not.toBe(newState);
			expect(initialState.items).not.toBe(newState.items);
		});
	});

	describe("Action Creators", () => {
		test("should create correct action for addItems", () => {
			const action = addItems([mockItem]);
			expect(action).toEqual({
				type: "items/addItems",
				payload: [mockItem],
			});
		});

		test("should create correct action for toggleItem", () => {
			const action = toggleItem(mockItem.id);
			expect(action).toEqual({
				type: "items/toggleItem",
				payload: mockItem.id,
			});
		});

		test("should create correct action for deleteItem", () => {
			const action = deleteItem(mockItem.id);
			expect(action).toEqual({
				type: "items/deleteItem",
				payload: mockItem.id,
			});
		});

		test("should create correct action for updateQuantity", () => {
			const action = updateQuantity({ id: mockItem.id, quantity: 5 });
			expect(action).toEqual({
				type: "items/updateQuantity",
				payload: { id: mockItem.id, quantity: 5 },
			});
		});

		test("should create correct action for setItems", () => {
			const action = setItems([mockItem]);
			expect(action).toEqual({
				type: "items/setItems",
				payload: [mockItem],
			});
		});

		test("should create correct action for clearItems", () => {
			const action = clearItems();
			expect(action).toEqual({
				type: "items/clearItems",
			});
		});
	});
});
