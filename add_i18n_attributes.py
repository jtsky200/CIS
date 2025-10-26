#!/usr/bin/env python3
"""
Script to add data-i18n attributes to settings.html
This script processes the HTML file and adds i18n attributes based on the translation keys
"""

import re
import json

# Load German translations to get all keys
with open('/home/ubuntu/CIS/public/translations/de.json', 'r', encoding='utf-8') as f:
    translations = json.load(f)

# Read the HTML file
with open('/home/ubuntu/CIS/public/settings.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Define mapping of German text to translation keys
text_to_key_mapping = {
    # Branding section
    "Willkommensnachricht": "settings.branding.welcomeMessage",
    "Haupttitel": "settings.branding.mainTitle",
    "Haupttitel auf der Startseite": "settings.branding.mainTitleHint",
    "Untertitel": "settings.branding.subtitle",
    "Untertitel auf der Startseite": "settings.branding.subtitleHint",
    "Browser": "settings.branding.browser",
    "Seitentitel": "settings.branding.pageTitle",
    "Titel im Browser-Tab": "settings.branding.pageTitleHint",
    "Farbschema": "settings.branding.colorScheme",
    "Primärfarbe": "settings.branding.primaryColor",
    "Hauptfarbe für Buttons und Links": "settings.branding.primaryColorHint",
    "Sekundärfarbe": "settings.branding.secondaryColor",
    "Farbe für sekundäre Elemente": "settings.branding.secondaryColorHint",
    "Button-Farbe": "settings.branding.buttonColor",
    "Farbe für ALLE Buttons": "settings.branding.buttonColorHint",
    "Erweiterte Einstellungen": "settings.branding.advancedSettings",
    "Logo in Navigation anzeigen": "settings.branding.showLogoInNav",
    "Willkommensnachricht anzeigen": "settings.branding.showWelcomeMessage",
    "Animationen aktivieren": "settings.branding.enableAnimations",
    "Änderungen speichern": "settings.branding.saveChanges",
    "Alles zurücksetzen": "settings.branding.resetAll",
    
    # General Settings
    "Allgemeine Einstellungen": "settings.general.title",
    "Verwalten Sie System-Einstellungen und erweiterte Tools.": "settings.general.subtitle",
    "System-Einstellungen": "settings.general.systemSettings",
    "Sprache": "settings.general.language",
    "Zeitzone": "settings.general.timezone",
    "Datumsformat": "settings.general.dateFormat",
    "Benachrichtigungen aktivieren": "settings.general.enableNotifications",
    "KI-Modell Konfiguration": "settings.general.aiModelConfig",
    "Primäres KI-Modell": "settings.general.primaryModel",
    "Datenbank-Zugriff": "settings.general.databaseAccess",
    "Zugriff auf Wissensdatenbank": "settings.general.accessKnowledgeDb",
    "Zugriff auf Technische Datenbank": "settings.general.accessTechnicalDb",
    "Temperatur (Kreativität)": "settings.general.temperature",
    "Max Tokens": "settings.general.maxTokens",
    "System Prompt (Chat-Seite)": "settings.general.systemPromptChat",
    "System Prompt (Troubleshooting-Seite)": "settings.general.systemPromptTroubleshooting",
    "Streaming aktivieren (Echtzeit-Antworten)": "settings.general.enableStreaming",
    "Chat-Verlauf speichern": "settings.general.saveChatHistory",
    "Einheitlicher Workflow (Alle Modelle zusammenarbeiten lassen)": "settings.general.unifiedWorkflow",
    
    # Knowledge Database
    "Wissensdatenbank": "settings.knowledgeDb.title",
    "Verwalten Sie Dokumente in der Wissensdatenbank": "settings.knowledgeDb.subtitle",
    "Dokument hochladen": "settings.knowledgeDb.uploadDocument",
    "Dokumente durchsuchen...": "settings.knowledgeDb.search",
    "Nach Kategorie filtern": "settings.knowledgeDb.filterByCategory",
    "Alle Kategorien": "settings.knowledgeDb.allCategories",
    "Sortieren nach": "settings.knowledgeDb.sortBy",
    "Neueste zuerst": "settings.knowledgeDb.newest",
    "Älteste zuerst": "settings.knowledgeDb.oldest",
    "Nach Name": "settings.knowledgeDb.nameAZ",
    "Nach Größe": "settings.knowledgeDb.sizeAsc",
    "Alle auswählen": "settings.knowledgeDb.selectAll",
    "ausgewählt": "settings.knowledgeDb.selected",
    "Ansehen": "settings.knowledgeDb.view",
    "Herunterladen": "settings.knowledgeDb.download",
    "Löschen": "settings.knowledgeDb.delete",
    "Letzte Aktualisierung": "settings.knowledgeDb.lastUpdate",
    "Dokumente gesamt": "settings.knowledgeDb.totalDocuments",
    "Gesamtgröße": "settings.knowledgeDb.totalSize",
    
    # Technical Database
    "Technische Datenbank": "settings.technicalDb.title",
    "Verwalten Sie technische Dokumente": "settings.technicalDb.subtitle",
}

# Function to add data-i18n attribute if not present
def add_i18n_attribute(match):
    tag_start = match.group(1)
    tag_content = match.group(2)
    tag_end = match.group(3)
    
    # Check if already has data-i18n
    if 'data-i18n=' in tag_start:
        return match.group(0)
    
    # Check if text matches a translation key
    text = tag_content.strip()
    if text in text_to_key_mapping:
        key = text_to_key_mapping[text]
        # Add data-i18n attribute before the closing >
        new_tag_start = tag_start.rstrip('>') + f' data-i18n="{key}">'
        return new_tag_start + tag_content + tag_end
    
    return match.group(0)

# Process labels
html_content = re.sub(
    r'(<label[^>]*>)([^<]+)(</label>)',
    add_i18n_attribute,
    html_content
)

# Process spans
html_content = re.sub(
    r'(<span[^>]*>)([^<]+)(</span>)',
    add_i18n_attribute,
    html_content
)

# Process h2, h3 elements
html_content = re.sub(
    r'(<h[23][^>]*>)([^<]+)(</h[23]>)',
    add_i18n_attribute,
    html_content
)

# Process div with form-hint class
html_content = re.sub(
    r'(<div class="form-hint"[^>]*>)([^<]+)(</div>)',
    add_i18n_attribute,
    html_content
)

# Process buttons
html_content = re.sub(
    r'(<button[^>]*>)([^<]+)(</button>)',
    add_i18n_attribute,
    html_content
)

# Write the modified HTML
with open('/home/ubuntu/CIS/public/settings.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print("✅ Successfully added i18n attributes to settings.html")
print(f"Processed {len(text_to_key_mapping)} text mappings")

