// Knowledge Base & Technical Database Functions
// Handles pagination, search, filter, sort, and document actions

(function() {
    'use strict';
    
    // Global state
    window.kbState = {
        allDocuments: [],
        filteredDocuments: [],
        currentPage: 1,
        itemsPerPage: 20,
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
        window.kbState.allDocuments = documents || [];
        window.kbState.filteredDocuments = [...window.kbState.allDocuments];
        applyFiltersAndSort();
        renderDocuments();
    };
    
    // Apply filters and sorting
    function applyFiltersAndSort() {
        let docs = [...window.kbState.allDocuments];
        
        // Apply search filter
        if (window.kbState.searchTerm) {
            const term = window.kbState.searchTerm.toLowerCase();
            docs = docs.filter(doc => {
                const filename = (doc.filename || doc.name || '').toLowerCase();
                return filename.includes(term);
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
            <div class="kb-item" data-doc-id="${doc.id}" style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px; background: white; transition: all 0.2s;">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 16px;">
                    <!-- Left: Checkbox and filename -->
                    <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0;">
                        <input type="checkbox" class="kb-checkbox" data-doc-id="${doc.id}" ${isSelected ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer;">
                        <div style="font-weight: 500; color: #1f2937; font-size: 15px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${doc.filename || doc.name || 'Unbekannt'}</div>
                    </div>
                    
                    <!-- Right: Metadata and actions -->
                    <div style="display: flex; gap: 8px; align-items: center; flex-shrink: 0;">
                        <span style="font-size: 13px; color: #6b7280;">${formatDate(doc.uploadedAt)}</span>
                        <span style="background: ${category.color}; color: ${category.textColor}; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 600;">${fileType}</span>
                        <span style="background: #f3f4f6; color: #374151; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 500;">${formatSize(doc.size)}</span>
                        
                        <!-- Action buttons -->
                        <button class="kb-action-btn kb-view-btn" data-doc-id="${doc.id}" title="Ansehen" style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500;">
                            Ansehen
                        </button>
                        <button class="kb-action-btn kb-download-btn" data-doc-id="${doc.id}" title="Herunterladen" style="background: #10b981; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500;">
                            Download
                        </button>
                        <button class="kb-action-btn kb-delete-btn" data-doc-id="${doc.id}" title="Löschen" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500;">
                            Löschen
                        </button>
                    </div>
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
                <div style="display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 24px; padding: 16px;">
                    <button onclick="window.goToKbPage(1)" ${currentPage === 1 ? 'disabled' : ''} style="padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 4px; background: white; cursor: pointer; font-size: 14px;">Erste</button>
                    <button onclick="window.goToKbPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} style="padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 4px; background: white; cursor: pointer; font-size: 14px;">Zurück</button>
                    <span style="padding: 8px 16px; font-size: 14px; color: #374151;">Seite ${currentPage} von ${totalPages}</span>
                    <button onclick="window.goToKbPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} style="padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 4px; background: white; cursor: pointer; font-size: 14px;">Weiter</button>
                    <button onclick="window.goToKbPage(${totalPages})" ${currentPage === totalPages ? 'disabled' : ''} style="padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 4px; background: white; cursor: pointer; font-size: 14px;">Letzte</button>
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
            checkbox.addEventListener('change', handleCheckboxChange);
        });
        
        // View buttons
        document.querySelectorAll('.kb-view-btn').forEach(btn => {
            btn.addEventListener('click', () => handleViewDocument(btn.dataset.docId));
        });
        
        // Download buttons
        document.querySelectorAll('.kb-download-btn').forEach(btn => {
            btn.addEventListener('click', () => handleDownloadDocument(btn.dataset.docId));
        });
        
        // Delete buttons
        document.querySelectorAll('.kb-delete-btn').forEach(btn => {
            btn.addEventListener('click', () => handleDeleteDocument(btn.dataset.docId));
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
    
    async function handleBulkDelete() {
        const count = window.kbState.selectedDocs.size;
        if (count === 0) return;
        
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

