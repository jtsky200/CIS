// Knowledge Base & Technical Database Functions
// Handles pagination, search, filter, sort, and document actions

(function() {
    'use strict';
    
    // Global state
    window.kbState = {
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
        document.addEventListener('DOMContentLoaded', initKbFunctions);
    } else {
        initKbFunctions();
    }
    
    function initKbFunctions() {
        console.log('🔧 Initializing KB Functions...');
        setupEventListeners();
    }
    
    function setupEventListeners() {
        // Search input with autocomplete
        const searchInput = document.getElementById('kbSearch');
        if (searchInput) {
            searchInput.addEventListener('input', handleSearch);
        }
        
        // Filter dropdown
        const filterSelect = document.getElementById('kbFilter');
        if (filterSelect) {
            filterSelect.addEventListener('change', handleFilter);
        }
        
        // Sort dropdown
        const sortSelect = document.getElementById('kbSort');
        if (sortSelect) {
            sortSelect.addEventListener('change', handleSort);
        }
        
        // Select all checkbox
        const selectAllCheckbox = document.getElementById('selectAllKb');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', handleSelectAll);
        }
        
        // Bulk delete button
        const bulkDeleteBtn = document.getElementById('bulkDeleteKbBtn');
        if (bulkDeleteBtn) {
            bulkDeleteBtn.addEventListener('click', handleBulkDelete);
        }
        
        // Export button
        const exportBtn = document.getElementById('exportKbBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', handleExport);
        }
        
        // Import button
        const importBtn = document.getElementById('importKbBtn');
        if (importBtn) {
            importBtn.addEventListener('click', handleImport);
        }
        
        console.log('✅ KB Event listeners set up');
    }
    
    // Load and display documents with pagination
    window.loadKbDocuments = function(documents) {
        console.log('📚 loadKbDocuments called with', documents.length, 'documents');
        window.kbState.allDocuments = documents || [];
        window.kbState.filteredDocuments = [...window.kbState.allDocuments];
        applyFiltersAndSort();
        renderDocuments();
        
        // Re-initialize event listeners after documents are loaded
        setupEventListeners();
    };
    
    // Apply filters and sorting
    function applyFiltersAndSort() {
        let docs = [...window.kbState.allDocuments];
        
        // Apply search filter - includes tags and categories
        if (window.kbState.searchTerm) {
            const term = window.kbState.searchTerm.toLowerCase();
            docs = docs.filter(doc => {
                const filename = (doc.filename || doc.name || '').toLowerCase();
                const category = (doc.category || '').toLowerCase();
                const subcategory = (doc.subcategory || '').toLowerCase();
                const tags = (doc.tags || []).map(t => t.toLowerCase()).join(' ');
                const content = (doc.content || '').toLowerCase();
                
                return filename.includes(term) || 
                       category.includes(term) || 
                       subcategory.includes(term) ||
                       tags.includes(term) ||
                       content.includes(term);
            });
        }
        
        // Apply category filter
        if (window.kbState.filterCategory) {
            docs = docs.filter(doc => {
                const fileType = (doc.fileType || '').toUpperCase();
                return fileType === window.kbState.filterCategory;
            });
        }
        
        // Apply sorting
        docs.sort((a, b) => {
            switch (window.kbState.sortBy) {
                case 'newest':
                    return (b.uploadedAt || 0) - (a.uploadedAt || 0);
                case 'oldest':
                    return (a.uploadedAt || 0) - (b.uploadedAt || 0);
                case 'name':
                    return (a.filename || a.name || '').localeCompare(b.filename || b.name || '');
                case 'size':
                    return (b.size || 0) - (a.size || 0);
                default:
                    return 0;
            }
        });
        
        window.kbState.filteredDocuments = docs;
        window.kbState.currentPage = 1; // Reset to first page
    }
    
    // Render documents with pagination
    function renderDocuments() {
        const kbList = document.getElementById('kbList');
        if (!kbList) {
            console.error('❌ kbList element not found');
            return;
        }
        
        const docs = window.kbState.filteredDocuments;
        const startIndex = (window.kbState.currentPage - 1) * window.kbState.itemsPerPage;
        const endIndex = startIndex + window.kbState.itemsPerPage;
        const pageDocs = docs.slice(startIndex, endIndex);
        
        if (docs.length === 0) {
            kbList.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">Keine Dokumente gefunden</div>';
            renderPagination(0);
            return;
        }
        
        kbList.innerHTML = pageDocs.map(doc => createDocumentItem(doc)).join('');
        renderPagination(docs.length);
        
        // Attach event listeners to checkboxes and action buttons
        attachDocumentEventListeners();
    }
    
    // Create HTML for a single document item
    function createDocumentItem(doc) {
        const isSelected = window.kbState.selectedDocs.has(doc.id);
        const fileType = (doc.fileType || 'FILE').toUpperCase();
        const category = getCategoryFromFileType(fileType);
        
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
    }
    
    // Get category color based on file type
    function getCategoryFromFileType(fileType) {
        const categories = {
            'PDF': { color: '#e0e7ff', textColor: '#3730a3' },
            'TXT': { color: '#dbeafe', textColor: '#1e40af' },
            'TEXT': { color: '#dbeafe', textColor: '#1e40af' },
            'MD': { color: '#fef3c7', textColor: '#92400e' },
            'MARKDOWN': { color: '#fef3c7', textColor: '#92400e' },
            'XLSX': { color: '#d1fae5', textColor: '#065f46' },
            'DOCX': { color: '#e0e7ff', textColor: '#3730a3' },
            'JPEG': { color: '#fce7f3', textColor: '#9f1239' },
            'JPG': { color: '#fce7f3', textColor: '#9f1239' },
            'PNG': { color: '#fce7f3', textColor: '#9f1239' }
        };
        return categories[fileType] || { color: '#f3f4f6', textColor: '#374151' };
    }
    
    // Render pagination controls
    function renderPagination(totalItems) {
        const totalPages = Math.ceil(totalItems / window.kbState.itemsPerPage);
        const currentPage = window.kbState.currentPage;
        
        let paginationHtml = '';
        if (totalPages > 1) {
            paginationHtml = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 12px; padding: 20px; margin-top: 20px; background: #f9fafb; border-radius: 8px;">
                <button onclick="window.goToKbPage(1)" ${currentPage === 1 ? 'disabled' : ''} 
                    style="padding: 10px 18px; background: ${currentPage === 1 ? '#e5e7eb' : '#3b82f6'}; color: ${currentPage === 1 ? '#9ca3af' : 'white'}; border: none; border-radius: 6px; cursor: ${currentPage === 1 ? 'not-allowed' : 'pointer'}; font-weight: 500; font-size: 14px;">
                    ⏮ Erste
                </button>
                <button onclick="window.goToKbPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} 
                    style="padding: 10px 18px; background: ${currentPage === 1 ? '#e5e7eb' : '#3b82f6'}; color: ${currentPage === 1 ? '#9ca3af' : 'white'}; border: none; border-radius: 6px; cursor: ${currentPage === 1 ? 'not-allowed' : 'pointer'}; font-weight: 500; font-size: 14px;">
                    ← Zurück
                </button>
                <span style="padding: 10px 18px; background: white; border: 1px solid #e5e7eb; border-radius: 6px; font-weight: 600; font-size: 14px;">
                    Seite ${currentPage} von ${totalPages}
                </span>
                <button onclick="window.goToKbPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} 
                    style="padding: 10px 18px; background: ${currentPage === totalPages ? '#e5e7eb' : '#3b82f6'}; color: ${currentPage === totalPages ? '#9ca3af' : 'white'}; border: none; border-radius: 6px; cursor: ${currentPage === totalPages ? 'not-allowed' : 'pointer'}; font-weight: 500; font-size: 14px;">
                    Weiter →
                </button>
                <button onclick="window.goToKbPage(${totalPages})" ${currentPage === totalPages ? 'disabled' : ''} 
                    style="padding: 10px 18px; background: ${currentPage === totalPages ? '#e5e7eb' : '#3b82f6'}; color: ${currentPage === totalPages ? '#9ca3af' : 'white'}; border: none; border-radius: 6px; cursor: ${currentPage === totalPages ? 'not-allowed' : 'pointer'}; font-weight: 500; font-size: 14px;">
                    Letzte ⏭
                </button>
            </div>
        `;
        }
        
        const kbList = document.getElementById('kbList');
        if (kbList && kbList.parentElement) {
            let paginationContainer = document.getElementById('kbPagination');
            if (!paginationContainer) {
                paginationContainer = document.createElement('div');
                paginationContainer.id = 'kbPagination';
                kbList.parentElement.appendChild(paginationContainer);
            }
            paginationContainer.innerHTML = paginationHtml;
        }
    }
    
    // Go to specific page
    window.goToKbPage = function(page) {
        const totalPages = Math.ceil(window.kbState.filteredDocuments.length / window.kbState.itemsPerPage);
        if (page < 1 || page > totalPages) return;
        window.kbState.currentPage = page;
        renderDocuments();
    };
    
    // Attach event listeners to document items
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
    
    // Event handlers
    function handleSearch(e) {
        window.kbState.searchTerm = e.target.value;
        applyFiltersAndSort();
        renderDocuments();
    }
    
    function handleFilter(e) {
        window.kbState.filterCategory = e.target.value;
        applyFiltersAndSort();
        renderDocuments();
    }
    
    function handleSort(e) {
        window.kbState.sortBy = e.target.value;
        applyFiltersAndSort();
        renderDocuments();
    }
    
    function handleSelectAll(e) {
        const isChecked = e.target.checked;
        const docs = window.kbState.filteredDocuments;
        const startIndex = (window.kbState.currentPage - 1) * window.kbState.itemsPerPage;
        const endIndex = startIndex + window.kbState.itemsPerPage;
        const pageDocs = docs.slice(startIndex, endIndex);
        
        pageDocs.forEach(doc => {
            if (isChecked) {
                window.kbState.selectedDocs.add(doc.id);
            } else {
                window.kbState.selectedDocs.delete(doc.id);
            }
        });
        
        renderDocuments();
        updateSelectedCount();
    }
    
    function handleCheckboxChange(e) {
        const docId = e.target.dataset.docId;
        if (e.target.checked) {
            window.kbState.selectedDocs.add(docId);
        } else {
            window.kbState.selectedDocs.delete(docId);
        }
        updateSelectedCount();
    }
    
    function updateSelectedCount() {
        const count = window.kbState.selectedDocs.size;
        const countElement = document.getElementById('selectedCount');
        if (countElement) {
            countElement.textContent = count;
        }
        
        const bulkDeleteBtn = document.getElementById('bulkDeleteKbBtn');
        if (bulkDeleteBtn) {
            bulkDeleteBtn.disabled = count === 0;
        }
    }
    
    async function handleViewDocument(docId) {
        const doc = window.kbState.allDocuments.find(d => d.id === docId);
        if (!doc) return;
        
        try {
            // First, try to fetch the document data to check for errors
            const url = `https://us-central1-cis-de.cloudfunctions.net/viewDocument?docId=${docId}&type=knowledge`;
            const response = await fetch(url);
            
            // Check if response is JSON (error) or binary (success)
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                // It's an error response
                const errorData = await response.json();
                console.error('Backend error:', errorData);
                showNotification(`Fehler: ${errorData.error}. Felder: ${errorData.availableFields ? errorData.availableFields.join(', ') : 'unbekannt'}`, 'error');
            } else {
                // It's a binary response (PDF), open in new tab
                window.open(url, '_blank');
                showNotification('Dokument wird geöffnet...', 'success');
            }
        } catch (error) {
            console.error('Error viewing document:', error);
            showNotification('Fehler beim Öffnen des Dokuments.', 'error');
        }
    }
    
    async function handleDownloadDocument(docId) {
        const doc = window.kbState.allDocuments.find(d => d.id === docId);
        if (!doc) return;
        
        try {
            const response = await fetch(`https://us-central1-cis-de.cloudfunctions.net/downloadDocument?id=${docId}`);
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
        const doc = window.kbState.allDocuments.find(d => d.id === docId);
        if (!doc) return;
        
        if (typeof window.showConfirmDialog === 'function') {
            window.showConfirmDialog(`Möchten Sie "${doc.filename || doc.name}" wirklich löschen?`,
                async () => {
                    try {
                        const response = await fetch(`https://us-central1-cis-de.cloudfunctions.net/deleteDocument`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: docId })
                        });
                        
                        if (response.ok) {
                            // Remove from local state
                            window.kbState.allDocuments = window.kbState.allDocuments.filter(d => d.id !== docId);
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
        } else {
            // Fallback to old confirm if showConfirmDialog not available
            if (!confirm(`Möchten Sie "${doc.filename || doc.name}" wirklich löschen?`)) {
                return;
            }
            
            try {
                const response = await fetch(`https://us-central1-cis-de.cloudfunctions.net/deleteDocument`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: docId })
                });
                
                if (response.ok) {
                    // Remove from local state
                    window.kbState.allDocuments = window.kbState.allDocuments.filter(d => d.id !== docId);
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
    }
    
    async function handleBulkDelete() {
        const count = window.kbState.selectedDocs.size;
        if (count === 0) return;
        
        if (typeof window.showConfirmDialog === 'function') {
            window.showConfirmDialog(`Möchten Sie ${count} Dokument(e) wirklich löschen?`,
                async () => {
                    try {
                        const deletePromises = Array.from(window.kbState.selectedDocs).map(docId =>
                            fetch(`https://us-central1-cis-de.cloudfunctions.net/deleteDocument`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id: docId })
                            })
                        );
                        
                        await Promise.all(deletePromises);
                        
                        // Remove from local state
                        window.kbState.allDocuments = window.kbState.allDocuments.filter(
                            d => !window.kbState.selectedDocs.has(d.id)
                        );
                        window.kbState.selectedDocs.clear();
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
        } else {
            // Fallback to old confirm
            if (!confirm(`Möchten Sie ${count} Dokument(e) wirklich löschen?`)) {
                return;
            }
            
            try {
                const deletePromises = Array.from(window.kbState.selectedDocs).map(docId =>
                    fetch(`https://us-central1-cis-de.cloudfunctions.net/deleteDocument`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: docId })
                    })
                );
                
                await Promise.all(deletePromises);
                
                // Remove from local state
                window.kbState.allDocuments = window.kbState.allDocuments.filter(
                    d => !window.kbState.selectedDocs.has(d.id)
                );
                window.kbState.selectedDocs.clear();
                applyFiltersAndSort();
                renderDocuments();
                updateSelectedCount();
                showNotification(`${count} Dokument(e) erfolgreich gelöscht.`, 'success');
            } catch (error) {
                console.error('Error bulk deleting documents:', error);
                showNotification('Fehler beim Löschen der Dokumente.', 'error');
            }
        }
    }
    
    function handleExport() {
        const docs = window.kbState.allDocuments;
        const dataStr = JSON.stringify(docs, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `knowledge-base-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
    
    function handleImport() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.pdf,.txt,.md,.xlsx,.docx';
        input.multiple = true;
        input.onchange = async (e) => {
            const files = e.target.files;
            if (!files || files.length === 0) return;
            
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append('files', files[i]);
            }
            
            try {
                const response = await fetch('https://us-central1-cis-de.cloudfunctions.net/upload', {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    showNotification(`${files.length} Datei(en) erfolgreich hochgeladen.`, 'success');
                    window.refreshKnowledgeBase();
                } else {
                    showNotification('Fehler beim Hochladen der Dateien.', 'error');
                }
            } catch (error) {
                console.error('Error importing files:', error);
                showNotification('Fehler beim Hochladen der Dateien.', 'error');
            }
        };
        input.click();
    }
    
    // Utility functions
    function formatSize(bytes) {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
    window.refreshKnowledgeBase = async function() {
        try {
            const response = await fetch('https://us-central1-cis-de.cloudfunctions.net/knowledgebase?t=' + Date.now());
            const data = await response.json();
            const docs = data.documents || [];
            
            // Update statistics
            document.getElementById('kbDocCount').textContent = docs.length;
            const size = docs.reduce((sum, doc) => sum + (doc.size || 0), 0);
            document.getElementById('kbTotalSize').textContent = (size / (1024 * 1024)).toFixed(2) + ' MB';
            
            // Update last updated
            const lastUpdated = docs.length > 0 ? Math.max(...docs.map(d => d.uploadedAt || 0)) : null;
            if (lastUpdated) {
                document.getElementById('kbLastUpdated').textContent = formatDate(lastUpdated);
            }
            
            // Load documents
            window.loadKbDocuments(docs);
            
            showNotification('Wissensdatenbank erfolgreich aktualisiert.', 'success');
        } catch (error) {
            console.error('Error refreshing knowledge base:', error);
            showNotification('Fehler beim Aktualisieren der Wissensdatenbank.', 'error');
        }
    };
    
    // Show notification function
    function showNotification(message, type = 'success') {
        // Remove existing notification
        const existing = document.querySelector('.kb-notification');
        if (existing) {
            existing.remove();
        }
        
        // Create new notification
        const notification = document.createElement('div');
        notification.className = 'kb-notification';
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
        
        // Show notification
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);
        
        // Hide and remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    console.log('✅ KB Functions loaded');
})();

