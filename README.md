# AttackedAI Frontend

A modern React frontend for the AttackedAI briefing analysis platform, featuring advanced video analysis, AI-powered insights, and comprehensive reporting capabilities.

## Features

### 📊 Analysis Capabilities
- **Multi-format Support**: Upload video files or provide URLs for analysis
- **Real-time Processing**: Live job status tracking with progress indicators  
- **Advanced Scoring**: Content, delivery, and impact assessment with composite scoring
- **AI Insights**: Speaker identification, sentiment analysis, market impact, and improvement suggestions
- **Risk Detection**: Automated identification of risk factors and highlights

### 🎨 User Experience
- **Modern UI**: Clean, responsive design with dark/light mode support
- **Interactive Visualizations**: Radar charts, score badges, and progress indicators
- **Advanced Filtering**: Search, filter, and sort briefings by multiple criteria
- **Detailed Analysis**: Slice-level transcript analysis with thumbnails and metrics
- **Export Capabilities**: Download reports and export analysis data

### 🔧 Technical Features
- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** for responsive styling
- **React Router** for navigation
- **Recharts** for data visualizations
- **Lucide React** for icons

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- AttackedAI backend service running

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd attackedai-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env file
echo "VITE_API_BASE_URL=http://localhost:8000" > .env
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
npm run preview
```

## Configuration

### Environment Variables

- `VITE_API_BASE_URL` - Backend API base URL (default: `http://localhost:8000`)

### Runtime Configuration

The API base URL can also be configured at runtime through the Settings page, allowing for flexible deployment scenarios.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout with navigation
│   ├── ScoreBadge.tsx  # Score display component
│   ├── ScoreRadarChart.tsx # Radar chart visualization
│   └── ...
├── pages/              # Main application pages
│   ├── Dashboard.tsx   # Overview and statistics
│   ├── Upload.tsx      # File/URL upload interface
│   ├── Briefings.tsx   # Briefing list and filtering
│   ├── BriefingDetails.tsx # Detailed analysis view
│   ├── Slices.tsx      # Slice-level analysis
│   ├── Settings.tsx    # Configuration options
│   └── About.tsx       # System information
├── api/                # API client functions
│   └── client.ts       # Backend integration
├── hooks/              # Custom React hooks
│   ├── useTheme.ts     # Theme management
│   └── useJobPolling.ts # Job status polling
├── types/              # TypeScript type definitions
│   └── api.ts          # API response types
└── App.tsx             # Main application component
```

## Key Pages

### 📊 Dashboard (`/`)
- Overview statistics and recent briefings
- Quick upload functionality
- Score visualizations and trends

### 📤 Upload (`/upload`)
- File upload with drag & drop support
- URL input for remote video processing
- Real-time job status with progress tracking

### 📋 Briefings (`/briefings`)
- Comprehensive briefing list with search and filtering
- Score-based sorting and date range filtering  
- Grid view with score badges and metadata

### 📄 Briefing Details (`/briefings/:id`)
- Complete analysis results and scoring breakdown
- AI insights including sentiment and market impact
- Downloadable PDF reports and highlights
- Volatility tracking and risk assessment

### 🔍 Slices (`/briefings/:id/slices`)
- Detailed slice-by-slice analysis
- Transcript search and time-based filtering
- Thumbnail galleries and metric visualization
- Export capabilities for analysis data

### ⚙️ Settings (`/settings`)
- API endpoint configuration
- Theme preferences (light/dark mode)
- Connection status monitoring

### ℹ️ About (`/about`)
- System information and health status
- Feature overview and technology stack
- Backend connectivity monitoring

## API Integration

The frontend integrates with the AttackedAI FastAPI backend through a comprehensive client library:

### Endpoints
- `POST /v1/jobs` - Submit video files or URLs for processing
- `GET /v1/jobs/{id}` - Poll job status and progress
- `GET /v1/briefings` - List all briefings with metadata
- `GET /v1/briefings/{id}` - Get detailed briefing analysis
- `GET /v1/briefings/{id}/slices` - Get slice-level data
- `GET /v1/briefings/{id}/report` - Download PDF report
- `GET /v1/health` - Backend health check

### Error Handling
Comprehensive error handling with user-friendly messages and retry mechanisms throughout the application.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Organization

- **Components**: Reusable UI components with consistent styling
- **Pages**: Route-specific page components
- **Hooks**: Custom React hooks for shared logic
- **Types**: TypeScript definitions for API responses
- **API**: Centralized backend communication

### Styling Guidelines

- Uses Tailwind CSS utility classes
- Consistent color system with semantic naming
- Responsive design with mobile-first approach  
- Dark mode support throughout
- Accessible design patterns

## Deployment

### Environment Setup

Ensure the following environment variables are configured for production:

```bash
VITE_API_BASE_URL=https://your-backend-api.com
```

### Build Process

```bash
npm run build
```

The built files will be in the `dist/` directory and can be served by any static file server.

## Contributing

1. Follow the existing code style and patterns
2. Add TypeScript types for new functionality
3. Include proper error handling
4. Test responsive design across devices
5. Ensure accessibility compliance

## License

This project is part of the AttackedAI platform. See the main repository for licensing information.