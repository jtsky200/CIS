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
            // Detect file type from filename extension
            const filename = doc.filename || doc.name || '';
            const ext = filename.split('.').pop().toLowerCase();
            let fileType = 'UNKNOWN';
            
            if (ext === 'pdf') fileType = 'PDF';
            else if (ext === 'txt') fileType = 'TXT';
            else if (ext === 'md') fileType = 'MD';
            else if (ext === 'xlsx' || ext === 'xls') fileType = 'EXCEL';
            else fileType = ext.toUpperCase();
            
            const category = getCategoryInfo(fileType);
            const isSelected = window.tdState.selectedDocs.has(doc.id);
            
            return `
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                    <input type="checkbox" class="td-checkbox" data-doc-id="${doc.id}" ${isSelected ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer;">
                    
                    <div style="flex: 1; min-width: 200px;">
                        <span style="font-weight: 500; color: #111827;">${doc.filename || doc.name}</span>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                        <span style="font-size: 13px; color: #6b7280;">${formatDate(doc.uploadedAt)}</span>
                        <span style="background: ${category.color}; color: ${category.textColor}; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 600;">${fileType}</span>
                        <span style="background: #f3f4f6; color: #374151; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 500;">${formatSize(doc.size)}</span>
                        
                        <!-- Action buttons -->
                        <button class="td-action-btn td-view-btn" data-doc-id="${doc.id}" title="Ansehen" style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500;">
                            Ansehen
                        </button>
                        <button class="td-action-btn td-download-btn" data-doc-id="${doc.id}" title="Herunterladen" style="background: #10b981; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500;">
                            Download
                        </button>
                        <button class="td-action-btn td-delete-btn" data-doc-id="${doc.id}" title="Löschen" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500;">
                            Löschen
                        </button>
                    </div>
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
        document.querySelectorAll('.td-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', handleCheckboxChange);
        });
        
        // View buttons
        document.querySelectorAll('.td-view-btn').forEach(btn => {
            btn.addEventListener('click', () => handleViewDocument(btn.dataset.docId));
        });
        
        // Download buttons
        document.querySelectorAll('.td-download-btn').forEach(btn => {
            btn.addEventListener('click', () => handleDownloadDocument(btn.dataset.docId));
        });
        
        // Delete buttons
        document.querySelectorAll('.td-delete-btn').forEach(btn => {
            btn.addEventListener('click', () => handleDeleteDocument(btn.dataset.docId));
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
        
        if (!confirm(`Möchten Sie "${doc.filename || doc.name}" wirklich löschen?`)) return;
        
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
    
    async function handleBulkDelete() {
        const count = window.tdState.selectedDocs.size;
        if (count === 0) return;
        
        if (!confirm(`Möchten Sie ${count} Dokument(e) wirklich löschen?`)) return;
        
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
    
    function handleImport() {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.onchange = async (e) => {
            const files = Array.from(e.target.files);
            if (files.length === 0) return;
            
            try {
                const formData = new FormData();
                files.forEach(file => formData.append('files', file));
                
                const response = await fetch('https://us-central1-cis-de.cloudfunctions.net/uploadTechnicalDocument', {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    showNotification(`${files.length} Datei(en) erfolgreich hochgeladen.`, 'success');
                    window.refreshTechnicalDatabase();
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

