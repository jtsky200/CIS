const https = require('https');
const { JSDOM } = require('jsdom');

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║  COMPREHENSIVE INTERNAL TEST - Technical Database      ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

let testResults = {
    pageLoad: false,
    hasAppJs: false,
    hasTechList: false,
    appJsLoadable: false,
    functionExists: false,
    apiWorks: false
};

// Step 1: Load the troubleshooting page
console.log('📄 STEP 1: Loading troubleshooting.html...\n');

https.get('https://cis-de.web.app/troubleshooting.html', (res) => {
    let htmlData = '';
    res.on('data', chunk => htmlData += chunk);
    res.on('end', () => {
        console.log(`✅ Page loaded: ${res.statusCode}`);
        testResults.pageLoad = true;
        
        // Parse HTML with JSDOM
        try {
            const dom = new JSDOM(htmlData, {
                url: "https://cis-de.web.app/troubleshooting.html",
                runScripts: "outside-only"
            });
            const document = dom.window.document;
            
            console.log('\n📋 STEP 2: Checking HTML Structure...\n');
            
            // Check for techList
            const techList = document.getElementById('techList');
            if (techList) {
                console.log('✅ techList element EXISTS in HTML');
                console.log(`   Tag: <${techList.tagName.toLowerCase()}>`);
                console.log(`   ID: "${techList.id}"`);
                testResults.hasTechList = true;
            } else {
                console.log('❌ techList element NOT FOUND in HTML');
                
                // Try to find any element with "tech" in the id
                const allIds = Array.from(document.querySelectorAll('[id]')).map(el => el.id);
                const techIds = allIds.filter(id => id.toLowerCase().includes('tech'));
                console.log('   IDs containing "tech":', techIds.length > 0 ? techIds : 'none');
            }
            
            // Check for app.js script
            const scripts = Array.from(document.querySelectorAll('script[src]'));
            const appJsScript = scripts.find(s => s.src.includes('app.js'));
            if (appJsScript) {
                console.log('\n✅ app.js script tag found');
                console.log(`   Src: "${appJsScript.src}"`);
                testResults.hasAppJs = true;
            } else {
                console.log('\n❌ app.js script tag NOT found');
            }
            
            // Check for init script
            const inlineScripts = Array.from(document.querySelectorAll('script:not([src])')).map(s => s.textContent);
            const hasWaitForAppJs = inlineScripts.some(s => s.includes('waitForAppJs'));
            const hasInitTroubleshooting = inlineScripts.some(s => s.includes('initTroubleshooting'));
            
            console.log('\n📋 Inline Scripts:');
            console.log(`   waitForAppJs function: ${hasWaitForAppJs ? '✅' : '❌'}`);
            console.log(`   initTroubleshooting function: ${hasInitTroubleshooting ? '✅' : '❌'}`);
            
            // Now test app.js
            testAppJs();
            
        } catch (error) {
            console.error('❌ Error parsing HTML:', error.message);
            testAppJs();
        }
    });
}).on('error', err => {
    console.error('❌ Error loading page:', err.message);
    process.exit(1);
});

function testAppJs() {
    console.log('\n📄 STEP 3: Testing app.js...\n');
    
    https.get('https://cis-de.web.app/app.js', (res) => {
        let appJsData = '';
        res.on('data', chunk => appJsData += chunk);
        res.on('end', () => {
            console.log(`✅ app.js loaded: ${res.statusCode}`);
            testResults.appJsLoadable = true;
            
            // Check for required functions
            const hasLoadFunc = appJsData.includes('async function loadTechnicalDatabase()');
            const hasDisplayFunc = appJsData.includes('function displayTechnicalDatabase');
            
            console.log('\n📋 Functions in app.js:');
            console.log(`   loadTechnicalDatabase: ${hasLoadFunc ? '✅' : '❌'}`);
            console.log(`   displayTechnicalDatabase: ${hasDisplayFunc ? '✅' : '❌'}`);
            
            testResults.functionExists = hasLoadFunc && hasDisplayFunc;
            
            if (hasLoadFunc) {
                // Extract and analyze the function
                const funcStart = appJsData.indexOf('async function loadTechnicalDatabase()');
                let braceCount = 0;
                let inFunc = false;
                let funcEnd = funcStart;
                
                for (let i = funcStart; i < appJsData.length; i++) {
                    if (appJsData[i] === '{') {
                        braceCount++;
                        inFunc = true;
                    } else if (appJsData[i] === '}') {
                        braceCount--;
                        if (inFunc && braceCount === 0) {
                            funcEnd = i + 1;
                            break;
                        }
                    }
                }
                
                const funcCode = appJsData.substring(funcStart, funcEnd);
                
                const checksTechList = funcCode.includes("getElementById('techList')");
                const callsDisplay = funcCode.includes('displayTechnicalDatabase(');
                
                console.log('\n📋 Function Analysis:');
                console.log(`   Checks for techList: ${checksTechList ? '✅' : '❌'}`);
                console.log(`   Calls displayTechnicalDatabase: ${callsDisplay ? '✅' : '❌'}`);
            }
            
            testAPI();
        });
    }).on('error', err => {
        console.error('❌ Error loading app.js:', err.message);
        testAPI();
    });
}

function testAPI() {
    console.log('\n📄 STEP 4: Testing Firebase API...\n');
    
    https.get('https://us-central1-cis-de.cloudfunctions.net/technicalDatabase', (res) => {
        let apiData = '';
        res.on('data', chunk => apiData += chunk);
        res.on('end', () => {
            if (res.statusCode === 200) {
                const data = JSON.parse(apiData);
                console.log(`✅ API works: ${res.statusCode}`);
                console.log(`✅ Documents returned: ${data.documents.length}`);
                testResults.apiWorks = true;
            } else {
                console.log(`❌ API error: ${res.statusCode}`);
            }
            
            showFinalResults();
        });
    }).on('error', err => {
        console.error('❌ Error testing API:', err.message);
        showFinalResults();
    });
}

function showFinalResults() {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║  FINAL TEST RESULTS                                    ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    
    Object.entries(testResults).forEach(([key, value]) => {
        const emoji = value ? '✅' : '❌';
        const status = value ? 'PASS' : 'FAIL';
        console.log(`${emoji} ${key.padEnd(20)}: ${status}`);
    });
    
    const allPass = Object.values(testResults).every(v => v);
    
    console.log('\n' + '═'.repeat(60));
    if (allPass) {
        console.log('✅ ALL TESTS PASSED - Issue must be client-side timing');
        console.log('\n💡 LIKELY CAUSE: techList element not in DOM when');
        console.log('   loadTechnicalDatabase() is called.');
        console.log('\n🔧 SOLUTION: Need to ensure DOM is fully loaded before init');
    } else {
        console.log('❌ SOME TESTS FAILED - See details above');
    }
    console.log('═'.repeat(60));
}

