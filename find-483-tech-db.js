const admin = require('firebase-admin');
const serviceAccount = require('./functions/serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function find483InTechDB() {
    console.log('🔍 Searching Technical Database for "483"...\n');
    
    const snapshot = await db.collection('technical-database').get();
    
    let found = 0;
    snapshot.forEach(doc => {
        const data = doc.data();
        const contentStr = JSON.stringify(data).toLowerCase();
        
        if (contentStr.includes('483')) {
            found++;
            console.log(`\n❌ FOUND IN: ${doc.id}`);
            console.log(`Title: ${data.title}`);
            console.log(`Tags: ${data.tags ? data.tags.join(', ') : 'N/A'}`);
        }
    });
    
    if (found === 0) {
        console.log('✅ No documents containing "483" found in Technical Database!');
    } else {
        console.log(`\n\n⚠️  Total documents with "483": ${found}`);
    }
    
    process.exit(0);
}

find483InTechDB();

