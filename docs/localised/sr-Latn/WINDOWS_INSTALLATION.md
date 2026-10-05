# The Safex Mine — Instalacija na Windows-u i prvo korišćenje

> **Prevod zajednice.** Ovo je projektni prevod osnovnih uputstava za instalaciju i bezbednost uz pomoć AI. [Englesko uputstvo za instalaciju](../../WINDOWS_INSTALLATION.md) ostaje kanonska projektna referenca. Ispravke jezika i terminologije su dobrodošle.

## 1. Preuzimajte samo sa zvaničnog izdanja

The Safex Mine je **nepotpisana** Windows x64 aplikacija koja sadrži CPU miner, pomoćni program sa povišenim privilegijama i WinRing drajver. Instalacioni program preuzimajte isključivo sa zvaničnog GitHub izdanja projekta.

## 2. Proverite SHA-256 **pre pokretanja**

U PowerShell-u:

    Get-FileHash .\The-Safex-Mine_<version>_x64-setup.exe -Algorithm SHA256

Pažljivo uporedite rezultat sa SHA-256 vrednošću objavljenom uz izdanje.

**Ako Microsoft Defender stavi instalacioni program u karantin odmah nakon preuzimanja:** prvo vratite/dozvolite **samo taj konkretni preuzeti instalacioni program**, zatim izračunajte njegov SHA-256 i **nemojte ga pokretati** ako se ne poklapa sa zvaničnom vrednošću.

## 3. SmartScreen i antivirus

Pošto izdanje nije potpisano i sadrži komponente za rudarenje, SmartScreen ili drugi bezbednosni proizvodi mogu prikazati upozorenje ili staviti datoteke u karantin. Nastavite tek nakon provere izvora i kontrolne sume.

Nemojte opšte isključivati antivirus. Nemojte izuzimati Downloads, ceo korisnički profil ili čitave diskove. Ako je nakon provere izdanja potrebno izuzeće, ograničite ga na:

    %LOCALAPPDATA%\The Safex Mine

## 4. Instalacija, jezik i obaveštenje o riziku

NSIS instalacioni program obično automatski bira srpski latinicom prema Windows jeziku. Jezik aplikacije može se promeniti nakon pokretanja.

Pri prvom pokretanju prikazuje se **Mining Risk Acknowledgement — Version 1.0** na izabranom podržanom jeziku aplikacije. Pročitajte ga pre nastavka. **Exit** zatvara aplikaciju bez čuvanja saglasnosti. Engleski ostaje kanonska referenca: [Mining Risk Acknowledgement v1.0](../../MINING_RISK_ACKNOWLEDGEMENT.md).

## 5. UAC pomoćni program i MSR

Grafička aplikacija radi kao običan korisnik. Pri prvom pritisku na **Start Mining** u sesiji Windows traži UAC odobrenje za:

    safex-mine-helper.exe

Samo taj pomoćni program dobija povišene privilegije. On pokreće i nadzire XMRig i omogućava pokušaj MSR optimizacije. Ako Windows bezbednost blokira MSR, rudarenje može da nastavi sa manjim performansama. Nemojte slabiti bezbednost samo radi većeg hashrate-a.

## 6. Deinstalacija

Deinstalacija uklanja aplikaciju. Defender izuzeće koje ste ručno dodali može ostati; uklonite ga nakon deinstalacije ako više nije potrebno.

Dodatna pomoć: [englesko rešavanje problema](../../../TROUBLESHOOTING.md).
