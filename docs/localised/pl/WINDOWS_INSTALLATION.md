# The Safex Mine — Instalacja w Windows i pierwsze uruchomienie

> **Tłumaczenie społecznościowe.** Ta strona jest wspomaganym przez AI tłumaczeniem projektowym najważniejszych instrukcji instalacji i bezpieczeństwa. [Angielski przewodnik instalacji](../../WINDOWS_INSTALLATION.md) pozostaje kanonicznym dokumentem projektu. Korekty językowe i terminologiczne są mile widziane.

## 1. Pobieraj wyłącznie z oficjalnego wydania

The Safex Mine to **niepodpisana** aplikacja Windows x64 zawierająca miner CPU, pomocniczy proces z podwyższonymi uprawnieniami oraz sterownik WinRing. Instalator pobieraj wyłącznie z oficjalnego wydania projektu w GitHub.

## 2. Sprawdź SHA-256 **przed uruchomieniem**

W PowerShell:

    Get-FileHash .\The-Safex-Mine_<version>_x64-setup.exe -Algorithm SHA256

Dokładnie porównaj wynik z wartością SHA-256 opublikowaną przy wydaniu.

**Jeśli Microsoft Defender przeniesie instalator do kwarantanny natychmiast po pobraniu:** najpierw przywróć/zezwól **wyłącznie na ten konkretny pobrany instalator**, następnie oblicz jego SHA-256 i **nie uruchamiaj go**, dopóki hash nie będzie zgodny z oficjalną wartością.

## 3. SmartScreen i antywirus

Ponieważ wydanie jest niepodpisane i zawiera składniki do miningu, SmartScreen lub inne produkty bezpieczeństwa mogą ostrzegać albo poddać pliki kwarantannie. Kontynuuj dopiero po sprawdzeniu źródła i sumy kontrolnej.

Nie wyłączaj ogólnie programu antywirusowego. Nie dodawaj do wyjątków folderu Downloads, całego profilu użytkownika ani całych dysków. Jeśli po weryfikacji wydania wyjątek jest rzeczywiście potrzebny, ogranicz go do:

    %LOCALAPPDATA%\The Safex Mine

## 4. Instalacja, język i informacja o ryzyku

Instalator NSIS zwykle automatycznie wybiera język polski zgodnie z językiem wyświetlania Windows. Język aplikacji można później zmienić.

Przy pierwszym uruchomieniu wyświetlany jest **Oświadczenie o ryzyku związanym z kopaniem — v1.0** w wybranym obsługiwanym języku aplikacji. Przeczytaj go przed kontynuacją. **Wyjdź** zamyka aplikację bez zapisania akceptacji. Angielski pozostaje kanonicznym punktem odniesienia: [Oświadczenie o ryzyku związanym z kopaniem v1.0](../../MINING_RISK_ACKNOWLEDGEMENT.md).

## 5. Pomocnik UAC i MSR

Interfejs graficzny działa jako zwykły użytkownik. Przy pierwszym **Rozpocznij kopanie** w danej sesji Windows prosi o zgodę UAC dla:

    safex-mine-helper.exe

Tylko ten pomocnik uzyskuje podwyższone uprawnienia. Uruchamia i nadzoruje XMRig oraz umożliwia próbę optymalizacji MSR. Jeśli zabezpieczenia Windows blokują MSR, kopanie może nadal działać z niższą wydajnością. Nie wyłączaj funkcji bezpieczeństwa tylko po to, by zwiększyć hashrate.

## 6. Odinstalowanie

Odinstalowanie usuwa aplikację. Ręcznie dodany wyjątek Defender może pozostać; usuń go po odinstalowaniu, jeśli nie jest już potrzebny.

Więcej pomocy: [angielski dokument rozwiązywania problemów](../../../TROUBLESHOOTING.md).
