// Migration Script to Add Tags to Existing Documents
// Run this in browser console on settings page

const API_BASE = 'https://us-central1-cis-de.cloudfunctions.net';

async function migrateDocumentsWithTags() {
    console.log('🔄 Starting migration to add tags to existing documents...');
    
    try {
        // Load existing documents
        const [kbResponse, tdResponse] = await Promise.all([
            fetch(`${API_BASE}/knowledgebase`),
            fetch(`${API_BASE}/technicalDatabase`)
        ]);
        
        const kbData = await kbResponse.json();
        const tdData = await tdResponse.json();
        
        const kbDocs = kbData.documents || [];
        const tdDocs = tdData.documents || [];
        
        console.log(`📄 Found ${kbDocs.length} KB documents and ${tdDocs.length} TD documents`);
        
        // Define tag rules based on filename patterns
        const getTagsFromFilename = (filename) => {
            const lower = filename.toLowerCase();
            const tags = [];
            
            // Vehicle types
            if (lower.includes('lyriq')) tags.push('LYRIQ');
            if (lower.includes('vistiq')) tags.push('VISTIQ');
            if (lower.includes('escalade')) tags.push('ESCALADE');
            
            // Document types
            if (lower.includes('owner manual') || lower.includes('handbuch')) tags.push('Owner Manual');
            if (lower.includes('specification') || lower.includes('spec')) tags.push('SPECIFICATIONS');
            if (lower.includes('faq')) tags.push('FAQ');
            if (lower.includes('troubleshooting') || lower.includes('charging')) tags.push('Troubleshooting');
            if (lower.includes('website') || lower.includes('web')) tags.push('Website');
            
            return tags;
        };
        
        // Get category from filename
        const getCategoryFromFilename = (filename) => {
            const lower = filename.toLowerCase();
            
            if (lower.includes('owner manual') || lower.includes('handbuch')) {
                if (lower.includes('lyriq')) return 'LYRIQ Owner Manuals';
                if (lower.includes('vistiq')) return 'VISTIQ Owner Manuals';
                return 'Owner Manuals';
            }
            
            if (lower.includes('specification') || lower.includes('spec')) return 'SPECIFICATIONS';
            if (lower.includes('faq')) return 'FAQ';
            if (lower.includes('troubleshooting') || lower.includes('charging')) return 'Troubleshooting';
            
            return 'General';
        };
        
        // Process Knowledge Base documents
        let kbUpdated = 0;
        for (const doc of kbDocs) {
            if (!doc.tags || doc.tags.length === 0) {
                const tags = getTagsFromFilename(doc.filename || doc.name || '');
                const category = getCategoryFromFilename(doc.filename || doc.name || '');
                
                if (tags.length > 0 || category !== 'General') {
                    console.log(`📝 Updating KB doc: ${doc.filename || doc.name}`);
                    console.log(`   Tags: ${tags.join(', ')}`);
                    console.log(`   Category: ${category}`);
                    
                    // Note: In production, you would update via API
                    // For now, just log the changes
                    kbUpdated++;
                }
            }
        }
        
        // Process Technical Database documents
        let tdUpdated = 0;
        for (const doc of tdDocs) {
            if (!doc.tags || doc.tags.length === 0) {
                const tags = getTagsFromFilename(doc.filename || doc.name || '');
                const category = getCategoryFromFilename(doc.filename || doc.name || '');
                
                if (tags.length > 0 || (doc.category || 'General') !== category) {
                    console.log(`📝 Updating TD doc: ${doc.filename || doc.name}`);
                    console.log(`   Tags: ${tags.join(', ')}`);
                    console.log(`   Category: ${category}`);
                    
                    tdUpdated++;
                }
            }
        }
        
        console.log(`✅ Migration complete!`);
        console.log(`   KB documents to update: ${kbUpdated}`);
        console.log(`   TD documents to update: ${tdUpdated}`);
        console.log(`
📋 Next steps:
1. Manually update documents via Firebase Console
2. Or create API endpoint to batch update
3. Or use the export/import feature after setting tags

To apply tags when uploading new documents, use the tag selection interface.
        `);
        
    } catch (error) {
        console.error('❌ Migration error:', error);
    }
}

// Run migration
migrateDocumentsWithTags();

