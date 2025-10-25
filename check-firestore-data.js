// Check Firestore Data - Quick diagnostic script
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkCollections() {
    console.log('\n🔍 Checking Firestore Collections...\n');
    console.log('='.repeat(60));
    
    // Check knowledgebase collection
    try {
        console.log('\n📚 KNOWLEDGE BASE (knowledgebase):');
        console.log('-'.repeat(60));
        
        const kbSnapshot = await db.collection('knowledgebase').get();
        console.log(`Total documents: ${kbSnapshot.size}`);
        
        if (kbSnapshot.empty) {
            console.log('⚠️  EMPTY - No documents found!');
        } else {
            let activeCount = 0;
            let inactiveCount = 0;
            let totalSize = 0;
            const fileTypes = new Set();
            
            kbSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.isActive) activeCount++;
                else inactiveCount++;
                
                totalSize += data.size || 0;
                fileTypes.add(data.fileType || 'unknown');
                
                // Show first 3 documents
                if (activeCount + inactiveCount <= 3) {
                    console.log(`\n  📄 ${doc.id}`);
                    console.log(`     Name: ${data.filename || 'N/A'}`);
                    console.log(`     Type: ${data.fileType || 'N/A'}`);
                    console.log(`     Size: ${((data.size || 0) / 1024).toFixed(2)} KB`);
                    console.log(`     Active: ${data.isActive ? '✅' : '❌'}`);
                }
            });
            
            console.log(`\n  ✅ Active documents: ${activeCount}`);
            console.log(`  ❌ Inactive documents: ${inactiveCount}`);
            console.log(`  📊 Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
            console.log(`  📁 File types: ${Array.from(fileTypes).join(', ')}`);
        }
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
    
    // Check technicalDatabase collection
    try {
        console.log('\n\n🔧 TECHNICAL DATABASE (technicalDatabase):');
        console.log('-'.repeat(60));
        
        const techSnapshot = await db.collection('technicalDatabase').get();
        console.log(`Total documents: ${techSnapshot.size}`);
        
        if (techSnapshot.empty) {
            console.log('⚠️  EMPTY - No documents found!');
        } else {
            let activeCount = 0;
            let inactiveCount = 0;
            let totalSize = 0;
            const categories = new Set();
            
            techSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.isActive) activeCount++;
                else inactiveCount++;
                
                totalSize += data.size || 0;
                categories.add(data.category || 'unknown');
                
                // Show first 3 documents
                if (activeCount + inactiveCount <= 3) {
                    console.log(`\n  📄 ${doc.id}`);
                    console.log(`     Name: ${data.name || data.filename || 'N/A'}`);
                    console.log(`     Type: ${data.fileType || 'N/A'}`);
                    console.log(`     Category: ${data.category || 'N/A'}`);
                    console.log(`     Size: ${((data.size || 0) / 1024).toFixed(2)} KB`);
                    console.log(`     Active: ${data.isActive ? '✅' : '❌'}`);
                }
            });
            
            console.log(`\n  ✅ Active documents: ${activeCount}`);
            console.log(`  ❌ Inactive documents: ${inactiveCount}`);
            console.log(`  📊 Total size: ${(totalSize / 1024).toFixed(2)} KB`);
            console.log(`  📁 Categories: ${Array.from(categories).join(', ')}`);
        }
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
    
    // Check other collections
    try {
        console.log('\n\n📋 ALL COLLECTIONS:');
        console.log('-'.repeat(60));
        
        const collections = await db.listCollections();
        collections.forEach(col => {
            console.log(`  • ${col.id}`);
        });
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Check complete!\n');
    
    process.exit(0);
}

// Run the check
checkCollections().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});

