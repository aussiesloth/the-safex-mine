# The Safex Mine — Windows-Installation und erster Start

> **Community-Übersetzung.** Dies ist eine KI-unterstützte Projektübersetzung der wesentlichen Installations- und Sicherheitshinweise. Die [englische Installationsanleitung](../../WINDOWS_INSTALLATION.md) bleibt die maßgebliche Projektreferenz. Sprachliche Korrekturen sind willkommen.

## 1. Nur von der offiziellen Veröffentlichung herunterladen

The Safex Mine ist eine **nicht signierte** Windows-x64-Anwendung mit CPU-Miner, erhöht ausgeführtem Hilfsprogramm und WinRing-Treiber. Laden Sie den Installer ausschließlich von der offiziellen GitHub-Veröffentlichung des Projekts herunter.

## 2. SHA-256 **vor dem Ausführen** prüfen

Prüfen Sie den Hash der heruntergeladenen Datei in PowerShell:

    Get-FileHash .\The-Safex-Mine_<version>_x64-setup.exe -Algorithm SHA256

Vergleichen Sie ihn exakt mit dem auf der GitHub-Veröffentlichungsseite veröffentlichten SHA-256-Wert.

**Wenn Microsoft Defender den Installer unmittelbar nach dem Download in Quarantäne verschiebt:** Stellen/erlauben Sie **nur genau diese heruntergeladene Installer-Datei** zuerst wieder, berechnen Sie danach den SHA-256-Hash und führen Sie die Datei **erst dann** aus, wenn der Hash mit dem offiziellen Wert übereinstimmt.

## 3. SmartScreen und Antivirus

Da die Veröffentlichung nicht signiert ist und Mining-Komponenten enthält, können SmartScreen oder Antivirusprodukte warnen oder Dateien in Quarantäne verschieben. Fahren Sie nur fort, nachdem Quelle und SHA-256 geprüft wurden.

Deaktivieren Sie den Virenschutz nicht allgemein. Schließen Sie nicht Downloads, Ihr gesamtes Benutzerprofil oder ganze Laufwerke aus. Falls nach der Verifizierung tatsächlich eine Ausnahme erforderlich ist, beschränken Sie sie auf:

    %LOCALAPPDATA%\The Safex Mine

## 4. Installation, Sprache und Risikohinweis

Der NSIS-Installer wählt normalerweise anhand der Windows-Anzeigesprache automatisch Deutsch. Nach dem ersten Start kann die Anwendungssprache unabhängig davon geändert werden.

Beim ersten Start erscheint **Mining-Risikoerklärung — v1.0** in der gewählten unterstützten Anwendungssprache. Lesen Sie den Hinweis, bevor Sie fortfahren. **Beenden** beendet die Anwendung, ohne eine Zustimmung zu speichern. Englisch bleibt die kanonische Referenz: [Mining-Risikoerklärung v1.0](../../MINING_RISK_ACKNOWLEDGEMENT.md).

## 5. UAC-Hilfsprogramm und MSR

Die grafische Anwendung läuft als normaler Benutzer. Beim ersten **Mining starten** einer Sitzung fordert Windows eine UAC-Bestätigung für:

    safex-mine-helper.exe

Nur dieses Hilfsprogramm wird erhöht ausgeführt. Es startet und überwacht XMRig und ermöglicht den Versuch der MSR-Optimierung. Wenn Windows-Sicherheitsfunktionen MSR-Zugriffe blockieren, kann Mining mit geringerer Leistung weiterlaufen. Deaktivieren Sie Sicherheitsfunktionen nicht nur für eine höhere Hashrate.

## 6. Deinstallation

Die Deinstallation entfernt die Anwendung. Eine Defender-Ausnahme, die Sie selbst hinzugefügt haben, kann bestehen bleiben; entfernen Sie sie danach manuell, wenn sie nicht mehr benötigt wird.

Weitere Hilfe: [englische Fehlerbehebung](../../../TROUBLESHOOTING.md).
