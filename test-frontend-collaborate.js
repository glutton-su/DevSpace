#!/usr/bin/env node

/**
 * Test script to verify the frontend Collaborate page functionality
 */

const puppeteer = require('puppeteer');

async function testCollaboratePage() {
  console.log('🧪 Testing Collaborate Page Frontend...\n');
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: null,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Listen for console messages
    page.on('console', msg => {
      const type = msg.type();
      if (type === 'error') {
        console.log(`❌ Browser Error: ${msg.text()}`);
      } else if (type === 'warning') {
        console.log(`⚠️  Browser Warning: ${msg.text()}`);
      } else {
        console.log(`📝 Browser Log: ${msg.text()}`);
      }
    });
    
    // Listen for page errors
    page.on('pageerror', error => {
      console.log(`❌ Page Error: ${error.message}`);
    });
    
    console.log('1. Navigating to login page...');
    await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle0' });
    
    // Quick login (assuming we have test credentials)
    console.log('2. Attempting to login...');
    await page.type('input[type="email"]', 'test@example.com');
    await page.type('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    console.log('3. Navigating to Collaborate page...');
    await page.goto('http://localhost:5174/collaborate', { waitUntil: 'networkidle0' });
    
    // Wait for the page to load
    await page.waitForTimeout(3000);
    
    // Check if snippets are loaded
    const snippetsContainer = await page.$('.grid');
    const loadingSpinner = await page.$('[data-testid="loading-spinner"]');
    
    if (loadingSpinner) {
      console.log('⏳ Loading spinner is still visible');
    } else if (snippetsContainer) {
      console.log('✅ Snippets container found');
      
      const snippetCards = await page.$$('.snippet-card');
      console.log(`📊 Found ${snippetCards.length} snippet cards`);
    } else {
      console.log('❌ No snippets container or loading state found');
    }
    
    // Check for specific errors
    const hasError = await page.evaluate(() => {
      return document.body.textContent.includes('Error') || 
             document.body.textContent.includes('Failed');
    });
    
    if (hasError) {
      console.log('❌ Error text found on page');
    } else {
      console.log('✅ No error text found');
    }
    
    console.log('\n🎯 Test completed. Check browser for visual inspection.');
    
    // Keep browser open for manual inspection
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
testCollaboratePage();
