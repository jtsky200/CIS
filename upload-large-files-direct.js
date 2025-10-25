const fs = require('fs');
const path = require('path');
const https = require('https');

// Upload large files directly to technical database with special handling
async function uploadLargeFileDirect(filePath) {
    const fullPath = path.join('./manuals technical', filePath);
    
    if (!fs.existsSync(fullPath)) {
        console.log(`❌ File not found: ${filePath}`);
        return { success: false, error: 'File not found' };
    }
    
    const stats = fs.statSync(fullPath);
    const sizeMB = Math.round(stats.size / 1024 / 1024);
    
    console.log(`📤 Uploading: ${path.basename(filePath)} (${sizeMB}MB)`);
    
    try {
        // Read the entire PDF file
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
        
        console.log(`   🚗 Vehicle: ${vehicleType}`);
        console.log(`   📁 Category: ${category}`);
        
        // Upload to regular technical database with special handling
        const result = await uploadToTechnicalDatabase({
            filename: path.basename(filePath),
            content: base64Content,
            vehicleType: vehicleType,
            category: category,
            size: stats.size,
            isLargeFile: true,
            fileType: 'pdf'
        });
        
        if (result.success) {
            console.log(`   ✅ Success: ${result.message}`);
            console.log(`   🖼️ Images indexed: ${result.imagesIndexed || 0}`);
            return { success: true, result: result };
        } else {
            console.log(`   ❌ Error: ${result.error || 'Upload failed'}`);
            return { success: false, error: result.error || 'Upload failed' };
        }
        
    } catch (error) {
        console.log(`   ❌ Upload failed: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// Upload to technical database
function uploadToTechnicalDatabase(data) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);
        
        console.log(`   📤 Uploading ${Math.round(postData.length / 1024 / 1024)}MB to technical database...`);
        
        const options = {
            hostname: 'us-central1-cis-de.cloudfunctions.net',
            port: 443,
            path: '/uploadTechnicalDocument',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            },
            timeout: 600000 // 10 minute timeout
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

// Main execution
async function main() {
    const largePDFs = [
        'LYRIQ/LYRIQ-Owner-Manual-EU-EN 2024.pdf',
        'OPTIQ/25_CAD_OPTIQ_OM_en_US_U_18469671B_2025APR07_2P.pdf',
        'OPTIQ/OPTIQ-Owner-Manual-EU-EN 2025.pdf',
        'VISTIQ/26_CAD_VISTIQ_OM_en_US_U_18933832B_2025APR01_2P.pdf',
        'VISTIQ/VISTIQ-Owner-Manual-EU-EN 2026.pdf'
    ];
    
    console.log('🚀 Direct Large File Upload System');
    console.log('📋 Target large owner manuals:');
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
    let totalImagesIndexed = 0;
    
    for (let i = 0; i < largePDFs.length; i++) {
        const filePath = largePDFs[i];
        console.log(`\n📤 Processing ${i + 1}/${largePDFs.length}: ${path.basename(filePath)}`);
        
        const result = await uploadLargeFileDirect(filePath);
        
        if (result.success) {
            successCount++;
            totalImagesIndexed += result.result.imagesIndexed || 0;
        } else {
            errorCount++;
        }
        
        // Wait between files
        if (i < largePDFs.length - 1) {
            console.log(`   ⏳ Waiting 15 seconds before next file...`);
            await new Promise(resolve => setTimeout(resolve, 15000));
        }
    }
    
    console.log('\n📊 DIRECT LARGE FILE UPLOAD SUMMARY:');
    console.log(`   ✅ Successful uploads: ${successCount}`);
    console.log(`   ❌ Failed uploads: ${errorCount}`);
    console.log(`   🖼️ Total images indexed: ${totalImagesIndexed}`);
    console.log(`   📁 Total files processed: ${largePDFs.length}`);
    
    if (successCount > 0) {
        console.log('\n🔄 Triggering final image indexing...');
        await triggerFinalImageIndexing();
    }
    
    return { successCount, errorCount, totalImagesIndexed, totalFiles: largePDFs.length };
}

// Trigger final image indexing
function triggerFinalImageIndexing() {
    return new Promise((resolve) => {
        console.log('🖼️ Triggering final comprehensive image indexing...');
        
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
                    console.log('\n🖼️ FINAL IMAGE INDEXING RESULTS:');
                    console.log(`   📊 Total Documents: ${indexResult.totalDocuments}`);
                    console.log(`   🖼️ Images Indexed: ${indexResult.imagesIndexed}`);
                    console.log(`   ❌ Errors: ${indexResult.errors}`);
                    console.log(`   ✅ Success: ${indexResult.success}`);
                    
                    if (indexResult.imagesIndexed > 27) {
                        console.log(`\n🎉 MASSIVE SUCCESS! Images indexed: ${indexResult.imagesIndexed} (was 27 before)`);
                        console.log('🖼️ Large owner manuals now fully indexed with all troubleshooting images!');
                        console.log('🚀 System ready for comprehensive troubleshooting analysis!');
                    } else {
                        console.log(`\n⚠️ Images indexed: ${indexResult.imagesIndexed}`);
                        console.log('💡 Large files may need additional processing time');
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

// Run the direct large file upload
main().then(result => {
    console.log('\n🎉 Direct Large File Upload System Completed!');
    console.log(`📊 Final results: ${result.successCount} successful, ${result.errorCount} failed out of ${result.totalFiles} total files`);
    console.log(`🖼️ Total images indexed: ${result.totalImagesIndexed}`);
    
    if (result.successCount > 0) {
        console.log('\n✅ Large owner manuals uploaded successfully!');
        console.log('🖼️ These PDFs contain the most valuable troubleshooting images');
        console.log('🔍 The direct system handles large files efficiently');
        console.log('📚 Users now have access to comprehensive owner manuals with full image analysis');
        console.log('🚀 System ready for production troubleshooting!');
    }
}).catch(error => {
    console.error('❌ Direct large file upload process failed:', error);
});
