const https = require('https');

console.log('🔍 Checking DEPLOYED app.js\n');

https.get('https://cis-de.web.app/app.js', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        // Find the exact loadTechnicalDatabase function
        const funcStart = data.indexOf('async function loadTechnicalDatabase()');
        const funcEnd = data.indexOf('\n}\n', funcStart) + 3;
        
        if (funcStart !== -1 && funcEnd > funcStart) {
            const fullFunction = data.substring(funcStart, funcEnd);
            
            console.log('═══════════════════════════════════════════════════');
            console.log('DEPLOYED loadTechnicalDatabase() FUNCTION:');
            console.log('═══════════════════════════════════════════════════\n');
            
            console.log(fullFunction);
            
            console.log('\n═══════════════════════════════════════════════════');
            console.log('ANALYSIS:');
            console.log('═══════════════════════════════════════════════════\n');
            
            const checksTechList = fullFunction.includes("getElementById('techList')");
            const callsDisplay = fullFunction.includes('displayTechnicalDatabase(');
            
            console.log(`✓ Checks for techList: ${checksTechList ? 'YES ✅' : 'NO ❌'}`);
            console.log(`✓ Calls displayTechnicalDatabase: ${callsDisplay ? 'YES ✅' : 'NO ❌'}`);
            
            if (!checksTechList) {
                console.log('\n❌ PROBLEM: Function does NOT check for techList!');
            }
            if (!callsDisplay) {
                console.log('\n❌ PROBLEM: Function does NOT call displayTechnicalDatabase!');
            }
        } else {
            console.log('❌ Could not find loadTechnicalDatabase function');
        }
    });
}).on('error', err => {
    console.error('❌ Error:', err.message);
});

