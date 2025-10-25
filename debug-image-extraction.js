const https = require('https');

// Test image extraction by calling the function directly
async function debugImageExtraction() {
    try {
        console.log('🔍 Debugging image extraction...');
        
        // Get the latest uploaded image document
        const getOptions = {
            hostname: 'us-central1-cis-de.cloudfunctions.net',
            port: 443,
            path: '/technicalDatabase',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const getReq = https.request(getOptions, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            res.on('end', () => {
                try {
                    const result = JSON.parse(responseData);
                    console.log(`📊 Found ${result.documents.length} documents in technical database`);
                    
                    // Find image documents
                    const imageDocs = result.documents.filter(doc => 
                        doc.fileType && doc.fileType.toLowerCase() === 'image'
                    );
                    console.log(`🖼️ Found ${imageDocs.length} image documents`);
                    
                    if (imageDocs.length > 0) {
                        const testDoc = imageDocs[0];
                        console.log('\n📄 Test document details:');
                        console.log(`   - Filename: ${testDoc.filename}`);
                        console.log(`   - File Type: ${testDoc.fileType}`);
                        console.log(`   - Has originalFileData: ${!!testDoc.originalFileData}`);
                        console.log(`   - Has originalPdfData: ${!!testDoc.originalPdfData}`);
                        console.log(`   - originalFileData length: ${testDoc.originalFileData ? testDoc.originalFileData.length : 0}`);
                        
                        // Test image indexing on this document
                        testImageIndexing(testDoc.id);
                    } else {
                        console.log('❌ No image documents found');
                    }
                    
                } catch (error) {
                    console.error('❌ Error parsing response:', error);
                    console.log('Raw response:', responseData);
                }
            });
        });

        getReq.on('error', (error) => {
            console.error('❌ Request error:', error);
        });

        getReq.end();
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Test image indexing on a specific document
async function testImageIndexing(documentId) {
    try {
        console.log(`\n🔍 Testing image indexing for document: ${documentId}`);
        
        const indexData = {
            docId: documentId,
            type: 'technical'
        };
        
        const postData = JSON.stringify(indexData);
        
        const options = {
            hostname: 'us-central1-cis-de.cloudfunctions.net',
            port: 443,
            path: '/indexDocumentImages',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
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
                    console.log('📊 Indexing result:');
                    console.log(`   - Success: ${result.success}`);
                    console.log(`   - Images indexed: ${result.imagesIndexed || 0}`);
                    console.log(`   - Message: ${result.message || 'No message'}`);
                    
                    if (result.images && result.images.length > 0) {
                        console.log('🖼️ Indexed images:');
                        result.images.forEach((img, index) => {
                            console.log(`   - Image ${index + 1}: Page ${img.pageNumber}, ID: ${img.imageId}`);
                        });
                    }
                } catch (error) {
                    console.error('❌ Error parsing indexing response:', error);
                    console.log('Raw response:', responseData);
                }
            });
        });

        req.on('error', (error) => {
            console.error('❌ Indexing error:', error);
        });

        req.write(postData);
        req.end();
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Run the debug
debugImageExtraction();
