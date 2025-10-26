const https = require('https');

console.log('🔍 Searching for loadTechnicalDatabase in deployed app.js\n');

https.get('https://cis-de.web.app/app.js', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log(`Total file size: ${data.length} characters\n`);
        
        // Try different search patterns
        const patterns = [
            'async function loadTechnicalDatabase',
            'function loadTechnicalDatabase',
            'loadTechnicalDatabase',
            'technicalDatabase',
            'displayTechnicalDatabase'
        ];
        
        patterns.forEach(pattern => {
            const count = (data.match(new RegExp(pattern, 'g')) || []).length;
            console.log(`"${pattern}": ${count} occurrences ${count > 0 ? '✅' : '❌'}`);
        });
        
        // Check if the file contains ANY async functions
        const asyncFuncCount = (data.match(/async function/g) || []).length;
        console.log(`\nTotal async functions: ${asyncFuncCount}`);
        
        // Show first 500 characters
        console.log('\nFirst 500 characters of app.js:');
        console.log('═'.repeat(60));
        console.log(data.substring(0, 500));
        console.log('═'.repeat(60));
    });
}).on('error', err => {
    console.error('❌ Error:', err.message);
});

