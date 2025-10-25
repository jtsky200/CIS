#!/usr/bin/env node

/**
 * Upload Local Files to Knowledge Base
 * 
 * This script uploads local files from the 'manuals technical' folder
 * to the Firebase knowledge base.
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Configuration
const MANUALS_DIR = './manuals technical';
const API_BASE = 'https://us-central1-cis-de.cloudfunctions.net';

// Get all files from the manuals directory
async function getLocalFiles() {
    try {
        const files = await fs.readdir(MANUALS_DIR);
        const fileList = [];
        
        for (const file of files) {
            const filePath = path.join(MANUALS_DIR, file);
            const stats = await fs.stat(filePath);
            
            if (stats.isFile()) {
                fileList.push({
                    name: file,
                    path: filePath,
                    size: stats.size
                });
            }
        }
        
        return fileList;
    } catch (error) {
        console.error('Error reading manuals directory:', error);
        return [];
    }
}

// Upload a single file to the knowledge base
async function uploadFile(fileInfo) {
    console.log(`\n📤 Uploading: ${fileInfo.name} (${fileInfo.size} bytes)`);
    
    try {
        // Read file content
        const content = await fs.readFile(fileInfo.path, 'utf8');
        
        // Determine file type
        const extension = path.extname(fileInfo.name).toLowerCase();
        let fileType = 'text';
        if (extension === '.pdf') fileType = 'pdf';
        else if (extension === '.md') fileType = 'markdown';
        else if (extension === '.txt') fileType = 'text';
        
        // Upload via API
        const uploadData = {
            filename: fileInfo.name,
            content: content,
            fileType: fileType,
            size: fileInfo.size,
            uploadedBy: 'system',
            isActive: true
        };
        
        const command = `powershell -Command "Invoke-RestMethod -Uri '${API_BASE}/knowledgebase' -Method POST -ContentType 'application/json' -Body '${JSON.stringify(uploadData)}'"`;
        
        const { stdout, stderr } = await execAsync(command);
        
        if (stderr) {
            console.error(`   ❌ Error uploading ${fileInfo.name}:`, stderr);
            return false;
        }
        
        console.log(`   ✅ Successfully uploaded ${fileInfo.name}`);
        return true;
        
    } catch (error) {
        console.error(`   ❌ Error uploading ${fileInfo.name}:`, error.message);
        return false;
    }
}

// Main execution
async function main() {
    console.log('🚀 Starting local files upload to knowledge base...\n');
    console.log('=' .repeat(60));
    
    try {
        // Get all local files
        console.log('📁 Scanning local files...');
        const files = await getLocalFiles();
        
        if (files.length === 0) {
            console.log('❌ No files found in manuals directory');
            return;
        }
        
        console.log(`✅ Found ${files.length} files to upload`);
        
        // Upload each file
        console.log('\n📤 Uploading files...');
        let successCount = 0;
        
        for (const file of files) {
            const success = await uploadFile(file);
            if (success) successCount++;
            
            // Wait a bit between uploads to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Summary
        console.log('\n' + '=' .repeat(60));
        console.log('✅ UPLOAD COMPLETE\n');
        console.log(`📊 Summary:`);
        console.log(`   - Files found: ${files.length}`);
        console.log(`   - Files uploaded: ${successCount}`);
        console.log(`   - Success rate: ${Math.round((successCount / files.length) * 100)}%`);
        
        if (successCount > 0) {
            console.log('\n💡 Next steps:');
            console.log('   - Check the Wissensdatenbank in the web app');
            console.log('   - Refresh the page to see the new documents');
            console.log('   - Test the chatbot with the new knowledge');
        }
        
    } catch (error) {
        console.error('\n❌ Fatal error:', error);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { getLocalFiles, uploadFile };
