# The Safex Mine — Windows kurulumu ve ilk kullanım

> **Topluluk çevirisi.** Bu sayfa, temel kurulum ve güvenlik yönergelerinin yapay zekâ destekli proje çevirisidir. [İngilizce kurulum kılavuzu](../../WINDOWS_INSTALLATION.md) projenin kanonik referansı olmaya devam eder. Dil ve terminoloji düzeltmeleri memnuniyetle karşılanır.

## 1. Yalnızca resmi sürümden indirin

The Safex Mine; CPU madencisi, yükseltilmiş ayrıcalıklarla çalışan yardımcı program ve WinRing sürücüsü içeren **imzasız** bir Windows x64 uygulamasıdır. Yükleyiciyi yalnızca projenin resmi GitHub sürümünden indirin.

## 2. Çalıştırmadan **önce** SHA-256 doğrulayın

PowerShell'de:

    Get-FileHash .\The-Safex-Mine_<version>_x64-setup.exe -Algorithm SHA256

Sonucu, sürümle birlikte yayımlanan SHA-256 değeriyle dikkatle karşılaştırın.

**Microsoft Defender yükleyiciyi indirdikten hemen sonra karantinaya alırsa:** önce **yalnızca o belirli indirilen yükleyiciyi** geri yükleyin/izin verin, ardından SHA-256 değerini hesaplayın ve resmi değerle eşleşmedikçe **çalıştırmayın**.

## 3. SmartScreen ve antivirüs

Sürüm imzasız olduğu ve madencilik bileşenleri içerdiği için SmartScreen veya başka güvenlik ürünleri uyarı gösterebilir ya da dosyaları karantinaya alabilir. Kaynak ve hash doğrulandıktan sonra devam edin.

Antivirüsü genel olarak devre dışı bırakmayın. Downloads klasörünü, kullanıcı profilinizin tamamını veya tüm sürücüleri dışlamayın. Sürüm doğrulandıktan sonra gerçekten dışlama gerekiyorsa bunu yalnızca şu klasörle sınırlayın:

    %LOCALAPPDATA%\The Safex Mine

## 4. Kurulum, dil ve risk bildirimi

NSIS yükleyicisi normalde Windows görüntüleme diline göre Türkçeyi otomatik seçer. Uygulama dili başlatıldıktan sonra ayrıca değiştirilebilir.

İlk çalıştırmada seçtiğiniz desteklenen uygulama dilinde **Mining Risk Acknowledgement — Version 1.0** gösterilir. Devam etmeden önce okuyun. **Exit**, kabulü kaydetmeden uygulamayı kapatır. İngilizce kanonik referanstır: [Mining Risk Acknowledgement v1.0](../../MINING_RISK_ACKNOWLEDGEMENT.md).

## 5. UAC yardımcısı ve MSR

Grafik uygulama normal kullanıcı olarak çalışır. Bir oturumdaki ilk **Start Mining** işleminde Windows şu dosya için UAC onayı ister:

    safex-mine-helper.exe

Yalnızca bu yardımcı yükseltilir. XMRig'i başlatıp denetler ve MSR optimizasyonunun denenmesini sağlar. Windows güvenliği MSR'yi engellerse madencilik daha düşük performansla devam edebilir. Yalnızca hashrate'i artırmak için güvenlik özelliklerini kapatmayın.

## 6. Kaldırma

Kaldırma işlemi uygulamayı siler. Elle eklediğiniz Defender dışlaması kalabilir; artık gerekmiyorsa sonradan elle kaldırın.

Daha fazla yardım: [İngilizce sorun giderme](../../../TROUBLESHOOTING.md).
