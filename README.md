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

### 💻 **Technology**
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

3. **Start the application:**

**Single Instance (Recommended):**
```bash
# Build and serve complete application on one port
npm start
# Access at: http://localhost:3000
```

**Development Mode (Optional - for active development):**
```bash
# Terminal 1: Frontend development server (Vite)
npm run dev              # http://localhost:5173

# Terminal 2: Backend API server (Express)  
npm run dev:server       # http://localhost:3000
```

**Application URLs:**
- **Production/Single Instance**: `http://localhost:3000` (complete app)
- **Development Frontend**: `http://localhost:5173` (Vite dev server)  
- **Development Backend**: `http://localhost:3000` (Express API only)

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

## Scripts

- `npm start` - Build and start production server
- `npm run dev` - Start Vite development server (frontend)
- `npm run dev:server` - Start Express server with nodemon (backend)
- `npm run build` - Build React application for production
- `npm run preview` - Preview production build locally
- `npm run serve` - Build and serve production version
