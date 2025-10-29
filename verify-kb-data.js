const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./functions/serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function verifyKBData() {
    try {
        console.log('🔍 Checking Knowledge Base for pricing documents...\n');
        
        const snapshot = await db.collection('knowledgeBase')
            .orderBy('uploadedAt', 'desc')
            .limit(10)
            .get();
        
        console.log(`Found ${snapshot.size} documents in Knowledge Base\n`);
        
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log('---');
            console.log('ID:', doc.id);
            console.log('Title:', data.title);
            console.log('Category:', data.category);
            console.log('Tags:', data.tags);
            console.log('Content preview:', data.content?.substring(0, 100) + '...');
            console.log('');
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        process.exit(0);
    }
}

verifyKBData();

