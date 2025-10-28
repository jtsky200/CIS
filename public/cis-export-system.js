// CIS Proprietary Export/Import System
// Creates encrypted .cis files that only this website can read and work with

(function() {
    'use strict';
    
    // CIS File Format Constants
    const CIS_MAGIC_HEADER = 'CIS-DB-EXPORT';
    const CIS_VERSION = '1.0';
    const CIS_ENCRYPTION_KEY = 'CIS-2024-SECURE-KEY'; // In production, this should be more secure
    
    // File format structure:
    // [MAGIC_HEADER][VERSION][ENCRYPTED_DATA][CHECKSUM]
    
    /**
     * Encrypts data using a simple XOR cipher (for demonstration)
     * In production, use proper encryption like AES
     */
    function encryptData(data, key) {
        const jsonString = JSON.stringify(data);
        let encrypted = '';
        
        for (let i = 0; i < jsonString.length; i++) {
            const charCode = jsonString.charCodeAt(i) ^ key.charCodeAt(i % key.length);
            // Ensure character code is within valid range (0-255)
            const validCharCode = charCode & 0xFF;
            encrypted += String.fromCharCode(validCharCode);
        }
        
        return btoa(encrypted); // Base64 encode
    }
    
    /**
     * Decrypts data using XOR cipher
     */
    function decryptData(encryptedData, key) {
        try {
            const decoded = atob(encryptedData); // Base64 decode
            let decrypted = '';
            
            for (let i = 0; i < decoded.length; i++) {
                const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
                decrypted += String.fromCharCode(charCode);
            }
            
            return JSON.parse(decrypted);
        } catch (error) {
            throw new Error('Invalid CIS file format or corrupted data');
        }
    }
    
    /**
     * Generates a simple checksum for data integrity
     */
    function generateChecksum(data) {
        let checksum = 0;
        const str = JSON.stringify(data);
        
        for (let i = 0; i < str.length; i++) {
            checksum = ((checksum << 5) - checksum + str.charCodeAt(i)) & 0xffffffff;
        }
        
        return checksum.toString(16);
    }
    
    /**
     * Creates a CIS file from data
     */
    function createCISFile(data, databaseType) {
        try {
            console.log('🔐 createCISFile called with:', { dataLength: data?.length, databaseType });
            
            // Prepare export data
            const exportData = {
                databaseType: databaseType,
                timestamp: new Date().toISOString(),
                version: CIS_VERSION,
                documents: data,
                metadata: {
                    totalDocuments: data.length,
                    exportSource: 'CIS-Cadillac-EV-App',
                    checksum: generateChecksum(data)
                }
            };
            
            console.log('🔐 Export data prepared:', { totalDocuments: exportData.metadata.totalDocuments });
            
            // Encrypt the data
            const encryptedData = encryptData(exportData, CIS_ENCRYPTION_KEY);
            console.log('🔐 Data encrypted, length:', encryptedData?.length);
            
            // Create CIS file content
            const cisContent = `${CIS_MAGIC_HEADER}|${CIS_VERSION}|${encryptedData}|${generateChecksum(exportData)}`;
            console.log('🔐 CIS content created, total length:', cisContent?.length);
            
            return cisContent;
        } catch (error) {
            console.error('🔐 Error creating CIS file:', error);
            throw new Error('Failed to create CIS export file');
        }
    }
    
    /**
     * Reads and validates a CIS file
     */
    function readCISFile(fileContent) {
        try {
            // Split the file content
            const parts = fileContent.split('|');
            
            if (parts.length !== 4) {
                throw new Error('Invalid CIS file format');
            }
            
            const [magicHeader, version, encryptedData, checksum] = parts;
            
            // Validate magic header
            if (magicHeader !== CIS_MAGIC_HEADER) {
                throw new Error('Not a valid CIS file');
            }
            
            // Validate version compatibility
            if (version !== CIS_VERSION) {
                throw new Error(`Unsupported CIS file version: ${version}. Expected: ${CIS_VERSION}`);
            }
            
            // Decrypt the data
            const decryptedData = decryptData(encryptedData, CIS_ENCRYPTION_KEY);
            
            // Validate checksum
            const expectedChecksum = generateChecksum(decryptedData);
            if (checksum !== expectedChecksum) {
                throw new Error('CIS file is corrupted or tampered with');
            }
            
            return decryptedData;
        } catch (error) {
            console.error('Error reading CIS file:', error);
            throw error;
        }
    }
    
    /**
     * Exports database to CIS format
     */
    window.exportToCIS = function(documents, databaseType, filename) {
        try {
            console.log('🔐 exportToCIS called with:', { documents: documents?.length, databaseType, filename });
            
            const cisContent = createCISFile(documents, databaseType);
            console.log('🔐 CIS content created, length:', cisContent?.length);
            
            // Create blob with CIS content
            const blob = new Blob([cisContent], { 
                type: 'application/octet-stream' 
            });
            console.log('🔐 Blob created, size:', blob.size);
            
            // Create download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename || `${databaseType}-export-${new Date().toISOString().split('T')[0]}.cis`;
            
            console.log('🔐 Download link created:', a.download);
            
            // Trigger download
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('🔐 Export completed successfully');
            return true;
        } catch (error) {
            console.error('🔐 Export error:', error);
            return false;
        }
    };
    
    /**
     * Imports database from CIS format
     */
    window.importFromCIS = function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const fileContent = e.target.result;
                    const data = readCISFile(fileContent);
                    
                    resolve({
                        success: true,
                        data: data,
                        databaseType: data.databaseType,
                        metadata: data.metadata
                    });
                } catch (error) {
                    reject({
                        success: false,
                        error: error.message
                    });
                }
            };
            
            reader.onerror = function() {
                reject({
                    success: false,
                    error: 'Failed to read file'
                });
            };
            
            reader.readAsText(file);
        });
    };
    
    /**
     * Validates if a file is a valid CIS file
     */
    window.validateCISFile = function(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const fileContent = e.target.result;
                    const parts = fileContent.split('|');
                    
                    if (parts.length !== 4 || parts[0] !== CIS_MAGIC_HEADER) {
                        resolve({
                            valid: false,
                            error: 'Not a valid CIS file'
                        });
                        return;
                    }
                    
                    resolve({
                        valid: true,
                        version: parts[1],
                        databaseType: 'Unknown' // Would need to decrypt to get this
                    });
                } catch (error) {
                    resolve({
                        valid: false,
                        error: 'File validation failed'
                    });
                }
            };
            
            reader.onerror = function() {
                resolve({
                    valid: false,
                    error: 'Failed to read file'
                });
            };
            
            // Only read first part to check magic header
            reader.readAsText(file.slice(0, 100));
        });
    };
    
    /**
     * Shows CIS file information
     */
    window.showCISFileInfo = function(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const fileContent = e.target.result;
                    const data = readCISFile(fileContent);
                    
                    resolve({
                        success: true,
                        info: {
                            databaseType: data.databaseType,
                            timestamp: data.timestamp,
                            version: data.version,
                            totalDocuments: data.metadata.totalDocuments,
                            exportSource: data.metadata.exportSource
                        }
                    });
                } catch (error) {
                    resolve({
                        success: false,
                        error: error.message
                    });
                }
            };
            
            reader.onerror = function() {
                resolve({
                    success: false,
                    error: 'Failed to read file'
                });
            };
            
            reader.readAsText(file);
        });
    };
    
    console.log('🔐 CIS Export/Import System initialized');
    
})();
