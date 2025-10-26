# 🔄 GitHub Auto-Sync System - Schnellstart

## ✅ System ist installiert und bereit!

---

## 🚀 SOFORT STARTEN

### **Einfachste Methode:**
```bash
start-github-sync.bat
```
Dann wähle Option **3** für den Node.js Service.

---

## 📊 Was passiert gerade?

Das System:
- ✅ Prüft alle **30 Sekunden** GitHub auf Änderungen
- ✅ Synchronisiert **automatisch** neue Dateien
- ✅ Zeigt **welche Dateien** geändert wurden
- ✅ Protokolliert **alles** in `github-sync-log.txt`

---

## 🎯 Die 4 Modi

### 1️⃣ **VISUELL** - Siehst alles live
```bash
auto-sync-github.bat
```
**Perfekt für:** Erste Nutzung, Debugging

### 2️⃣ **HINTERGRUND** - Läuft unsichtbar
```bash
start /min auto-sync-github-silent.bat
```
**Perfekt für:** Arbeiten, ohne gestört zu werden

### 3️⃣ **NODE.JS SERVICE** - Am zuverlässigsten
```bash
node github-sync-service.js
```
**Perfekt für:** Produktiv-Einsatz, detailliertes Logging

### 4️⃣ **WINDOWS TASK** - Startet mit Windows
```bash
install-github-sync-task.bat
```
(Als Administrator ausführen)  
**Perfekt für:** Immer aktiv haben

---

## 📝 Log ansehen

```bash
type github-sync-log.txt
```

Oder live:
```bash
Get-Content github-sync-log.txt -Wait
```

---

## ⚠️ WICHTIG: Lokale Änderungen

**Das System überschreibt lokale Dateien mit GitHub!**

### Wenn du lokal entwickelst:
1. **Sync STOPPEN**
2. Entwickeln
3. Zu GitHub pushen
4. **Sync STARTEN**

### Sync stoppen:
- Visuell: `CTRL+C` drücken
- Task: `schtasks /end /tn "GitHub Auto-Sync CIS"`

---

## ✅ Status prüfen

```bash
git status
```

Sollte zeigen:
```
On branch main
Your branch is up to date with 'origin/main'.
nothing to commit, working tree clean
```

---

## 🔧 Häufige Befehle

| Befehl | Aktion |
|--------|--------|
| `start-github-sync.bat` | Hauptmenü öffnen |
| `node github-sync-service.js` | Service starten |
| `type github-sync-log.txt` | Log ansehen |
| `git fetch origin main` | Manuell prüfen |
| `git status` | Status anzeigen |

---

## 📊 Aktueller Stand

```bash
git log --oneline -n 1
```

Zeigt: Welcher Commit aktuell aktiv ist

---

## 🎉 Fertig!

Dein System synchronisiert sich jetzt automatisch mit:
### **https://github.com/jtsky200/CIS**

Alle Änderungen auf GitHub werden automatisch zu dir heruntergeladen! 🚀

---

**Vollständige Anleitung:** `GITHUB-SYNC-ANLEITUNG.md`

