const fs = require('fs').promises;
const path = require('path');

async function uploadVistiqManual() {
    try {
        console.log('📤 Uploading VISTIQ manual to knowledge base...');
        
        // Read the VISTIQ manual file
        const filePath = './manuals technical/vistiq-complete-manual.txt';
        const content = await fs.readFile(filePath, 'utf8');
        
        // Prepare upload data
        const uploadData = {
            filename: 'vistiq-complete-manual.txt',
            content: content,
            fileType: 'text',
            size: content.length,
            uploadedBy: 'system',
            isActive: true
        };
        
        // Upload via fetch
        const response = await fetch('https://us-central1-cis-de.cloudfunctions.net/knowledgebase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(uploadData)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Successfully uploaded VISTIQ manual');
            console.log('Result:', result);
        } else {
            console.error('❌ Upload failed:', response.status, response.statusText);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

uploadVistiqManual();
