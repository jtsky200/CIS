const https = require('https');

console.log('🔍 Checking for inline loader script...\n');

https.get('https://cis-de.web.app/troubleshooting.html', (res) => {
    let html = '';
    res.on('data', chunk => html += chunk);
    res.on('end', () => {
        // Look for the inline script
        const inlinePos = html.indexOf('INLINE: Starting Technical Database Loader');
        
        if (inlinePos > -1) {
            console.log('✅ INLINE loader found!');
            console.log('\nShowing context (first 500 chars):\n');
            console.log('─'.repeat(60));
            console.log(html.substring(inlinePos - 50, inlinePos + 500));
            console.log('─'.repeat(60));
            
            // Check for fetch call
            const fetchCall = html.includes("fetch('https://us-central1-cis-de.cloudfunctions.net/technicalDatabase");
            console.log('\n📡 Fetch API Call:', fetchCall ? '✅ FOUND' : '❌ NOT FOUND');
            
            // Check for statistics update
            const statUpdate = html.includes('techDocCount.textContent = docs.length');
            console.log('📊 Statistics Update:', statUpdate ? '✅ FOUND' : '❌ NOT FOUND');
            
        } else {
            console.log('❌ INLINE loader NOT found in deployed HTML!');
            console.log('\n⚠️  The inline script was not deployed!');
        }
        
        // Check for loading state
        const loadingState = html.includes('id="techLoadingState"');
        console.log('\n⏳ Loading State Element:', loadingState ? '✅ FOUND' : '❌ NOT FOUND');
        
        // Check for statistics grid
        const statsGrid = html.includes('class="stats-grid"');
        console.log('📊 Statistics Grid:', statsGrid ? '✅ FOUND' : '❌ NOT FOUND');
    });
});

