const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
    const serviceAccount = require('./functions/serviceAccountKey.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkAllDocuments() {
    try {
        console.log('🔍 Checking all documents in all collections...\n');
        
        // Check knowledgebase collection (all documents)
        console.log('📚 KNOWLEDGE BASE COLLECTION:');
        const kbSnapshot = await db.collection('knowledgebase').get();
        console.log(`Total documents: ${kbSnapshot.size}`);
        
        let activeCount = 0;
        let inactiveCount = 0;
        
        kbSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.isActive === true) {
                activeCount++;
            } else {
                inactiveCount++;
                console.log(`  ❌ Inactive: ${data.filename} (isActive: ${data.isActive})`);
            }
        });
        
        console.log(`  ✅ Active: ${activeCount}`);
        console.log(`  ❌ Inactive: ${inactiveCount}\n`);
        
        // Check technicalDatabase collection (all documents)
        console.log('🔧 TECHNICAL DATABASE COLLECTION:');
        const techSnapshot = await db.collection('technicalDatabase').get();
        console.log(`Total documents: ${techSnapshot.size}`);
        
        let techActiveCount = 0;
        let techInactiveCount = 0;
        
        techSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.isActive === true) {
                techActiveCount++;
            } else {
                techInactiveCount++;
                console.log(`  ❌ Inactive: ${data.filename} (isActive: ${data.isActive})`);
            }
        });
        
        console.log(`  ✅ Active: ${techActiveCount}`);
        console.log(`  ❌ Inactive: ${techInactiveCount}\n`);
        
        // Check for other collections
        console.log('🔍 CHECKING FOR OTHER COLLECTIONS:');
        const collections = await db.listCollections();
        console.log('Available collections:');
        collections.forEach(collection => {
            console.log(`  - ${collection.id}`);
        });
        
        // Summary
        console.log('\n📊 SUMMARY:');
        console.log(`Knowledge Base: ${activeCount} active, ${inactiveCount} inactive (${kbSnapshot.size} total)`);
        console.log(`Technical Database: ${techActiveCount} active, ${techInactiveCount} inactive (${techSnapshot.size} total)`);
        console.log(`Total Active Documents: ${activeCount + techActiveCount}`);
        console.log(`Total Documents: ${kbSnapshot.size + techSnapshot.size}`);
        
    } catch (error) {
        console.error('❌ Error checking documents:', error);
    }
}

checkAllDocuments();
