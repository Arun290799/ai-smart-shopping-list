# Shopping List App

A smart grocery & multi-category shopping list web application built with Next.js 14, TypeScript, Redux Toolkit, and Tailwind CSS.

## Features

- **Natural Language Input**: Type items like "2 litres milk, 5kg rice, baby diapers 40 pieces"
- **Auto-categorization**: Items are automatically categorized using keyword mapping
- **Smart Parsing**: Rule-based parser extracts quantities and units automatically
- **Local Storage**: Data persists automatically in browser storage
- **Share Lists**: Generate shareable links with encoded list data
- **Responsive Design**: Mobile-first UI with Tailwind CSS
- **Real-time Updates**: Toggle completion, edit quantities, delete items

## Categories

- Grocery (rice, wheat, flour, sugar, salt, oil, spices, etc.)
- Dairy (milk, cheese, yogurt, curd, cream, paneer, etc.)
- Baby (diapers, baby products, formula, wipes, etc.)
- Medical (medicine, tablets, syrup, ointment, etc.)
- Electrical (bulb, wire, switch, battery, charger, etc.)
- General (soap, shampoo, toothpaste, tissue, etc.)
- Kirana (tea, coffee, biscuits, snacks, cold drinks, etc.)

## Supported Units

- Weight: kg, g
- Volume: litre, ml
- Pieces: pcs, packets, boxes, bottles

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Type items in natural language in the textarea
2. Click "Add Items" to parse and add them to your list
3. Items are automatically categorized and grouped
4. Toggle completion status, edit quantities, or delete items
5. Use "Share List" to generate a shareable link
6. Data is automatically saved to localStorage

## Project Structure

```
shopping-list/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ItemCard.tsx
│   ├── ItemList.tsx
│   └── TextInput.tsx
├── features/
│   └── items/
│       └── itemsSlice.ts
├── store/
│   ├── hooks.ts
│   └── store.ts
├── types/
│   └── index.ts
├── utils/
│   └── parseInput.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## Technologies Used

- **Next.js 14+**: React framework with App Router
- **TypeScript**: Type-safe development
- **Redux Toolkit**: State management
- **Tailwind CSS**: Utility-first CSS framework
- **UUID**: Unique identifier generation

## Build for Production

```bash
npm run build
npm start
```

## License

MIT License
