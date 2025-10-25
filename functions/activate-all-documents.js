const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
    const serviceAccount = require('./serviceAccountKey.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function activateAllDocuments() {
    try {
        console.log('🔄 Activating all inactive documents...\n');
        
        // Get all inactive documents from knowledgebase
        const kbSnapshot = await db.collection('knowledgebase').get();
        let activatedCount = 0;
        
        console.log('📚 KNOWLEDGE BASE COLLECTION:');
        console.log(`Found ${kbSnapshot.size} total documents`);
        
        for (const doc of kbSnapshot.docs) {
            const data = doc.data();
            if (data.isActive !== true) {
                console.log(`  🔄 Activating: ${data.filename}`);
                await doc.ref.update({ isActive: true });
                activatedCount++;
            }
        }
        
        console.log(`\n✅ Activated ${activatedCount} documents in knowledge base`);
        
        // Check technical database too
        const techSnapshot = await db.collection('technicalDatabase').get();
        let techActivatedCount = 0;
        
        console.log('\n🔧 TECHNICAL DATABASE COLLECTION:');
        console.log(`Found ${techSnapshot.size} total documents`);
        
        for (const doc of techSnapshot.docs) {
            const data = doc.data();
            if (data.isActive !== true) {
                console.log(`  🔄 Activating: ${data.filename}`);
                await doc.ref.update({ isActive: true });
                techActivatedCount++;
            }
        }
        
        console.log(`\n✅ Activated ${techActivatedCount} documents in technical database`);
        
        // Final summary
        console.log('\n📊 FINAL SUMMARY:');
        console.log(`Knowledge Base: ${activatedCount} documents activated`);
        console.log(`Technical Database: ${techActivatedCount} documents activated`);
        console.log(`Total activated: ${activatedCount + techActivatedCount}`);
        
        console.log('\n🎉 All documents are now active and should be visible in the web app!');
        
    } catch (error) {
        console.error('❌ Error activating documents:', error);
    }
}

activateAllDocuments();
