import "@testing-library/jest-dom";
import "@testing-library/jest-dom/matchers";

// Mock Next.js router
jest.mock("next/navigation", () => ({
	useRouter: () => ({
		push: jest.fn(),
		replace: jest.fn(),
		prefetch: jest.fn(),
		back: jest.fn(),
		forward: jest.fn(),
		refresh: jest.fn(),
	}),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => "/",
}));

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: jest.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: jest.fn(), // deprecated
		removeListener: jest.fn(), // deprecated
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		dispatchEvent: jest.fn(),
	})),
});

// Mock Speech Recognition API
const mockSpeechRecognition = {
	continuous: true,
	interimResults: true,
	lang: "en-US",
	start: jest.fn(),
	stop: jest.fn(),
	onstart: null,
	onresult: null,
	onerror: null,
	onend: null,
};

Object.defineProperty(window, "SpeechRecognition", {
	writable: true,
	value: jest.fn(() => mockSpeechRecognition),
});

Object.defineProperty(window, "webkitSpeechRecognition", {
	writable: true,
	value: jest.fn(() => mockSpeechRecognition),
});

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
	getItem: jest.fn(),
	setItem: jest.fn(),
	removeItem: jest.fn(),
	clear: jest.fn(),
};
Object.defineProperty(window, "localStorage", {
	value: localStorageMock,
	writable: true,
});
global.localStorage = localStorageMock;

// Mock window.alert, window.confirm, and window.prompt
global.alert = jest.fn();
global.confirm = jest.fn(() => true);
global.prompt = jest.fn();
