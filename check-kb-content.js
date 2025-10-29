const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./functions/serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkContent() {
    try {
        const doc = await db.collection('knowledgeBase').doc('NGRwLZCxokgxOvSBK0YZ').get();
        
        if (doc.exists) {
            console.log('Document Title:', doc.data().title);
            console.log('\n=== FULL CONTENT ===\n');
            console.log(doc.data().content);
        } else {
            console.log('Document not found');
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}

checkContent();

