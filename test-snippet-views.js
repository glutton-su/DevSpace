const puppeteer = require('puppeteer');

async function testSnippetViews() {
  console.log('🚀 Starting snippet view testing...');
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    const baseUrl = 'http://localhost:3000';
    
    // Test pages that don't require authentication first
    console.log('\n📋 Testing public pages...');
    
    // Test Dashboard (public view)
    console.log('🏠 Testing Dashboard...');
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle0', timeout: 10000 });
    
    const dashboardTitle = await page.$eval('h1', el => el.textContent);
    console.log('Dashboard title:', dashboardTitle);
    
    // Check if snippets are loading
    try {
      await page.waitForSelector('[data-testid="snippet-card"], .text-gray-500', { timeout: 5000 });
      const snippetCards = await page.$$('[data-testid="snippet-card"]');
      console.log(`✅ Dashboard: Found ${snippetCards.length} snippet cards`);
    } catch (e) {
      const emptyMessage = await page.$('.text-gray-500');
      if (emptyMessage) {
        console.log('ℹ️  Dashboard: No snippets message displayed');
      } else {
        console.log('⚠️  Dashboard: No snippet cards or empty message found');
      }
    }
    
    // Test Projects page (public view)
    console.log('\n📁 Testing Projects page...');
    await page.goto(`${baseUrl}/projects`, { waitUntil: 'networkidle0', timeout: 10000 });
    
    const projectsTitle = await page.$eval('h1', el => el.textContent);
    console.log('Projects title:', projectsTitle);
    
    // Check filter tabs for unauthenticated user
    const filterButtons = await page.$$('button[class*="btn"]');
    console.log(`✅ Projects: Found ${filterButtons.length} filter buttons`);
    
    // Test Collaborate page
    console.log('\n🤝 Testing Collaborate page...');
    await page.goto(`${baseUrl}/collaborate`, { waitUntil: 'networkidle0', timeout: 10000 });
    
    const collaborateTitle = await page.$eval('h1', el => el.textContent);
    console.log('Collaborate title:', collaborateTitle);
    
    // Check for collaborative snippets
    try {
      await page.waitForSelector('[data-testid="snippet-card"], .text-gray-500', { timeout: 5000 });
      const collabSnippets = await page.$$('[data-testid="snippet-card"]');
      console.log(`✅ Collaborate: Found ${collabSnippets.length} collaborative snippets`);
    } catch (e) {
      console.log('ℹ️  Collaborate: No collaborative snippets found');
    }
    
    // Test public profile view
    console.log('\n👤 Testing Profile page...');
    await page.goto(`${baseUrl}/profile/testuser`, { waitUntil: 'networkidle0', timeout: 10000 });
    
    try {
      const profileHeading = await page.$eval('h1, h2', el => el.textContent);
      console.log('Profile heading:', profileHeading);
      console.log('✅ Profile page loaded successfully');
    } catch (e) {
      console.log('⚠️  Profile page may have issues loading');
    }
    
    console.log('\n✨ Testing completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Check if server is running
const axios = require('axios');

async function checkServer() {
  try {
    const response = await axios.get('http://localhost:3000', { timeout: 5000 });
    console.log('✅ Frontend server is running');
    return true;
  } catch (error) {
    console.log('❌ Frontend server is not running on port 3000');
    console.log('Please start the frontend server with: cd client && npm run dev');
    return false;
  }
}

// Main execution
async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await testSnippetViews();
  }
}

main().catch(console.error);
