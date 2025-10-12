# MoodLift User Service - Deployment Guide

## 🚀 Quick Start

The build process has been fixed and optimized for cross-platform deployment.

### Local Development

```bash
npm install
npm run dev
```

### Production Build

```bash
npm run build
```

This will:

1. Clean the `dist` directory
2. Bundle the application using esbuild
3. Create a production-ready `package.json`
4. Generate source maps for debugging

### Deployment Options

#### Option 1: Deploy to Render/Heroku/Similar PaaS

1. Run `npm run deploy` to prepare files
2. Push to your git repository
3. The platform will automatically run `npm run build` and `npm start`

#### Option 2: Docker Deployment

```bash
# Build Docker image
npm run docker:build

# Run Docker container
npm run docker:run
```

#### Option 3: Manual Server Deployment

1. Run `npm run build` locally
2. Copy the `dist` directory to your server
3. Run `npm install --production` in the dist directory
4. Start with `node index.js`

## 🔧 Build Configuration

The build process:

- Uses esbuild for fast bundling
- Excludes external dependencies (they're installed separately)
- Creates ES modules compatible output
- Includes source maps for debugging
- Cross-platform compatible (Windows/Linux/macOS)

## 🐛 Troubleshooting

### Previous Error Fixed

The "Syntax error: end of file unexpected (expecting 'then')" was caused by Windows-specific shell commands in package.json scripts. This has been replaced with Node.js-based cross-platform scripts.

### Environment Variables

Make sure to set these environment variables in your deployment platform:

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - JWT refresh token secret
- `NODE_ENV` - Set to "production"
- `USER_SERVICE_PORT` - Port number (default: 3001)

## 📁 File Structure After Build

```
dist/
├── index.js          # Bundled application
├── index.js.map      # Source map
└── package.json      # Production dependencies only
```

The built application is completely self-contained and ready for deployment.
