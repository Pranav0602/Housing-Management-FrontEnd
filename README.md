<<<<<<< HEAD
# Housing-Management-FrontEnd
=======
# Society Management System - Vite Frontend

This is the Vite-based frontend for the Society Management System. It provides a modern, fast development experience with features like instant server start and hot module replacement.

## Features

- React with Vite for fast development
- Material UI for component library
- JWT authentication
- Role-based access control
- WebSocket for real-time notifications
- Form validation with Formik and Yup
- Responsive design with light/dark theme support

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- Backend API running on http://localhost:8080

## Installation

1. Clone the repository
2. Navigate to the vite-frontend directory:
   ```
   cd society-management-system/vite-frontend
   ```
3. Install dependencies:
   ```
   npm install
   ```

## Development

To start the development server:

```
npm run dev
```

This will start the Vite development server at http://localhost:3000 with hot module replacement.

## Building for Production

To build the application for production:

```
npm run build
```

This will create a `dist` directory with optimized production build.

## Previewing the Production Build

To preview the production build locally:

```
npm run preview
```

## Project Structure

- `src/` - Source code
  - `components/` - Reusable UI components
  - `context/` - React context providers
  - `pages/` - Page components
    - `admin/` - Admin-specific pages
    - `resident/` - Resident-specific pages
    - `guard/` - Guard-specific pages
  - `services/` - API services
  - `App.jsx` - Main application component
  - `main.jsx` - Application entry point

## Key Differences from Create React App

1. **Faster Development Experience**:
   - Vite provides significantly faster startup times
   - Hot Module Replacement (HMR) is more efficient

2. **Build Configuration**:
   - Uses Rollup under the hood instead of webpack
   - Optimized production builds with better code splitting

3. **Import Aliases**:
   - Uses `@/` alias for imports from the src directory

4. **Development Server**:
   - Built-in proxy configuration for API requests
   - Native ESM-based dev server

## API Proxy Configuration

The development server is configured to proxy API requests to the backend:

- API requests (`/api/*`) are proxied to `http://localhost:8080`
- WebSocket connections (`/ws/*`) are proxied to `ws://localhost:8080`

This configuration is defined in `vite.config.js`.
>>>>>>> 9e96039 (first commit)
