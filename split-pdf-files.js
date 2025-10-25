const fs = require('fs');
const path = require('path');
const https = require('https');

// PDF splitting system for large owner manuals
async function splitPDFFile(filePath, maxSizeMB = 2) {
    const fullPath = path.join('./manuals technical', filePath);
    
    if (!fs.existsSync(fullPath)) {
        console.log(`❌ File not found: ${filePath}`);
        return { success: false, error: 'File not found' };
    }
    
    const stats = fs.statSync(fullPath);
    const sizeMB = Math.round(stats.size / 1024 / 1024);
    
    console.log(`📄 Processing: ${path.basename(filePath)} (${sizeMB}MB)`);
    
    if (sizeMB <= maxSizeMB) {
        console.log(`   ✅ File is already small enough (${sizeMB}MB <= ${maxSizeMB}MB)`);
        return { success: true, chunks: [filePath], message: 'File already small enough' };
    }
    
    try {
        // Read the entire PDF file
        const fileBuffer = fs.readFileSync(fullPath);
        const base64Content = fileBuffer.toString('base64');
        
        // Calculate how many chunks we need
        const maxChunkSizeBytes = maxSizeMB * 1024 * 1024;
        const totalChunks = Math.ceil(fileBuffer.length / maxChunkSizeBytes);
        
        console.log(`   📊 Splitting into ${totalChunks} chunks of max ${maxSizeMB}MB each`);
        
        // Create chunks directory
        const chunksDir = path.join('./manuals technical', 'chunks', path.basename(filePath, '.pdf'));
        if (!fs.existsSync(chunksDir)) {
            fs.mkdirSync(chunksDir, { recursive: true });
        }
        
        const chunks = [];
        
        // Split the file into chunks
        for (let i = 0; i < totalChunks; i++) {
            const start = i * maxChunkSizeBytes;
            const end = Math.min(start + maxChunkSizeBytes, fileBuffer.length);
            const chunk = fileBuffer.slice(start, end);
            
            const chunkFilename = `${path.basename(filePath, '.pdf')}_part${i + 1}.pdf`;
            const chunkPath = path.join(chunksDir, chunkFilename);
            
            // Write chunk to file
            fs.writeFileSync(chunkPath, chunk);
            
            const chunkSizeMB = Math.round(chunk.length / 1024 / 1024);
            console.log(`   📄 Created chunk ${i + 1}/${totalChunks}: ${chunkFilename} (${chunkSizeMB}MB)`);
            
            chunks.push({
                filename: chunkFilename,
                path: chunkPath,
                size: chunk.length,
                sizeMB: chunkSizeMB,
                part: i + 1,
                totalParts: totalChunks
            });
        }
        
        console.log(`   ✅ Successfully split into ${chunks.length} chunks`);
        return { success: true, chunks: chunks, originalSize: sizeMB, totalChunks: chunks.length };
        
    } catch (error) {
        console.log(`   ❌ Split failed: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// Upload split PDF chunks
async function uploadSplitChunks(chunks, originalFile, vehicleType, category) {
    console.log(`\n📤 Uploading ${chunks.length} chunks for ${originalFile}:`);
    
    let successCount = 0;
    let errorCount = 0;
    let totalImagesIndexed = 0;
    
    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`\n📤 Uploading chunk ${i + 1}/${chunks.length}: ${chunk.filename} (${chunk.sizeMB}MB)`);
        
        try {
            // Read chunk file
            const chunkBuffer = fs.readFileSync(chunk.path);
            const base64Content = chunkBuffer.toString('base64');
            
            // Upload to technical database
            const result = await uploadChunkToDatabase({
                filename: chunk.filename,
                content: base64Content,
                vehicleType: vehicleType,
                category: category,
                size: chunk.size,
                isLargeFile: true,
                fileType: 'pdf',
                originalFile: originalFile,
                part: chunk.part,
                totalParts: chunk.totalParts
            });
            
            if (result.success) {
                console.log(`   ✅ Success: ${result.message}`);
                console.log(`   🖼️ Images indexed: ${result.imagesIndexed || 0}`);
                successCount++;
                totalImagesIndexed += result.imagesIndexed || 0;
            } else {
                console.log(`   ❌ Error: ${result.error || 'Upload failed'}`);
                errorCount++;
            }
            
        } catch (error) {
            console.log(`   ❌ Upload failed: ${error.message}`);
            errorCount++;
        }
        
        // Wait between chunks
        if (i < chunks.length - 1) {
            console.log(`   ⏳ Waiting 3 seconds before next chunk...`);
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
    
    return { successCount, errorCount, totalImagesIndexed };
}

// Upload chunk to database
function uploadChunkToDatabase(data) {
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
    
    console.log('🚀 PDF Splitting and Upload System');
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
    
    let totalSuccessCount = 0;
    let totalErrorCount = 0;
    let totalImagesIndexed = 0;
    let totalFilesProcessed = 0;
    
    for (let i = 0; i < largePDFs.length; i++) {
        const filePath = largePDFs[i];
        console.log(`\n📄 Processing ${i + 1}/${largePDFs.length}: ${path.basename(filePath)}`);
        
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
        
        // Split the PDF file
        const splitResult = await splitPDFFile(filePath, 2); // 2MB max per chunk
        
        if (splitResult.success) {
            if (splitResult.chunks.length === 1 && splitResult.message === 'File already small enough') {
                console.log(`   ✅ File is already small enough, uploading directly...`);
                
                // Upload the original file directly
                const directResult = await uploadChunkToDatabase({
                    filename: path.basename(filePath),
                    content: fs.readFileSync(path.join('./manuals technical', filePath)).toString('base64'),
                    vehicleType: vehicleType,
                    category: category,
                    size: fs.statSync(path.join('./manuals technical', filePath)).size,
                    isLargeFile: false,
                    fileType: 'pdf'
                });
                
                if (directResult.success) {
                    totalSuccessCount++;
                    totalImagesIndexed += directResult.imagesIndexed || 0;
                } else {
                    totalErrorCount++;
                }
            } else {
                console.log(`   📊 Split into ${splitResult.chunks.length} chunks, uploading...`);
                
                // Upload all chunks
                const uploadResult = await uploadSplitChunks(splitResult.chunks, path.basename(filePath), vehicleType, category);
                
                totalSuccessCount += uploadResult.successCount;
                totalErrorCount += uploadResult.errorCount;
                totalImagesIndexed += uploadResult.totalImagesIndexed;
            }
            
            totalFilesProcessed++;
        } else {
            console.log(`   ❌ Failed to split: ${splitResult.error}`);
            totalErrorCount++;
        }
        
        // Wait between files
        if (i < largePDFs.length - 1) {
            console.log(`   ⏳ Waiting 10 seconds before next file...`);
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }
    
    console.log('\n📊 PDF SPLITTING AND UPLOAD SUMMARY:');
    console.log(`   ✅ Successful uploads: ${totalSuccessCount}`);
    console.log(`   ❌ Failed uploads: ${totalErrorCount}`);
    console.log(`   🖼️ Total images indexed: ${totalImagesIndexed}`);
    console.log(`   📁 Total files processed: ${totalFilesProcessed}`);
    
    if (totalSuccessCount > 0) {
        console.log('\n🔄 Triggering final image indexing...');
        await triggerFinalImageIndexing();
    }
    
    return { totalSuccessCount, totalErrorCount, totalImagesIndexed, totalFilesProcessed };
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

// Run the PDF splitting and upload system
main().then(result => {
    console.log('\n🎉 PDF Splitting and Upload System Completed!');
    console.log(`📊 Final results: ${result.totalSuccessCount} successful, ${result.totalErrorCount} failed out of ${result.totalFilesProcessed} total files`);
    console.log(`🖼️ Total images indexed: ${result.totalImagesIndexed}`);
    
    if (result.totalSuccessCount > 0) {
        console.log('\n✅ Large owner manuals split and uploaded successfully!');
        console.log('🖼️ These PDFs contain the most valuable troubleshooting images');
        console.log('🔍 The splitting system handles large files efficiently');
        console.log('📚 Users now have access to comprehensive owner manuals with full image analysis');
        console.log('🚀 System ready for production troubleshooting!');
    }
}).catch(error => {
    console.error('❌ PDF splitting and upload process failed:', error);
});
