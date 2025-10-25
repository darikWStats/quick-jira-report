# Quick Jira Report

A web application for generating Jira sprint reports with a clean, modular Node.js architecture.

## Features

- Generate sprint reports from Jira API
- Modern Material-UI (MUI v7) interface with React
- Real-time form validation and error handling
- Beautiful, responsive design with Material Design principles
- Local storage for remembering user preferences (excluding sensitive data)
- Modular code structure with separation of concerns
- RESTful API backend
- Professional-grade UI components and theming

## Project Structure

```
quick-jira-report/
├── server.js                 # Express server entry point
├── package.json              # Project dependencies and scripts
├── routes/
│   └── api.js               # API routes
├── services/
│   └── jiraService.js       # Jira API integration service
├── public/                  # Static files served by Express
│   ├── index.html          # Main HTML file with Material-UI setup
│   ├── css/
│   │   └── styles.css      # Legacy application styles
│   └── js/                 # Client-side JavaScript modules
│       ├── mui-app.js      # Material-UI React application (main UI)
│       ├── app.js          # Legacy vanilla JS application
│       ├── api.js          # API service for backend communication
│       ├── storage.js      # localStorage utility
│       ├── validation.js   # Form validation utilities
│       └── reportFormatter.js # Report formatting utilities
├── example_response.json    # Sample Jira API response
└── postman-test-script.js  # Postman testing script
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

Or start the production server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Usage

1. Open the application in your browser
2. Fill in your Jira credentials:
   - Jira Host (e.g., https://yourcompany.atlassian.net)
   - Email (your Atlassian account email)
   - Jira Token (create one at https://id.atlassian.com/manage-profile/security/api-tokens)
   - Board ID (numeric ID of your Jira board)
   - Sprint ID (numeric ID of the sprint)
3. Check "Remember me" to save non-sensitive data locally
4. Click "Generate Report" to fetch and display the sprint report

## API Endpoints

- `GET /api/health` - Health check endpoint
- `POST /api/sprint-report` - Generate sprint report

## Security Features

- Helmet.js for security headers
- CORS protection
- Input validation
- Sensitive data (API tokens) not stored locally
- CSP headers configured

## Development

The project uses a modern, modular architecture:

- **Backend**: Express.js server with separate route and service layers
- **Frontend**: React with Material-UI v7 components and modern design system
- **UI Framework**: Material-UI (MUI) with custom theming and responsive design
- **State Management**: React hooks for local state management
- **Styling**: Material Design principles with emotion-based styling
- **Storage**: localStorage utility for non-sensitive data persistence
- **Security**: CSP headers and proper event handling

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run build` - Build assets (placeholder for future build process)
