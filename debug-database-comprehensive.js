const https = require('https');

// Comprehensive database analysis
async function debugDatabaseComprehensive() {
    try {
        console.log('🔍 Comprehensive database analysis...');
        
        // Test the indexAllImages function with detailed logging
        const requestData = JSON.stringify({});
        
        const options = {
            hostname: 'us-central1-cis-de.cloudfunctions.net',
            port: 443,
            path: '/indexAllImages',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(requestData)
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
                    console.log('\n=== COMPREHENSIVE INDEXING RESULTS ===');
                    console.log(`✅ Success: ${result.success}`);
                    console.log(`📊 Total Documents: ${result.totalDocuments}`);
                    console.log(`🖼️ Images Indexed: ${result.imagesIndexed}`);
                    console.log(`❌ Errors: ${result.errors}`);
                    console.log(`📝 Message: ${result.message}`);
                    
                    if (result.imagesIndexed < 10) {
                        console.log('\n🔍 ANALYSIS:');
                        console.log('   The low number of indexed images suggests:');
                        console.log('   1. Most documents are not image files');
                        console.log('   2. PDF documents may not have extractable images');
                        console.log('   3. Documents may be missing originalFileData');
                        console.log('   4. File types may not be correctly identified');
                        
                        console.log('\n💡 RECOMMENDATIONS:');
                        console.log('   - Check if documents have originalFileData field');
                        console.log('   - Verify file types are correctly set');
                        console.log('   - Consider uploading more image files');
                        console.log('   - Implement better PDF image extraction');
                    }
                    
                    console.log('\n=====================================');
                } catch (error) {
                    console.error('❌ Error parsing response:', error);
                    console.log('Raw response:', responseData);
                }
            });
        });

        req.on('error', (error) => {
            console.error('❌ Request error:', error);
        });

        req.write(requestData);
        req.end();
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Run the analysis
debugDatabaseComprehensive();
