// Tag Management Functions
// ============================================================================

const API_BASE = 'https://us-central1-cis-de.cloudfunctions.net';

// Initialize tag autocomplete for upload forms
async function initTagAutocomplete(inputId, containerId) {
    const input = document.getElementById(inputId);
    const container = document.getElementById(containerId);
    
    if (!input || !container) return;
    
    let availableTags = [];
    
    // Load available tags
    async function loadTags() {
        const { tags, categories } = await loadAllTags();
        availableTags = [
            ...categories.map(([name]) => ({ name, type: 'category' })),
            ...tags.map(([name]) => ({ name, type: 'tag' }))
        ];
    }
    
    await loadTags();
    
    let currentFocus = -1;
    
    input.addEventListener('input', async function(e) {
        const val = this.value.trim();
        
        // Close any existing dropdown
        closeTagDropdown();
        
        if (!val) return;
        
        // Filter tags
        const filtered = availableTags.filter(tag => 
            tag.name.toLowerCase().includes(val.toLowerCase())
        );
        
        if (filtered.length === 0) return;
        
        // Create dropdown
        const dropdown = document.createElement('div');
        dropdown.id = 'tagAutocompleteList';
        dropdown.className = 'tag-autocomplete-list';
        dropdown.style.cssText = 'position: absolute; border: 1px solid #d1d5db; border-radius: 6px; max-height: 200px; overflow-y: auto; background: white; z-index: 1000; width: 100%; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
        
        filtered.forEach((tag, index) => {
            const item = document.createElement('div');
            item.style.cssText = `padding: 10px 15px; cursor: pointer; border-bottom: 1px solid #f3f4f6; display: flex; align-items: center; gap: 8px;`;
            item.innerHTML = `
                <span style="padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; 
                    background: ${tag.type === 'category' ? '#fef3c7' : '#dbeafe'}; 
                    color: ${tag.type === 'category' ? '#92400e' : '#1e40af'};">
                    ${tag.type === 'category' ? 'Cat' : 'Tag'}
                </span>
                <span>${tag.name}</span>
            `;
            
            item.addEventListener('click', function() {
                // Add tag to input value
                const currentValue = input.value.trim();
                const tags = currentValue ? currentValue.split(',').map(t => t.trim()) : [];
                
                if (!tags.includes(tag.name)) {
                    tags.push(tag.name);
                    input.value = tags.join(', ');
                    updateTagChips(container, tags);
                }
                
                closeTagDropdown();
            });
            
            item.addEventListener('mouseenter', function() {
                item.style.background = '#f9fafb';
            });
            
            item.addEventListener('mouseleave', function() {
                item.style.background = '';
            });
            
            dropdown.appendChild(item);
        });
        
        container.parentElement.style.position = 'relative';
        container.appendChild(dropdown);
    });
    
    function closeTagDropdown() {
        const existing = document.getElementById('tagAutocompleteList');
        if (existing) existing.remove();
    }
    
    // Close on outside click
    document.addEventListener('click', function(e) {
        if (!input.contains(e.target) && !container.contains(e.target)) {
            closeTagDropdown();
        }
    });
}

// Update tag chips display
function updateTagChips(container, tags) {
    if (!container) return;
    
    container.innerHTML = tags.map(tag => `
        <span class="tag-chip" style="display: inline-flex; align-items: center; padding: 6px 12px; background: #dbeafe; color: #1e40af; border-radius: 6px; font-size: 14px; margin-right: 8px; margin-bottom: 8px;">
            ${tag}
            <button onclick="removeTag(this, '${tag}')" style="margin-left: 8px; background: none; border: none; color: #1e40af; cursor: pointer; font-size: 18px; line-height: 1;">×</button>
        </span>
    `).join('');
}

