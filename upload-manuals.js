const fs = require('fs').promises;
const path = require('path');

async function uploadManuals() {
    const API_BASE = 'https://us-central1-cis-de.cloudfunctions.net';
    const manualsDir = './manuals technical';
    
    try {
        // Get all files in the manuals directory
        const files = await fs.readdir(manualsDir);
        console.log(`Found ${files.length} files to upload`);
        
        for (const file of files) {
            if (file.endsWith('.txt') || file.endsWith('.md')) {
                console.log(`\n📤 Uploading ${file}...`);
                
                try {
                    // Read file content
                    const filePath = path.join(manualsDir, file);
                    const content = await fs.readFile(filePath, 'utf8');
                    
                    // Determine file type
                    const extension = path.extname(file).toLowerCase();
                    let fileType = 'text';
                    if (extension === '.md') fileType = 'markdown';
                    
                    // Prepare upload data
                    const uploadData = {
                        filename: file,
                        content: content,
                        fileType: fileType,
                        size: content.length,
                        uploadedBy: 'system',
                        isActive: true
                    };
                    
                    // Upload via fetch
                    const response = await fetch(`${API_BASE}/upload`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(uploadData)
                    });
                    
                    if (response.ok) {
                        const result = await response.json();
                        console.log(`✅ Successfully uploaded ${file}`);
                    } else {
                        const errorText = await response.text();
                        console.log(`❌ Failed to upload ${file}: ${response.status} - ${errorText}`);
                    }
                    
                } catch (error) {
                    console.log(`❌ Error uploading ${file}: ${error.message}`);
                }
                
                // Wait a bit between uploads
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        console.log('\n✅ Upload process completed');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

uploadManuals();
