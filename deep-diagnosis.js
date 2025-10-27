const https = require('https');

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║  DEEP DIAGNOSIS - Find the EXACT Problem              ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

// Get current timestamp for cache bust
const timestamp = Date.now();

// Load troubleshooting page
https.get('https://cis-de.web.app/troubleshooting.html', (res) => {
    let html = '';
    res.on('data', chunk => html += chunk);
    res.on('end', () => {
        console.log('✅ HTML Loaded\n');
        
        // Extract the exact init script
        const scriptTagMatch = html.match(/<script src="app\.js\?v=([^"]+)/);
        const cacheVersion = scriptTagMatch ? scriptTagMatch[1] : 'no version';
        
        console.log('📋 Cache Version:', cacheVersion);
        console.log('📋 Current timestamp:', timestamp);
        console.log('\n');
        
        // Check for waitForTechListElement
        const hasWaitForTechList = html.includes('function waitForTechListElement');
        console.log(`Has waitForTechListElement: ${hasWaitForTechList ? '✅' : '❌'}`);
        
        if (!hasWaitForTechList) {
            console.log('\n❌ PROBLEM FOUND: waitForTechListElement NOT in deployed HTML!');
            console.log('   The fix was NOT deployed correctly!');
            return;
        }
        
        // Now check what app.js actually does when it runs
        console.log('\n─'.repeat(60));
        console.log('Loading app.js to check loadTechnicalDatabase...\n');
        
        https.get(`https://cis-de.web.app/app.js?v=${cacheVersion}`, (res2) => {
            let js = '';
            res2.on('data', chunk => js += chunk);
            res2.on('end', () => {
                // Check if loadTechnicalDatabase checks for techList
                const loadFuncMatch = js.match(/async function loadTechnicalDatabase\(\) \{[\s\S]{0,2000}\}/);
                
                if (loadFuncMatch) {
                    const loadFunc = loadFuncMatch[0];
                    
                    console.log('✅ loadTechnicalDatabase found');
                    console.log(`   Length: ${loadFunc.length} characters\n`);
                    
                    // Find the techList check
                    if (loadFunc.includes("getElementById('techList')")) {
                        console.log('✅ Function checks for techList\n');
                        
                        // Extract the check block
                        const checkMatch = loadFunc.match(/if \(document\.getElementById\('techList'\)\) \{[\s\S]{0,300}\}/);
                        
                        if (checkMatch) {
                            console.log('Code block that renders docs:');
                            console.log('─'.repeat(60));
                            console.log(checkMatch[0]);
                            console.log('─'.repeat(60));
                        }
                    } else {
                        console.log('❌ Function does NOT check for techList!');
                        console.log('\nThis means the function would run but not render anything.');
                    }
                } else {
                    console.log('❌ loadTechnicalDatabase NOT found in app.js!');
                }
                
                // Final summary
                console.log('\n╔════════════════════════════════════════════════════════╗');
                console.log('║  DIAGNOSIS COMPLETE                                    ║');
                console.log('╚════════════════════════════════════════════════════════╝\n');
                
                if (hasWaitForTechList && js.includes('loadTechnicalDatabase')) {
                    console.log('✅ ALL CODE IS CORRECT');
                    console.log('\n💡 The problem is likely:');
                    console.log('   1. Browser cache (needs hard refresh)');
                    console.log('   2. JavaScript error blocking execution');
                    console.log('   3. Element timing issue despite the wait functions\n');
                    console.log('🔧 Try this in browser console:');
                    console.log('   loadTechnicalDatabase()');
                    console.log('   This should immediately show the documents\n');
                }
            });
        }).on('error', err => {
            console.error('❌ Error:', err.message);
        });
    });
}).on('error', err => {
    console.error('❌ Error:', err.message);
});

