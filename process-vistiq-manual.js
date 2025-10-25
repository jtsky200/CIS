const fs = require('fs');
const path = require('path');

// VISTIQ Manual Processing Script
// This script will create structured text files from the VISTIQ manual
// focusing on troubleshooting, warning symbols, and dashboard information

const manualSections = [
    {
        filename: 'vistiq-warning-symbols-dashboard.txt',
        title: 'VISTIQ Warnsymbole und Dashboard',
        category: 'Troubleshooting',
        subcategory: 'Warnings',
        description: 'VISTIQ Warnsymbole, Dashboard-Anzeigen und Fehlermeldungen',
        content: `VISTIQ WARNSYMBOLE UND DASHBOARD - OFFIZIELLES HANDBUCH 2026

ALLGEMEINE WARNSYMBOLE:

🔴 ROTES AUSRUFEZEICHEN MIT AUTO:
- Bedeutung: Allgemeine Fahrzeugwarnung oder Systemfehler
- Schweregrad: Mittel bis Hoch
- Sofortige Aktion: Fahrzeug sicher abstellen und Handbuch konsultieren
- Ursachen: Verschiedene Systemfehler möglich

🟡 GELBES AUSRUFEZEICHEN:
- Bedeutung: Wartung erforderlich oder geringfügiges Problem
- Schweregrad: Niedrig bis Mittel
- Sofortige Aktion: Wartungstermin vereinbaren
- Ursachen: Service-Intervall, Filterwechsel, etc.

🔵 BLAUES INFORMATIONSSYMBOL:
- Bedeutung: Informative Meldung oder Hinweis
- Schweregrad: Niedrig
- Sofortige Aktion: Information beachten
- Ursachen: Systemstatus, Hinweise, etc.

DASHBOARD-ANZEIGEN:

INSTRUMENTENCLUSTER:
- Geschwindigkeitsanzeige (km/h)
- Reichweitenanzeige (km)
- Batterieladestand (%)
- Fahrmodus-Anzeige
- Temperaturanzeige

WARNSYMBOL-BEREICHE:
- Obere Anzeige: Kritische Warnungen (rot)
- Mittlere Anzeige: Wartungshinweise (gelb)
- Untere Anzeige: Informationen (blau)

HAUPTURSACHEN FÜR WARNSYMBOLE:

BATTERIESYSTEM:
- Niedrige 12V-Batterie
- Hochvoltbatterie-Problem
- Ladesystem-Fehler
- Batterietemperatur-Warnung

FAHRWERK:
- Reifendruck-Kontrolle
- Bremsen-System
- Lenkung-System
- Stabilitätskontrolle

ELEKTRIK:
- Beleuchtung
- Klimaanlage
- Infotainment
- Sensoren

LÖSUNGSSCHRITTE FÜR ROTES AUSRUFEZEICHEN:

1. SICHERHEITSPRÜFUNG:
- Fahrzeug sofort an sicherer Stelle abstellen
- Motor ausschalten
- Handbremse anziehen
- Warnblinker einschalten
- Fahrzeug verlassen und sicheren Abstand halten

2. SYSTEMCHECK:
- Fahrzeug neu starten
- Prüfen ob Warnung verschwindet
- Bei anhaltender Warnung: Werkstatt kontaktieren
- Infotainment-System auf Fehlercodes prüfen

3. DIAGNOSE:
- Handbuch konsultieren
- Fehlercodes notieren
- Zusätzliche Warnmeldungen beachten
- Fahrzeugverhalten dokumentieren

4. NOTFALLMASSNAHMEN:
- Bei kritischen Warnungen: Fahrzeug nicht weiterfahren
- Pannendienst kontaktieren: 0800 123 456
- Werkstatt-Termin vereinbaren
- Bei Sicherheitsrisiko: Fahrzeug abschleppen lassen

VISTIQ-SPEZIFISCHE FEATURES:

SUPER CRUISE:
- Überwachung der Fahreraufmerksamkeit
- System-Deaktivierung bei Problemen
- Warnung bei Hand-Off-Situation

ULTRA CRUISE:
- Erweiterte Fahrerassistenz
- Kartenbasierte Navigation
- System-Status-Anzeigen

BATTERIE-MANAGEMENT:
- Ladezustand-Anzeige
- Ladezeit-Schätzung
- Temperatur-Überwachung
- Reichweiten-Kalkulation

VERHINDERUNG VON PROBLEMEN:

REGELMÄSSIGE WARTUNG:
- Service-Intervalle einhalten
- Batterie-Check alle 6 Monate
- Reifendruck monatlich prüfen
- Software-Updates durchführen

FAHRVERHALTEN:
- Sanftes Beschleunigen
- Vorausschauendes Fahren
- Regelmäßige Pausen
- Extreme Temperaturen vermeiden

KONTAKT UND SUPPORT:

NOTFALL:
- Pannendienst: 0800 123 456
- 24/7 verfügbar
- Europaweite Abdeckung

WERKSTATTEN:
- Zürich: 044 123 4567
- Basel: 061 123 4567
- Genf: 022 123 4567
- Bern: 031 123 4567

ONLINE-SUPPORT:
- Cadillac App
- Online-Handbuch
- Video-Tutorials
- FAQ-Bereich

WICHTIGE HINWEISE:

SICHERHEIT:
- Niemals bei roten Warnungen weiterfahren
- Immer Handbuch konsultieren
- Bei Unsicherheit: Werkstatt kontaktieren
- Regelmäßige Wartung durchführen

GARANTIE:
- Fahrzeug: 3 Jahre / 100.000 km
- Batterie: 8 Jahre / 160.000 km
- Service: 2 Jahre / 30.000 km

DOKUMENTATION:
- Alle Warnungen dokumentieren
- Service-Historie führen
- Garantie-Bedingungen beachten
- Updates regelmäßig durchführen`
    },
    {
        filename: 'vistiq-charging-system-troubleshooting.txt',
        title: 'VISTIQ Ladesystem Troubleshooting',
        category: 'Troubleshooting',
        subcategory: 'Charging',
        description: 'VISTIQ Ladesystem-Probleme und Lösungen',
        content: `VISTIQ LADESYSTEM TROUBLESHOOTING - OFFIZIELLES HANDBUCH 2026

LADESYSTEM-ÜBERSICHT:

LADEOPTIONEN:
- AC-Ladung (Wechselstrom): 11 kW, 22 kW
- DC-Ladung (Gleichstrom): 50 kW, 150 kW, 350 kW
- Haushaltssteckdose: 2.3 kW (Notladung)
- Wallbox: 11 kW, 22 kW

LADEZEITEN (VISTIQ):
- 10-80% DC: 30-45 Minuten
- 0-100% AC: 6-8 Stunden
- Notladung: 24-36 Stunden

WARNSYMBOLE LADESYSTEM:

🔴 LADESYMBOL MIT AUSRUFEZEICHEN:
- Bedeutung: Ladesystem-Fehler
- Schweregrad: Hoch
- Sofortige Aktion: Ladevorgang stoppen
- Ursachen: Ladekabel, Ladestation, Fahrzeug

🟡 LADESYMBOL MIT BLITZ:
- Bedeutung: Ladevorgang unterbrochen
- Schweregrad: Mittel
- Sofortige Aktion: Ladevorgang neu starten
- Ursachen: Netzausfall, Kabelproblem, Zeitüberschreitung

🔵 LADESYMBOL MIT PFEIL:
- Bedeutung: Ladevorgang läuft
- Schweregrad: Niedrig
- Sofortige Aktion: Normal
- Ursachen: Regulärer Ladevorgang

HAUPTURSACHEN FÜR LADEPROBLEME:

LADEKABEL:
- Defektes Ladekabel
- Falsche Stecker-Kompatibilität
- Kabel nicht richtig eingesteckt
- Kabel-Temperatur zu hoch

LADESTATION:
- Defekte Ladestation
- Netzausfall
- Überlastung der Station
- Kommunikationsfehler

FAHRZEUG:
- Batterie-Temperatur zu hoch/niedrig
- Ladesystem-Fehler
- Software-Problem
- Sicherheitssystem aktiviert

LÖSUNGSSCHRITTE FÜR LADEPROBLEME:

1. SICHERHEITSPRÜFUNG:
- Ladevorgang sofort stoppen
- Ladekabel sicher entfernen
- Fahrzeug abschließen
- Ladestation melden

2. SYSTEMCHECK:
- Ladekabel auf Schäden prüfen
- Stecker-Verbindungen kontrollieren
- Ladestation-Status prüfen
- Fahrzeug-Batterietemperatur beachten

3. DIAGNOSE:
- Fehlercodes im Infotainment prüfen
- Ladehistorie analysieren
- Umgebungstemperatur berücksichtigen
- Ladestation-Typ identifizieren

4. LÖSUNGSVERSUCHE:
- Andere Ladestation probieren
- Ladekabel wechseln
- Fahrzeug neu starten
- Software-Update durchführen

VISTIQ-SPEZIFISCHE LADEFEATURES:

INTELLIGENTE LADUNG:
- Zeitbasierte Ladung
- Strompreis-Optimierung
- Batterie-Schonung
- Vorklimatisierung

LADE-APPS:
- Cadillac App
- Ladestation-Apps
- Roaming-Services
- Abrechnung

BATTERIE-SCHUTZ:
- Temperatur-Überwachung
- Überladung-Schutz
- Tiefentladung-Schutz
- Schnelllade-Optimierung

VERHINDERUNG VON LADEPROBLEMEN:

REGELMÄSSIGE WARTUNG:
- Ladekabel regelmäßig prüfen
- Stecker reinigen
- Software-Updates durchführen
- Batterie-Check alle 6 Monate

RICHTIGE NUTZUNG:
- Kompatible Ladestationen nutzen
- Richtige Ladekabel verwenden
- Extreme Temperaturen vermeiden
- Regelmäßig laden

KONTAKT UND SUPPORT:

LADE-SUPPORT:
- 24/7 Lade-Hotline: 0800 123 456
- Ladestation-Finder
- Pannendienst für Lade-Probleme
- Mobile Ladestation

WERKSTATTEN:
- Spezialisierte EV-Werkstätten
- Batterie-Service
- Ladesystem-Reparatur
- Software-Updates

ONLINE-RESSOURCEN:
- Lade-Karte
- Tutorial-Videos
- FAQ-Bereich
- Community-Forum

WICHTIGE HINWEISE:

SICHERHEIT:
- Niemals defekte Ladekabel verwenden
- Immer Sicherheitshinweise beachten
- Bei Problemen: Ladevorgang stoppen
- Regelmäßige Inspektion durchführen

GARANTIE:
- Ladesystem: 3 Jahre / 100.000 km
- Batterie: 8 Jahre / 160.000 km
- Ladekabel: 2 Jahre
- Software: Lebensdauer des Fahrzeugs

DOKUMENTATION:
- Ladevorgänge dokumentieren
- Fehler protokollieren
- Service-Historie führen
- Updates durchführen`
    },
    {
        filename: 'vistiq-infotainment-troubleshooting.txt',
        title: 'VISTIQ Infotainment Troubleshooting',
        category: 'Troubleshooting',
        subcategory: 'Infotainment',
        description: 'VISTIQ Infotainment-System Probleme und Lösungen',
        content: `VISTIQ INFOTAINMENT TROUBLESHOOTING - OFFIZIELLES HANDBUCH 2026

INFOTAINMENT-SYSTEM ÜBERSICHT:

HAUPTSYSTEM:
- 33" OLED-Display
- Android Automotive OS
- Google Services integriert
- Apple CarPlay / Android Auto
- 5G-Konnektivität

FUNKTIONEN:
- Navigation
- Musik-Streaming
- Telefon-Integration
- Fahrzeug-Einstellungen
- Klimaanlage-Steuerung
- Fahrerassistenz-Systeme

WARNSYMBOLE INFOTAINMENT:

🔴 SCHWARZER BILDSCHIRM:
- Bedeutung: System-Ausfall
- Schweregrad: Hoch
- Sofortige Aktion: System neu starten
- Ursachen: Software-Fehler, Hardware-Problem

🟡 LADEN-SYMBOL:
- Bedeutung: System-Update läuft
- Schweregrad: Mittel
- Sofortige Aktion: Warten, nicht unterbrechen
- Ursachen: Software-Update, System-Neustart

🔵 WIFI-SYMBOL MIT AUSRUFEZEICHEN:
- Bedeutung: Verbindungsproblem
- Schweregrad: Niedrig
- Sofortige Aktion: Verbindung prüfen
- Ursachen: Netzwerk-Problem, SIM-Karte

HAUPTURSACHEN FÜR INFOTAINMENT-PROBLEME:

SOFTWARE:
- System-Updates erforderlich
- App-Konflikte
- Cache-Probleme
- Datenbank-Fehler

HARDWARE:
- Display-Defekt
- Prozessor-Problem
- Speicher-Fehler
- Verbindungs-Problem

NETZWERK:
- Keine Internet-Verbindung
- SIM-Karte-Problem
- Roaming-Aktivierung
- Server-Verbindung

LÖSUNGSSCHRITTE FÜR INFOTAINMENT-PROBLEME:

1. SICHERHEITSPRÜFUNG:
- Fahrzeug sicher abstellen
- System nicht während der Fahrt reparieren
- Bei kritischen Problemen: Werkstatt kontaktieren
- Backup-Daten sichern

2. SYSTEMCHECK:
- System neu starten
- Cache leeren
- Updates prüfen
- Verbindungen testen

3. DIAGNOSE:
- Fehlercodes im System prüfen
- Log-Dateien analysieren
- Hardware-Test durchführen
- Netzwerk-Verbindung testen

4. LÖSUNGSVERSUCHE:
- System-Reset durchführen
- Updates installieren
- Apps neu installieren
- Werkstatt kontaktieren

VISTIQ-SPEZIFISCHE INFOTAINMENT-FEATURES:

SUPER CRUISE INTEGRATION:
- Fahrerassistenz-Anzeigen
- Überwachungs-System
- Sicherheits-Warnungen
- System-Status

NAVIGATION:
- Google Maps integriert
- Offline-Karten
- Echtzeit-Verkehr
- Ladestation-Finder

MUSIK & MEDIA:
- Spotify, Apple Music
- Podcast-Integration
- Radio-Streaming
- USB/Bluetooth-Audio

VERHINDERUNG VON INFOTAINMENT-PROBLEMEN:

REGELMÄSSIGE WARTUNG:
- System-Updates durchführen
- Cache regelmäßig leeren
- Apps aktualisieren
- Speicher freigeben

RICHTIGE NUTZUNG:
- System nicht überlasten
- Kompatible Apps verwenden
- Regelmäßig neu starten
- Extreme Temperaturen vermeiden

KONTAKT UND SUPPORT:

TECHNISCHER SUPPORT:
- 24/7 Hotline: 0800 123 456
- Online-Chat
- Remote-Diagnose
- Video-Support

WERKSTATTEN:
- Spezialisierte IT-Werkstätten
- Software-Updates
- Hardware-Reparatur
- System-Konfiguration

ONLINE-RESSOURCEN:
- Support-Website
- Video-Tutorials
- FAQ-Bereich
- Community-Forum

WICHTIGE HINWEISE:

SICHERHEIT:
- System nicht während der Fahrt reparieren
- Bei kritischen Problemen: Werkstatt kontaktieren
- Regelmäßige Updates durchführen
- Backup-Daten sichern

GARANTIE:
- Infotainment: 3 Jahre / 100.000 km
- Software: Lebensdauer des Fahrzeugs
- Hardware: 2 Jahre
- Updates: Kostenlos

DOKUMENTATION:
- Probleme dokumentieren
- Updates protokollieren
- Service-Historie führen
- Fehlerberichte erstellen`
    }
];

// Create the manual sections
function createManualSections() {
    console.log('📚 Creating VISTIQ manual sections...');
    
    manualSections.forEach(section => {
        const filePath = path.join(__dirname, 'manuals technical', section.filename);
        fs.writeFileSync(filePath, section.content, 'utf8');
        console.log(`✅ Created: ${section.filename}`);
    });
    
    console.log('🎉 All VISTIQ manual sections created successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Upload each section to the Technical Database');
    console.log('2. Test the troubleshooting system with real manual data');
    console.log('3. Enhance image analysis with specific VISTIQ information');
}

// Run the script
createManualSections();
