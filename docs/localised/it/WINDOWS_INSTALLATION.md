# The Safex Mine — Installazione su Windows e primo utilizzo

> **Traduzione della comunità.** Questa pagina è una traduzione di progetto assistita dall’IA delle istruzioni essenziali di installazione e sicurezza. La [guida di installazione inglese](../../WINDOWS_INSTALLATION.md) resta il riferimento canonico del progetto. Sono benvenute correzioni linguistiche e terminologiche.

## 1. Scaricare solo dalla release ufficiale

The Safex Mine è un’applicazione Windows x64 **non firmata** che include un miner CPU, un helper con privilegi elevati e il driver WinRing. Scarica l’installer solo dalla release GitHub ufficiale del progetto.

## 2. Verificare SHA-256 **prima dell’esecuzione**

In PowerShell:

    Get-FileHash .\The-Safex-Mine_<version>_x64-setup.exe -Algorithm SHA256

Confronta attentamente il risultato con il SHA-256 pubblicato insieme alla release.

**Se Microsoft Defender mette immediatamente in quarantena l’installer dopo il download:** ripristina/consenti prima **solo quello specifico installer scaricato**, quindi calcola il suo SHA-256 e **non eseguirlo** finché il valore non coincide con quello ufficiale.

## 3. SmartScreen e antivirus

Poiché la release non è firmata e contiene componenti di mining, SmartScreen o altri prodotti di sicurezza possono mostrare avvisi o mettere file in quarantena. Procedi solo dopo aver verificato origine e hash.

Non disabilitare l’antivirus in modo generale. Non escludere Download, l’intero profilo utente o intere unità. Se dopo la verifica è davvero necessaria un’esclusione, limitala a:

    %LOCALAPPDATA%\The Safex Mine

## 4. Installazione, lingua e avviso sui rischi

L’installer NSIS normalmente seleziona automaticamente l’italiano in base alla lingua di Windows. La lingua dell’applicazione può essere cambiata anche dopo l’avvio.

Al primo avvio viene mostrato **Informativa sui rischi del mining — v1.0** nella lingua dell’applicazione supportata selezionata. Leggilo prima di continuare. **Esci** chiude l’app senza registrare l’accettazione. L’inglese resta il riferimento canonico: [Informativa sui rischi del mining v1.0](../../MINING_RISK_ACKNOWLEDGEMENT.md).

## 5. Helper UAC e MSR

L’interfaccia grafica funziona come utente normale. Al primo **Avvia mining** della sessione, Windows richiede l’approvazione UAC per:

    safex-mine-helper.exe

Solo questo helper viene elevato. Avvia e supervisiona XMRig e consente il tentativo di ottimizzazione MSR. Se la sicurezza di Windows blocca MSR, il mining può continuare con prestazioni inferiori. Non disattivare funzioni di sicurezza solo per aumentare l’hashrate.

## 6. Disinstallazione

La disinstallazione rimuove l’applicazione. Un’esclusione Defender aggiunta manualmente può rimanere; rimuovila in seguito se non serve più.

Altra assistenza: [risoluzione problemi in inglese](../../../TROUBLESHOOTING.md).
