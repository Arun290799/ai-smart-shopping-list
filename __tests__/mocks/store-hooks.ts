// Mock store hooks for testing
export const mockDispatch = jest.fn();

export const mockUseAppDispatch = jest.fn(() => mockDispatch);
export const mockUseAppSelector = jest.fn() as jest.MockedFunction<() => any>;
