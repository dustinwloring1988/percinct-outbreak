# Precinct Outbreak - Zombie Survival

A 2D top-down zombie shooter inspired by Black Ops Zombies. Survive the night in a police station overrun by the undead.

## Features

- Intense zombie survival gameplay
- Top-down perspective with smooth character movement
- Wave-based combat system
- Interactive minimap
- Game statistics tracking
- Customizable settings (volume, difficulty, etc.)
- Multiple game screens (menu, game, help, settings, stats)

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) 16.0.3
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom animations
- **UI Components**: Radix UI primitives with custom styling
- **Icons**: Lucide React
- **State Management**: React hooks
- **Analytics**: Vercel Analytics
- **Game Architecture**: Custom React-based game engine

## Dependencies

This project uses several key libraries:

- `react` & `react-dom` - Core UI library
- `@radix-ui/react-*` - Accessible UI components
- `lucide-react` - Icon library
- `tailwindcss` - Styling framework
- `recharts` - Data visualization
- `zod` - Schema validation
- And many more (see `package.json` for full list)

## Getting Started

### Prerequisites

- Node.js (version compatible with Next.js 16)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/dusti/percinct-outbreak.git
```

2. Navigate to the project directory:
```bash
cd percinct-outbreak
```

3. Install dependencies:
```bash
npm install
```

### Running the Development Server

1. Start the development server:
```bash
npm run dev
```

2. Open your browser and visit [http://localhost:3000](http://localhost:3000) to play the game

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the production application
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check for code issues

## Project Structure

```
├── app/                 # Next.js 13+ App Router
│   ├── layout.tsx       # Root layout with metadata
│   ├── page.tsx         # Main game page
│   └── globals.css      # Global styles
├── components/          # React components
│   ├── game/            # Game-specific components
│   │   ├── game-canvas.tsx      # Main game canvas
│   │   ├── game-hud.tsx         # Game heads-up display
│   │   ├── main-menu.tsx        # Main menu interface
│   │   ├── pause-menu.tsx       # In-game pause menu
│   │   ├── minimap.tsx          # Interactive minimap
│   │   ├── settings-screen.tsx  # Settings interface
│   │   └── ...                  # Other game screens
│   └── ui/              # Reusable UI components
├── lib/                 # Utility functions and types
└── public/              # Static assets
```

## Game Screens

The game features multiple screens accessible through the main navigation:

- **Main Menu**: Start, settings, help, and statistics
- **Game Screen**: Core gameplay area
- **Help Screen**: Game instructions and tips
- **Settings Screen**: Audio, difficulty, and UI preferences
- **Stats Screen**: Performance statistics and achievements
- **Pause Menu**: In-game pause functionality
- **Game Over Screen**: Results after game completion

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the Black Ops Zombies mode
- Built with the Next.js App Router
- UI components from Radix UI
- Icons from Lucide React
- Analytics by Vercel