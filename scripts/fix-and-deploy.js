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

// Write content to a file
function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content);
  log(`Created/Updated file: ${filePath}`, colors.green);
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
    
    // Create build
    log('Building project...', colors.blue);
    exec('GENERATE_SOURCEMAP=false npm run build');
    
    log('Creating special files for GitHub Pages...', colors.blue);
    
    // Create .nojekyll file (prevents GitHub Pages from processing with Jekyll)
    writeFile(path.join('build', '.nojekyll'), '');
    
    // Create a special variant of index.html in the root directory for direct access
    const indexHtmlContent = fs.readFileSync(path.join('build', 'index.html'), 'utf-8');
    
    // Simple 200.html file (for hosting providers that support it)
    writeFile(path.join('build', '200.html'), indexHtmlContent);
    
    // Copy our custom build-index.html to the build directory as index.html
    if (fs.existsSync('build-index.html')) {
      log('Using custom index.html for build...', colors.blue);
      // But first backup the original
      fs.copyFileSync(
        path.join('build', 'index.html'), 
        path.join('build', 'app.html')
      );
      fs.copyFileSync(
        'build-index.html', 
        path.join('build', 'index.html')
      );
    }
    
    // Fix paths in the index.html
    log('Fixing paths in HTML files...', colors.blue);
    const htmlFiles = ['index.html', 'app.html', '200.html', '404.html'].filter(
      file => fs.existsSync(path.join('build', file))
    );
    
    htmlFiles.forEach(file => {
      const filePath = path.join('build', file);
      let content = fs.readFileSync(filePath, 'utf-8');
      
      // Fix static file paths
      content = content.replace(/src="\//g, 'src="/Disaster-Alert-System/');
      content = content.replace(/href="\//g, 'href="/Disaster-Alert-System/');
      content = content.replace(/url\(\//g, 'url(/Disaster-Alert-System/');
      
      // Write the updated content
      fs.writeFileSync(filePath, content);
      log(`Fixed paths in ${file}`, colors.green);
    });
    
    // Deploy to GitHub Pages
    log('Deploying to GitHub Pages...', colors.magenta);
    exec('npx gh-pages -d build');
    
    log('\n✅ Deployment completed successfully!', colors.green);
    log('Your site should be available at: https://Subhra1432.github.io/Disaster-Alert-System/');
    
    // Additional recommendations
    log('\n📝 Additional steps you can try if the site still doesn\'t work:', colors.yellow);
    log('1. Visit https://Subhra1432.github.io/Disaster-Alert-System/test.html to verify GitHub Pages is serving static files');
    log('2. Check GitHub repository settings to ensure GitHub Pages is enabled for the gh-pages branch');
    log('3. Try visiting the site in an incognito/private window or clearing your browser cache');
    
  } catch (error) {
    log(`\n❌ Deployment failed: ${error.message}`, colors.red);
    process.exit(1);
  }
}

// Start deployment
deploy(); 