#!/usr/bin/env node

/**
 * Database initialization script for Disaster Alert System
 * 
 * This script helps initialize the database with sample data
 * for both SQLite and Firebase Firestore options.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
const envExists = fs.existsSync(envPath);

console.log(`${colors.bright}${colors.blue}╔════════════════════════════════════════════════╗${colors.reset}`);
console.log(`${colors.bright}${colors.blue}║     Disaster Alert System - DB Setup Tool      ║${colors.reset}`);
console.log(`${colors.bright}${colors.blue}╚════════════════════════════════════════════════╝${colors.reset}`);
console.log('');

// Main function to run the script
async function main() {
  console.log(`${colors.cyan}This tool will help you set up your database configuration.${colors.reset}\n`);
  
  // Get user preference for database type
  const dbType = await askQuestion(
    `${colors.yellow}Which database would you like to use?${colors.reset}\n` +
    `1) ${colors.green}SQLite${colors.reset} (local browser database, no setup required)\n` +
    `2) ${colors.magenta}Firebase${colors.reset} (cloud database, requires Firebase account)\n` +
    `3) ${colors.cyan}Auto${colors.reset} (try Firebase first, fallback to SQLite)\n` +
    `Enter choice (1-3): `,
    val => {
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 1 || num > 3) {
        throw new Error('Please enter a number between 1 and 3');
      }
      return num;
    }
  );
  
  let useFirebase = 'false';
  let preferredDb = 'sqlite';
  
  switch(dbType) {
    case 1:
      preferredDb = 'sqlite';
      useFirebase = 'false';
      break;
    case 2:
      preferredDb = 'firebase';
      useFirebase = 'true';
      break;
    case 3:
      preferredDb = 'auto';
      useFirebase = 'true';
      break;
  }
  
  // Firebase setup if chosen
  let firebaseConfig = {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: ''
  };
  
  if (dbType === 2 || dbType === 3) {
    console.log(`\n${colors.magenta}Firebase configuration:${colors.reset}`);
    console.log(`${colors.dim}You'll need your Firebase project credentials.${colors.reset}`);
    console.log(`${colors.dim}Find them in your Firebase console under Project settings > General > Your apps > SDK setup.${colors.reset}\n`);
    
    // Ask for Firebase credentials
    for (const key of Object.keys(firebaseConfig)) {
      let formattedKey = key.replace(/([A-Z])/g, ' $1').toLowerCase();
      formattedKey = formattedKey.charAt(0).toUpperCase() + formattedKey.slice(1);
      
      let description = '';
      switch(key) {
        case 'apiKey': 
          description = '(looks like "AIzaSyC...")';
          break;
        case 'authDomain':
          description = '(looks like "your-project.firebaseapp.com")';
          break;
        case 'projectId':
          description = '(looks like "your-project-id")';
          break;
      }
      
      firebaseConfig[key] = await askQuestion(
        `${colors.yellow}${formattedKey}${colors.reset} ${colors.dim}${description}${colors.reset}: `
      );
    }
  }
  
  // Create or update .env file
  let envContent = '';
  
  if (envExists) {
    // Read existing .env file
    const existingEnv = fs.readFileSync(envPath, 'utf8');
    
    // Update values
    envContent = existingEnv
      .replace(/REACT_APP_USE_FIREBASE=.*/, `REACT_APP_USE_FIREBASE=${useFirebase}`)
      .replace(/REACT_APP_PREFERRED_DB=.*/, `REACT_APP_PREFERRED_DB=${preferredDb}`);
    
    if (dbType === 2 || dbType === 3) {
      // Update Firebase values
      Object.entries(firebaseConfig).forEach(([key, value]) => {
        const envKey = `REACT_APP_FIREBASE_${key.toUpperCase()}`;
        const regex = new RegExp(`${envKey}=.*`);
        if (envContent.match(regex)) {
          envContent = envContent.replace(regex, `${envKey}=${value}`);
        } else {
          envContent += `\n${envKey}=${value}`;
        }
      });
    }
  } else {
    // Create new .env file
    envContent = `# Firebase Configuration\nREACT_APP_USE_FIREBASE=${useFirebase}\n\n`;
    
    if (dbType === 2 || dbType === 3) {
      Object.entries(firebaseConfig).forEach(([key, value]) => {
        envContent += `REACT_APP_FIREBASE_${key.toUpperCase()}=${value}\n`;
      });
    } else {
      envContent += `# Set to 'true' and fill in these values to use Firebase\n`;
      Object.keys(firebaseConfig).forEach(key => {
        envContent += `# REACT_APP_FIREBASE_${key.toUpperCase()}=your_${key}\n`;
      });
    }
    
    envContent += `\n# Database Configuration\n`;
    envContent += `# Options: 'firebase', 'sqlite', 'auto'\n`;
    envContent += `# 'auto' will try Firebase first, then fall back to SQLite if Firebase is not configured\n`;
    envContent += `REACT_APP_PREFERRED_DB=${preferredDb}\n`;
  }
  
  // Write to .env file
  fs.writeFileSync(envPath, envContent);
  
  console.log(`\n${colors.green}✅ Database configuration saved to .env file${colors.reset}`);
  
  if (dbType === 1) {
    console.log(`\n${colors.green}SQLite configuration complete!${colors.reset}`);
    console.log(`${colors.dim}The application will use an in-memory SQLite database.${colors.reset}`);
    console.log(`${colors.dim}No additional setup required.${colors.reset}`);
  } else {
    console.log(`\n${colors.magenta}Firebase configuration complete!${colors.reset}`);
    console.log(`${colors.dim}Make sure your Firebase project has Firestore enabled.${colors.reset}`);
  }
  
  console.log(`\n${colors.bright}${colors.blue}╔════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}║           Setup Complete! Next Steps:           ║${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}╚════════════════════════════════════════════════╝${colors.reset}`);
  console.log(`${colors.green}1. Run ${colors.bright}npm start${colors.reset}${colors.green} to start the application${colors.reset}`);
  console.log(`${colors.green}2. See ${colors.bright}database-readme.md${colors.reset}${colors.green} for more details on the database implementation${colors.reset}`);
  
  rl.close();
}

// Helper function to ask questions
function askQuestion(question, validator = val => val) {
  return new Promise(resolve => {
    const ask = () => {
      rl.question(question, answer => {
        try {
          const value = validator(answer);
          resolve(value);
        } catch (err) {
          console.log(`${colors.red}Error: ${err.message}${colors.reset}`);
          ask();
        }
      });
    };
    ask();
  });
}

// Run the script
main().catch(err => {
  console.error(`${colors.red}Error: ${err.message}${colors.reset}`);
  process.exit(1);
}); 