const fs = require('fs');
const path = require('path');
const https = require('https');

// Comprehensive manual upload script
async function uploadAllManuals() {
    const baseDir = './manuals technical';
    const files = [];
    
    console.log('🔍 Scanning all manual files...');
    
    // Recursively scan all files
    function scanDirectory(dir, relativePath = '') {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const relativeItemPath = path.join(relativePath, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                scanDirectory(fullPath, relativeItemPath);
            } else {
                // Only process supported file types
                const ext = path.extname(item).toLowerCase();
                if (['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.txt', '.md', '.docx', '.xlsx'].includes(ext)) {
                    files.push({
                        path: fullPath,
                        relativePath: relativeItemPath,
                        name: item,
                        size: stat.size,
                        ext: ext
                    });
                }
            }
        }
    }
    
    scanDirectory(baseDir);
    
    console.log(`📊 Found ${files.length} files to upload:`);
    files.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file.relativePath} (${file.size} bytes, ${file.ext})`);
    });
    
    console.log('\n🚀 Starting upload process...');
    
    let successCount = 0;
    let errorCount = 0;
    const results = [];
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`\n📤 Uploading ${i + 1}/${files.length}: ${file.name}`);
        
        try {
            // Read file content
            const fileBuffer = fs.readFileSync(file.path);
            const base64Content = fileBuffer.toString('base64');
            
            // Determine file type and category
            let fileType = 'unknown';
            let category = 'General';
            let vehicleType = 'General';
            
            if (file.ext === '.pdf') {
                fileType = 'pdf';
            } else if (['.jpg', '.jpeg', '.png', '.gif', '.bmp'].includes(file.ext)) {
                fileType = 'image';
            } else if (file.ext === '.txt' || file.ext === '.md') {
                fileType = 'text';
            } else if (file.ext === '.docx') {
                fileType = 'document';
            } else if (file.ext === '.xlsx') {
                fileType = 'spreadsheet';
            }
            
            // Determine vehicle type from folder structure
            if (file.relativePath.startsWith('LYRIQ/')) {
                vehicleType = 'LYRIQ';
                category = 'LYRIQ Manuals';
            } else if (file.relativePath.startsWith('VISTIQ/')) {
                vehicleType = 'VISTIQ';
                category = 'VISTIQ Manuals';
            } else if (file.relativePath.startsWith('OPTIQ/')) {
                vehicleType = 'OPTIQ';
                category = 'OPTIQ Manuals';
            } else if (file.relativePath.startsWith('GENERAL/')) {
                vehicleType = 'General';
                category = 'General Manuals';
            }
            
            // Upload to technical database
            const uploadData = {
                filename: file.name,
                content: base64Content,
                fileType: fileType,
                category: category,
                vehicleType: vehicleType,
                subcategory: 'Technical Documentation',
                manualType: 'Owner Manual',
                description: `Technical manual: ${file.name}`,
                originalFileData: base64Content
            };
            
            const result = await uploadToDatabase(uploadData);
            
            if (result.success) {
                console.log(`   ✅ Success: ${result.message}`);
                successCount++;
                results.push({
                    file: file.name,
                    status: 'success',
                    message: result.message
                });
            } else {
                console.log(`   ❌ Error: ${result.error}`);
                errorCount++;
                results.push({
                    file: file.name,
                    status: 'error',
                    error: result.error
                });
            }
            
        } catch (error) {
            console.log(`   ❌ Upload failed: ${error.message}`);
            errorCount++;
            results.push({
                file: file.name,
                status: 'error',
                error: error.message
            });
        }
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n📊 UPLOAD SUMMARY:');
    console.log(`   ✅ Successful uploads: ${successCount}`);
    console.log(`   ❌ Failed uploads: ${errorCount}`);
    console.log(`   📁 Total files processed: ${files.length}`);
    
    console.log('\n🔍 DETAILED RESULTS:');
    results.forEach((result, index) => {
        if (result.status === 'success') {
            console.log(`   ✅ ${result.file}: ${result.message}`);
        } else {
            console.log(`   ❌ ${result.file}: ${result.error}`);
        }
    });
    
    return { successCount, errorCount, totalFiles: files.length, results };
}

// Upload to database function
function uploadToDatabase(data) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);
        
        const options = {
            hostname: 'us-central1-cis-de.cloudfunctions.net',
            port: 443,
            path: '/uploadTechnicalDocument',
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
                    resolve(result);
                } catch (error) {
                    resolve({ success: false, error: 'Invalid response format' });
                }
            });
        });

        req.on('error', (error) => {
            resolve({ success: false, error: error.message });
        });

        req.write(postData);
        req.end();
    });
}

// Run the upload process
uploadAllManuals().then(result => {
    console.log('\n🎉 Upload process completed!');
    console.log(`📊 Final results: ${result.successCount} successful, ${result.errorCount} failed out of ${result.totalFiles} total files`);
    
    if (result.successCount > 0) {
        console.log('\n🔄 Now triggering image indexing for all uploaded files...');
        
        // Trigger image indexing
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
                } catch (error) {
                    console.log('❌ Error parsing indexing results:', error.message);
                }
            });
        });

        indexReq.on('error', (error) => {
            console.log('❌ Error triggering image indexing:', error.message);
        });

        indexReq.write(indexData);
        indexReq.end();
    }
}).catch(error => {
    console.error('❌ Upload process failed:', error);
});