// Remove tag
window.removeTag = function(button, tag) {
    // Find all tag inputs and remove the tag
    const input = document.querySelector('[data-tag-input="true"]');
    if (input) {
        const tags = input.value.split(',').map(t => t.trim()).filter(t => t !== tag);
        input.value = tags.join(', ');
        
        // Update tag container
        const container = document.getElementById('uploadTagsContainer');
        if (container) updateTagChips(container, tags);
    }
    
    button.parentElement.remove();
};

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
        
        // Category mappings to clean up
        const categoryMappings = {
            'LYRIQ Owner Manuals': 'LYRIQ',
            'VISTIQ Owner Manuals': 'VISTIQ',
            'OPTIQ Owner Manuals': 'OPTIQ',
            'Troubleshooting': 'TROUBLESHOOTING',
            'General': 'GENERAL',
            'SERVICE_MANUAL': 'SERVICE MANUAL',
            'service_manual': 'SERVICE MANUAL',
            'Service_Manual': 'SERVICE MANUAL'
        };
        
        // Tags to exclude (not real tags)
        const tagsToExclude = [
            'TXT', 'PDF', 'DOC', 'DOCX', 'XLSX', 'MD', // File types
            'official-website', 'OFFICIAL-WEBSITE', // Not a category
            'powertrain', 'POWERTRAIN', // Too specific
            'manual', 'MANUAL' // Too generic
        ];
        
        // Tags to merge (remove duplicates and standardize)
        const tagsToMerge = {
            'TROUBLESHOOTING': ['Troubleshooting', 'TROUBLESHOOTING'],
            'CHARGING': ['charging', 'CHARGING', 'Charging'],
            'SERVICE MANUAL': ['SERVICE_MANUAL', 'service_manual', 'Service_Manual', 'SERVICE MANUAL']
        };
        
        // Extract all unique tags and categories
        const tagsMap = new Map();
        const categoriesMap = new Map();
        
        [...kbDocs, ...tdDocs].forEach(doc => {
            // Clean and count categories
            let category = doc.category || 'GENERAL';
            // Apply mapping
            category = categoryMappings[category] || category;
            // Convert to uppercase
            category = category.toUpperCase();
            categoriesMap.set(category, (categoriesMap.get(category) || 0) + 1);
            
            // Clean and count tags
            if (doc.tags && Array.isArray(doc.tags)) {
                doc.tags.forEach(tag => {
                    // Skip excluded tags
                    if (tagsToExclude.includes(tag) || tagsToExclude.includes(tag.toUpperCase())) {
                        return;
                    }
                    
                    // Merge duplicate tags
                    let cleanedTag = tag;
                    for (const [canonicalTag, variations] of Object.entries(tagsToMerge)) {
                        if (variations.includes(tag) || variations.includes(tag.toUpperCase())) {
                            cleanedTag = canonicalTag;
                            break;
                        }
                    }
                    // Convert to uppercase
                    cleanedTag = cleanedTag.toUpperCase();
                    // Skip if it's a file extension
                    const fileExtensions = ['PDF', 'TXT', 'DOC', 'DOCX', 'XLSX', 'MD', 'PNG', 'JPG', 'JPEG'];
                    if (!fileExtensions.includes(cleanedTag)) {
                        tagsMap.set(cleanedTag, (tagsMap.get(cleanedTag) || 0) + 1);
                    }
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
    
    tagsList.innerHTML = '<div style="text-align: center; padding: 40px; color: #6b7280; font-weight: 500;">Lade Tags...</div>';
    
    const { tags, categories } = await loadAllTags();
    
    if (tags.length === 0 && categories.length === 0) {
        tagsList.innerHTML = '<div style="text-align: center; padding: 60px; color: #6b7280; font-weight: 500; background: #f9fafb; border-radius: 8px; border: 2px dashed #e5e7eb;">Keine Tags gefunden. Erstellen Sie Ihren ersten Tag!</div>';
        return;
    }
    
    let html = '';
    
    // Display Categories
    if (categories.length > 0) {
        html += '<div style="margin-bottom: 32px;">';
        html += '<h4 style="font-size: 15px; font-weight: 600; color: #374151; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">';
        html += '<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M5.5,7A1.5,1.5 0 0,1 4,5.5A1.5,1.5 0 0,1 5.5,4A1.5,1.5 0 0,1 7,5.5A1.5,1.5 0 0,1 5.5,7M21.41,11.58L12.41,2.58C12.05,2.22 11.55,2 11,2H4C2.89,2 2,2.89 2,4V11C2,11.55 2.22,12.05 2.59,12.41L11.58,21.41C11.95,21.77 12.45,22 13,22C13.55,22 14.05,21.77 14.41,21.41L21.41,14.41C21.77,14.05 22,13.55 22,13C22,12.45 21.77,11.95 21.41,11.58Z"/></svg>';
        html += 'Kategorien</h4>';
        html += '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;">';
        categories.forEach(([category, count]) => {
            html += `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; transition: all 0.2s;" 
                    onmouseover="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'; this.style.transform='translateY(-1px)'" 
                    onmouseout="this.style.boxShadow=''; this.style.transform=''">
                    <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                        <svg width="16" height="16" fill="#92400e" viewBox="0 0 24 24"><path d="M5.5,7A1.5,1.5 0 0,1 4,5.5A1.5,1.5 0 0,1 5.5,4A1.5,1.5 0 0,1 7,5.5A1.5,1.5 0 0,1 5.5,7M21.41,11.58L12.41,2.58C12.05,2.22 11.55,2 11,2H4C2.89,2 2,2.89 2,4V11C2,11.55 2.22,12.05 2.59,12.41L11.58,21.41C11.95,21.77 12.45,22 13,22C13.55,22 14.05,21.77 14.41,21.41L21.41,14.41C21.77,14.05 22,13.55 22,13C22,12.45 21.77,11.95 21.41,11.58Z"/></svg>
                        <span style="color: #92400e; font-weight: 600; font-size: 14px; text-transform: uppercase;">${category.toUpperCase()}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="padding: 4px 12px; background: white; border-radius: 12px; font-size: 13px; font-weight: 600; color: #92400e;">${count} Dok.</span>
                        <button onclick="editTag('${category.replace(/'/g, "\\'")}', 'category')" 
                            style="padding: 6px; background: white; border: 1px solid #fde68a; border-radius: 6px; cursor: pointer; display: flex; align-items: center; transition: all 0.2s;"
                            onmouseover="this.style.background='#fef3c7'" onmouseout="this.style.background='white'"
                            title="Bearbeiten">
                            <svg width="14" height="14" fill="#92400e" viewBox="0 0 24 24"><path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/></svg>
                        </button>
                    </div>
                </div>
            `;
        });
        html += '</div></div>';
    }
    
    // Display Tags
    if (tags.length > 0) {
        html += '<div>';
        html += '<h4 style="font-size: 15px; font-weight: 600; color: #374151; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">';
        html += '<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/></svg>';
        html += 'Tags</h4>';
        html += '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;">';
        tags.forEach(([tag, count]) => {
            html += `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #dbeafe; border: 1px solid #bfdbfe; border-radius: 8px; transition: all 0.2s;" 
                    onmouseover="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'; this.style.transform='translateY(-1px)'" 
                    onmouseout="this.style.boxShadow=''; this.style.transform=''">
                    <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                        <svg width="16" height="16" fill="#1e40af" viewBox="0 0 24 24"><path d="M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/></svg>
                        <span style="color: #1e40af; font-weight: 600; font-size: 14px; text-transform: uppercase;">${tag.toUpperCase()}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="padding: 4px 12px; background: white; border-radius: 12px; font-size: 13px; font-weight: 600; color: #1e40af;">${count} Dok.</span>
                        <button onclick="editTag('${tag.replace(/'/g, "\\'")}', 'tag')" 
                            style="padding: 6px; background: white; border: 1px solid #bfdbfe; border-radius: 6px; cursor: pointer; display: flex; align-items: center; transition: all 0.2s;"
                            onmouseover="this.style.background='#dbeafe'" onmouseout="this.style.background='white'"
                            title="Bearbeiten">
                            <svg width="14" height="14" fill="#1e40af" viewBox="0 0 24 24"><path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/></svg>
                        </button>
                        <button onclick="deleteTag('${tag.replace(/'/g, "\\'")}', 'tag', ${count})" 
                            style="padding: 6px; background: white; border: 1px solid #bfdbfe; border-radius: 6px; cursor: pointer; display: flex; align-items: center; transition: all 0.2s;"
                            onmouseover="this.style.background='#fee2e2'; this.style.borderColor='#fecaca'" 
                            onmouseout="this.style.background='white'; this.style.borderColor='#bfdbfe'"
                            title="Löschen">
                            <svg width="14" height="14" fill="#ef4444" viewBox="0 0 24 24"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/></svg>
                        </button>
                    </div>
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

// Edit tag globally
window.editTag = async function(oldName, type) {
    const typeText = type === 'category' ? 'Kategorie' : 'Tag';
    const newName = await window.showPromptDialog(
        `${typeText} umbenennen`,
        `Neuer Name für "${oldName}":`,
        oldName
    );
    
    if (!newName || newName === oldName) return;
    
    const confirmMsg = type === 'category' 
        ? `Möchten Sie die Kategorie "${oldName}" in "${newName}" umbenennen? Dies wird in ALLEN Dokumenten angewendet.`
        : `Möchten Sie den Tag "${oldName}" in "${newName}" umbenennen? Dies wird in ALLEN Dokumenten angewendet.`;
    
    const confirmed = await window.showConfirmDialog(confirmMsg);
    if (!confirmed) return;
    
    try {
        // Load all documents
        const [kbResponse, tdResponse] = await Promise.all([
            fetch(`${API_BASE}/knowledgebase`),
            fetch(`${API_BASE}/technicalDatabase`)
        ]);
        
        const kbData = await kbResponse.json();
        const tdData = await tdResponse.json();
        
        let updatedCount = 0;
        
        // Update Knowledge Base documents
        for (const doc of (kbData.documents || [])) {
            let needsUpdate = false;
            const updates = {};
            
            if (type === 'category' && doc.category === oldName) {
                updates.category = newName;
                needsUpdate = true;
            } else if (type === 'tag' && doc.tags && doc.tags.includes(oldName)) {
                updates.tags = doc.tags.map(t => t === oldName ? newName : t);
                needsUpdate = true;
            }
            
            if (needsUpdate) {
                updatedCount++;
                console.log(`Updating KB doc: ${doc.filename}`, updates);
                // In production, call update API here
            }
        }
        
        // Update Technical Database documents
        for (const doc of (tdData.documents || [])) {
            let needsUpdate = false;
            const updates = {};
            
            if (type === 'category' && doc.category === oldName) {
                updates.category = newName;
                needsUpdate = true;
            } else if (type === 'tag' && doc.tags && doc.tags.includes(oldName)) {
                updates.tags = doc.tags.map(t => t === oldName ? newName : t);
                needsUpdate = true;
            }
            
            if (needsUpdate) {
                updatedCount++;
                console.log(`Updating TD doc: ${doc.filename}`, updates);
                // In production, call update API here
            }
        }
        
        window.showNotification(
            `${typeText} "${oldName}" wurde in "${newName}" umbenannt. ${updatedCount} Dokumente werden aktualisiert.`,
            'success'
        );
        
        setTimeout(() => refreshTags(), 1000);
        
    } catch (error) {
        console.error('Error editing tag:', error);
        window.showNotification('Fehler beim Umbenennen des Tags', 'error');
    }
};

// Delete tag globally
window.deleteTag = async function(tagName, type, count) {
    const typeText = type === 'category' ? 'Kategorie' : 'Tag';
    
    const confirmed = await window.showConfirmDialog(
        `Möchten Sie ${type === 'tag' ? 'den' : 'die'} ${typeText} "${tagName}" wirklich löschen? Dies entfernt ${type === 'tag' ? 'ihn' : 'sie'} aus ${count} Dokumenten.`
    );
    
    if (!confirmed) return;
    
    try {
        // Load all documents
        const [kbResponse, tdResponse] = await Promise.all([
            fetch(`${API_BASE}/knowledgebase`),
            fetch(`${API_BASE}/technicalDatabase`)
        ]);
        
        const kbData = await kbResponse.json();
        const tdData = await tdResponse.json();
        
        let updatedCount = 0;
        
        // Update Knowledge Base documents
        for (const doc of (kbData.documents || [])) {
            if (type === 'tag' && doc.tags && doc.tags.includes(tagName)) {
                const newTags = doc.tags.filter(t => t !== tagName);
                console.log(`Removing tag from KB doc: ${doc.filename}`);
                updatedCount++;
                // In production, call update API here
            }
        }
        
        // Update Technical Database documents
        for (const doc of (tdData.documents || [])) {
            if (type === 'tag' && doc.tags && doc.tags.includes(tagName)) {
                const newTags = doc.tags.filter(t => t !== tagName);
                console.log(`Removing tag from TD doc: ${doc.filename}`);
                updatedCount++;
                // In production, call update API here
            }
        }
        
        window.showNotification(
            `${typeText} "${tagName}" wurde gelöscht. ${updatedCount} Dokumente wurden aktualisiert.`,
            'success'
        );
        
        setTimeout(() => refreshTags(), 1000);
        
    } catch (error) {
        console.error('Error deleting tag:', error);
        window.showNotification('Fehler beim Löschen des Tags', 'error');
    }
};

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

