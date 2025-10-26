/**
 * VOLLAUTOMATISCHER GITHUB SYNCHRONISIERUNGS-SERVICE
 * Läuft komplett im Hintergrund - keine Benutzer-Interaktion nötig
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Konfiguration
const CONFIG = {
    repoUrl: 'https://github.com/jtsky200/CIS',
    branch: 'main',
    checkInterval: 30000, // 30 Sekunden - sehr häufig für maximale Aktualität
    logFile: 'github-sync-log.txt',
    maxLogSize: 1024 * 1024 * 5, // 5MB - danach wird Log rotiert
    silentMode: true // Komplett still im Hintergrund
};

let lastCommit = null;
let syncCount = 0;
let errorCount = 0;

/**
 * Führt Git-Befehl aus
 */
function runGitCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, { cwd: __dirname }, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve(stdout.trim());
            }
        });
    });
}

/**
 * Loggt Nachricht
 */
function log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${type}] ${message}`;
    
    try {
        // Prüfe Log-Größe
        if (fs.existsSync(CONFIG.logFile)) {
            const stats = fs.statSync(CONFIG.logFile);
            if (stats.size > CONFIG.maxLogSize) {
                // Rotiere Log
                const backupFile = CONFIG.logFile + '.old';
                if (fs.existsSync(backupFile)) {
                    fs.unlinkSync(backupFile);
                }
                fs.renameSync(CONFIG.logFile, backupFile);
            }
        }
        
        fs.appendFileSync(CONFIG.logFile, logMessage + '\n');
        
        // Im Silent-Mode nur kritische Fehler ausgeben
        if (!CONFIG.silentMode || type === 'ERROR' || type === 'FATAL') {
            console.log(logMessage);
        }
    } catch (error) {
        // Wenn Logging fehlschlägt, ignorieren um Service nicht zu unterbrechen
    }
}

/**
 * Holt aktuelle Informationen von GitHub
 */
async function fetchFromGitHub() {
    try {
        await runGitCommand('git fetch origin main');
        return true;
    } catch (error) {
        errorCount++;
        log(`Fehler beim Fetch: ${error.message}`, 'ERROR');
        return false;
    }
}

/**
 * Prüft ob es neue Commits gibt
 */
async function checkForUpdates() {
    try {
        const localCommit = await runGitCommand('git rev-parse HEAD');
        const remoteCommit = await runGitCommand('git rev-parse origin/main');
        
        return {
            hasUpdates: localCommit !== remoteCommit,
            localCommit,
            remoteCommit
        };
    } catch (error) {
        errorCount++;
        log(`Fehler beim Prüfen: ${error.message}`, 'ERROR');
        return { hasUpdates: false };
    }
}

/**
 * Zeigt geänderte Dateien
 */
async function getChangedFiles() {
    try {
        const diff = await runGitCommand('git diff --name-status HEAD origin/main');
        return diff.split('\n').filter(line => line.trim());
    } catch (error) {
        return [];
    }
}

/**
 * Synchronisiert lokale Dateien mit GitHub
 */
async function syncWithGitHub() {
    try {
        log('🔄 Synchronisierung gestartet', 'SYNC');
        
        // Zeige geänderte Dateien
        const changedFiles = await getChangedFiles();
        if (changedFiles.length > 0) {
            log(`📝 ${changedFiles.length} Datei(en) geändert`, 'SYNC');
            changedFiles.slice(0, 5).forEach(file => log(`   ${file}`, 'SYNC'));
            if (changedFiles.length > 5) {
                log(`   ... und ${changedFiles.length - 5} weitere`, 'SYNC');
            }
        }
        
        // Reset auf GitHub Stand
        await runGitCommand('git reset --hard origin/main');
        await runGitCommand('git clean -fd');
        
        // Hole aktuellen Commit
        const currentCommit = await runGitCommand('git log --oneline -n 1');
        
        syncCount++;
        errorCount = 0; // Reset error count bei erfolgreichem Sync
        
        log('✅ Synchronisierung erfolgreich!', 'SUCCESS');
        log(`📍 Stand: ${currentCommit}`, 'SUCCESS');
        log(`📊 Gesamt-Syncs: ${syncCount}`, 'INFO');
        
        lastCommit = currentCommit;
        return true;
    } catch (error) {
        errorCount++;
        log(`❌ Fehler bei Synchronisierung: ${error.message}`, 'ERROR');
        
        // Bei zu vielen Fehlern, Service neu starten
        if (errorCount > 10) {
            log('⚠️ Zu viele Fehler - versuche Recovery', 'WARNING');
            await attemptRecovery();
        }
        
        return false;
    }
}

/**
 * Versucht Git-Repository wiederherzustellen
 */
async function attemptRecovery() {
    try {
        log('🔧 Starte Recovery-Prozess...', 'RECOVERY');
        
        // Versuche Clean und Reset
        await runGitCommand('git clean -fdx');
        await runGitCommand('git reset --hard origin/main');
        
        errorCount = 0;
        log('✅ Recovery erfolgreich', 'RECOVERY');
    } catch (error) {
        log(`❌ Recovery fehlgeschlagen: ${error.message}`, 'FATAL');
        // Service läuft weiter, versucht es beim nächsten Mal erneut
    }
}

/**
 * Hauptschleife
 */
async function startMonitoring() {
    log('🚀 GitHub Auto-Sync Service gestartet', 'START');
    log(`📂 Repository: ${CONFIG.repoUrl}`, 'START');
    log(`⏱️  Check-Intervall: ${CONFIG.checkInterval / 1000}s`, 'START');
    log(`🔇 Silent-Mode: ${CONFIG.silentMode ? 'Aktiv' : 'Inaktiv'}`, 'START');
    log(`📋 Log: ${CONFIG.logFile}`, 'START');
    
    // Initiale Synchronisierung
    log('🔍 Initiale Synchronisierung...', 'START');
    await fetchFromGitHub();
    const initialCheck = await checkForUpdates();
    
    if (initialCheck.hasUpdates) {
        await syncWithGitHub();
    } else {
        log('✓ Bereits aktuell', 'INFO');
    }
    
    log('👀 Überwachung aktiv - läuft automatisch', 'INFO');
    
    // Überwachungsschleife
    setInterval(async () => {
        try {
            const fetched = await fetchFromGitHub();
            if (!fetched) return;
            
            const check = await checkForUpdates();
            
            if (check.hasUpdates) {
                log('🔔 Neue Änderungen erkannt!', 'UPDATE');
                await syncWithGitHub();
            }
            // Im Silent-Mode keine "Keine Änderungen" Logs
        } catch (error) {
            errorCount++;
            log(`⚠️ Fehler in Hauptschleife: ${error.message}`, 'ERROR');
        }
    }, CONFIG.checkInterval);
    
    // Heartbeat alle 30 Minuten
    setInterval(() => {
        log(`💓 Service läuft (${syncCount} Syncs, ${errorCount} Fehler)`, 'HEARTBEAT');
    }, 1800000); // 30 Minuten
}

/**
 * Graceful Shutdown
 */
process.on('SIGINT', () => {
    log('⏹️  Service wird beendet', 'STOP');
    log(`📊 Statistik: ${syncCount} Synchronisierungen`, 'STOP');
    process.exit(0);
});

process.on('SIGTERM', () => {
    log('⏹️  Service gestoppt', 'STOP');
    process.exit(0);
});

// Uncaught Exception Handler - Service darf nicht crashen
process.on('uncaughtException', (error) => {
    log(`🚨 Kritischer Fehler: ${error.message}`, 'FATAL');
    log('🔄 Service läuft weiter...', 'FATAL');
    errorCount++;
});

process.on('unhandledRejection', (reason, promise) => {
    log(`🚨 Unhandled Rejection: ${reason}`, 'FATAL');
    errorCount++;
});

// Starte Service
log('⚡ Initialisierung...', 'START');
startMonitoring().catch(error => {
    log(`❌ Kritischer Fehler beim Start: ${error.message}`, 'FATAL');
    log('🔄 Versuche neu zu starten in 30 Sekunden...', 'FATAL');
    setTimeout(() => {
        startMonitoring();
    }, 30000);
});

