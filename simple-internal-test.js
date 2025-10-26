const https = require('https');

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║  SIMPLE INTERNAL TEST - Technical Database             ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

let results = [];

// Test 1: Check HTML for techList element
console.log('TEST 1: Checking HTML for techList element...\n');

https.get('https://cis-de.web.app/troubleshooting.html', (res) => {
    let html = '';
    res.on('data', chunk => html += chunk);
    res.on('end', () => {
        const hasTechListId = html.includes('id="techList"');
        const hasTechSearchId = html.includes('id="techSearch"');
        const hasTechFilterId = html.includes('id="techFilter"');
        const hasTechSortId = html.includes('id="techSort"');
        
        console.log('HTML Element IDs:');
        console.log(`  id="techList": ${hasTechListId ? '✅' : '❌'}`);
        console.log(`  id="techSearch": ${hasTechSearchId ? '✅' : '❌'}`);
        console.log(`  id="techFilter": ${hasTechFilterId ? '✅' : '❌'}`);
        console.log(`  id="techSort": ${hasTechSortId ? '✅' : '❌'}`);
        
        results.push({ test: 'HTML has techList', pass: hasTechListId });
        results.push({ test: 'HTML has techSearch', pass: hasTechSearchId });
        results.push({ test: 'HTML has techFilter', pass: hasTechFilterId });
        results.push({ test: 'HTML has techSort', pass: hasTechSortId });
        
        // Check script loading order
        const appJsPosition = html.indexOf('<script src="app.js"></script>');
        const initScriptPosition = html.indexOf('function waitForAppJs');
        const correctOrder = appJsPosition < initScriptPosition && appJsPosition !== -1;
        
        console.log(`\nScript Loading Order:`);
        console.log(`  app.js before init: ${correctOrder ? '✅' : '❌'}`);
        results.push({ test: 'Script order correct', pass: correctOrder });
        
        // Check for waitForAppJs implementation
        const hasWaitForAppJs = html.includes('function waitForAppJs(callback, maxAttempts = 20)');
        const hasInitTroubleshooting = html.includes('function initTroubleshooting()');
        const callsLoadTechnicalDatabase = html.includes('loadTechnicalDatabase();');
        
        console.log(`\nScript Implementation:`);
        console.log(`  waitForAppJs function: ${hasWaitForAppJs ? '✅' : '❌'}`);
        console.log(`  initTroubleshooting function: ${hasInitTroubleshooting ? '✅' : '❌'}`);
        console.log(`  Calls loadTechnicalDatabase: ${callsLoadTechnicalDatabase ? '✅' : '❌'}`);
        
        results.push({ test: 'Has waitForAppJs', pass: hasWaitForAppJs });
        results.push({ test: 'Has initTroubleshooting', pass: hasInitTroubleshooting });
        results.push({ test: 'Calls loadTechnicalDatabase', pass: callsLoadTechnicalDatabase });
        
        testAppJs();
    });
});

function testAppJs() {
    console.log('\n─'.repeat(60));
    console.log('TEST 2: Checking app.js functions...\n');
    
    https.get('https://cis-de.web.app/app.js', (res) => {
        let js = '';
        res.on('data', chunk => js += chunk);
        res.on('end', () => {
            const hasLoadFunc = js.includes('async function loadTechnicalDatabase()');
            const hasDisplayFunc = js.includes('function displayTechnicalDatabase(');
            const loadFuncChecksTechList = js.includes("document.getElementById('techList')");
            const loadFuncCallsDisplay = js.includes('displayTechnicalDatabase(technicalDatabase)');
            
            console.log('app.js Functions:');
            console.log(`  loadTechnicalDatabase exists: ${hasLoadFunc ? '✅' : '❌'}`);
            console.log(`  displayTechnicalDatabase exists: ${hasDisplayFunc ? '✅' : '❌'}`);
            console.log(`  loadFunc checks techList: ${loadFuncChecksTechList ? '✅' : '❌'}`);
            console.log(`  loadFunc calls display: ${loadFuncCallsDisplay ? '✅' : '❌'}`);
            
            results.push({ test: 'loadTechnicalDatabase exists', pass: hasLoadFunc });
            results.push({ test: 'displayTechnicalDatabase exists', pass: hasDisplayFunc });
            results.push({ test: 'loadFunc checks techList', pass: loadFuncChecksTechList });
            results.push({ test: 'loadFunc calls display', pass: loadFuncCallsDisplay });
            
            testAPI();
        });
    });
}

function testAPI() {
    console.log('\n─'.repeat(60));
    console.log('TEST 3: Checking Firebase API...\n');
    
    https.get('https://us-central1-cis-de.cloudfunctions.net/technicalDatabase', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            if (res.statusCode === 200) {
                const json = JSON.parse(data);
                const docCount = json.documents ? json.documents.length : 0;
                
                console.log(`API Response:`);
                console.log(`  Status: ${res.statusCode} ✅`);
                console.log(`  Documents: ${docCount}`);
                
                results.push({ test: 'API returns 200', pass: res.statusCode === 200 });
                results.push({ test: 'API has documents', pass: docCount > 0 });
                
                if (docCount > 0) {
                    console.log(`\n  First document:`);
                    console.log(`    Name: ${json.documents[0].name}`);
                    console.log(`    Category: ${json.documents[0].category}`);
                }
            } else {
                console.log(`  Status: ${res.statusCode} ❌`);
                results.push({ test: 'API returns 200', pass: false });
            }
            
            showResults();
        });
    });
}

function showResults() {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║  TEST SUMMARY                                          ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    
    const passed = results.filter(r => r.pass).length;
    const failed = results.filter(r => !r.pass).length;
    const total = results.length;
    
    results.forEach(r => {
        const emoji = r.pass ? '✅' : '❌';
        console.log(`${emoji} ${r.test}`);
    });
    
    console.log('\n' + '═'.repeat(60));
    console.log(`RESULTS: ${passed}/${total} tests passed, ${failed} failed`);
    console.log('═'.repeat(60));
    
    if (failed === 0) {
        console.log('\n✅ ALL INFRASTRUCTURE IS CORRECT!');
        console.log('\n🔍 DIAGNOSIS: The technical database SHOULD work.');
        console.log('   Problem is likely browser cache or timing issue.');
        console.log('\n🔧 SOLUTION NEEDED:');
        console.log('   1. Force browser cache clear');
        console.log('   2. Add more aggressive DOM-ready checking');
        console.log('   3. Move techList check into loadTechnicalDatabase itself');
    } else {
        console.log('\n❌ ISSUES FOUND - See failed tests above');
    }
}

