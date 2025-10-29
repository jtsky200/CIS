const admin = require('firebase-admin');
const serviceAccount = require('./functions/serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkLyriqDocs() {
    console.log('📋 Checking LYRIQ documents in Knowledge Base...\n');
    
    const snapshot = await db.collection('knowledge-base')
        .where('tags', 'array-contains', 'LYRIQ')
        .get();
    
    snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`ID: ${doc.id}`);
        console.log(`Title: ${data.title}`);
        console.log(`Source: ${data.source}`);
        
        // Look for range mentions
        const rangeMatches = data.content.match(/\d{3}\s?[kK]ilometer/g);
        console.log(`Range mentions: ${rangeMatches ? rangeMatches.join(', ') : 'N/A'}`);
        
        // Look for price mentions
        const priceMatches = data.content.match(/CHF\s*[\d']+/g);
        console.log(`Price mentions: ${priceMatches ? priceMatches.join(', ') : 'N/A'}`);
        
        console.log('---\n');
    });
    
    process.exit(0);
}

checkLyriqDocs();

