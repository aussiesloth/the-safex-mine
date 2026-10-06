# The Safex Mine — Windows-installatie en eerste gebruik

> **Communityvertaling.** Deze pagina is een AI-ondersteunde projectvertaling van de essentiële installatie- en beveiligingsinstructies. De [Engelse installatiehandleiding](../../WINDOWS_INSTALLATION.md) blijft de canonieke projectreferentie. Taal- en terminologiecorrecties zijn welkom.

## 1. Alleen downloaden van de officiële release

The Safex Mine is een **niet-ondertekende** Windows x64-toepassing met een CPU-miner, een helper met verhoogde rechten en het WinRing-stuurprogramma. Download het installatieprogramma uitsluitend via de officiële GitHub-release van het project.

## 2. Controleer SHA-256 **vóór uitvoeren**

In PowerShell:

    Get-FileHash .\The-Safex-Mine_<version>_x64-setup.exe -Algorithm SHA256

Vergelijk de uitkomst nauwkeurig met de SHA-256 die bij de release is gepubliceerd.

**Als Microsoft Defender het installatieprogramma direct na het downloaden in quarantaine plaatst:** herstel/sta eerst **alleen dat specifieke gedownloade installatieprogramma** toe, bereken daarna de SHA-256 en voer het **pas uit** als de hash overeenkomt met de officiële waarde.

## 3. SmartScreen en antivirus

Omdat de release niet is ondertekend en miningcomponenten bevat, kunnen SmartScreen of andere beveiligingsproducten waarschuwen of bestanden in quarantaine plaatsen. Ga alleen verder nadat bron en hash zijn gecontroleerd.

Schakel antivirusbescherming niet in brede zin uit. Sluit Downloads, uw volledige gebruikersprofiel of hele schijven niet uit. Als na verificatie echt een uitzondering nodig is, beperk die tot:

    %LOCALAPPDATA%\The Safex Mine

## 4. Installatie, taal en risicomelding

Het NSIS-installatieprogramma kiest normaal automatisch Nederlands op basis van de Windows-weergavetaal. De app-taal kan na het starten nog worden gewijzigd.

Bij de eerste start verschijnt **Verklaring over miningrisico's — v1.0** in de gekozen ondersteunde app-taal. Lees dit voordat u doorgaat. **Afsluiten** sluit de app zonder acceptatie op te slaan. Engels blijft de canonieke referentie: [Verklaring over miningrisico's v1.0](../../MINING_RISK_ACKNOWLEDGEMENT.md).

## 5. UAC-helper en MSR

De grafische toepassing draait als gewone gebruiker. Bij de eerste **Mining starten** in een sessie vraagt Windows UAC-goedkeuring voor:

    safex-mine-helper.exe

Alleen deze helper wordt verhoogd uitgevoerd. Hij start en bewaakt XMRig en maakt een poging tot MSR-optimalisatie mogelijk. Als Windows-beveiliging MSR blokkeert, kan mining doorgaan met lagere prestaties. Schakel beveiligingsfuncties niet uit alleen voor een hogere hashrate.

## 6. Verwijderen

Deïnstallatie verwijdert de toepassing. Een Defender-uitzondering die u handmatig hebt toegevoegd kan blijven bestaan; verwijder die achteraf als ze niet meer nodig is.

Meer hulp: [Engelse probleemoplossing](../../../TROUBLESHOOTING.md).
