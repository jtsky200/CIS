// Tag Management Functions
// ============================================================================

const API_BASE = 'https://us-central1-cis-de.cloudfunctions.net';

// Load all tags from both databases
async function loadAllTags() {
    try {
        // Load tags from Knowledge Base
        const kbResponse = await fetch(`${API_BASE}/knowledgebase`);
        const kbData = await kbResponse.json();
        const kbDocs = kbData.documents || [];
        
        // Load tags from Technical Database
        const tdResponse = await fetch(`${API_BASE}/technicalDatabase`);
        const tdData = await tdResponse.json();
        const tdDocs = tdData.documents || [];
        
        // Extract all unique tags and categories
        const tagsMap = new Map();
        const categoriesMap = new Map();
        
        [...kbDocs, ...tdDocs].forEach(doc => {
            // Count categories
            const category = doc.category || 'General';
            categoriesMap.set(category, (categoriesMap.get(category) || 0) + 1);
            
            // Count tags
            if (doc.tags && Array.isArray(doc.tags)) {
                doc.tags.forEach(tag => {
                    tagsMap.set(tag, (tagsMap.get(tag) || 0) + 1);
                });
            }
        });
        
        return {
            tags: Array.from(tagsMap.entries()),
            categories: Array.from(categoriesMap.entries())
        };
        
    } catch (error) {
        console.error('Error loading tags:', error);
        window.showNotification('Fehler beim Laden der Tags', 'error');
        return { tags: [], categories: [] };
    }
}

// Refresh tags list
async function refreshTags() {
    const tagsList = document.getElementById('tagsList');
    if (!tagsList) return;
    
    tagsList.innerHTML = '<div style="text-align: center; padding: 40px; color: #6b7280;">Lade Tags...</div>';
    
    const { tags, categories } = await loadAllTags();
    
    if (tags.length === 0 && categories.length === 0) {
        tagsList.innerHTML = '<div style="text-align: center; padding: 40px; color: #6b7280;">Keine Tags gefunden.</div>';
        return;
    }
    
    let html = '';
    
    // Display Categories
    if (categories.length > 0) {
        html += '<div style="margin-bottom: 30px;">';
        html += '<h4 style="font-size: 16px; font-weight: 500; color: #2d2d2d; margin-bottom: 15px;">Kategorien</h4>';
        html += '<div style="display: flex; flex-wrap: wrap; gap: 10px;">';
        categories.forEach(([category, count]) => {
            html += `
                <div style="display: inline-flex; align-items: center; padding: 6px 12px; background: #fef3c7; color: #92400e; border-radius: 6px; font-size: 14px; font-weight: 500;">
                    <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24" style="margin-right: 6px;"><path d="M5.5,7A1.5,1.5 0 0,1 4,5.5A1.5,1.5 0 0,1 5.5,4A1.5,1.5 0 0,1 7,5.5A1.5,1.5 0 0,1 5.5,7M21.41,11.58L12.41,2.58C12.05,2.22 11.55,2 11,2H4C2.89,2 2,2.89 2,4V11C2,11.55 2.22,12.05 2.59,12.41L11.58,21.41C11.95,21.77 12.45,22 13,22C13.55,22 14.05,21.77 14.41,21.41L21.41,14.41C21.77,14.05 22,13.55 22,13C22,12.45 21.77,11.95 21.41,11.58Z"/></svg>
                    ${category}
                    <span style="margin-left: 8px; padding: 2px 8px; background: white; border-radius: 10px; font-size: 12px;">${count}</span>
                </div>
            `;
        });
        html += '</div></div>';
    }
    
    // Display Tags
    if (tags.length > 0) {
        html += '<div>';
        html += '<h4 style="font-size: 16px; font-weight: 500; color: #2d2d2d; margin-bottom: 15px;">Tags</h4>';
        html += '<div style="display: flex; flex-wrap: wrap; gap: 10px;">';
        tags.forEach(([tag, count]) => {
            html += `
                <div style="display: inline-flex; align-items: center; padding: 6px 12px; background: #dbeafe; color: #1e40af; border-radius: 6px; font-size: 14px; font-weight: 500;">
                    <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24" style="margin-right: 6px;"><path d="M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/></svg>
                    ${tag}
                    <span style="margin-left: 8px; padding: 2px 8px; background: white; border-radius: 10px; font-size: 12px;">${count}</span>
                </div>
            `;
        });
        html += '</div></div>';
    }
    
    tagsList.innerHTML = html;
}

// Create new tag
async function createNewTag() {
    const tagName = document.getElementById('newTagName').value;
    const category = document.getElementById('newTagCategory').value;
    
    if (!tagName || tagName.trim() === '') {
        window.showNotification('Bitte geben Sie einen Tag-Namen ein.', 'error');
        return;
    }
    
    window.showNotification(`Tag "${tagName}" zur Kategorie "${category}" wurde erstellt. Sie können ihn jetzt beim Hochladen von Dokumenten verwenden.`, 'success');
    
    // Clear inputs
    document.getElementById('newTagName').value = '';
    document.getElementById('newTagCategory').value = 'General';
    
    // Refresh tags list
    setTimeout(() => {
        refreshTags();
    }, 500);
}

// Load tags when tab is opened
document.addEventListener('DOMContentLoaded', function() {
    // Load tags when tags tab is clicked
    const observer = new MutationObserver(function(mutations) {
        const tagsTab = document.getElementById('tags');
        if (tagsTab && tagsTab.classList.contains('active')) {
            refreshTags();
        }
    });
    
    // Observe changes to active classes
    document.querySelectorAll('.tab-content').forEach(tab => {
        observer.observe(tab, { attributes: true, attributeFilter: ['class'] });
    });
    
    // Also listen to tab clicks
    document.querySelectorAll('[data-tab="tags"]').forEach(btn => {
        btn.addEventListener('click', () => {
            setTimeout(() => refreshTags(), 100);
        });
    });
});

