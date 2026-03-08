import React from "react";
import { render, screen, fireEvent, waitFor } from "../test-utils";
import userEvent from "@testing-library/user-event";
import { ItemList } from "@/components/ItemList";
import { ShoppingItem } from "@/types";

const mockItems: ShoppingItem[] = [
	{
		id: "1",
		name: "Milk",
		quantity: 2,
		unit: "litre",
		isCompleted: false,
	},
	{
		id: "2",
		name: "Bread",
		quantity: 1,
		unit: "pcs",
		isCompleted: true,
	},
];

describe("ItemList Component", () => {
	describe("Rendering Tests", () => {
		test("renders empty state when no items", () => {
			render(<ItemList />);

			expect(screen.getByText("No items yet")).toBeInTheDocument();
			expect(screen.getByText("Add some items to get started!")).toBeInTheDocument();
		});

		test("renders items count when items exist", () => {
			render(<ItemList />, {
				initialState: {
					items: { items: mockItems },
				},
			});

			// Look for the item count badge specifically (it has specific styling)
			const itemsLabel = screen.getByText("Items");
			const badge = itemsLabel.previousElementSibling as HTMLElement;

			expect(badge).toHaveTextContent("2");
			expect(badge).toHaveClass("bg-gray-200", "text-gray-700", "px-3", "py-1", "rounded-full", "text-sm");
			expect(screen.getByText("Items")).toBeInTheDocument();
		});

		test("renders all items when items exist", () => {
			render(<ItemList />, {
				initialState: {
					items: { items: mockItems },
				},
			});

			// Check that we have the right number of ItemCards
			const itemCards = screen.getAllByRole("checkbox");
			expect(itemCards).toHaveLength(2);
		});

		test("renders ItemCard for each item", () => {
			render(<ItemList />, {
				initialState: {
					items: { items: mockItems },
				},
			});

			const itemCards = screen.getAllByRole("checkbox");
			expect(itemCards).toHaveLength(2);
		});
	});

	describe("State Management Tests", () => {
		test("displays correct item count", () => {
			const singleItem = [mockItems[0]];
			render(<ItemList />, {
				initialState: {
					items: { items: singleItem },
				},
			});

			expect(screen.getByText("1")).toBeInTheDocument();
			expect(screen.getByText("Items")).toBeInTheDocument();
		});

		test("updates when items change", () => {
			// Initial render with empty items
			render(<ItemList />, {
				initialState: {
					items: { items: [] },
				},
			});

			expect(screen.getByText("No items yet")).toBeInTheDocument();

			// Re-render with items
			render(<ItemList />, {
				initialState: {
					items: { items: mockItems },
				},
			});

			expect(screen.getByText("Milk")).toBeInTheDocument();
		});
	});

	describe("Accessibility Tests", () => {
		test("has proper heading structure", async () => {
			render(<ItemList />, {
				initialState: {
					items: { items: mockItems },
				},
			});

			// Get the heading container that has all the classes
			const headingContainer = screen.getByText("Items").parentElement;
			expect(headingContainer).toHaveClass("text-lg", "font-semibold", "text-gray-800", "flex", "items-center");

			// Also verify the individual text elements
			expect(screen.getByText("Items")).toBeInTheDocument();
		});

		test("item count is properly announced", async () => {
			render(<ItemList />, {
				initialState: {
					items: { items: mockItems },
				},
			});

			// Get the item count badge specifically
			const itemsLabel = screen.getByText("Items");
			const badge = itemsLabel.previousElementSibling as HTMLElement;

			expect(badge).toHaveTextContent("2");
			// Verify it has the correct classes for the badge
			expect(badge).toHaveClass("bg-gray-200", "text-gray-700", "px-3", "py-1", "rounded-full", "text-sm");

			// Also verify the heading is present
			const heading = screen.getByText("Items");
			expect(heading).toBeInTheDocument();
		});
	});

	describe("Edge Cases", () => {
		test("handles large number of items", () => {
			const manyItems = Array.from({ length: 100 }, (_, i) => ({
				id: `${i}`,
				name: `Item ${i}`,
				quantity: 1,
				unit: "pcs" as const,
				isCompleted: false,
			}));

			render(<ItemList />, {
				initialState: {
					items: { items: manyItems },
				},
			});

			expect(screen.getByText("100")).toBeInTheDocument();
			expect(screen.getByText("Items")).toBeInTheDocument();
		});

		test("handles items with special characters in names", () => {
			const specialItems = [
				{
					id: "1",
					name: "Milk & Cheese",
					quantity: 1,
					unit: "pcs" as const,
					isCompleted: false,
				},
				{
					id: "2",
					name: 'Item with "quotes"',
					quantity: 2,
					unit: "kg" as const,
					isCompleted: false,
				},
			];

			render(<ItemList />, {
				initialState: {
					items: { items: specialItems },
				},
			});

			expect(screen.getByText("Milk & Cheese")).toBeInTheDocument();
			expect(screen.getByText('Item with "quotes"')).toBeInTheDocument();
		});

		test("handles items with very long names", () => {
			const longNameItem = [
				{
					id: "1",
					name: "This is a very long item name that might cause layout issues and should still render properly without breaking the design",
					quantity: 1,
					unit: "pcs" as const,
					isCompleted: false,
				},
			];

			render(<ItemList />, {
				initialState: {
					items: { items: longNameItem },
				},
			});

			expect(screen.getByText(longNameItem[0].name)).toBeInTheDocument();
		});

		test("handles all completed items", () => {
			const allCompletedItems = mockItems.map((item) => ({
				...item,
				isCompleted: true,
			}));

			render(<ItemList />, {
				initialState: {
					items: { items: allCompletedItems },
				},
			});

			// Check that we have the right number of ItemCards
			const itemCards = screen.getAllByRole("checkbox");
			expect(itemCards).toHaveLength(2);
		});

		test("renders ItemCard for each item", () => {
			render(<ItemList />, {
				initialState: {
					items: { items: mockItems },
				},
			});

			// Check that we have the right number of ItemCards
			const itemCards = screen.getAllByRole("checkbox");
			expect(itemCards).toHaveLength(2);
		});
	});
});
