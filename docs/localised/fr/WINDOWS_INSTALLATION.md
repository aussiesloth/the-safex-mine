# The Safex Mine — Installation Windows et première utilisation

> **Traduction communautaire.** Cette page est une traduction de projet assistée par IA des consignes essentielles d’installation et de sécurité. Le [guide d’installation anglais](../../WINDOWS_INSTALLATION.md) reste la référence canonique du projet. Les corrections linguistiques et terminologiques sont les bienvenues.

## 1. Télécharger uniquement depuis la version officielle

The Safex Mine est une application Windows x64 **non signée** qui contient un mineur CPU, un assistant exécuté avec élévation et le pilote WinRing. Téléchargez l’installeur uniquement depuis la publication GitHub officielle du projet.

## 2. Vérifier le SHA-256 **avant l’exécution**

Dans PowerShell :

    Get-FileHash .\The-Safex-Mine_<version>_x64-setup.exe -Algorithm SHA256

Comparez soigneusement le résultat au SHA-256 publié avec la version.

**Si Microsoft Defender place immédiatement l’installeur en quarantaine après le téléchargement :** restaurez/autorisez d’abord **uniquement cet installeur téléchargé**, calculez ensuite son SHA-256 et ne l’exécutez **que si** le résultat correspond à la valeur officielle.

## 3. SmartScreen et antivirus

La version étant non signée et contenant des composants de minage, SmartScreen ou d’autres produits de sécurité peuvent afficher un avertissement ou mettre des fichiers en quarantaine. Ne continuez qu’après avoir vérifié la source et le hash.

Ne désactivez pas globalement l’antivirus. N’excluez pas le dossier Téléchargements, l’ensemble de votre profil utilisateur ni un disque complet. Si une exclusion est réellement nécessaire après vérification, limitez-la à :

    %LOCALAPPDATA%\The Safex Mine

## 4. Installation, langue et avis de risque

L’installeur NSIS sélectionne normalement automatiquement le français selon la langue d’affichage de Windows. La langue de l’application peut encore être modifiée après le lancement.

Au premier démarrage, **Mining Risk Acknowledgement — Version 1.0** s’affiche dans la langue d’application prise en charge choisie. Lisez-le avant de continuer. **Exit** ferme l’application sans enregistrer d’acceptation. L’anglais reste la référence canonique : [Mining Risk Acknowledgement v1.0](../../MINING_RISK_ACKNOWLEDGEMENT.md).

## 5. Assistant UAC et MSR

L’interface graphique fonctionne avec les droits de l’utilisateur normal. Au premier **Start Mining** d’une session, Windows demande une approbation UAC pour :

    safex-mine-helper.exe

Seul cet assistant est élevé. Il lance et supervise XMRig et permet de tenter l’optimisation MSR. Si la sécurité Windows bloque MSR, le minage peut continuer avec des performances réduites. Ne désactivez pas des fonctions de sécurité uniquement pour augmenter le hashrate.

## 6. Désinstallation

La désinstallation supprime l’application. Une exclusion Defender ajoutée manuellement peut rester en place ; supprimez-la ensuite si elle n’est plus nécessaire.

Aide complémentaire : [dépannage en anglais](../../../TROUBLESHOOTING.md).
