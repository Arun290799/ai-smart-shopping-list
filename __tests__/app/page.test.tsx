import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "@/app/page";
import { ShoppingItem } from "@/types";

// Type definition for mocked localStorage
interface MockLocalStorage {
	getItem: jest.MockedFunction<(key: string) => string | null>;
	setItem: jest.MockedFunction<(key: string, value: string) => void>;
	removeItem: jest.MockedFunction<(key: string) => void>;
	clear: jest.MockedFunction<() => void>;
}

// Helper function to mock clipboard
const mockClipboard = (writeText: jest.Mock) => {
	Object.defineProperty(navigator, "clipboard", {
		value: { writeText },
		writable: true,
		configurable: true,
	});
};

// Mock fetch
const mockFetch = global.fetch as jest.Mock;

describe("Home Page Integration Tests", () => {
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

	beforeEach(() => {
		mockFetch.mockClear();
		// Reset localStorage mock
		const localStorageMock = global.localStorage as unknown as MockLocalStorage;
		localStorageMock.clear();
		localStorageMock.getItem.mockClear();
		localStorageMock.setItem.mockClear();
		localStorageMock.removeItem.mockClear();
	});

	describe("Initial Loading", () => {
		test("shows loading state initially", () => {
			// Mock fetch to delay response
			mockFetch.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

			render(<Home />);

			expect(screen.getByText("Setting up your smart list…")).toBeInTheDocument();
			expect(screen.getByText("Loading your shopping list")).toBeInTheDocument();
		});

		test("creates new share ID when none exists", async () => {
			const newShareId = "test-share-id";
			mockFetch
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({ shareId: newShareId }),
				})
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({ items: [] }),
				});

			const localStorageMock = global.localStorage as unknown as MockLocalStorage;
			localStorageMock.getItem.mockReturnValue(null);

			render(<Home />);

			await waitFor(() => {
				expect(mockFetch).toHaveBeenCalledWith("/api/share", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ items: [] }),
				});
			});

			expect(localStorageMock.setItem).toHaveBeenCalledWith("currentShareId", newShareId);
		});

		test("loads existing items when share ID exists", async () => {
			const existingShareId = "existing-share-id";
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ items: mockItems }),
			});

			const localStorageMock = global.localStorage as unknown as MockLocalStorage;
			localStorageMock.getItem.mockReturnValue(existingShareId);

			render(<Home />);

			await waitFor(() => {
				expect(mockFetch).toHaveBeenCalledWith(`/api/share?id=${existingShareId}`);
			});

			expect(screen.getByText("Milk")).toBeInTheDocument();
			expect(screen.getByText("Bread")).toBeInTheDocument();
		});

		test("handles expired list by creating new one", async () => {
			const expiredShareId = "expired-share-id";
			const newShareId = "new-share-id";
			mockFetch
				.mockResolvedValueOnce({
					status: 410,
					json: async () => ({}),
				})
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({ shareId: newShareId }),
				});

			const localStorageMock = global.localStorage as unknown as MockLocalStorage;
			localStorageMock.getItem.mockReturnValue(expiredShareId);

			render(<Home />);

			await waitFor(() => {
				expect(localStorageMock.removeItem).toHaveBeenCalledWith("currentShareId");
				expect(localStorageMock.setItem).toHaveBeenCalledWith("currentShareId", newShareId);
			});
		});
	});

	describe("Loaded State Interactions", () => {
		beforeEach(async () => {
			// Setup successful load
			mockFetch
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({ shareId: "test-share-id" }),
				})
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({ items: mockItems }),
				});

			const localStorageMock = global.localStorage as unknown as MockLocalStorage;
			localStorageMock.getItem.mockReturnValue(null);
		});

		test("renders main content after loading", async () => {
			render(<Home />);

			await waitFor(() => {
				expect(screen.getByText("Shopping List")).toBeInTheDocument();
				expect(screen.getByText("Add items using natural language")).toBeInTheDocument();
			});
		});

		test("shows action buttons when items exist", async () => {
			render(<Home />);

			await waitFor(() => {
				expect(screen.getByRole("button", { name: "Share List" })).toBeInTheDocument();
				expect(screen.getByRole("button", { name: "Clear All" })).toBeInTheDocument();
			});
		});

		test("hides action buttons when no items", async () => {
			mockFetch
				.mockReset()
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({ shareId: "test-share-id" }),
				})
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({ items: [] }),
				});

			render(<Home />);

			await waitFor(() => {
				expect(screen.queryByRole("button", { name: "Share List" })).not.toBeInTheDocument();
				expect(screen.queryByRole("button", { name: "Clear All" })).not.toBeInTheDocument();
			});
		});
	});

	describe("Share Functionality", () => {
		beforeEach(async () => {
			// Setup successful load
			mockFetch
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({ shareId: "test-share-id" }),
				})
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({ items: mockItems }),
				});

			const localStorageMock = global.localStorage as unknown as MockLocalStorage;
			localStorageMock.getItem.mockReturnValue(null);
		});

		test("copies share link to clipboard", async () => {
			const user = userEvent.setup();

			// Mock clipboard to succeed
			mockClipboard(jest.fn().mockResolvedValue(undefined));

			render(<Home />);

			await waitFor(() => {
				expect(screen.getByRole("button", { name: "Share List" })).toBeInTheDocument();
			});

			const shareButton = screen.getByRole("button", { name: "Share List" });
			await user.click(shareButton);

			expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining("test-share-id"));
			expect(global.alert).toHaveBeenCalledWith("Share link copied to clipboard!");
		});

		test("shows prompt when clipboard fails", async () => {
			const user = userEvent.setup();

			// Mock clipboard to fail
			mockClipboard(jest.fn().mockRejectedValue(new Error("Clipboard failed")));
			global.prompt = jest.fn();

			render(<Home />);

			await waitFor(() => {
				expect(screen.getByRole("button", { name: "Share List" })).toBeInTheDocument();
			});

			const shareButton = screen.getByRole("button", { name: "Share List" });
			await user.click(shareButton);

			expect(global.prompt).toHaveBeenCalledWith("Share this link:", expect.stringContaining("test-share-id"));
		});

		test("clears all items when confirmed", async () => {
			const user = userEvent.setup();
			global.confirm = jest.fn(() => true);

			render(<Home />);

			await waitFor(() => {
				expect(screen.getByRole("button", { name: "Clear All" })).toBeInTheDocument();
			});

			const clearButton = screen.getByRole("button", { name: "Clear All" });
			await user.click(clearButton);

			await waitFor(() => {
				expect(screen.getByText("No items yet")).toBeInTheDocument();
			});
		});

		test("does not clear items when cancelled", async () => {
			const user = userEvent.setup();
			global.confirm = jest.fn(() => false);

			render(<Home />);

			await waitFor(() => {
				expect(screen.getByRole("button", { name: "Clear All" })).toBeInTheDocument();
			});

			const clearButton = screen.getByRole("button", { name: "Clear All" });
			await user.click(clearButton);

			await waitFor(() => {
				expect(screen.getByText("Milk")).toBeInTheDocument();
			});
		});
	});

	describe("Auto-save Functionality", () => {
		test("saves items to database when they change", async () => {
			// Mock the complete sequence: POST -> GET -> PUT
			mockFetch
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({ shareId: "test-share-id" }),
				})
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({ items: mockItems }),
				})
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({ success: true }),
				});

			render(<Home />);

			await waitFor(() => {
				expect(screen.getByText("Milk")).toBeInTheDocument();
			});

			// Wait for auto-save debounce (longer than 1000ms)
			await waitFor(
				() => {
					expect(mockFetch).toHaveBeenCalledWith("/api/share", {
						method: "PUT",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							shareId: "test-share-id",
							items: mockItems,
						}),
					});
				},
				{ timeout: 2000 }, // Wait longer than debounce time
			);
		});
	});

	describe("Error Handling", () => {
		test("handles network errors gracefully", async () => {
			// Mock network error
			mockFetch.mockRejectedValue(new Error("Network error"));

			render(<Home />);

			await waitFor(() => {
				expect(screen.getByText("Shopping List")).toBeInTheDocument();
			});
		});

		test("handles API errors gracefully", async () => {
			// Mock API error response
			mockFetch.mockResolvedValue({
				ok: false,
				status: 500,
				json: async () => ({ error: "Server error" }),
			});

			render(<Home />);

			await waitFor(() => {
				expect(screen.getByText("Shopping List")).toBeInTheDocument();
			});
		});
	});

	describe("Component Integration", () => {
		beforeEach(async () => {
			mockFetch
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({ shareId: "test-share-id" }),
				})
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({ items: [] }),
				});
		});

		test("renders all child components", async () => {
			render(<Home />);

			await waitFor(() => {
				expect(screen.getByPlaceholderText(/Enter items like/)).toBeInTheDocument();
				expect(screen.getByText("No items yet")).toBeInTheDocument();
			});
		});

		test("shows tips section", async () => {
			render(<Home />);

			await waitFor(() => {
				expect(screen.getByText("Tips")).toBeInTheDocument();
				expect(screen.getByText(/Type or speak your items/)).toBeInTheDocument();
			});
		});
	});

	describe("Accessibility", () => {
		beforeEach(async () => {
			mockFetch
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({ shareId: "test-share-id" }),
				})
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({ items: mockItems }),
				});
		});

		test("has proper heading hierarchy", async () => {
			render(<Home />);

			await waitFor(() => {
				const mainHeading = screen.getByRole("heading", { level: 1 });
				expect(mainHeading).toHaveTextContent("Shopping List");
			});
		});

		test("buttons have accessible names", async () => {
			render(<Home />);

			await waitFor(() => {
				expect(screen.getByRole("button", { name: "Share List" })).toBeInTheDocument();
				expect(screen.getByRole("button", { name: "Clear All" })).toBeInTheDocument();
			});
		});
	});
});
