const https = require('https');

console.log('🔍 Checking deployed HTML for techList...\n');

https.get('https://cis-de.web.app/troubleshooting.html', (res) => {
    let html = '';
    res.on('data', chunk => html += chunk);
    res.on('end', () => {
        console.log('HTML length:', html.length, 'characters\n');
        
        // Search for techList
        const techListIndex = html.indexOf('techList');
        
        if (techListIndex === -1) {
            console.log('❌ "techList" string NOT FOUND anywhere in HTML!');
            
            // Search for "Technical Database" section
            const technicalDbIndex = html.indexOf('Technical Database');
            if (technicalDbIndex > -1) {
                console.log('\n✅ Found "Technical Database" section');
                const section = html.substring(technicalDbIndex - 200, technicalDbIndex + 500);
                console.log('\nContext:');
                console.log(section);
            }
            
        } else {
            console.log('✅ Found "techList" at position', techListIndex);
            
            // Show context
            const context = html.substring(Math.max(0, techListIndex - 100), techListIndex + 200);
            console.log('\nContext around techList:');
            console.log('─'.repeat(60));
            console.log(context);
            console.log('─'.repeat(60));
            
            // Check if it's inside <div id=
            if (context.includes('<div') && context.includes('id="')) {
                console.log('\n✅ techList is a div with id attribute');
                
                // Extract the full div
                let divStart = techListIndex;
                while (divStart > 0 && html[divStart] !== '<') divStart--;
                
                // Find closing
                let depth = 0;
                let divEnd = divStart;
                for (let i = divStart; i < html.length && i < divStart + 500; i++) {
                    if (html.substr(i, 5) === '<div ') depth++;
                    if (html.substr(i, 6) === '</div>') {
                        depth--;
                        if (depth === 0) {
                            divEnd = i + 6;
                            break;
                        }
                    }
                }
                
                const fullDiv = html.substring(divStart, divEnd);
                console.log('\nFull div:');
                console.log('─'.repeat(60));
                console.log(fullDiv.substring(0, 400));
                console.log('─'.repeat(60));
            }
        }
    });
});

