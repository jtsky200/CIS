// Simple Firestore check using fetch API
const https = require('https');

const API_BASE = 'https://us-central1-cis-de.cloudfunctions.net';

async function checkEndpoint(name, url) {
    return new Promise((resolve) => {
        console.log(`\n🔍 Checking ${name}...`);
        console.log(`URL: ${url}`);
        
        https.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    const docCount = json.documents ? json.documents.length : 0;
                    
                    console.log(`✅ Status: ${res.statusCode}`);
                    console.log(`✅ Documents found: ${docCount}`);
                    
                    if (docCount > 0) {
                        console.log(`\n📄 First document sample:`);
                        const firstDoc = json.documents[0];
                        console.log(`   - ID: ${firstDoc.id || 'N/A'}`);
                        console.log(`   - Filename: ${firstDoc.filename || firstDoc.name || 'N/A'}`);
                        console.log(`   - Type: ${firstDoc.fileType || 'N/A'}`);
                        console.log(`   - Size: ${firstDoc.size ? (firstDoc.size / 1024).toFixed(2) + ' KB' : 'N/A'}`);
                        console.log(`   - Active: ${firstDoc.isActive ? '✅' : '❌'}`);
                    } else {
                        console.log(`⚠️  NO DOCUMENTS FOUND IN RESPONSE!`);
                    }
                    
                    resolve({ success: true, count: docCount });
                } catch (error) {
                    console.log(`❌ Error parsing response: ${error.message}`);
                    console.log(`Raw response: ${data.substring(0, 200)}`);
                    resolve({ success: false, error: error.message });
                }
            });
        }).on('error', (error) => {
            console.log(`❌ Request error: ${error.message}`);
            resolve({ success: false, error: error.message });
        });
    });
}

async function main() {
    console.log('\n' + '='.repeat(70));
    console.log('🔍 FIRESTORE DATABASE CHECK - Live API Test');
    console.log('='.repeat(70));
    
    // Check Knowledge Base
    console.log('\n📚 KNOWLEDGE BASE:');
    console.log('-'.repeat(70));
    const kbResult = await checkEndpoint(
        'Knowledge Base',
        `${API_BASE}/knowledgebase?t=${Date.now()}`
    );
    
    // Check Technical Database
    console.log('\n\n🔧 TECHNICAL DATABASE:');
    console.log('-'.repeat(70));
    const techResult = await checkEndpoint(
        'Technical Database',
        `${API_BASE}/technicalDatabase?t=${Date.now()}`
    );
    
    // Summary
    console.log('\n\n' + '='.repeat(70));
    console.log('📊 SUMMARY:');
    console.log('='.repeat(70));
    console.log(`\n📚 Knowledge Base: ${kbResult.success ? `✅ ${kbResult.count} documents` : `❌ ${kbResult.error}`}`);
    console.log(`🔧 Technical Database: ${techResult.success ? `✅ ${techResult.count} documents` : `❌ ${techResult.error}`}`);
    
    if (kbResult.count === 0 && techResult.count === 0) {
        console.log('\n⚠️  PROBLEM IDENTIFIED:');
        console.log('   Both databases are returning 0 documents!');
        console.log('\n   Possible causes:');
        console.log('   1. ❌ No documents uploaded to Firestore');
        console.log('   2. ❌ All documents are marked as inactive (isActive: false)');
        console.log('   3. ❌ Firebase Functions are querying wrong collections');
        console.log('   4. ❌ Firestore security rules blocking access');
        console.log('\n   Next steps:');
        console.log('   1. Check Firestore Console: https://console.firebase.google.com/project/cis-de/firestore');
        console.log('   2. Verify collections exist: knowledgebase, technicalDatabase');
        console.log('   3. Check if documents have isActive: true');
        console.log('   4. Review Firestore security rules');
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ Check complete!\n');
}

main().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
});

