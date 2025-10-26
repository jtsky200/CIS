const https = require('https');

console.log('🔍 DEBUGGING TECHNICAL DATABASE\n');

// Test 1: Check if page loads correctly
console.log('📋 Test 1: Check Troubleshooting Page');
console.log('─'.repeat(60));

https.get('https://cis-de.web.app/troubleshooting.html', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log(`✅ Status: ${res.statusCode}`);
        
        // Check for correct IDs
        const hasTechList = data.includes('id="techList"');
        const hasTechSearch = data.includes('id="techSearch"');
        const hasTechFilter = data.includes('id="techFilter"');
        const hasTechSort = data.includes('id="techSort"');
        
        console.log(`Element IDs:`);
        console.log(`  techList: ${hasTechList ? '✅' : '❌'}`);
        console.log(`  techSearch: ${hasTechSearch ? '✅' : '❌'}`);
        console.log(`  techFilter: ${hasTechFilter ? '✅' : '❌'}`);
        console.log(`  techSort: ${hasTechSort ? '✅' : '❌'}`);
        
        // Check for init function
        const hasInitTroubleshooting = data.includes('initTroubleshooting');
        const hasLoadTechnicalDatabase = data.includes('loadTechnicalDatabase');
        
        console.log(`\nInitialization:`);
        console.log(`  initTroubleshooting: ${hasInitTroubleshooting ? '✅' : '❌'}`);
        console.log(`  loadTechnicalDatabase call: ${hasLoadTechnicalDatabase ? '✅' : '❌'}`);
        
        console.log('\n─'.repeat(60));
        testFirebaseFunction();
    });
}).on('error', err => {
    console.error('❌ Error:', err.message);
});

// Test 2: Check Firebase Function
function testFirebaseFunction() {
    console.log('\n📋 Test 2: Check Firebase Function');
    console.log('─'.repeat(60));
    
    const url = 'https://us-central1-cis-de.cloudfunctions.net/technicalDatabase';
    
    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log(`Status: ${res.statusCode}`);
            
            if (res.statusCode === 200) {
                try {
                    const json = JSON.parse(data);
                    console.log(`✅ Documents found: ${json.documents ? json.documents.length : 0}`);
                    
                    if (json.documents && json.documents.length > 0) {
                        console.log(`\nFirst 3 documents:`);
                        json.documents.slice(0, 3).forEach((doc, i) => {
                            console.log(`  ${i + 1}. ${doc.name || doc.title || 'Unknown'}`);
                        });
                    } else {
                        console.log('⚠️  No documents in response');
                    }
                } catch (e) {
                    console.error('❌ Failed to parse JSON:', e.message);
                    console.log('Raw response:', data.substring(0, 200));
                }
            } else {
                console.log(`❌ Error response: ${data}`);
            }
            
            console.log('\n─'.repeat(60));
            testAppJs();
        });
    }).on('error', err => {
        console.error('❌ Error:', err.message);
    });
}

// Test 3: Check app.js
function testAppJs() {
    console.log('\n📋 Test 3: Check app.js');
    console.log('─'.repeat(60));
    
    https.get('https://cis-de.web.app/app.js', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log(`✅ Status: ${res.statusCode}`);
            
            // Check for loadTechnicalDatabase function
            const hasLoadFunction = data.includes('async function loadTechnicalDatabase()');
            const hasDisplayFunction = data.includes('function displayTechnicalDatabase');
            const hasTechListCheck = data.includes("document.getElementById('techList')");
            
            console.log(`Functions:`);
            console.log(`  loadTechnicalDatabase: ${hasLoadFunction ? '✅' : '❌'}`);
            console.log(`  displayTechnicalDatabase: ${hasDisplayFunction ? '✅' : '❌'}`);
            console.log(`  techList check: ${hasTechListCheck ? '✅' : '❌'}`);
            
            console.log('\n╔═══════════════════════════════════════════════════════╗');
            console.log('║     DIAGNOSIS COMPLETE                                ║');
            console.log('╚═══════════════════════════════════════════════════════╝');
        });
    }).on('error', err => {
        console.error('❌ Error:', err.message);
    });
}

