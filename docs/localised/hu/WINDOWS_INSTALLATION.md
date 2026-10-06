# The Safex Mine — Windows-telepítés és első használat

> **Közösségi fordítás.** Ez az oldal az alapvető telepítési és biztonsági útmutató AI-val támogatott projektfordítása. Az [angol telepítési útmutató](../../WINDOWS_INSTALLATION.md) marad a projekt kanonikus hivatkozása. A nyelvi és terminológiai javításokat örömmel fogadjuk.

## 1. Csak a hivatalos kiadásból töltsön le

A The Safex Mine egy **aláíratlan** Windows x64 alkalmazás, amely CPU-bányászt, emelt jogosultságú segédprogramot és WinRing illesztőprogramot tartalmaz. A telepítőt kizárólag a projekt hivatalos GitHub-kiadásából töltse le.

## 2. Ellenőrizze a SHA-256 értéket **futtatás előtt**

PowerShellben:

    Get-FileHash .\The-Safex-Mine_<version>_x64-setup.exe -Algorithm SHA256

Az eredményt pontosan hasonlítsa össze a kiadáshoz közzétett SHA-256 értékkel.

**Ha a Microsoft Defender közvetlenül a letöltés után karanténba helyezi a telepítőt:** először **csak azt az egy konkrét letöltött telepítőt** állítsa vissza/engedélyezze, utána számítsa ki a SHA-256 értékét, és **ne futtassa**, amíg az nem egyezik a hivatalos értékkel.

## 3. SmartScreen és vírusvédelem

Mivel a kiadás nincs aláírva és bányászati összetevőket tartalmaz, a SmartScreen vagy más biztonsági termék figyelmeztethet vagy karanténba helyezhet fájlokat. Csak a forrás és a hash ellenőrzése után folytassa.

Ne kapcsolja ki általánosan a vírusvédelmet. Ne zárja ki a Downloads mappát, a teljes felhasználói profilt vagy egész meghajtókat. Ha ellenőrzés után valóban szükséges kizárás, azt korlátozza erre:

    %LOCALAPPDATA%\The Safex Mine

## 4. Telepítés, nyelv és kockázati tájékoztató

Az NSIS telepítő rendszerint a Windows megjelenítési nyelve alapján automatikusan magyart választ. Az alkalmazás nyelve indítás után is módosítható.

Első indításkor a választott támogatott alkalmazásnyelven megjelenik a **Bányászati kockázatokról szóló nyilatkozat — v1.0**. Folytatás előtt olvassa el. Az **Kilépés** elfogadás mentése nélkül bezárja az alkalmazást. Az angol a kanonikus referencia: [Bányászati kockázatokról szóló nyilatkozat v1.0](../../MINING_RISK_ACKNOWLEDGEMENT.md).

## 5. UAC-segéd és MSR

A grafikus alkalmazás normál felhasználóként fut. Egy munkamenet első **Bányászat indítása** műveleténél a Windows UAC-jóváhagyást kér ehhez:

    safex-mine-helper.exe

Csak ez a segéd kap emelt jogosultságot. Elindítja és felügyeli az XMRig-et, és lehetővé teszi az MSR-optimalizálás megkísérlését. Ha a Windows biztonsága blokkolja az MSR-t, a bányászat alacsonyabb teljesítménnyel folytatódhat. Ne gyengítse a biztonságot pusztán magasabb hashrate érdekében.

## 6. Eltávolítás

Az eltávolítás törli az alkalmazást. A kézzel hozzáadott Defender-kizárás megmaradhat; ha már nincs rá szükség, utólag törölje.

További segítség: [angol hibaelhárítás](../../../TROUBLESHOOTING.md).
