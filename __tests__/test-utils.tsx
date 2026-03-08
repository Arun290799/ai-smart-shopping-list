import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { itemsSlice } from "@/features/items/itemsSlice";

// Create a test store with the items slice
const createTestStore = (initialState: { items?: { items: any[] } } = {}) => {
	return configureStore({
		reducer: {
			items: itemsSlice.reducer,
		},
		preloadedState: {
			items: {
				items: [],
				...initialState.items,
			},
		},
	});
};

// Custom render function that includes Redux Provider
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
	initialState?: {
		items?: {
			items: any[];
		};
	};
	store?: any;
}

function customRender(
	ui: React.ReactElement,
	{ initialState = {}, store = createTestStore(initialState), ...renderOptions }: CustomRenderOptions = {},
) {
	function Wrapper({ children }: { children: React.ReactNode }) {
		return <Provider store={store}>{children}</Provider>;
	}

	return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything from testing-library
export * from "@testing-library/react";
export { customRender as render };
export { createTestStore };

// Simple test to ensure test files run
describe("Test Utils", () => {
	test("customRender works correctly", () => {
		const { container } = customRender(<div>Test</div>);
		expect(container).toBeInTheDocument();
	});
});
