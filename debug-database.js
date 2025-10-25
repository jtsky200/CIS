const https = require('https');

// Check what's actually in the database
async function debugDatabase() {
    try {
        console.log('🔍 Checking database contents...');
        
        // Get technical database documents
        const techOptions = {
            hostname: 'us-central1-cis-de.cloudfunctions.net',
            port: 443,
            path: '/technicalDatabase',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const techReq = https.request(techOptions, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            res.on('end', () => {
                try {
                    const result = JSON.parse(responseData);
                    console.log(`📊 Technical Database: ${result.documents.length} documents`);
                    
                    // Check first few documents
                    const sampleDocs = result.documents.slice(0, 5);
                    sampleDocs.forEach((doc, index) => {
                        console.log(`\n📄 Document ${index + 1}:`);
                        console.log(`   - Filename: ${doc.filename}`);
                        console.log(`   - File Type: ${doc.fileType}`);
                        console.log(`   - Has originalFileData: ${!!doc.originalFileData}`);
                        console.log(`   - Has originalPdfData: ${!!doc.originalPdfData}`);
                        console.log(`   - Content length: ${doc.content ? doc.content.length : 0}`);
                        console.log(`   - Is Active: ${doc.isActive}`);
                    });
                    
                    // Check for image files specifically
                    const imageDocs = result.documents.filter(doc => 
                        doc.fileType && ['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(doc.fileType.toLowerCase())
                    );
                    console.log(`\n🖼️ Image files found: ${imageDocs.length}`);
                    imageDocs.forEach(doc => {
                        console.log(`   - ${doc.filename} (${doc.fileType}) - Has originalFileData: ${!!doc.originalFileData}`);
                    });
                    
                } catch (error) {
                    console.error('❌ Error parsing technical database response:', error);
                    console.log('Raw response:', responseData);
                }
            });
        });

        techReq.on('error', (error) => {
            console.error('❌ Technical database request error:', error);
        });

        techReq.end();
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Run the debug
debugDatabase();
