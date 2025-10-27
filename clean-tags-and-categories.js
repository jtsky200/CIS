// Clean Tags and Categories Script
// Run this in browser console on settings page to clean up categories

const API_BASE = 'https://us-central1-cis-de.cloudfunctions.net';

async function cleanTagsAndCategories() {
    console.log('🧹 Starting tag and category cleanup...');
    
    // Define category mappings
    const categoryMappings = {
        'LYRIQ Owner Manuals': 'LYRIQ',
        'VISTIQ Owner Manuals': 'VISTIQ',
        'OPTIQ Owner Manuals': 'OPTIQ',
        'Troubleshooting': 'TROUBLESHOOTING',
        'General': 'GENERAL'
    };
    
    // Define tags to merge (remove duplicates)
    const tagsToMerge = {
        'TROUBLESHOOTING': ['Troubleshooting', 'TROUBLESHOOTING'],
        'CHARGING': ['charging', 'CHARGING']
    };
    
    try {
        // Load all documents
        const [kbResponse, tdResponse] = await Promise.all([
            fetch(`${API_BASE}/knowledgebase`),
            fetch(`${API_BASE}/technicalDatabase`)
        ]);
        
        const kbData = await kbResponse.json();
        const tdData = await tdResponse.json();
        
        const kbDocs = kbData.documents || [];
        const tdDocs = tdData.documents || [];
        
        console.log(`📄 Found ${kbDocs.length} KB documents and ${tdDocs.length} TD documents`);
        
        let updatedCategories = 0;
        let updatedTags = 0;
        
        // Process Knowledge Base documents
        for (const doc of kbDocs) {
            let needsUpdate = false;
            const updates = {};
            
            // Update category
            if (doc.category && categoryMappings[doc.category]) {
                updates.category = categoryMappings[doc.category];
                console.log(`KB: ${doc.filename || doc.name}`);
                console.log(`   Category: ${doc.category} → ${updates.category}`);
                needsUpdate = true;
                updatedCategories++;
            }
            
            // Update tags
            if (doc.tags && Array.isArray(doc.tags) && doc.tags.length > 0) {
                const newTags = [...doc.tags];
                let tagUpdated = false;
                
                // Merge duplicate tags
                for (const [canonicalTag, variations] of Object.entries(tagsToMerge)) {
                    const hasVariations = variations.some(v => newTags.includes(v));
                    if (hasVariations) {
                        // Remove all variations
                        variations.forEach(v => {
                            const index = newTags.indexOf(v);
                            if (index > -1) newTags.splice(index, 1);
                        });
                        // Add canonical tag if not present
                        if (!newTags.includes(canonicalTag)) {
                            newTags.push(canonicalTag);
                        }
                        tagUpdated = true;
                    }
                }
                
                if (tagUpdated) {
                    updates.tags = newTags;
                    console.log(`KB: ${doc.filename || doc.name}`);
                    console.log(`   Tags: ${doc.tags} → ${newTags}`);
                    needsUpdate = true;
                    updatedTags++;
                }
            }
            
            if (needsUpdate) {
                // In production, you would call update API here
                console.log(`Would update KB doc: ${doc.id}`, updates);
            }
        }
        
        // Process Technical Database documents
        for (const doc of tdDocs) {
            let needsUpdate = false;
            const updates = {};
            
            // Update category
            if (doc.category && categoryMappings[doc.category]) {
                updates.category = categoryMappings[doc.category];
                console.log(`TD: ${doc.filename || doc.name}`);
                console.log(`   Category: ${doc.category} → ${updates.category}`);
                needsUpdate = true;
                updatedCategories++;
            }
            
            // Update tags
            if (doc.tags && Array.isArray(doc.tags) && doc.tags.length > 0) {
                const newTags = [...doc.tags];
                let tagUpdated = false;
                
                // Merge duplicate tags
                for (const [canonicalTag, variations] of Object.entries(tagsToMerge)) {
                    const hasVariations = variations.some(v => newTags.includes(v));
                    if (hasVariations) {
                        // Remove all variations
                        variations.forEach(v => {
                            const index = newTags.indexOf(v);
                            if (index > -1) newTags.splice(index, 1);
                        });
                        // Add canonical tag if not present
                        if (!newTags.includes(canonicalTag)) {
                            newTags.push(canonicalTag);
                        }
                        tagUpdated = true;
                    }
                }
                
                if (tagUpdated) {
                    updates.tags = newTags;
                    console.log(`TD: ${doc.filename || doc.name}`);
                    console.log(`   Tags: ${doc.tags} → ${newTags}`);
                    needsUpdate = true;
                    updatedTags++;
                }
            }
            
            if (needsUpdate) {
                // In production, you would call update API here
                console.log(`Would update TD doc: ${doc.id}`, updates);
            }
        }
        
        console.log(`\n✅ Cleanup Summary:`);
        console.log(`   Categories to update: ${updatedCategories}`);
        console.log(`   Tags to update: ${updatedTags}`);
        console.log(`\n📋 Next steps:`);
        console.log(`1. Review the changes above`);
        console.log(`2. Create API endpoint to batch update documents`);
        console.log(`3. Or update manually via Firebase Console`);
        
        // Display what tags/categories will remain
        const allCategories = new Set();
        const allTags = new Set();
        
        [...kbDocs, ...tdDocs].forEach(doc => {
            if (doc.category) {
                const cleanedCategory = categoryMappings[doc.category] || doc.category.toUpperCase();
                allCategories.add(cleanedCategory);
            }
            if (doc.tags && Array.isArray(doc.tags)) {
                doc.tags.forEach(tag => {
                    const cleanedTag = tag.toUpperCase();
                    allTags.add(cleanedTag);
                });
            }
        });
        
        console.log(`\n📊 Final Categories:`);
        Array.from(allCategories).sort().forEach(cat => console.log(`   - ${cat}`));
        
        console.log(`\n📊 Final Tags:`);
        Array.from(allTags).sort().forEach(tag => console.log(`   - ${tag}`));
        
    } catch (error) {
        console.error('❌ Cleanup error:', error);
    }
}

// Run cleanup
cleanTagsAndCategories();

