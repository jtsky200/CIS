const https = require('https');

console.log('🔍 Checking for statistics update code...\n');

https.get('https://cis-de.web.app/troubleshooting.html', (res) => {
    let html = '';
    res.on('data', chunk => html += chunk);
    res.on('end', () => {
        // Find inline script
        const scriptStart = html.indexOf("// INLINE LOADER - SELF-CONTAINED");
        const scriptEnd = html.indexOf('</script>', scriptStart);
        const inlineScript = html.substring(scriptStart, scriptEnd);
        
        console.log('📄 Inline script length:', inlineScript.length, 'characters');
        
        // Check for specific updates
        const checks = [
            { name: 'techDocCount update', pattern: 'techDocCount' },
            { name: 'techTotalSize update', pattern: 'techTotalSize' },
            { name: 'techLastUpdate update', pattern: 'techLastUpdate' },
            { name: 'formatSize function', pattern: 'formatSize' },
            { name: 'formatDate function', pattern: 'formatDate' },
            { name: 'Hide loading state', pattern: 'loadingState.style.display = \'none\'' },
            { name: 'Display documents', pattern: 'docs.length' }
        ];
        
        console.log('\n📋 Checking code:');
        checks.forEach(check => {
            const found = inlineScript.includes(check.pattern);
            console.log(`${found ? '✅' : '❌'} ${check.name}`);
        });
        
        // Show a snippet
        console.log('\n📄 Script snippet (around document update):');
        console.log('─'.repeat(60));
        const updatePos = inlineScript.indexOf('Update statistics');
        if (updatePos > -1) {
            console.log(inlineScript.substring(updatePos - 50, updatePos + 300));
        } else {
            console.log('Statistics update block not found!');
        }
        console.log('─'.repeat(60));
    });
});

