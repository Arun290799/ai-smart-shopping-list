import React from "react";
import { fireEvent, screen, render, waitFor } from "@testing-library/react";

import userEvent from "@testing-library/user-event";
import { TextInput } from "@/components/TextInput";
import { ShoppingItem } from "@/types";
import { addItems } from "@/features/items/itemsSlice";
import { mockUseAppDispatch, mockUseAppSelector } from "../mocks/store-hooks";

// Type definition for mocked localStorage
interface MockLocalStorage {
	getItem: jest.MockedFunction<(key: string) => string | null>;
	setItem: jest.MockedFunction<(key: string, value: string) => void>;
	removeItem: jest.MockedFunction<(key: string) => void>;
	clear: jest.MockedFunction<() => void>;
}

// Mock the Redux store actions
const mockDispatch = jest.fn();
jest.mock("@/store/hooks", () => ({
	useAppDispatch: () => mockDispatch,
}));

// Mock fetch
const mockFetch = global.fetch as jest.Mock;

describe("TextInput Component", () => {
	beforeEach(() => {
		mockUseAppDispatch.mockClear();
		mockFetch.mockClear();
	});

	describe("Rendering Tests", () => {
		test("renders textarea with correct placeholder", () => {
			render(<TextInput />);

			const textarea = screen.getByPlaceholderText(
				"Enter items like: 2 litres milk, 5kg rice, baby diapers 40 pieces or click the microphone to use voice input",
			);
			expect(textarea).toBeInTheDocument();
		});

		test("renders Add Items button", () => {
			render(<TextInput />);

			const addButton = screen.getByRole("button", { name: "Add Items" });
			expect(addButton).toBeInTheDocument();
		});

		test("renders microphone button", () => {
			render(<TextInput />);

			const micButton = screen.getByTitle("Start voice recording");
			expect(micButton).toBeInTheDocument();
		});

		test("Clear button is not visible when input is empty", () => {
			render(<TextInput />);

			const clearButton = screen.queryByRole("button", { name: "Clear" });
			expect(clearButton).not.toBeInTheDocument();
		});

		test("Clear button appears when input has text", async () => {
			const user = userEvent.setup();
			render(<TextInput />);

			const textarea = screen.getByPlaceholderText(/Enter items like/);
			await user.type(textarea, "milk");

			const clearButton = screen.getByRole("button", { name: "Clear" });
			expect(clearButton).toBeInTheDocument();
		});
	});

	describe("Form Submission Tests", () => {
		test("submits form and calls addItems", async () => {
			const user = userEvent.setup();
			const mockItem: ShoppingItem = {
				id: "1",
				name: "Milk",
				quantity: 2,
				unit: "litre",
				isCompleted: false,
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ items: [mockItem] }),
			});

			render(<TextInput />);
			const textarea = screen.getByPlaceholderText(/Enter items like/);

			const addButton = screen.getByRole("button", { name: "Add Items" });

			await user.type(textarea, "2 litres milk");
			await user.click(addButton);

			expect(mockDispatch).toHaveBeenCalledWith(addItems([mockItem]));
			expect(mockFetch).toHaveBeenCalledWith("/api/parse", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ input: "2 litres milk" }),
			});

			expect(textarea).toHaveValue("");
		});

		test("shows error message when API call fails", async () => {
			const user = userEvent.setup();
			mockFetch.mockResolvedValueOnce({
				ok: false,
				json: async () => ({ error: "Parse failed" }),
			});

			render(<TextInput />);

			const textarea = screen.getByPlaceholderText(/Enter items like/);
			await user.type(textarea, "milk");
			const addButton = screen.getByRole("button", { name: "Add Items" });
			await user.click(addButton);

			await waitFor(() => {
				expect(screen.getByText("No items could be parsed. Try a different format.")).toBeInTheDocument();
			});
		});

		test("does not submit when input is empty", async () => {
			render(<TextInput />);

			const addButton = screen.getByRole("button", { name: "Add Items" });
			expect(addButton).toBeDisabled();
		});

		test("shows loading state during submission", async () => {
			const user = userEvent.setup();
			mockFetch.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

			render(<TextInput />);

			const textarea = screen.getByPlaceholderText(/Enter items like/);
			await user.type(textarea, "milk");

			const addButton = screen.getByRole("button", { name: "Add Items" });
			await user.click(addButton);

			expect(screen.getByText("Parsing with AI...")).toBeInTheDocument();
			expect(addButton).toBeDisabled();
		});

		test("clears input when Clear button is clicked", async () => {
			const user = userEvent.setup();
			render(<TextInput />);

			const textarea = screen.getByPlaceholderText(/Enter items like/);
			await user.type(textarea, "milk");

			const clearButton = screen.getByRole("button", { name: "Clear" });
			await user.click(clearButton);

			expect(textarea).toHaveValue("");
		});
	});

	describe("Content Filtering Tests", () => {
		test("filters inappropriate content", async () => {
			const user = userEvent.setup();
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ items: [], warning: "Inappropriate content filtered" }),
			});

			render(<TextInput />);

			const textarea = screen.getByPlaceholderText(/Enter items like/);
			await user.type(textarea, "buy some weapons");

			const addButton = screen.getByRole("button", { name: "Add Items" });
			await user.click(addButton);

			await waitFor(() => {
				expect(screen.getByText(/Inappropriate content filtered/)).toBeInTheDocument();
			});
		});

		test("shows warning for filtered content but still processes", async () => {
			const user = userEvent.setup();
			const mockItems: ShoppingItem[] = [
				{
					id: "1",
					name: "Milk",
					quantity: 2,
					unit: "litre",
					isCompleted: false,
				},
			];

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ items: mockItems, warning: "Inappropriate content filtered" }),
			});

			render(<TextInput />);

			const textarea = screen.getByPlaceholderText(/Enter items like/);
			await user.type(textarea, "2 litres milk and some bad stuff");

			const addButton = screen.getByRole("button", { name: "Add Items" });
			await user.click(addButton);

			await waitFor(() => {
				expect(screen.getByText(/Inappropriate content filtered/)).toBeInTheDocument();
			});

			expect(mockDispatch).toHaveBeenCalledWith({
				type: "items/addItems",
				payload: mockItems,
			});
		});
	});

	// describe("Voice Recording Tests", () => {
	// 	let mockRecognition: any;

	// 	beforeEach(() => {
	// 		mockRecognition = {
	// 			continuous: true,
	// 			interimResults: true,
	// 			lang: "en-US",
	// 			start: jest.fn(),
	// 			stop: jest.fn(),
	// 			onstart: null,
	// 			onresult: null,
	// 			onerror: null,
	// 			onend: null,
	// 		};

	// 		// Mock SpeechRecognition constructor
	// 		const SpeechRecognitionMock = jest.fn(() => mockRecognition);
	// 		Object.defineProperty(window, "SpeechRecognition", {
	// 			writable: true,
	// 			value: SpeechRecognitionMock,
	// 		});
	// 		Object.defineProperty(window, "webkitSpeechRecognition", {
	// 			writable: true,
	// 			value: SpeechRecognitionMock,
	// 		});
	// 	});

	// 	test("starts voice recording when microphone button is clicked", async () => {
	// 		const user = userEvent.setup();
	// 		render(<TextInput />);

	// 		const micButton = screen.getByTitle("Start voice recording");
	// 		await user.click(micButton);

	// 		expect(mockRecognition.start).toHaveBeenCalled();
	// 		expect(screen.getByText("Recording... Speak now")).toBeInTheDocument();
	// 	});

	// 	test("stops voice recording when button is clicked again", async () => {
	// 		const user = userEvent.setup();
	// 		render(<TextInput />);

	// 		const micButton = screen.getByTitle("Start voice recording");
	// 		await user.click(micButton); // Start
	// 		await user.click(micButton); // Stop

	// 		expect(mockRecognition.stop).toHaveBeenCalled();
	// 	});

	// 	test("shows listening status when recognition starts", async () => {
	// 		const user = userEvent.setup();
	// 		render(<TextInput />);

	// 		const micButton = screen.getByTitle("Start voice recording");
	// 		await user.click(micButton);

	// 		// Simulate recognition starting
	// 		if (mockRecognition.onstart) {
	// 			mockRecognition.onstart();
	// 		}

	// 		expect(screen.getByText("Recording... Speak now")).toBeInTheDocument();
	// 	});

	// 	test("adds transcribed text to input", async () => {
	// 		const user = userEvent.setup();
	// 		render(<TextInput />);

	// 		const micButton = screen.getByTitle("Start voice recording");
	// 		await user.click(micButton);

	// 		// Simulate speech recognition result
	// 		if (mockRecognition.onresult) {
	// 			mockRecognition.onresult?.({
	// 				resultIndex: 0,
	// 				results: [
	// 					{
	// 						isFinal: true,
	// 						0: {
	// 							transcript: "milk",
	// 						},
	// 					},
	// 				],
	// 			});
	// 		}

	// 		const textarea = screen.getByPlaceholderText(/Enter items like/);
	// 		expect(textarea).toHaveValue("milk ");
	// 	});

	// 	test("filters inappropriate voice input", async () => {
	// 		const user = userEvent.setup();
	// 		render(<TextInput />);

	// 		const micButton = screen.getByTitle("Start voice recording");
	// 		await user.click(micButton);

	// 		// Simulate inappropriate speech recognition result
	// 		if (mockRecognition.onresult) {
	// 			mockRecognition.onresult?.({
	// 				resultIndex: 0,
	// 				results: [
	// 					{
	// 						isFinal: true,
	// 						0: {
	// 							transcript: "buy some weapons",
	// 						},
	// 					},
	// 				],
	// 			});
	// 		}

	// 		await waitFor(() => {
	// 			expect(screen.getByText(/Inappropriate content filtered/)).toBeInTheDocument();
	// 		});
	// 	});

	// 	test("shows error when speech recognition is not supported", async () => {
	// 		const user = userEvent.setup();

	// 		// Remove SpeechRecognition support
	// 		Object.defineProperty(window, "SpeechRecognition", {
	// 			writable: true,
	// 			value: undefined,
	// 		});
	// 		Object.defineProperty(window, "webkitSpeechRecognition", {
	// 			writable: true,
	// 			value: undefined,
	// 		});

	// 		render(<TextInput />);

	// 		const micButton = screen.getByRole("button", { name: /voice/i });
	// 		await user.click(micButton);

	// 		await waitFor(() => {
	// 			expect(screen.getByText("Speech recognition is not supported in your browser")).toBeInTheDocument();
	// 		});
	// 	});
	// });

	describe("Keyboard Interaction Tests", () => {
		test("submits form with Enter key in textarea", async () => {
			const user = userEvent.setup();
			const mockItems: ShoppingItem[] = [
				{
					id: "1",
					name: "Milk",
					quantity: 2,
					unit: "litre",
					isCompleted: false,
				},
			];

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ items: mockItems }),
			});

			render(<TextInput />);

			const textarea = screen.getByPlaceholderText(/Enter items like/);
			await user.type(textarea, "2 litres milk{enter}");

			await waitFor(() => {
				expect(mockFetch).toHaveBeenCalled();
				expect(mockDispatch).toHaveBeenCalled();
			});
		});

		test("disables buttons during loading", async () => {
			const user = userEvent.setup();
			mockFetch.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

			render(<TextInput />);

			const textarea = screen.getByPlaceholderText(/Enter items like/);
			await user.type(textarea, "milk");

			const addButton = screen.getByRole("button", { name: "Add Items" });
			await user.click(addButton);

			expect(addButton).toBeDisabled();

			const clearButton = screen.getByRole("button", { name: "Clear" });
			expect(clearButton).toBeDisabled();

			const micButton = screen.getByRole("button", { name: /record/i });
			expect(micButton).toBeDisabled();
		});
	});

	describe("Edge Cases", () => {
		test("handles very long input", async () => {
			const user = userEvent.setup();
			const longText = "milk ".repeat(1000);
			render(<TextInput />);
			const textarea = screen.getByPlaceholderText(/Enter items like/);
			fireEvent.change(textarea, { target: { value: longText } });
			expect(textarea).toHaveValue(longText);
		});
		test("handles network errors gracefully", async () => {
			const user = userEvent.setup();
			mockFetch.mockRejectedValueOnce(new Error("Network error"));
			render(<TextInput />);
			const textarea = screen.getByPlaceholderText(/Enter items like/);
			await user.type(textarea, "milk");
			const addButton = screen.getByRole("button", { name: "Add Items" });
			await user.click(addButton);
			await waitFor(() => {
				expect(screen.getByText("Failed to parse items")).toBeInTheDocument();
			});
		});
		test("handles empty response from API", async () => {
			const user = userEvent.setup();
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ items: [] }),
			});
			render(<TextInput />);
			const textarea = screen.getByPlaceholderText(/Enter items like/);
			await user.type(textarea, "milk");
			const addButton = screen.getByRole("button", { name: "Add Items" });
			await user.click(addButton);
			await waitFor(() => {
				expect(screen.getByText("No items could be parsed. Try a different format.")).toBeInTheDocument();
			});
		});
	});
});
