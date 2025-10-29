const admin = require('firebase-admin');
const serviceAccount = require('./functions/serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Complete image database from official Cadillac Europe website
const modelImages = {
    'LYRIQ': {
        exterior: [
            'https://www.cadillaceurope.com/content/dam/cadillac/eu/europe/lyriq/hotspot-exterior/lyriq-exterior-bg-21-9.jpg?imwidth=1920',
            'https://www.cadillaceurope.com/content/dam/cadillac/eu/europe/lyriq/hotspot-exterior/lyriq-exterior-bg-5-4-m.jpg?imwidth=1200'
        ],
        interior: [
            'https://www.cadillaceurope.com/content/dam/cadillac/eu/europe/lyriq/hotspot-interior/lyriq-interior-01-bg-21-9.jpg?imwidth=1280',
            'https://www.cadillaceurope.com/content/dam/cadillac/eu/europe/lyriq/hotspot-interior/lyriq-interior-01-bg-5-4-m.jpg?imwidth=1200'
        ],
        charging: [
            'https://www.cadillaceurope.com/content/dam/cadillac/eu/europe/lyriq/main/lyriq-charging-bg-21-9.jpg?imwidth=1280'
        ],
        performance: [
            'https://www.cadillaceurope.com/content/dam/cadillac/eu/europe/lyriq/main/lyriq-performance-02-16-9.png?imwidth=981',
            'https://www.cadillaceurope.com/content/dam/cadillac/eu/europe/lyriq/main/lyriq-performance-03-16-9.png?imwidth=981'
        ],
        technology: [
            'https://www.cadillaceurope.com/content/dam/cadillac/eu/europe/lyriq/main/lyriq-technology-01-16-9.png?imwidth=981',
            'https://www.cadillaceurope.com/content/dam/cadillac/eu/europe/lyriq/main/lyriq-technology-02-16-9.png?imwidth=981'
        ]
    },
    'OPTIQ': {
        exterior: [
            'https://www.cadillaceurope.com/content/dam/cadillac/eu/europe/index/optiq/pdp/launch-edition/Exterior_OPTIQ-Launch-Edition_Desktop.jpg?imwidth=1200',
            'https://www.cadillaceurope.com/content/dam/cadillac/eu/europe/index/optiq/pdp/exterior/optiq-charging-bg-21-9.jpg?imwidth=1200',
            'https://www.cadillaceurope.com/content/dam/cadillac/eu/europe/index/optiq/pdp/exterior/optiq-sunroof.jpg?imwidth=1200',
            'https://www.cadillaceurope.com/content/dam/cadillac/eu/europe/index/optiq/pdp/exterior/optiq-brakes.jpg?imwidth=960'
        ],
        interior: [
            'https://www.cadillaceurope.com/content/dam/cadillac/eu/europe/index/optiq/pdp/interior/interior-elegance.jpg?imwidth=1200',
            'https://www.cadillaceurope.com/content/dam/cadillac/eu/europe/index/optiq/pdp/interior/lyriq-interior-03-16-9.jpg?imwidth=960'
        ],
        technology: [
            'https://www.cadillaceurope.com/content/dam/cadillac/eu/europe/index/optiq/pdp/technology/lyriq-google.jpg?imwidth=1200',
            'https://www.cadillaceurope.com/content/dam/cadillac/eu/europe/index/optiq/pdp/technology/lyriq-over-the-air.jpg?imwidth=1200'
        ],
        performance: [
            'https://www.cadillaceurope.com/content/dam/cadillac/eu/europe/index/optiq/pdp/performance/all-wheel-drive.jpg?imwidth=1200',
            'https://www.cadillaceurope.com/content/dam/cadillac/eu/europe/index/optiq/pdp/performance/one-pedal-driving.jpg?imwidth=1200'
        ],
        charging: [
            'https://www.cadillaceurope.com/content/dam/cadillac/eu/europe/index/optiq/pdp/charging/lyriq-charging-bg-21-9.jpg?imwidth=1200'
        ]
    },
    'VISTIQ': {
        exterior: [
            'https://www.cadillaceurope.com/content/dam/cadillac/eu/europe/vistiq/exterior/vistiq-exterior-bg-21-9.jpg?imwidth=1920'
        ],
        interior: [
            'https://www.cadillaceurope.com/content/dam/cadillac/eu/europe/vistiq/interior/vistiq-interior-bg-21-9.jpg?imwidth=1280'
        ],
        technology: [
            'https://www.cadillaceurope.com/content/dam/cadillac/eu/europe/vistiq/technology/vistiq-technology-bg-21-9.jpg?imwidth=1280'
        ]
    },
    'LYRIQ-V': {
        exterior: [
            'https://www.cadillaceurope.com/content/dam/cadillac/eu/europe/lyriq-v/exterior/lyriq-v-exterior-bg-21-9.jpg?imwidth=1920'
        ],
        interior: [
            'https://www.cadillaceurope.com/content/dam/cadillac/eu/europe/lyriq-v/interior/lyriq-v-interior-bg-21-9.jpg?imwidth=1280'
        ],
        performance: [
            'https://www.cadillaceurope.com/content/dam/cadillac/eu/europe/lyriq-v/performance/lyriq-v-performance-bg-21-9.jpg?imwidth=1280'
        ]
    }
};

async function updateKnowledgeBaseImages() {
    console.log('🖼️  Updating Knowledge Base with official Cadillac images...\n');
    
    for (const [model, categories] of Object.entries(modelImages)) {
        try {
            const docId = `cadillac-${model.toLowerCase()}-swiss-2025`;
            
            // Collect all images for this model
            const allImages = [];
            for (const category in categories) {
                allImages.push(...categories[category]);
            }
            
            console.log(`📸 ${model}: ${allImages.length} images`);
            
            // Update the document
            await db.collection('knowledge-base').doc(docId).update({
                images: allImages,
                lastModified: admin.firestore.FieldValue.serverTimestamp()
            });
            
            console.log(`✅ Updated ${model} with ${allImages.length} images`);
            
        } catch (error) {
            console.error(`❌ Error updating ${model}:`, error.message);
        }
    }
    
    console.log('\n✅ All images updated in Knowledge Base!');
    process.exit(0);
}

updateKnowledgeBaseImages();

