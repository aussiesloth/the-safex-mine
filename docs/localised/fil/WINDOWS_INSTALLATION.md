# The Safex Mine — Pag-install sa Windows at unang paggamit

> **Salin ng komunidad.** Ang pahinang ito ay AI-assisted na salin ng proyekto para sa mahahalagang tagubilin sa pag-install, seguridad at unang paggamit sa Windows. Ang [gabay sa pag-install sa Ingles](../../WINDOWS_INSTALLATION.md) ang nananatiling pangunahing sanggunian ng proyekto. Malugod na tinatanggap ang mga pagwawasto sa wika at terminolohiya.

## 1. Mag-download lamang mula sa opisyal na release

Ang The Safex Mine ay isang Windows x64 application na **walang digital na lagda** at may CPU miner, pantulong na prosesong may mas mataas na pribilehiyo, at WinRing driver. I-download lamang ang installer mula sa opisyal na GitHub release ng proyekto.

## 2. Suriin ang SHA-256 **bago patakbuhin**

Sa PowerShell:

    Get-FileHash .\The-Safex-Mine_<version>_x64-setup.exe -Algorithm SHA256

Maingat na ihambing ang resulta sa SHA-256 na inilathala kasama ng release.

**Kung agad ilagay ng Microsoft Defender sa quarantine ang installer pagkatapos ma-download:** ibalik o payagan muna **ang mismong partikular na installer na iyon lamang**, pagkatapos ay kalkulahin ang SHA-256 nito at **huwag itong patakbuhin** kung hindi tugma ang hash sa opisyal na halaga.

## 3. SmartScreen at antivirus

Dahil walang digital na lagda ang release at may mga bahagi itong ginagamit sa pagmimina, maaaring magbigay ng babala o mag-quarantine ng mga file ang SmartScreen o ibang security software. Magpatuloy lamang kapag nasuri na ang pinagmulan at hash.

Huwag ganap na patayin ang antivirus. Huwag gawing exclusion ang Downloads folder, ang buong user profile, o buong drive. Kung talagang kailangan ng exclusion matapos ma-verify ang release, limitahan lamang ito sa:

    %LOCALAPPDATA%\The Safex Mine

## 4. Pag-install, wika at abiso sa panganib

**English ang installer interface para sa Filipino**, dahil walang Filipino/Tagalog installer language ang NSIS 3.11. Pagkatapos ilunsad ang app, maaari mong piliin ang Filipino bilang wika ng application.

Sa unang pagtakbo, ipapakita ang **Pagkilala sa mga Panganib ng Pagmimina — Bersyon 1.0** sa napiling suportadong wika. Basahin ito bago magpatuloy. Isinasara ng **Lumabas** ang app nang hindi nagtatala ng pagtanggap. Ang Ingles ang pangunahing sanggunian: [Pagkilala sa mga Panganib ng Pagmimina v1.0](../../MINING_RISK_ACKNOWLEDGEMENT.md).

## 5. UAC helper at MSR

Tumatakbo ang graphical app bilang ordinaryong user. Sa unang **Simulan ang Pagmimina** sa isang session, hihingi ang Windows ng UAC approval para sa:

    safex-mine-helper.exe

Ang pantulong na prosesong ito lamang ang binibigyan ng mas mataas na pribilehiyo. Ito ang naglulunsad at nagbabantay sa XMRig at nagbibigay-daan sa pagtatangkang MSR optimisation. Kung harangin ng Windows security ang MSR, maaaring magpatuloy ang pagmimina nang mas mababa ang performance. Huwag pahinain ang mga security feature ng Windows para lamang tumaas ang hashrate.

## 6. Pag-uninstall

Aalisin ng pag-uninstall ang application. Maaaring manatili ang Defender exclusion na mano-mano mong idinagdag; alisin ito pagkatapos kung hindi na kailangan.

Karagdagang tulong: [paglutas ng problema sa Ingles](../../../TROUBLESHOOTING.md).
