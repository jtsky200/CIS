const https = require('https');

console.log('🔍 Extracting exact loadTechnicalDatabase function\n');

https.get('https://cis-de.web.app/app.js', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        // Find the function
        const funcStart = data.indexOf('async function loadTechnicalDatabase()');
        
        if (funcStart === -1) {
            console.log('❌ Function not found');
            return;
        }
        
        // Find the end by counting braces
        let braceCount = 0;
        let inFunction = false;
        let funcEnd = funcStart;
        
        for (let i = funcStart; i < data.length; i++) {
            if (data[i] === '{') {
                braceCount++;
                inFunction = true;
            } else if (data[i] === '}') {
                braceCount--;
                if (inFunction && braceCount === 0) {
                    funcEnd = i + 1;
                    break;
                }
            }
        }
        
        const fullFunction = data.substring(funcStart, funcEnd);
        
        console.log('═══════════════════════════════════════════════════');
        console.log('EXACT DEPLOYED FUNCTION:');
        console.log('═══════════════════════════════════════════════════\n');
        console.log(fullFunction);
        console.log('\n═══════════════════════════════════════════════════');
        
        // Analysis
        console.log('ANALYSIS:');
        console.log('═══════════════════════════════════════════════════\n');
        
        const checksTechList = fullFunction.includes("getElementById('techList')");
        const callsDisplay = fullFunction.includes('displayTechnicalDatabase(');
        const hasElse = fullFunction.includes('} else {');
        
        console.log(`Checks for techList: ${checksTechList ? '✅ YES' : '❌ NO'}`);
        console.log(`Calls displayTechnicalDatabase: ${callsDisplay ? '✅ YES' : '❌ NO'}`);
        console.log(`Has else block: ${hasElse ? '✅ YES' : '❌ NO'}`);
        
        if (checksTechList && callsDisplay) {
            console.log('\n✅ Function looks CORRECT!');
            console.log('\n💡 The problem must be elsewhere (timing, element not found, etc.)');
        } else {
            console.log('\n❌ Function has issues that need fixing!');
        }
    });
}).on('error', err => {
    console.error('❌ Error:', err.message);
});

