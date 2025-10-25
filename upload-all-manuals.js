const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const BASE_URL = 'https://us-central1-cis-de.cloudfunctions.net';
const MANUALS_DIR = './manuals technical';

// Helper function to make HTTP requests
function makeRequest(url, data) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);
        
        const options = {
            hostname: 'us-central1-cis-de.cloudfunctions.net',
            port: 443,
            path: url.replace('https://us-central1-cis-de.cloudfunctions.net', ''),
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
                    reject(new Error(`Failed to parse response: ${responseData}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

// Upload file to technical database
async function uploadToTechnicalDatabase(filePath, vehicleType, category) {
    try {
        const fileBuffer = fs.readFileSync(filePath);
        const base64Data = fileBuffer.toString('base64');
        const fileName = path.basename(filePath);
        const fileExt = path.extname(fileName).toLowerCase();
        
        let fileType = 'unknown';
        if (fileExt === '.pdf') fileType = 'pdf';
        else if (fileExt === '.jpg' || fileExt === '.jpeg') fileType = 'image';
        else if (fileExt === '.png') fileType = 'image';
        else if (fileExt === '.txt') fileType = 'text';
        else if (fileExt === '.docx') fileType = 'document';
        else if (fileExt === '.xlsx') fileType = 'spreadsheet';
        else if (fileExt === '.md') fileType = 'markdown';

        const uploadData = {
            filename: fileName,
            fileData: base64Data,
            category: category,
            subcategory: vehicleType,
            description: `Technical manual for ${vehicleType} - ${category}`
        };

        console.log(`📤 Uploading ${fileName} to technical database...`);
        const result = await makeRequest(`${BASE_URL}/uploadTechnicalDocument`, uploadData);
        console.log(`✅ Uploaded: ${fileName} (ID: ${result.id})`);
        return result;
    } catch (error) {
        console.error(`❌ Error uploading ${filePath}:`, error.message);
        return null;
    }
}

// Upload file to knowledge base
async function uploadToKnowledgeBase(filePath, vehicleType, category) {
    try {
        const fileBuffer = fs.readFileSync(filePath);
        const base64Data = fileBuffer.toString('base64');
        const fileName = path.basename(filePath);
        
        // Extract text content for knowledge base
        let content = '';
        const fileExt = path.extname(fileName).toLowerCase();
        
        if (fileExt === '.txt' || fileExt === '.md') {
            content = fileBuffer.toString('utf-8');
        } else if (fileExt === '.pdf') {
            content = `PDF Document: ${fileName} - ${vehicleType} ${category}`;
        } else if (fileExt === '.jpg' || fileExt === '.jpeg' || fileExt === '.png') {
            content = `Image: ${fileName} - ${vehicleType} ${category}`;
        } else {
            content = `Document: ${fileName} - ${vehicleType} ${category}`;
        }

        const uploadData = {
            filename: fileName,
            content: content,
            fileType: path.extname(fileName).substring(1).toLowerCase(),
            vehicleType: vehicleType,
            category: category
        };

        console.log(`📤 Uploading ${fileName} to knowledge base...`);
        const result = await makeRequest(`${BASE_URL}/upload`, uploadData);
        console.log(`✅ Uploaded: ${fileName} (ID: ${result.files[0].documentId})`);
        return result;
    } catch (error) {
        console.error(`❌ Error uploading ${filePath}:`, error.message);
        return null;
    }
}

// Process all files in a directory
async function processDirectory(dirPath, vehicleType, category) {
    const files = fs.readdirSync(dirPath);
    let successCount = 0;
    let errorCount = 0;

    for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            console.log(`📁 Processing subdirectory: ${file}`);
            const subResults = await processDirectory(filePath, vehicleType, `${category}/${file}`);
            successCount += subResults.success;
            errorCount += subResults.errors;
        } else {
            try {
                // Upload to both databases
                const techResult = await uploadToTechnicalDatabase(filePath, vehicleType, category);
                const kbResult = await uploadToKnowledgeBase(filePath, vehicleType, category);
                
                if (techResult || kbResult) {
                    successCount++;
                } else {
                    errorCount++;
                }
            } catch (error) {
                console.error(`❌ Error processing ${filePath}:`, error.message);
                errorCount++;
            }
        }
    }

    return { success: successCount, errors: errorCount };
}

// Main function
async function main() {
    console.log('🚀 Starting manual upload process...');
    console.log('=====================================');

    let totalSuccess = 0;
    let totalErrors = 0;

    try {
        // Process each vehicle type directory
        const vehicleTypes = ['GENERAL', 'LYRIQ', 'OPTIQ', 'VISTIQ'];
        
        for (const vehicleType of vehicleTypes) {
            const vehicleDir = path.join(MANUALS_DIR, vehicleType);
            
            if (fs.existsSync(vehicleDir)) {
                console.log(`\n📁 Processing ${vehicleType} manuals...`);
                const results = await processDirectory(vehicleDir, vehicleType, 'MANUAL');
                totalSuccess += results.success;
                totalErrors += results.errors;
                console.log(`✅ ${vehicleType}: ${results.success} files uploaded, ${results.errors} errors`);
            }
        }

        console.log('\n🔄 Starting image indexing...');
        const indexResult = await makeRequest(`${BASE_URL}/indexAllImages`, {});
        console.log('📊 Indexing Results:');
        console.log(`  - Total Documents: ${indexResult.totalDocuments}`);
        console.log(`  - Images Indexed: ${indexResult.imagesIndexed}`);
        console.log(`  - Errors: ${indexResult.errors}`);

        console.log('\n🎉 Upload and indexing completed!');
        console.log('=====================================');
        console.log(`✅ Total files uploaded: ${totalSuccess}`);
        console.log(`❌ Total errors: ${totalErrors}`);
        console.log(`🖼️ Images indexed: ${indexResult.imagesIndexed}`);

    } catch (error) {
        console.error('❌ Fatal error:', error.message);
    }
}

// Run the script
main().catch(console.error);
