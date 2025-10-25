const fs = require('fs');
const path = require('path');
const https = require('https');

// Upload large PDFs using chunked approach
async function uploadLargePDFs() {
    const largePDFs = [
        'LYRIQ/LYRIQ-Owner-Manual-EU-EN 2024.pdf',
        'OPTIQ/25_CAD_OPTIQ_OM_en_US_U_18469671B_2025APR07_2P.pdf',
        'OPTIQ/OPTIQ-Owner-Manual-EU-EN 2025.pdf',
        'VISTIQ/26_CAD_VISTIQ_OM_en_US_U_18933832B_2025APR01_2P.pdf',
        'VISTIQ/VISTIQ-Owner-Manual-EU-EN 2026.pdf'
    ];
    
    console.log('🚀 Uploading large PDF owner manuals...');
    console.log('📋 Target files:');
    largePDFs.forEach((file, index) => {
        const fullPath = path.join('./manuals technical', file);
        if (fs.existsSync(fullPath)) {
            const stats = fs.statSync(fullPath);
            console.log(`   ${index + 1}. ${file} (${Math.round(stats.size / 1024 / 1024)}MB)`);
        } else {
            console.log(`   ${index + 1}. ${file} (FILE NOT FOUND)`);
        }
    });
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < largePDFs.length; i++) {
        const filePath = largePDFs[i];
        const fullPath = path.join('./manuals technical', filePath);
        
        if (!fs.existsSync(fullPath)) {
            console.log(`\n❌ File not found: ${filePath}`);
            errorCount++;
            continue;
        }
        
        const stats = fs.statSync(fullPath);
        const sizeMB = Math.round(stats.size / 1024 / 1024);
        
        console.log(`\n📤 Uploading ${i + 1}/${largePDFs.length}: ${path.basename(filePath)} (${sizeMB}MB)`);
        
        try {
            // Read the PDF file
            const fileBuffer = fs.readFileSync(fullPath);
            const base64Content = fileBuffer.toString('base64');
            
            // Determine vehicle type from path
            let vehicleType = 'General';
            let category = 'General Manuals';
            
            if (filePath.includes('LYRIQ/')) {
                vehicleType = 'LYRIQ';
                category = 'LYRIQ Owner Manuals';
            } else if (filePath.includes('VISTIQ/')) {
                vehicleType = 'VISTIQ';
                category = 'VISTIQ Owner Manuals';
            } else if (filePath.includes('OPTIQ/')) {
                vehicleType = 'OPTIQ';
                category = 'OPTIQ Owner Manuals';
            }
            
            // Create upload data with metadata
            const uploadData = {
                filename: path.basename(filePath),
                content: base64Content,
                fileType: 'pdf',
                category: category,
                vehicleType: vehicleType,
                subcategory: 'Owner Manual',
                manualType: 'Owner Manual',
                description: `Complete owner manual: ${path.basename(filePath)}`,
                originalFileData: base64Content,
                originalPdfData: base64Content,
                size: stats.size,
                sizeMB: sizeMB
            };
            
            console.log(`   📊 File size: ${sizeMB}MB`);
            console.log(`   🚗 Vehicle: ${vehicleType}`);
            console.log(`   📁 Category: ${category}`);
            
            // Upload using direct Firebase approach
            const result = await uploadLargeFile(uploadData);
            
            if (result.success || result.id) {
                console.log(`   ✅ Success: ${result.message || 'Large PDF uploaded successfully'}`);
                successCount++;
            } else {
                console.log(`   ❌ Error: ${result.error || 'Upload failed'}`);
                errorCount++;
            }
            
        } catch (error) {
            console.log(`   ❌ Upload failed: ${error.message}`);
            errorCount++;
        }
        
        // Longer delay for large files
        console.log(`   ⏳ Waiting 3 seconds before next upload...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    console.log('\n📊 LARGE PDF UPLOAD SUMMARY:');
    console.log(`   ✅ Successful uploads: ${successCount}`);
    console.log(`   ❌ Failed uploads: ${errorCount}`);
    console.log(`   📁 Total files processed: ${largePDFs.length}`);
    
    if (successCount > 0) {
        console.log('\n🔄 Triggering image indexing for large PDFs...');
        await triggerImageIndexing();
    }
    
    return { successCount, errorCount, totalFiles: largePDFs.length };
}

// Upload large file with special handling
function uploadLargeFile(data) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);
        
        console.log(`   📤 Uploading ${Math.round(postData.length / 1024 / 1024)}MB of data...`);
        
        const options = {
            hostname: 'us-central1-cis-de.cloudfunctions.net',
            port: 443,
            path: '/uploadTechnicalDocument',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            },
            timeout: 60000 // 60 second timeout for large files
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
                    resolve({ success: false, error: 'Invalid response format' });
                }
            });
        });

        req.on('error', (error) => {
            resolve({ success: false, error: error.message });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({ success: false, error: 'Upload timeout' });
        });

        req.write(postData);
        req.end();
    });
}

// Trigger image indexing
function triggerImageIndexing() {
    return new Promise((resolve) => {
        console.log('🖼️ Triggering image indexing...');
        
        const indexData = JSON.stringify({});
        const indexOptions = {
            hostname: 'us-central1-cis-de.cloudfunctions.net',
            port: 443,
            path: '/indexAllImages',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(indexData)
            }
        };

        const indexReq = https.request(indexOptions, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            res.on('end', () => {
                try {
                    const indexResult = JSON.parse(responseData);
                    console.log('\n🖼️ IMAGE INDEXING RESULTS:');
                    console.log(`   📊 Total Documents: ${indexResult.totalDocuments}`);
                    console.log(`   🖼️ Images Indexed: ${indexResult.imagesIndexed}`);
                    console.log(`   ❌ Errors: ${indexResult.errors}`);
                    console.log(`   ✅ Success: ${indexResult.success}`);
                    
                    if (indexResult.imagesIndexed > 9) {
                        console.log(`\n🎉 SUCCESS! More images indexed: ${indexResult.imagesIndexed} (was 9 before)`);
                    } else {
                        console.log(`\n⚠️ Same number of images indexed: ${indexResult.imagesIndexed}`);
                    }
                    
                    resolve(indexResult);
                } catch (error) {
                    console.log('❌ Error parsing indexing results:', error.message);
                    resolve(null);
                }
            });
        });

        indexReq.on('error', (error) => {
            console.log('❌ Error triggering image indexing:', error.message);
            resolve(null);
        });

        indexReq.write(indexData);
        indexReq.end();
    });
}

// Run the large PDF upload
uploadLargePDFs().then(result => {
    console.log('\n🎉 Large PDF upload process completed!');
    console.log(`📊 Final results: ${result.successCount} successful, ${result.errorCount} failed out of ${result.totalFiles} total files`);
    
    if (result.successCount > 0) {
        console.log('\n✅ Large owner manuals uploaded successfully!');
        console.log('🖼️ These PDFs contain the most valuable troubleshooting images');
        console.log('🔍 The image indexing should now find many more images');
    }
}).catch(error => {
    console.error('❌ Large PDF upload process failed:', error);
});
