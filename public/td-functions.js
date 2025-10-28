// Technical Database Functions
// Handles pagination, search, filter, sort, and document actions for Technical Database

(function() {
    'use strict';
    
    // Global state
    window.tdState = {
        allDocuments: [],
        filteredDocuments: [],
        currentPage: 1,
        itemsPerPage: 10,
        searchTerm: '',
        filterCategory: '',
        sortBy: 'newest',
        selectedDocs: new Set()
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTdFunctions);
    } else {
        initTdFunctions();
    }
    
    function initTdFunctions() {
        console.log('🔧 Initializing TD Functions...');
        setupEventListeners();
    }
    
    function setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('tdSearch');
        if (searchInput) {
            searchInput.addEventListener('input', handleSearch);
        }
        
        // Filter dropdown
        const filterSelect = document.getElementById('tdFilter');
        if (filterSelect) {
            filterSelect.addEventListener('change', handleFilter);
        }
        
        // Sort dropdown
        const sortSelect = document.getElementById('tdSort');
        if (sortSelect) {
            sortSelect.addEventListener('change', handleSort);
        }
        
        // Select all checkbox
        const selectAllCheckbox = document.getElementById('selectAllTd');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', handleSelectAll);
        }
        
        // Bulk delete button
        const bulkDeleteBtn = document.getElementById('bulkDeleteTdBtn');
        if (bulkDeleteBtn) {
            bulkDeleteBtn.addEventListener('click', handleBulkDelete);
        }
        
        // Export button
        const exportBtn = document.getElementById('exportTdBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', handleExport);
        }
        
        // Import button
        const importBtn = document.getElementById('importTdBtn');
        if (importBtn) {
            importBtn.addEventListener('click', handleImport);
        }
        
        console.log('✅ TD Event listeners set up');
    }
    
    // Load and display documents with pagination
    window.loadTdDocuments = function(documents) {
        console.log('🔧 loadTdDocuments called with', documents.length, 'documents');
        window.tdState.allDocuments = documents || [];
        window.tdState.filteredDocuments = [...window.tdState.allDocuments];
        applyFiltersAndSort();
        renderDocuments();
        
        // Re-initialize event listeners after documents are loaded
        setupEventListeners();
    };
    
    // Apply filters and sorting
    function applyFiltersAndSort() {
        let docs = [...window.tdState.allDocuments];
        
        // Apply search filter
        if (window.tdState.searchTerm) {
            const term = window.tdState.searchTerm.toLowerCase();
            docs = docs.filter(doc => {
                const filename = (doc.filename || doc.name || '').toLowerCase();
                return filename.includes(term);
            });
        }
        
        // Apply category filter
        if (window.tdState.filterCategory) {
            docs = docs.filter(doc => {
                const fileType = (doc.fileType || doc.type || '').toLowerCase();
                return fileType === window.tdState.filterCategory.toLowerCase();
            });
        }
        
        // Apply sorting
        docs.sort((a, b) => {
            switch (window.tdState.sortBy) {
                case 'oldest':
                    return (a.uploadedAt || 0) - (b.uploadedAt || 0);
                case 'name':
                    return (a.filename || a.name || '').localeCompare(b.filename || b.name || '');
                case 'size':
                    return (b.size || 0) - (a.size || 0);
                case 'newest':
                default:
                    return (b.uploadedAt || 0) - (a.uploadedAt || 0);
            }
        });
        
        window.tdState.filteredDocuments = docs;
    }
    
    // Render documents with pagination
    function renderDocuments() {
        const container = document.getElementById('tdList');
        if (!container) return;
        
        const docs = window.tdState.filteredDocuments;
        const startIdx = (window.tdState.currentPage - 1) * window.tdState.itemsPerPage;
        const endIdx = startIdx + window.tdState.itemsPerPage;
        const pageDocs = docs.slice(startIdx, endIdx);
        
        if (pageDocs.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 40px;">Keine Dokumente gefunden.</p>';
            renderPagination();
            return;
        }
        
        container.innerHTML = pageDocs.map(doc => {
            // Use fileType from API if available, otherwise extract from filename
            let fileType = 'UNKNOWN';
            if (doc.fileType) {
                fileType = doc.fileType.toUpperCase();
            } else {
                // Fallback: detect file type from filename extension
                const filename = doc.filename || doc.name || '';
                const ext = filename.split('.').pop().toLowerCase();
                
                if (ext === 'pdf') fileType = 'PDF';
                else if (ext === 'txt') fileType = 'TXT';
                else if (ext === 'md') fileType = 'MD';
                else if (ext === 'xlsx' || ext === 'xls') fileType = 'EXCEL';
                else fileType = ext.toUpperCase();
            }
            
            const category = getCategoryInfo(fileType);
            const isSelected = window.tdState.selectedDocs.has(doc.id);
            
            return `
        <div class="kb-item" data-doc-id="${doc.id}">
            <div class="kb-item-header">
                <div style="display: flex; align-items: center; flex: 1;">
                    <input type="checkbox" class="kb-checkbox" data-doc-id="${doc.id}" ${isSelected ? 'checked' : ''}>
                    <div class="kb-item-title">${doc.filename || doc.name || 'Unbekannt'}</div>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <div class="kb-item-date">${formatDate(doc.uploadedAt)}</div>
                    <div class="kb-tools">
                        <button class="kb-tool-btn primary" data-doc-id="${doc.id}" title="Vorschau">
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14L20.5,19.79L19.79,20.5L14,14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
                            </svg>
                        </button>
                        <button class="kb-tool-btn" data-doc-id="${doc.id}" title="Download">
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19.35,10.04C18.67,6.59 15.64,4 12,4C9.11,4 6.6,5.64 5.35,8.04C2.34,8.36 0,10.91 0,14A6,6 0 0,0 6,20H19A5,5 0 0,0 24,15C24,12.36 21.95,10.22 19.35,10.04M14,13V17H10V13H7L12,8L17,13H14Z"/>
                            </svg>
                        </button>
                        <button class="kb-tool-btn danger" data-doc-id="${doc.id}" data-doc-name="${doc.filename || doc.name || 'Unbekannt'}" title="Löschen">
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19M8,9V17H10V9H8M14,9V17H16V9H14Z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            <div class="kb-item-meta">
                <span class="file-type-badge">
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" style="margin-right: 6px;">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M12,11L9,14H11V18H13V14H15L12,11Z"/>
                    </svg>
                    ${fileType}
                </span>
                <span class="file-size-badge">
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" style="margin-right: 6px;">
                        <path d="M12,3C7.58,3 4,4.79 4,7C4,9.21 7.58,11 12,11C16.42,11 20,9.21 20,7C20,4.79 16.42,3 12,3M4,9V12C4,14.21 7.58,16 12,16C16.42,16 20,14.21 20,12V9C20,11.21 16.42,13 12,13C7.58,13 4,11.21 4,9M4,14V17C4,19.21 7.58,21 12,21C16.42,21 20,19.21 20,17V14C20,16.21 16.42,18 12,18C7.58,18 4,16.21 4,14Z"/>
                    </svg>
                    ${formatSize(doc.size)}
                </span>
                ${doc.category ? `<span class="kb-item-category">
                    <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24" style="margin-right: 4px;">
                        <path d="M5.5,7A1.5,1.5 0 0,1 4,5.5A1.5,1.5 0 0,1 5.5,4A1.5,1.5 0 0,1 7,5.5A1.5,1.5 0 0,1 5.5,7M21.41,11.58L12.41,2.58C12.05,2.22 11.55,2 11,2H4C2.89,2 2,2.89 2,4V11C2,11.55 2.22,12.05 2.59,12.41L11.58,21.41C11.95,21.77 12.45,22 13,22C13.55,22 14.05,21.77 14.41,21.41L21.41,14.41C21.77,14.05 22,13.55 22,13C22,12.45 21.77,11.95 21.41,11.58Z"/>
                    </svg>
                    ${doc.category}
                </span>` : ''}
            </div>
        </div>
        `;
        }).join('');
        
        // Attach event listeners
        attachDocumentEventListeners();
        renderPagination();
    }
    
    function attachDocumentEventListeners() {
        // Checkboxes
        document.querySelectorAll('.kb-checkbox').forEach(checkbox => {
            if (!checkbox.dataset.listenerAttached) {
                checkbox.addEventListener('change', handleCheckboxChange);
                checkbox.dataset.listenerAttached = 'true';
            }
        });
        
        // Tool buttons (view, download, delete)
        document.querySelectorAll('.kb-tool-btn').forEach(btn => {
            if (!btn.dataset.listenerAttached) {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const docId = btn.dataset.docId;
                    
                    if (btn.classList.contains('primary')) {
                        handleViewDocument(docId);
                    } else if (btn.classList.contains('danger')) {
                        handleDeleteDocument(docId);
                    } else {
                        handleDownloadDocument(docId);
                    }
                });
                btn.dataset.listenerAttached = 'true';
            }
        });
    }
    
    function renderPagination() {
        const container = document.getElementById('tdPagination');
        if (!container) {
            console.warn('tdPagination container not found');
            return;
        }
        
        const totalPages = Math.ceil(window.tdState.filteredDocuments.length / window.tdState.itemsPerPage);
        const currentPage = window.tdState.currentPage;
        
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }
        
        container.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 12px; padding: 20px; margin-top: 20px; background: #f9fafb; border-radius: 8px;">
                <button onclick="window.tdGoToPage(1)" ${currentPage === 1 ? 'disabled' : ''} 
                    style="padding: 10px 18px; background: ${currentPage === 1 ? '#e5e7eb' : '#3b82f6'}; color: ${currentPage === 1 ? '#9ca3af' : 'white'}; border: none; border-radius: 6px; cursor: ${currentPage === 1 ? 'not-allowed' : 'pointer'}; font-weight: 500; font-size: 14px;">
                    ⏮ Erste
                </button>
                <button onclick="window.tdGoToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} 
                    style="padding: 10px 18px; background: ${currentPage === 1 ? '#e5e7eb' : '#3b82f6'}; color: ${currentPage === 1 ? '#9ca3af' : 'white'}; border: none; border-radius: 6px; cursor: ${currentPage === 1 ? 'not-allowed' : 'pointer'}; font-weight: 500; font-size: 14px;">
                    ← Zurück
                </button>
                <span style="padding: 10px 18px; background: white; border: 1px solid #e5e7eb; border-radius: 6px; font-weight: 600; font-size: 14px;">
                    Seite ${currentPage} von ${totalPages}
                </span>
                <button onclick="window.tdGoToPage(${currentPage + 1})" ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''} 
                    style="padding: 10px 18px; background: ${currentPage === totalPages || totalPages === 0 ? '#e5e7eb' : '#3b82f6'}; color: ${currentPage === totalPages || totalPages === 0 ? '#9ca3af' : 'white'}; border: none; border-radius: 6px; cursor: ${currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer'}; font-weight: 500; font-size: 14px;">
                    Weiter →
                </button>
                <button onclick="window.tdGoToPage(${totalPages})" ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''} 
                    style="padding: 10px 18px; background: ${currentPage === totalPages || totalPages === 0 ? '#e5e7eb' : '#3b82f6'}; color: ${currentPage === totalPages || totalPages === 0 ? '#9ca3af' : 'white'}; border: none; border-radius: 6px; cursor: ${currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer'}; font-weight: 500; font-size: 14px;">
                    Letzte ⏭
                </button>
            </div>
        `;
    }
    
    window.tdGoToPage = function(page) {
        const totalPages = Math.ceil(window.tdState.filteredDocuments.length / window.tdState.itemsPerPage);
        if (page < 1 || page > totalPages) return;
        window.tdState.currentPage = page;
        renderDocuments();
    };
    
    function handleSearch(e) {
        window.tdState.searchTerm = e.target.value;
        window.tdState.currentPage = 1;
        applyFiltersAndSort();
        renderDocuments();
    }
    
    function handleFilter(e) {
        window.tdState.filterCategory = e.target.value;
        window.tdState.currentPage = 1;
        applyFiltersAndSort();
        renderDocuments();
    }
    
    function handleSort(e) {
        window.tdState.sortBy = e.target.value;
        applyFiltersAndSort();
        renderDocuments();
    }
    
    function handleSelectAll(e) {
        const isChecked = e.target.checked;
        const startIdx = (window.tdState.currentPage - 1) * window.tdState.itemsPerPage;
        const endIdx = startIdx + window.tdState.itemsPerPage;
        const pageDocs = window.tdState.filteredDocuments.slice(startIdx, endIdx);
        
        pageDocs.forEach(doc => {
            if (isChecked) {
                window.tdState.selectedDocs.add(doc.id);
            } else {
                window.tdState.selectedDocs.delete(doc.id);
            }
        });
        
        renderDocuments();
        updateSelectedCount();
    }
    
    function handleCheckboxChange(e) {
        const docId = e.target.dataset.docId;
        if (e.target.checked) {
            window.tdState.selectedDocs.add(docId);
        } else {
            window.tdState.selectedDocs.delete(docId);
        }
        updateSelectedCount();
    }
    
    function updateSelectedCount() {
        const countElement = document.getElementById('tdSelectedCount');
        if (countElement) {
            const count = window.tdState.selectedDocs.size;
            countElement.textContent = `${count} ausgewählt`;
            
            const bulkDeleteBtn = document.getElementById('bulkDeleteTdBtn');
            if (bulkDeleteBtn) {
                bulkDeleteBtn.disabled = count === 0;
            }
        }
    }
    
    async function handleViewDocument(docId) {
        const doc = window.tdState.allDocuments.find(d => d.id === docId);
        if (!doc) return;
        
        try {
            // Open the document directly in a new tab
            const url = `https://us-central1-cis-de.cloudfunctions.net/viewDocument?docId=${docId}&type=technical`;
            window.open(url, '_blank');
            showNotification('Dokument wird geöffnet...', 'success');
        } catch (error) {
            console.error('Error viewing document:', error);
            showNotification('Fehler beim Öffnen des Dokuments.', 'error');
        }
    }
    
    async function handleDownloadDocument(docId) {
        const doc = window.tdState.allDocuments.find(d => d.id === docId);
        if (!doc) return;
        
        try {
            const response = await fetch(`https://us-central1-cis-de.cloudfunctions.net/downloadDocument?id=${docId}&type=technical`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = doc.filename || doc.name || 'document';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading document:', error);
            showNotification('Fehler beim Herunterladen des Dokuments.', 'error');
        }
    }
    
    async function handleDeleteDocument(docId) {
        const doc = window.tdState.allDocuments.find(d => d.id === docId);
        if (!doc) return;
        
        if (typeof window.showConfirmDialog === 'function') {
            window.showConfirmDialog(
                `Möchten Sie "${doc.filename || doc.name}" wirklich löschen?`,
                async () => {
                    try {
                        const response = await fetch(`https://us-central1-cis-de.cloudfunctions.net/deleteDocument`, {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: docId, type: 'technical' })
                        });
                        
                        if (response.ok) {
                            window.tdState.allDocuments = window.tdState.allDocuments.filter(d => d.id !== docId);
                            applyFiltersAndSort();
                            renderDocuments();
                            showNotification('Dokument erfolgreich gelöscht.', 'success');
                        } else {
                            showNotification('Fehler beim Löschen des Dokuments.', 'error');
                        }
                    } catch (error) {
                        console.error('Error deleting document:', error);
                        showNotification('Fehler beim Löschen des Dokuments.', 'error');
                    }
                }
            );
        }
    }
    
    async function handleBulkDelete() {
        const count = window.tdState.selectedDocs.size;
        if (count === 0) return;
        
        if (typeof window.showConfirmDialog === 'function') {
            window.showConfirmDialog(
                `Möchten Sie ${count} Dokument(e) wirklich löschen?`,
                async () => {
                    try {
                        const docIds = Array.from(window.tdState.selectedDocs);
                        await Promise.all(docIds.map(id => 
                            fetch(`https://us-central1-cis-de.cloudfunctions.net/deleteDocument`, {
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id, type: 'technical' })
                            })
                        ));
                        
                        window.tdState.allDocuments = window.tdState.allDocuments.filter(
                            d => !window.tdState.selectedDocs.has(d.id)
                        );
                        window.tdState.selectedDocs.clear();
                        applyFiltersAndSort();
                        renderDocuments();
                        updateSelectedCount();
                        showNotification(`${count} Dokument(e) erfolgreich gelöscht.`, 'success');
                    } catch (error) {
                        console.error('Error bulk deleting documents:', error);
                        showNotification('Fehler beim Löschen der Dokumente.', 'error');
                    }
                }
            );
        }
    }
    
    function handleExport() {
        const docs = window.tdState.allDocuments;
        const csv = 'Dateiname,Typ,Größe,Hochgeladen\n' + docs.map(doc => 
            `"${doc.filename || doc.name}","${doc.fileType || doc.type}","${doc.size}","${formatDate(doc.uploadedAt)}"`
        ).join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'technische-datenbank.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
    
    async function handleImport() {
        // Show tag selection modal first
        const tags = await getAvailableTags();
        
        if (tags.length === 0) {
            // No tags available, proceed with upload
            await performFileUpload([], null);
            return;
        }
        
        // Create modal for tag selection
        const selectedTags = await showTagSelectionModal(tags);
        
        // Proceed with file selection
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.onchange = async (e) => {
            const files = Array.from(e.target.files);
            if (files.length === 0) return;
            
            await performFileUpload(files, selectedTags);
        };
        input.click();
    }
    
    async function getAvailableTags() {
        try {
            const { tags, categories } = await loadAllTags();
            return [
                ...categories.map(([name]) => ({ name, type: 'category' })),
                ...tags.map(([name]) => ({ name, type: 'tag' }))
            ];
        } catch (error) {
            console.error('Error loading tags:', error);
            return [];
        }
    }
    
    async function showTagSelectionModal(availableTags) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 10000; display: flex; align-items: center; justify-content: center;';
            
            const modal = document.createElement('div');
            modal.className = 'modal-content-hidden-scroll';
            modal.style.cssText = 'background: white; border-radius: 12px; padding: 32px; max-width: 600px; width: 90%; max-height: 80vh; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);';
            
            const selectedTags = [];
            
            modal.innerHTML = `
                <div style="margin-bottom: 24px;">
                    <div style="font-size: 20px; font-weight: 600; color: #111827; margin-bottom: 8px;">Tags für Dokumente auswählen</div>
                    <div style="color: #6b7280; font-size: 15px;">Wählen Sie optional Tags für die hochgeladenen Dokumente</div>
                </div>
                <div class="document-list-hidden-scroll" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; margin-bottom: 24px; max-height: 300px;">
                    ${availableTags.map(tag => `
                        <label style="display: flex; align-items: center; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; cursor: pointer; transition: all 0.2s; font-size: 14px; font-weight: 500;">
                            <input type="checkbox" value="${tag.name}" style="margin-right: 8px;">
                            ${tag.name}
                        </label>
                    `).join('')}
                </div>
                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button id="tagModalCancel" style="padding: 10px 20px; background: #f3f4f6; color: #374151; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 14px;">Überspringen</button>
                    <button id="tagModalConfirm" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 14px;">Fortfahren</button>
                </div>
            `;
            
            overlay.appendChild(modal);
            document.body.appendChild(overlay);
            
            const checkboxes = modal.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        selectedTags.push(e.target.value);
                    } else {
                        const index = selectedTags.indexOf(e.target.value);
                        if (index > -1) selectedTags.splice(index, 1);
                    }
                });
            });
            
            const closeModal = () => {
                document.body.removeChild(overlay);
            };
            
            document.getElementById('tagModalCancel').addEventListener('click', () => {
                closeModal();
                resolve([]);
            });
            
            document.getElementById('tagModalConfirm').addEventListener('click', () => {
                closeModal();
                resolve(selectedTags);
            });
            
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    closeModal();
                    resolve([]);
                }
            });
        });
    }
    
    async function performFileUpload(files, selectedTags = []) {
        if (files.length === 0) return;
        
        try {
            for (const file of files) {
                const fileBuffer = await file.arrayBuffer();
                const base64Content = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));
                
                const uploadData = {
                    filename: file.name,
                    content: '',  // Will be processed on server
                    fileType: file.name.split('.').pop().toLowerCase(),
                    tags: selectedTags.length > 0 ? selectedTags : [],
                    category: selectedTags.length > 0 ? selectedTags[0] : 'General',
                    subcategory: 'General'
                };
                
                // Also append file for server processing
                const formData = new FormData();
                formData.append('file', file);
                formData.append('category', uploadData.category);
                formData.append('tags', JSON.stringify(selectedTags));
                formData.append('filename', file.name);
                
                const response = await fetch('https://us-central1-cis-de.cloudfunctions.net/uploadTechnicalDocument', {
                    method: 'POST',
                    body: formData
                });
                
                if (!response.ok) {
                    throw new Error('Upload failed');
                }
            }
            
            showNotification(`${files.length} Datei(en) erfolgreich hochgeladen.`, 'success');
            window.refreshTechnicalDatabase();
            
        } catch (error) {
            console.error('Error uploading files:', error);
            showNotification('Fehler beim Hochladen der Dateien.', 'error');
        }
    }
    
    function getCategoryInfo(fileType) {
        const categories = {
            'PDF': { color: '#e0e7ff', textColor: '#3730a3' },
            'TXT': { color: '#dbeafe', textColor: '#1e40af' },
            'TEXT': { color: '#dbeafe', textColor: '#1e40af' },
            'MD': { color: '#fef3c7', textColor: '#92400e' },
            'MARKDOWN': { color: '#fef3c7', textColor: '#92400e' },
            'XLSX': { color: '#d1fae5', textColor: '#065f46' },
            'EXCEL': { color: '#d1fae5', textColor: '#065f46' },
            'DOCX': { color: '#e0e7ff', textColor: '#3730a3' },
            'JPEG': { color: '#fce7f3', textColor: '#9f1239' },
            'JPG': { color: '#fce7f3', textColor: '#9f1239' },
            'PNG': { color: '#fce7f3', textColor: '#9f1239' }
        };
        return categories[fileType] || { color: '#f3f4f6', textColor: '#374151' };
    }
    
    function formatSize(bytes) {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
    }
    
    function formatDate(date) {
        if (!date) return '-';
        
        let timestamp;
        if (typeof date === 'object') {
            if (date._seconds) {
                timestamp = date._seconds * 1000;
            } else if (date.seconds) {
                timestamp = date.seconds * 1000;
            } else if (date.toDate) {
                timestamp = date.toDate().getTime();
            } else {
                timestamp = new Date(date).getTime();
            }
        } else {
            timestamp = new Date(date).getTime();
        }
        
        const d = new Date(timestamp);
        if (isNaN(d.getTime())) return '-';
        return d.toLocaleDateString('de-DE');
    }
    
    // Refresh function
    window.refreshTechnicalDatabase = async function() {
        try {
            const response = await fetch('https://us-central1-cis-de.cloudfunctions.net/technicalDatabase?t=' + Date.now());
            const data = await response.json();
            const docs = data.documents || [];
            
            // Update statistics
            document.getElementById('tdDocCount').textContent = docs.length;
            const size = docs.reduce((sum, doc) => sum + (doc.size || 0), 0);
            document.getElementById('tdTotalSize').textContent = (size / (1024 * 1024)).toFixed(2) + ' MB';
            
            // Update last updated
            const lastUpdated = docs.length > 0 ? Math.max(...docs.map(d => d.uploadedAt?.seconds || d.uploadedAt?._seconds || 0)) : null;
            if (lastUpdated) {
                document.getElementById('tdLastUpdated').textContent = formatDate({ seconds: lastUpdated });
            }
            
            // Load documents
            window.loadTdDocuments(docs);
            
            showNotification('Technische Datenbank erfolgreich aktualisiert.', 'success');
        } catch (error) {
            console.error('Error refreshing technical database:', error);
            showNotification('Fehler beim Aktualisieren der Technischen Datenbank.', 'error');
        }
    };
    
    // Show notification function
    function showNotification(message, type = 'success') {
        const existing = document.querySelector('.td-notification');
        if (existing) {
            existing.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = 'td-notification';
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'error' ? '#ef4444' : '#10b981'};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            font-size: 14px;
            font-weight: 500;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    console.log('✅ TD Functions loaded');
})();

