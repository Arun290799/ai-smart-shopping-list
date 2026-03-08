import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ItemCard } from "@/components/ItemCard";
import { ShoppingItem } from "@/types";
import { toggleItem, deleteItem, updateQuantity } from "@/features/items/itemsSlice";
import { mockUseAppDispatch, mockUseAppSelector } from "../mocks/store-hooks";

// Mock Redux store hooks
jest.mock("@/store/hooks", () => ({
	useAppDispatch: mockUseAppDispatch,
	useAppSelector: mockUseAppSelector,
}));

describe("ItemCard Component", () => {
	beforeEach(() => {
		mockUseAppDispatch.mockClear();
	});

	const mockItem: ShoppingItem = {
		id: "1",
		name: "Milk",
		quantity: 2,
		unit: "litre",
		isCompleted: false,
	};

	describe("Rendering Tests", () => {
		test("renders item details correctly", () => {
			render(<ItemCard item={mockItem} />);

			expect(screen.getByText("Milk")).toBeInTheDocument();
			expect(screen.getByText("2")).toBeInTheDocument();
			expect(screen.getByText("litre")).toBeInTheDocument();
		});

		test("renders checkbox unchecked for incomplete item", () => {
			render(<ItemCard item={mockItem} />);

			const checkbox = screen.getByRole("checkbox");
			expect(checkbox).not.toBeChecked();
		});

		test("toggles item completion when checkbox is clicked", async () => {
			const user = userEvent.setup();
			render(<ItemCard item={mockItem} />);

			const checkbox = screen.getByRole("checkbox");
			await user.click(checkbox);

			expect(mockUseAppDispatch).toHaveBeenCalledWith(toggleItem(mockItem.id));
			expect(checkbox).toBeChecked();
		});

		test("applies correct styling for completed items", () => {
			const completedItem = { ...mockItem, isCompleted: true };
			render(<ItemCard item={completedItem} />);

			const itemName = screen.getByText("Milk");
			expect(itemName).toHaveClass("line-through", "text-gray-400");
		});

		test("shows delete button on hover", () => {
			render(<ItemCard item={mockItem} />);

			const deleteButton = screen.getByLabelText("Delete item");
			expect(deleteButton).toBeInTheDocument();
			expect(deleteButton).toHaveClass("opacity-0");
		});
	});

	describe("Interaction Tests", () => {
		test("toggles item completion when checkbox is clicked", async () => {
			const user = userEvent.setup();
			render(<ItemCard item={mockItem} />);

			const checkbox = screen.getByRole("checkbox");
			await user.click(checkbox);

			expect(mockUseAppDispatch).toHaveBeenCalledWith({
				type: "items/toggleItem",
				payload: "1",
			});
		});

		test("toggles item completion when card is clicked (excluding buttons and inputs)", async () => {
			const user = userEvent.setup();
			render(<ItemCard item={mockItem} />);

			const card = screen.getByText("Milk").closest("div");
			expect(card).toBeInTheDocument();
			if (card) {
				await user.click(card);
			}

			expect(mockUseAppDispatch).toHaveBeenCalledWith({
				type: "items/toggleItem",
				payload: "1",
			});
		});

		test("deletes item when delete button is clicked", async () => {
			const user = userEvent.setup();
			render(<ItemCard item={mockItem} />);

			const deleteButton = screen.getByLabelText("Delete item");
			await user.click(deleteButton);

			expect(mockUseAppDispatch).toHaveBeenCalledWith(deleteItem(mockItem.id));
		});

		test("does not toggle item when clicking on delete button", async () => {
			const user = userEvent.setup();
			render(<ItemCard item={mockItem} />);

			const deleteButton = screen.getByLabelText("Delete item");
			await user.click(deleteButton);

			expect(mockUseAppDispatch).not.toHaveBeenCalledWith({
				type: "items/toggleItem",
				payload: "1",
			});
			expect(mockUseAppDispatch).toHaveBeenCalledWith(deleteItem(mockItem.id));
		});

		test("updates item quantity", async () => {
			const user = userEvent.setup();
			render(<ItemCard item={mockItem} />);

			const quantityButton = screen.getByRole("button", { name: /2 litre/i });
			await user.click(quantityButton);

			const quantityInput = screen.getByDisplayValue("2");
			await user.clear(quantityInput);
			await user.type(quantityInput, "3");

			await user.keyboard("{Enter}");

			expect(mockUseAppDispatch).toHaveBeenCalledWith(updateQuantity({ id: mockItem.id, quantity: 3 }));
		});
	});

	describe("Quantity Editing Tests", () => {
		test("enters edit mode when quantity is clicked", async () => {
			const user = userEvent.setup();
			render(<ItemCard item={mockItem} />);

			const quantityButton = screen.getByText("2").closest("button");
			await user.click(quantityButton!);

			expect(screen.getByDisplayValue("2")).toBeInTheDocument();
		});

		test("updates quantity when Enter key is pressed", async () => {
			const user = userEvent.setup();
			render(<ItemCard item={mockItem} />);

			// Enter edit mode
			const quantityButton = screen.getByText("2").closest("button");
			await user.click(quantityButton!);

			// Change quantity
			const quantityInput = screen.getByDisplayValue("2");
			await user.clear(quantityInput);
			await user.type(quantityInput, "3");

			// Press Enter
			await user.keyboard("{Enter}");

			expect(mockUseAppDispatch).toHaveBeenCalledWith({
				type: "items/updateQuantity",
				payload: { id: "1", quantity: 3 },
			});
		});

		test("updates quantity when input loses focus", async () => {
			const user = userEvent.setup();
			render(<ItemCard item={mockItem} />);

			// Enter edit mode
			const quantityButton = screen.getByText("2").closest("button");
			await user.click(quantityButton!);

			// Change quantity
			const quantityInput = screen.getByDisplayValue("2");
			await user.clear(quantityInput);
			await user.type(quantityInput, "3.5");

			// Blur the input
			quantityInput.blur();

			await waitFor(() => {
				expect(mockUseAppDispatch).toHaveBeenCalledWith({
					type: "items/updateQuantity",
					payload: { id: "1", quantity: 3.5 },
				});
			});
		});

		test("cancels edit when Escape key is pressed", async () => {
			const user = userEvent.setup();
			render(<ItemCard item={mockItem} />);

			// Enter edit mode
			const quantityButton = screen.getByText("2").closest("button");
			await user.click(quantityButton!);

			// Change quantity
			const quantityInput = screen.getByDisplayValue("2");
			await user.clear(quantityInput);
			await user.type(quantityInput, "3");

			// Press Escape
			await user.keyboard("{Escape}");

			// Should exit edit mode without dispatching
			expect(screen.getByText("2")).toBeInTheDocument();
			expect(mockUseAppDispatch).not.toHaveBeenCalledWith({
				type: "items/updateQuantity",
				payload: { id: "1", quantity: 3 },
			});
		});

		test("does not update quantity with invalid input", async () => {
			const user = userEvent.setup();
			render(<ItemCard item={mockItem} />);

			// Enter edit mode
			const quantityButton = screen.getByText("2").closest("button");
			await user.click(quantityButton!);

			// Change quantity to invalid value
			const quantityInput = screen.getByDisplayValue("2");
			await user.clear(quantityInput);
			await user.type(quantityInput, "abc");

			// Press Enter
			await user.keyboard("{Enter}");

			// Should not dispatch update
			expect(mockUseAppDispatch).not.toHaveBeenCalledWith({
				type: "items/updateQuantity",
				payload: expect.any(Object),
			});
		});

		test("does not update quantity with zero or negative value", async () => {
			const user = userEvent.setup();
			render(<ItemCard item={mockItem} />);

			// Enter edit mode
			const quantityButton = screen.getByText("2").closest("button");
			await user.click(quantityButton!);

			// Change quantity to zero
			const quantityInput = screen.getByDisplayValue("2");
			await user.clear(quantityInput);
			await user.type(quantityInput, "0");

			// Press Enter
			await user.keyboard("{Enter}");

			// Should not dispatch update
			expect(mockUseAppDispatch).not.toHaveBeenCalledWith({
				type: "items/updateQuantity",
				payload: expect.any(Object),
			});
		});
	});

	describe("Accessibility Tests", () => {
		test("has proper ARIA labels", () => {
			render(<ItemCard item={mockItem} />);

			const deleteButton = screen.getByLabelText("Delete item");
			expect(deleteButton).toBeInTheDocument();

			const checkbox = screen.getByRole("checkbox");
			expect(checkbox).toBeInTheDocument();
		});

		test("supports keyboard navigation", async () => {
			const user = userEvent.setup();
			render(<ItemCard item={mockItem} />);

			const checkbox = screen.getByRole("checkbox");
			checkbox.focus();
			expect(checkbox).toHaveFocus();

			await user.keyboard("{Enter}");
			expect(mockUseAppDispatch).toHaveBeenCalledWith({
				type: "items/toggleItem",
				payload: "1",
			});
		});
	});

	describe("Edge Cases", () => {
		test("handles decimal quantities correctly", () => {
			const itemWithDecimal = { ...mockItem, quantity: 2.5 };
			render(<ItemCard item={itemWithDecimal} />);

			expect(screen.getByText("2.5")).toBeInTheDocument();
		});

		test("handles very long item names", () => {
			const longNameItem = {
				...mockItem,
				name: "Very long item name that might cause layout issues",
			};
			render(<ItemCard item={longNameItem} />);

			expect(screen.getByText(longNameItem.name)).toBeInTheDocument();
		});

		test("handles different units correctly", () => {
			const itemWithKg = { ...mockItem, unit: "kg" as const };
			render(<ItemCard item={itemWithKg} />);

			expect(screen.getByText("kg")).toBeInTheDocument();
		});
	});
});
