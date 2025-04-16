#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Log with color
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Execute shell command and return output
function exec(command) {
  log(`\n> ${command}`, colors.cyan);
  return execSync(command, { stdio: 'inherit' });
}

// Create directory if it doesn't exist
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    log(`Created directory: ${directory}`, colors.green);
  }
}

// Main deployment process
async function deploy() {
  try {
    log('🚀 Starting GitHub Pages deployment process...', colors.magenta);
    
    // Clean build folder if it exists
    if (fs.existsSync('build')) {
      log('Cleaning previous build directory...', colors.yellow);
      exec('rm -rf build');
    }
    
    // Ensure special directories exist
    ensureDirectoryExists('public');
    ensureDirectoryExists('scripts');
    
    // Create build
    log('Building project...', colors.blue);
    exec('npm run build');
    
    // Create special files for GitHub Pages
    log('Creating special files for GitHub Pages...', colors.blue);
    
    // Ensure .nojekyll file exists (prevents GitHub Pages from processing with Jekyll)
    const nojekyllPath = path.join('build', '.nojekyll');
    fs.writeFileSync(nojekyllPath, '');
    log('Created .nojekyll file', colors.green);
    
    // Deploy to GitHub Pages
    log('Deploying to GitHub Pages...', colors.magenta);
    exec('npx gh-pages -d build');
    
    log('\n✅ Deployment completed successfully!', colors.green);
    log('Your site should be available at: https://Subhra1432.github.io/Disaster-Alert-System/');
    
    // Watch for online status
    log('\nYou can verify your deployment status at:');
    log('https://github.com/Subhra1432/Disaster-Alert-System/actions', colors.blue);
    log('\nNote: It may take a few minutes for the site to be available online.');
    
  } catch (error) {
    log(`\n❌ Deployment failed: ${error.message}`, colors.red);
    process.exit(1);
  }
}

// Start deployment
deploy(); 