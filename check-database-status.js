const https = require('https');

// Check database status and file types
async function checkDatabaseStatus() {
    try {
        console.log('🔍 Checking database status...');
        
        // Get technical database
        const techResponse = await makeRequest('https://us-central1-cis-de.cloudfunctions.net/technicalDatabase', 'GET');
        console.log('\n📊 TECHNICAL DATABASE:');
        if (techResponse && techResponse.documents) {
            console.log(`   Total documents: ${techResponse.documents.length}`);
            
            const fileTypes = {};
            const imageDocs = [];
            const pdfDocs = [];
            
            techResponse.documents.forEach(doc => {
                const fileType = doc.fileType || 'unknown';
                fileTypes[fileType] = (fileTypes[fileType] || 0) + 1;
                
                if (fileType === 'image') {
                    imageDocs.push(doc.filename);
                } else if (fileType === 'pdf') {
                    pdfDocs.push(doc.filename);
                }
            });
            
            console.log('\n📈 File Type Distribution:');
            Object.entries(fileTypes).forEach(([type, count]) => {
                console.log(`   ${type}: ${count} documents`);
            });
            
            console.log('\n🖼️ Image Documents:');
            imageDocs.forEach((filename, index) => {
                console.log(`   ${index + 1}. ${filename}`);
            });
            
            console.log('\n📄 PDF Documents (first 10):');
            pdfDocs.slice(0, 10).forEach((filename, index) => {
                console.log(`   ${index + 1}. ${filename}`);
            });
            
            if (pdfDocs.length > 10) {
                console.log(`   ... and ${pdfDocs.length - 10} more PDF documents`);
            }
        }
        
        // Get knowledge base
        const kbResponse = await makeRequest('https://us-central1-cis-de.cloudfunctions.net/knowledgebase', 'GET');
        console.log('\n📚 KNOWLEDGE BASE:');
        if (kbResponse && kbResponse.documents) {
            console.log(`   Total documents: ${kbResponse.documents.length}`);
            
            const fileTypes = {};
            kbResponse.documents.forEach(doc => {
                const fileType = doc.fileType || 'unknown';
                fileTypes[fileType] = (fileTypes[fileType] || 0) + 1;
            });
            
            console.log('\n📈 File Type Distribution:');
            Object.entries(fileTypes).forEach(([type, count]) => {
                console.log(`   ${type}: ${count} documents`);
            });
        }
        
        console.log('\n🔍 ANALYSIS:');
        console.log('   The low image count suggests:');
        console.log('   1. Most uploaded files are text documents');
        console.log('   2. PDFs may not contain extractable images');
        console.log('   3. Large PDFs were skipped due to size limits');
        console.log('   4. The image extraction algorithm needs improvement');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Helper function to make HTTP requests
function makeRequest(url, method = 'GET') {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'us-central1-cis-de.cloudfunctions.net',
            port: 443,
            path: url.split('us-central1-cis-de.cloudfunctions.net')[1],
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            res.on('end', () => {
                try {
                    const result = JSON.parse(responseData);
                    resolve(result);
                } catch (error) {
                    resolve(null);
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

// Run the check
checkDatabaseStatus();
