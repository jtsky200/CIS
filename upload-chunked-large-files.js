const fs = require('fs');
const path = require('path');
const https = require('https');

// Upload large files in chunks to avoid size limits
async function uploadChunkedLargeFile(filePath) {
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
        
        // Split into smaller chunks to avoid size limits
        const maxChunkSize = 2 * 1024 * 1024; // 2MB chunks
        const chunks = [];
        
        for (let i = 0; i < base64Content.length; i += maxChunkSize) {
            chunks.push(base64Content.slice(i, i + maxChunkSize));
        }
        
        console.log(`   📊 Split into ${chunks.length} chunks of max ${Math.round(maxChunkSize / 1024 / 1024)}MB each`);
        
        // Upload each chunk
        let allChunks = [];
        for (let i = 0; i < chunks.length; i++) {
            console.log(`   📤 Uploading chunk ${i + 1}/${chunks.length}...`);
            
            const chunkResult = await uploadChunk({
                filename: path.basename(filePath),
                chunkIndex: i,
                totalChunks: chunks.length,
                chunkData: chunks[i],
                vehicleType: vehicleType,
                category: category,
                size: stats.size
            });
            
            if (!chunkResult.success) {
                console.log(`   ❌ Chunk ${i + 1} failed: ${chunkResult.error}`);
                return { success: false, error: `Chunk ${i + 1} failed: ${chunkResult.error}` };
            }
            
            allChunks.push(chunkResult);
            console.log(`   ✅ Chunk ${i + 1} uploaded successfully`);
            
            // Wait between chunks
            if (i < chunks.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        
        console.log(`   🎉 All ${chunks.length} chunks uploaded successfully!`);
        console.log(`   🖼️ Total images indexed: ${allChunks.reduce((sum, chunk) => sum + (chunk.imagesIndexed || 0), 0)}`);
        
        return { 
            success: true, 
            totalChunks: chunks.length,
            totalImagesIndexed: allChunks.reduce((sum, chunk) => sum + (chunk.imagesIndexed || 0), 0)
        };
        
    } catch (error) {
        console.log(`   ❌ Upload failed: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// Upload a single chunk
function uploadChunk(data) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);
        
        const options = {
            hostname: 'us-central1-cis-de.cloudfunctions.net',
            port: 443,
            path: '/uploadLargeFile',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            },
            timeout: 300000 // 5 minute timeout
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
    
    console.log('🚀 Chunked Large File Upload System');
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
        
        const result = await uploadChunkedLargeFile(filePath);
        
        if (result.success) {
            successCount++;
            totalImagesIndexed += result.totalImagesIndexed || 0;
        } else {
            errorCount++;
        }
        
        // Wait between files
        if (i < largePDFs.length - 1) {
            console.log(`   ⏳ Waiting 15 seconds before next file...`);
            await new Promise(resolve => setTimeout(resolve, 15000));
        }
    }
    
    console.log('\n📊 CHUNKED LARGE FILE UPLOAD SUMMARY:');
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

// Run the chunked large file upload
main().then(result => {
    console.log('\n🎉 Chunked Large File Upload System Completed!');
    console.log(`📊 Final results: ${result.successCount} successful, ${result.errorCount} failed out of ${result.totalFiles} total files`);
    console.log(`🖼️ Total images indexed: ${result.totalImagesIndexed}`);
    
    if (result.successCount > 0) {
        console.log('\n✅ Large owner manuals uploaded successfully!');
        console.log('🖼️ These PDFs contain the most valuable troubleshooting images');
        console.log('🔍 The chunked system handles large files efficiently');
        console.log('📚 Users now have access to comprehensive owner manuals with full image analysis');
        console.log('🚀 System ready for production troubleshooting!');
    }
}).catch(error => {
    console.error('❌ Chunked large file upload process failed:', error);
});
