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

// Write content to a file
function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content);
  log(`Created/Updated file: ${filePath}`, colors.green);
}

// Main deployment process
async function deploy() {
  try {
    log('🚀 Starting direct GitHub Pages deployment process...', colors.magenta);
    
    // Step 1: Build the React app
    log('Building project...', colors.blue);
    exec('GENERATE_SOURCEMAP=false npm run build');
    
    // Step 2: Ensure build folder exists
    if (!fs.existsSync('build')) {
      throw new Error('Build folder does not exist!');
    }
    
    // Step 3: Make sure .nojekyll file exists
    writeFile(path.join('build', '.nojekyll'), '');
    
    // Step 4: Fix paths in the index.html file
    log('Fixing paths in HTML files...', colors.blue);
    const htmlFiles = ['index.html', '404.html'].filter(
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
    
    // Step A: Direct Git commands to push to gh-pages branch
    log('Setting up direct Git deployment...', colors.magenta);
    
    // Step 5: Create a temporary directory for the gh-pages branch
    const tempDir = path.join(__dirname, '../.gh-pages-temp');
    if (fs.existsSync(tempDir)) {
      log('Cleaning existing temp directory...', colors.yellow);
      exec(`rm -rf ${tempDir}`);
    }
    
    // Step 6: Create the temporary directory
    fs.mkdirSync(tempDir, { recursive: true });
    
    // Step 7: Copy the build folder to the temporary directory
    log('Copying build files to temp directory...', colors.blue);
    exec(`cp -R ${path.join(__dirname, '../build/*')} ${tempDir}`);
    
    // Step 8: Initialize a Git repository in the temporary directory
    log('Initializing Git repository in temp directory...', colors.blue);
    process.chdir(tempDir);
    exec('git init');
    exec('git config user.name "GitHub Actions Bot"');
    exec('git config user.email "actions@github.com"');
    
    // Step 9: Add all files and commit
    log('Committing files...', colors.blue);
    exec('git add .');
    exec('git commit -m "Deploy to GitHub Pages"');
    
    // Step 10: Force push to the gh-pages branch
    log('Pushing to gh-pages branch...', colors.magenta);
    exec('git push -f https://github.com/Subhra1432/Disaster-Alert-System.git master:gh-pages');
    
    // Step 11: Clean up
    log('Cleaning up...', colors.yellow);
    process.chdir(path.join(__dirname, '..'));
    exec(`rm -rf ${tempDir}`);
    
    log('\n✅ Deployment completed successfully!', colors.green);
    log('Your site should be available at: https://Subhra1432.github.io/Disaster-Alert-System/');
    log('\nNote: It may take a few minutes for the changes to be visible online.');
    
  } catch (error) {
    log(`\n❌ Deployment failed: ${error.message}`, colors.red);
    process.exit(1);
  }
}

// Start deployment
deploy(); 