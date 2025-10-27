# Quick Jira Report

A modern web application for generating comprehensive Jira sprint reports with advanced analytics, productivity metrics, and velocity analysis.

## Features

### 📊 **Advanced Sprint Analytics**
- Comprehensive sprint report generation from Jira API
- Velocity analysis with historical trend tracking
- Productivity metrics and team performance analysis
- Sprint-by-sprint breakdown with dev days tracking
- Next sprint estimation based on historical data

### 🎯 **Sprint Health Insights**
- Scope discipline tracking (mid-sprint additions)
- Initial work completion vs. scope creep analysis
- Story points breakdown with visual indicators
- Issue tracking with categorized ticket details

### 💻 **Modern Technology Stack**
- **Frontend:** React 19.2.0 + TypeScript
- **UI Framework:** Material-UI (MUI) v7 with custom theming
- **Build Tool:** Vite 5.4.21 with hot module reloading
- **Backend:** Express.js with modular architecture
- **Development:** Full TypeScript support with modern tooling

### 🎨 **User Experience**
- Responsive Material Design interface
- Real-time form validation and error handling
- Copy-paste ready sprint summaries for presentations
- Excel/CSV export functionality
- Local storage for user preferences (non-sensitive data)

## Project Structure

```
quick-jira-report/
├── server.js                     # Express server entry point
├── package.json                  # Project dependencies and scripts
├── vite.config.js               # Vite configuration
├── routes/
│   └── api.js                   # API routes
├── services/
│   └── jiraService.js           # Jira API integration service
├── src/                         # Modern React + TypeScript source
│   ├── main.tsx                 # React application entry point
│   ├── index.html               # HTML template
│   ├── components/              # Modular React components
│   │   ├── JiraReportApp.tsx    # Main application orchestrator
│   │   ├── LoginForm.tsx        # Authentication form
│   │   ├── ConfigurationStatus.tsx # Environment configuration
│   │   ├── TabNavigation.tsx    # Tab navigation interface
│   │   ├── VelocityAnalysisDisplay.tsx # Velocity analysis system
│   │   ├── ProductivityAnalysis.tsx # Productivity metrics & estimation
│   │   ├── SprintBreakdownCards.tsx # Individual sprint cards
│   │   ├── SprintReportDisplay.tsx # Detailed sprint reports
│   │   └── ProjectBoardSelection.tsx # Board/project selection
│   ├── services/
│   │   └── api.ts              # API service with TypeScript interfaces
│   ├── utils/
│   │   ├── validation.ts       # Form validation utilities
│   │   └── storage.ts          # localStorage utility
│   └── theme/
│       └── theme.ts            # Material-UI theme configuration
├── docs/                        # API documentation
│   └── jira-velocity-api-options.ts # JIRA API reference
├── suggestions/                 # Enhancement suggestions
├── dist/                       # Built application (generated)
├── example_response.json       # Sample Jira API response
└── postman-test-script.js     # Postman testing script
```

## Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Environment setup:**
```bash
cp .env.example .env
# Edit .env with your configuration if needed
```

3. **Start development:**
```bash
# Frontend development server (Vite)
npm run dev

# Backend development server (separate terminal)
npm run dev:server
```

4. **Production build:**
```bash
# Build and serve production version
npm start
```

**Development URLs:**
- Frontend: `http://localhost:5173` (Vite dev server)
- Backend API: `http://localhost:3000` (Express server)

**Production URL:**
- Full application: `http://localhost:3000` (serves built frontend + API)

## Usage

### 🔑 **Initial Setup**
1. Open the application in your browser
2. Fill in your Jira credentials:
   - **Jira Host:** `https://yourcompany.atlassian.net`
   - **Email:** Your Atlassian account email
   - **API Token:** [Generate one here](https://id.atlassian.com/manage-profile/security/api-tokens)
   - **Board ID:** Numeric ID of your Jira board
3. Check "Remember me" to save non-sensitive data locally

### 📊 **Generate Reports**
1. **Velocity Analysis:** View historical sprint performance trends
2. **Sprint Reports:** Select specific sprints for detailed analysis
3. **Productivity Analysis:** Input dev days for capacity planning

### 📋 **Export & Share**
- **Copy Sprint Summary:** Presentation-ready format
- **Excel Export:** CSV data for spreadsheet analysis
- **Visual Insights:** Sprint health and scope discipline metrics

## API Endpoints

- `GET /api/health` - Health check endpoint
- `POST /api/sprint-report` - Generate sprint report

## Security Features

- Helmet.js for security headers
- CORS protection
- Input validation
- Sensitive data (API tokens) not stored locally
- CSP headers configured

## Architecture & Development

### 🏗️ **Modern Architecture**
- **Frontend:** React 19.2.0 + TypeScript with Vite build system
- **Backend:** Express.js with modular route/service separation
- **Component System:** 9 extracted, reusable TypeScript components
- **State Management:** React hooks with TypeScript interfaces
- **Styling:** Material-UI v7 with emotion-based custom theming

### 🔧 **Development Features**
- **Hot Module Reloading:** Instant updates during development
- **TypeScript:** Full type safety across frontend and API interfaces  
- **Modular Components:** Clean separation of concerns
- **API Documentation:** Comprehensive JIRA API reference in `/docs`
- **Security:** Helmet.js, CORS, CSP headers, input validation

### 📈 **Analytics Capabilities**
- **Velocity Tracking:** Historical sprint performance analysis
- **Productivity Metrics:** Dev days tracking and capacity planning
- **Scope Analysis:** Mid-sprint addition tracking and discipline metrics
- **Team Health:** Completion quality and sprint management insights

## Scripts

- `npm start` - Build and start production server
- `npm run dev` - Start Vite development server (frontend)
- `npm run dev:server` - Start Express server with nodemon (backend)
- `npm run build` - Build React application for production
- `npm run preview` - Preview production build locally
- `npm run serve` - Build and serve production version

## Component Architecture

The application features a modular component system with clear separation of concerns:

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| `JiraReportApp.tsx` | Main orchestrator | State management, API integration |
| `VelocityAnalysisDisplay.tsx` | Velocity analysis | Historical trends, team metrics |
| `ProductivityAnalysis.tsx` | Productivity metrics | Dev days, capacity planning |
| `SprintReportDisplay.tsx` | Detailed reports | Ticket analysis, export features |
| `SprintBreakdownCards.tsx` | Sprint cards | Individual sprint metrics |
| `LoginForm.tsx` | Authentication | Secure credential management |
| `ConfigurationStatus.tsx` | Environment status | Configuration validation |
| `TabNavigation.tsx` | Navigation | Clean tab interface |
| `ProjectBoardSelection.tsx` | Board selection | Project/board management |

**Architecture Transformation:** Evolved from monolithic structure to 9 focused, reusable components with clean separation of concerns.
