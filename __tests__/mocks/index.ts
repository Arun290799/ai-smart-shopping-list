import { ShoppingItem } from '@/types'

export const mockItems: ShoppingItem[] = [
  {
    id: '1',
    name: 'Milk',
    quantity: 2,
    unit: 'litre',
    isCompleted: false,
  },
  {
    id: '2',
    name: 'Bread',
    quantity: 1,
    unit: 'pcs',
    isCompleted: true,
  },
  {
    id: '3',
    name: 'Eggs',
    quantity: 12,
    unit: 'pcs',
    isCompleted: false,
  },
  {
    id: '4',
    name: 'Rice',
    quantity: 5,
    unit: 'kg',
    isCompleted: false,
  },
  {
    id: '5',
    name: 'Oil',
    quantity: 1.5,
    unit: 'litre',
    isCompleted: true,
  },
]

export const mockApiResponses = {
  // Parse API responses
  parseSuccess: (items: ShoppingItem[]) => ({
    ok: true,
    status: 200,
    json: async () => ({ items }),
  }),

  parseError: (message: string) => ({
    ok: false,
    status: 400,
    json: async () => ({ error: message }),
  }),

  parseEmpty: () => ({
    ok: true,
    status: 200,
    json: async () => ({ items: [] }),
  }),

  parseWithWarning: (items: ShoppingItem[], warning: string) => ({
    ok: true,
    status: 200,
    json: async () => ({ items, warning }),
  }),

  // Share API responses
  shareCreateSuccess: (shareId: string) => ({
    ok: true,
    status: 200,
    json: async () => ({ shareId }),
  }),

  shareCreateError: (message: string) => ({
    ok: false,
    status: 400,
    json: async () => ({ error: message }),
  }),

  shareLoadSuccess: (items: ShoppingItem[], isExpiringSoon = false, hoursRemaining = 24) => ({
    ok: true,
    status: 200,
    json: async () => ({ 
      items, 
      isExpiringSoon, 
      hoursRemaining 
    }),
  }),

  shareLoadExpired: () => ({
    ok: false,
    status: 410,
    json: async () => ({ error: 'List has expired' }),
  }),

  shareLoadNotFound: () => ({
    ok: false,
    status: 404,
    json: async () => ({ error: 'List not found' }),
  }),

  shareUpdateSuccess: () => ({
    ok: true,
    status: 200,
    json: async () => ({ success: true }),
  }),

  shareUpdateError: (message: string) => ({
    ok: false,
    status: 400,
    json: async () => ({ error: message }),
  }),

  // Network errors
  networkError: () => Promise.reject(new Error('Network error')),
  timeoutError: () => new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Request timeout')), 1000)
  ),
}

export const mockSpeechRecognition = {
  continuous: true,
  interimResults: true,
  lang: 'en-US',
  start: jest.fn(),
  stop: jest.fn(),
  onstart: null,
  onresult: null,
  onerror: null,
  onend: null,
}

export const createMockRecognitionResult = (transcript: string, isFinal = true) => ({
  resultIndex: 0,
  results: [
    {
      isFinal,
      0: { transcript },
    },
  ],
})

export const createMockRecognitionError = (error: string) => ({
  error,
})

export const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

export const mockClipboard = {
  writeText: jest.fn().mockResolvedValue(undefined),
  readText: jest.fn().mockResolvedValue(''),
}

export const setupMocks = () => {
  // Reset all mocks
  jest.clearAllMocks()

  // Setup fetch mock
  global.fetch = jest.fn()

  // Setup localStorage mock
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  })

  // Setup clipboard mock
  Object.defineProperty(navigator, 'clipboard', {
    value: mockClipboard,
    writable: true,
  })

  // Setup alert and confirm mocks
  global.alert = jest.fn()
  global.confirm = jest.fn(() => true)
  global.prompt = jest.fn()

  // Setup Speech Recognition mock
  const SpeechRecognitionMock = jest.fn(() => mockSpeechRecognition)
  Object.defineProperty(window, 'SpeechRecognition', {
    value: SpeechRecognitionMock,
    writable: true,
  })
  Object.defineProperty(window, 'webkitSpeechRecognition', {
    value: SpeechRecognitionMock,
    writable: true,
  })

  return {
    fetch: global.fetch as jest.Mock,
    localStorage: mockLocalStorage,
    clipboard: mockClipboard,
    alert: global.alert as jest.Mock,
    confirm: global.confirm as jest.Mock,
    prompt: global.prompt as jest.Mock,
    SpeechRecognition: SpeechRecognitionMock,
    speechRecognition: mockSpeechRecognition,
  }
}

export const cleanupMocks = () => {
  jest.restoreAllMocks()
}
