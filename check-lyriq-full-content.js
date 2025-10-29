const admin = require('firebase-admin');
const serviceAccount = require('./functions/serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkFullContent() {
    console.log('📋 Checking LYRIQ full content...\n');
    
    const doc = await db.collection('knowledge-base')
        .doc('cadillac-lyriq-swiss-2025')
        .get();
    
    if (doc.exists) {
        const data = doc.data();
        console.log('CONTENT FIELD:');
        console.log(data.content);
        console.log('\n\nFULL_CONTENT FIELD:');
        console.log(data.fullContent);
    }
    
    process.exit(0);
}

checkFullContent();

