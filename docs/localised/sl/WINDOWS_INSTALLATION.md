# The Safex Mine — Namestitev v sistemu Windows in prva uporaba

> **Skupnostni prevod.** Ta stran je z umetno inteligenco podprt projektni prevod bistvenih navodil za namestitev in varnost. [Angleški vodnik za namestitev](../../WINDOWS_INSTALLATION.md) ostaja kanonična referenca projekta. Jezikovni in terminološki popravki so dobrodošli.

## 1. Prenesite samo iz uradne izdaje

The Safex Mine je **nepodpisana** aplikacija Windows x64, ki vključuje CPU-rudar, pomožni program z dvignjenimi pravicami in gonilnik WinRing. Namestitveni program prenesite samo iz uradne izdaje projekta na GitHubu.

## 2. Preverite SHA-256 **pred zagonom**

V PowerShellu:

    Get-FileHash .\The-Safex-Mine_<version>_x64-setup.exe -Algorithm SHA256

Rezultat natančno primerjajte z vrednostjo SHA-256, objavljeno ob izdaji.

**Če Microsoft Defender namestitveni program takoj po prenosu premakne v karanteno:** najprej obnovite/dovolite **samo ta konkretni preneseni namestitveni program**, nato izračunajte SHA-256 in ga **ne zaženite**, dokler se hash ne ujema z uradno vrednostjo.

## 3. SmartScreen in protivirusna zaščita

Ker izdaja ni podpisana in vsebuje rudarske komponente, lahko SmartScreen ali drugi varnostni izdelki prikažejo opozorilo ali datoteke premaknejo v karanteno. Nadaljujte šele po preverjanju izvora in hasha.

Protivirusne zaščite ne izklapljajte na splošno. Ne izključujte mape Downloads, celotnega uporabniškega profila ali celih pogonov. Če je po preverjanju izdaje izključitev res potrebna, jo omejite na:

    %LOCALAPPDATA%\The Safex Mine

## 4. Namestitev, jezik in obvestilo o tveganju

NSIS namestitveni program običajno samodejno izbere slovenščino glede na prikazni jezik sistema Windows. Jezik aplikacije lahko po zagonu še vedno spremenite.

Ob prvem zagonu se v izbranem podprtem jeziku aplikacije prikaže **Mining Risk Acknowledgement — Version 1.0**. Pred nadaljevanjem ga preberite. **Exit** zapre aplikacijo brez shranjene potrditve. Angleščina ostaja kanonična referenca: [Mining Risk Acknowledgement v1.0](../../MINING_RISK_ACKNOWLEDGEMENT.md).

## 5. UAC-pomočnik in MSR

Grafična aplikacija deluje kot običajen uporabnik. Ob prvem **Start Mining** v seji Windows zahteva UAC-potrditev za:

    safex-mine-helper.exe

Povišane pravice dobi samo ta pomočnik. Zažene in nadzoruje XMRig ter omogoči poskus optimizacije MSR. Če varnostne funkcije Windows blokirajo MSR, se rudarjenje lahko nadaljuje z nižjo zmogljivostjo. Ne izklapljajte varnostnih funkcij samo zaradi višjega hashrata.

## 6. Odstranitev

Odstranitev izbriše aplikacijo. Ročno dodana izjema Defenderja lahko ostane; pozneje jo odstranite, če je ne potrebujete več.

Dodatna pomoč: [angleško odpravljanje težav](../../../TROUBLESHOOTING.md).
