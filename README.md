# AI-Powered Spreadsheet Web Application

A comprehensive AI-powered spreadsheet web application built with Next.js 14 Canary, TailwindCSS v3, and shadcn/ui. This application features an Excel-inspired interface with a virtualized data grid, formula support, and multiple specialized AI agents.

## Features

- Excel-inspired interface with ribbon toolbar, virtualized data grid, and status bar
- Comprehensive spreadsheet engine with formula support
- AI-powered assistance with specialized agents for different tasks
- Real-time visualization with Chart.js
- Native .xlsx import/export via SheetJS
- Offline functionality with IndexedDB
- Undo/redo functionality
- Keyboard shortcuts
- Light/dark theme support

## AI Capabilities

The application includes a powerful AI system with specialized agents:

- Formula Agent: Translates natural language into Excel formulas
- Data Cleaning Agent: Normalizes and deduplicates data
- Charting Agent: Creates and updates visualizations
- Formatting Agent: Applies styling and conditional formatting
- Template Agent: Generates prebuilt structures
- Query & Insight Agent: Analyzes data and provides insights
- File I/O Agent: Handles import/export operations
- Validator Agent: Ensures operation safety

## Technology Stack

- **Frontend Framework**: Next.js 14 Canary with TypeScript
- **Styling**: TailwindCSS v3 and shadcn/ui components
- **State Management**: Zustand
- **Data Persistence**: IndexedDB
- **File Handling**: SheetJS for Excel file import/export
- **Charting**: Chart.js/Recharts
- **Virtualization**: react-window

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-powered-spreadsheet.git
   cd ai-powered-spreadsheet
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
src/
├── app/                  # Next.js app directory
├── components/           # React components
│   ├── layout/           # Layout components (RibbonToolbar, StatusBar, AIPanel)
│   ├── spreadsheet/      # Spreadsheet components (Grid, Cell, etc.)
│   ├── ui/               # UI components (Button, Tabs, etc.)
│   └── charts/           # Chart components
├── lib/                  # Utility libraries
│   ├── spreadsheet/      # Spreadsheet engine
│   ├── formula/          # Formula parser and evaluator
│   ├── ai/               # AI system and agents
│   ├── storage/          # Data persistence
│   ├── commands/         # Command pattern for undo/redo
│   └── io/               # Import/export functionality
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
└── store/                # State management
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [SheetJS](https://sheetjs.com/)
- [Chart.js](https://www.chartjs.org/)
- [react-window](https://github.com/bvaughn/react-window)

