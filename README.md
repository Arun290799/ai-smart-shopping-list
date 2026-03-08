# AI-Powered Smart Shopping List

A modern, intelligent shopping list application with voice input, AI-powered parsing, and comprehensive content filtering. Built with Next.js 14, TypeScript, and cutting-edge web technologies.

## ✨ Key Features

### 🎤 **Voice Input & Speech Recognition**

- Click the microphone button to add items using your voice
- Real-time speech-to-text conversion
- Continuous listening for multiple items
- Visual feedback with recording indicators

### 🤖 **AI-Powered Natural Language Processing**

- Advanced LLM-powered parsing using Groq API
- Understands complex natural language inputs
- Extracts quantities, units, and items automatically
- Smart error handling and fallback mechanisms

### 🛡️ **Multi-Layer Content Filtering**

- **Client-side filtering**: Real-time content validation
- **Server-side protection**: Pre and post-LLM validation
- **Family-safe**: Blocks inappropriate, harmful, or dangerous content
- **Smart filtering**: Preserves legitimate items while removing problematic content

### 💰 **Price Support**

- Parse price information like "20 rs dal" or "₹100 oil"
- Multiple currency formats supported (₹, $, rs, rupees)
- Visual price display in item cards

### 📝 **Smart Input Processing**

- Natural language: "2 litres milk, 5kg rice, baby diapers 40 pieces"
- Multiple item separation (commas, natural pauses)
- Automatic quantity and unit extraction
- Duplicate detection and removal

### 🎨 **Modern User Interface**

- Responsive design for all devices
- Smooth animations and transitions
- Real-time status indicators
- Accessibility-focused design

### 💾 **Data Management**

- Automatic local storage persistence
- Shareable list generation
- Real-time updates and synchronization
- Export and import capabilities

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Groq API key (for AI parsing)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd shopping-list
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**
   Create a `.env.local` file in the root:

```env
GROQ_API_KEY=your_groq_api_key_here
```

4. **Run the development server**

```bash
npm run dev
```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### Voice Input

1. Click the microphone button next to the input field
2. Speak your shopping items naturally
3. Click the stop button when finished
4. Review and submit the parsed items

### Text Input

1. Type items in natural language format
2. Use commas or natural separation
3. Include quantities and units if desired
4. Click "Add Items" to process

### Examples

- `"2 kg rice, 1 litre milk, 5 packets biscuits"`
- `"₹100 oil, 20 rs dal, 3 pcs soap"`
- Voice: "Buy two kilograms of flour and one litre of milk"

### Managing Items

- **Toggle completion**: Click items or checkboxes
- **Edit quantities**: Click the quantity button
- **Delete items**: Hover and click the delete button
- **Clear all**: Use the clear button in the input area

## 🏗️ Architecture

### Frontend Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Redux Toolkit**: State management
- **Tailwind CSS**: Utility-first styling
- **Web Speech API**: Voice recognition

### Backend & AI

- **Groq API**: LLM-powered natural language processing
- **Zod**: Runtime type validation
- **Content Filtering**: Multi-layer safety system

### Data Flow

```
User Input → Client Filtering → API Validation → LLM Processing →
Post-LLM Filtering → Response → UI Update → Local Storage
```

## 🔧 Configuration

### Supported Units

- **Weight**: kg, g
- **Volume**: litre, ml
- **Pieces**: pcs, packets, boxes, bottles
- **Currency**: rupees, rs, ₹, $

### Content Filtering Rules

- Blocks: weapons, drugs, medical items, violence, adult content
- Preserves: legitimate grocery, household, personal care items
- Smart filtering with user feedback

### Browser Compatibility

- Chrome/Edge: Full voice support
- Safari: Voice support with permissions
- Firefox: Voice support with permissions
- Mobile: Responsive design optimized

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Environment Variables

```env
GROQ_API_KEY=your_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🌟 Advanced Features

### AI Processing

- Llama 3.1 model integration
- Temperature: 0 for consistent results
- Structured JSON output
- Error recovery and fallbacks

### Safety Features

- 4-layer content filtering
- Real-time validation
- User-friendly error messages
- Graceful degradation

### Performance

- Optimistic updates
- Debounced input handling
- Efficient state management
- Minimal re-renders

## 🔒 Security & Privacy

- **Client-side filtering**: Immediate content validation
- **Server-side validation**: API-level protection
- **No data persistence**: Items stored locally only
- **Secure API calls**: Environment variable protection
- **Content sanitization**: Input cleaning and validation

## 📱 Mobile Experience

- Touch-optimized interface
- Voice input support
- Responsive design
- Progressive enhancement
- Offline capability

## 🚀 Production Deployment

### Build Commands

```bash
npm run build
npm run start
```

### Deployment Platforms

- Vercel (recommended)
- Netlify
- AWS Amplify
- DigitalOcean

### Environment Setup

1. Set `GROQ_API_KEY` in production
2. Configure `NEXT_PUBLIC_APP_URL`
3. Enable HTTPS for voice API support
4. Set up proper CORS if needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🆘 Support

For issues, questions, or feature requests:

- Check the existing issues
- Create a new issue with detailed description
- Include browser and environment information

---

**Built with ❤️ using modern web technologies**
