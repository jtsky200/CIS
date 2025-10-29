const admin = require('firebase-admin');
const serviceAccount = require('./functions/serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkKnowledgeBaseImages() {
    console.log('🔍 Checking Knowledge Base images...\n');
    
    try {
        const snapshot = await db.collection('knowledge-base').get();
        
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`\n📄 Document ID: ${doc.id}`);
            console.log(`   Title: ${data.title}`);
            console.log(`   Category: ${data.category}`);
            console.log(`   Tags: ${data.tags ? data.tags.join(', ') : 'none'}`);
            console.log(`   Images: ${data.images ? data.images.length : 0}`);
            
            if (data.images && data.images.length > 0) {
                console.log('   Image URLs:');
                data.images.slice(0, 3).forEach((img, index) => {
                    console.log(`   ${index + 1}. ${img.substring(0, 80)}...`);
                });
            }
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
    
    process.exit(0);
}

checkKnowledgeBaseImages();

