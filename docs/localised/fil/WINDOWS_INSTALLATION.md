# The Safex Mine — Pag-install sa Windows at unang paggamit

> **Salin ng komunidad.** Ang pahinang ito ay AI-assisted na salin ng proyekto para sa mahahalagang tagubilin sa pag-install at seguridad. Ang [English installation guide](../../WINDOWS_INSTALLATION.md) ang nananatiling canonical na sanggunian ng proyekto. Malugod na tinatanggap ang mga pagwawasto sa wika at terminolohiya.

## 1. Mag-download lamang mula sa opisyal na release

Ang The Safex Mine ay isang **unsigned** na Windows x64 application na may CPU miner, elevated helper, at WinRing driver. I-download lamang ang installer mula sa opisyal na GitHub release ng proyekto.

## 2. I-verify ang SHA-256 **bago patakbuhin**

Sa PowerShell:

    Get-FileHash .\The-Safex-Mine_<version>_x64-setup.exe -Algorithm SHA256

Maingat na ihambing ang resulta sa SHA-256 na inilathala kasama ng release.

**Kung i-quarantine agad ng Microsoft Defender ang installer pagkatapos ma-download:** i-restore/i-allow muna **ang mismong partikular na installer na iyon lamang**, pagkatapos ay kalkulahin ang SHA-256 nito at **huwag itong patakbuhin** hangga't hindi tumutugma ang hash sa opisyal na halaga.

## 3. SmartScreen at antivirus

Dahil unsigned ang release at may mining components, maaaring magbigay ng babala o mag-quarantine ng files ang SmartScreen o ibang security product. Magpatuloy lamang kapag na-verify na ang source at hash.

Huwag i-disable nang malawakan ang antivirus. Huwag i-exclude ang Downloads, ang buong user profile, o buong drive. Kung talagang kailangan ng exclusion matapos ma-verify ang release, limitahan lamang ito sa:

    %LOCALAPPDATA%\The Safex Mine

## 4. Pag-install, wika, at risk notice

**English ang installer UI para sa Filipino**, dahil walang Filipino/Tagalog installer language ang NSIS 3.11. Pagkatapos ilunsad ang app, maaari mong piliin ang Filipino bilang application language.

Sa unang pagtakbo, ipapakita ang **Mining Risk Acknowledgement — Version 1.0** sa napiling suportadong application language. Basahin ito bago magpatuloy. Isinasara ng **Exit** ang app nang hindi nagse-save ng acceptance. English ang canonical na sanggunian: [Mining Risk Acknowledgement v1.0](../../MINING_RISK_ACKNOWLEDGEMENT.md).

## 5. UAC helper at MSR

Tumatakbo ang graphical app bilang ordinaryong user. Sa unang **Start Mining** sa isang session, hihingi ang Windows ng UAC approval para sa:

    safex-mine-helper.exe

Ang helper lamang na ito ang ine-elevate. Ito ang naglulunsad at nagbabantay sa XMRig at nagbibigay-daan sa pagtatangkang MSR optimisation. Kung i-block ng Windows security ang MSR, maaaring magpatuloy ang mining nang mas mababa ang performance. Huwag pahinain ang seguridad para lamang tumaas ang hashrate.

## 6. Pag-uninstall

Aalisin ng uninstall ang application. Maaaring manatili ang Defender exclusion na mano-mano mong idinagdag; alisin ito pagkatapos kung hindi na kailangan.

Karagdagang tulong: [English troubleshooting](../../../TROUBLESHOOTING.md).
